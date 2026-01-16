import { AppDataSource } from "../../database/datasource";
import { UserEntity } from "../../database/entity/user-entity";
import { BioEntity } from "../../database/entity/bio-entity";
import { BillingEntity } from "../../database/entity/billing-entity";
import { PostEntity } from "../../database/entity/posts-entity";
import { BookingEntity } from "../../database/entity/booking-entity";
import { FormEntity } from "../../database/entity/form-entity";
import { BookingSettingsEntity } from "../../database/entity/booking-settings-entity";
import { IntegrationEntity } from "../../database/entity/integration-entity";
import { EmailTemplateEntity } from "../../database/entity/email-template-entity";
import { QRCodeEntity } from "../../database/entity/qrcode-entity";
import { BillingService } from "../../services/billing.service";
import { logger } from "../utils/logger";
import { ApiError, APIErrors } from "../errors/api-error";
import { MoreThan, LessThanOrEqual } from "typeorm";

const userRepository = AppDataSource.getRepository(UserEntity);
const bioRepository = AppDataSource.getRepository(BioEntity);
const billingRepository = AppDataSource.getRepository(BillingEntity);
const postRepository = AppDataSource.getRepository(PostEntity);
const bookingRepository = AppDataSource.getRepository(BookingEntity);
const formRepository = AppDataSource.getRepository(FormEntity);
const bookingSettingsRepository = AppDataSource.getRepository(BookingSettingsEntity);
const integrationRepository = AppDataSource.getRepository(IntegrationEntity);
const emailTemplateRepository = AppDataSource.getRepository(EmailTemplateEntity);
const qrCodeRepository = AppDataSource.getRepository(QRCodeEntity);

export interface AdminUserDTO {
    id: string;
    email: string;
    fullName: string;
    plan: string;
    planExpiresAt?: Date;
    isBanned: boolean;
    verified: boolean;
    provider: string;
    createdAt: Date;
    biosCount: number;
}

export interface AdminStats {
    totalUsers: number;
    totalBios: number;
    planDistribution: {
        free: number;
        standard: number;
        pro: number;
    };
    bannedUsers: number;
    newUsersThisMonth: number;
}

/**
 * Get the active billing for a user (if any)
 */
const getActiveBilling = async (userId: string): Promise<BillingEntity | null> => {
    const now = new Date();
    return await billingRepository.findOne({
        where: {
            userId: userId,
            startDate: LessThanOrEqual(now),
            endDate: MoreThan(now)
        },
        order: {
            endDate: "DESC"
        }
    });
};

/**
 * Get paginated list of all users for admin
 */
export const getAllUsers = async (
    page: number = 1,
    limit: number = 20,
    search?: string,
    sortBy: string = 'createdAt',
    sortOrder: 'ASC' | 'DESC' = 'DESC'
): Promise<{ users: AdminUserDTO[]; total: number; pages: number }> => {
    const query = userRepository
        .createQueryBuilder('user')
        .leftJoin('user.bios', 'bio')
        .select([
            'user.id',
            'user.email',
            'user.fullName',
            'user.isBanned',
            'user.verified',
            'user.provider',
            'user.createdAt'
        ])
        .addSelect('COUNT(bio.id)', 'biosCount')
        .groupBy('user.id');

    if (search) {
        query.where('user.email LIKE :search OR user.fullName LIKE :search', {
            search: `%${search}%`
        });
    }

    // Get total count
    const totalQuery = userRepository.createQueryBuilder('user');
    if (search) {
        totalQuery.where('user.email LIKE :search OR user.fullName LIKE :search', {
            search: `%${search}%`
        });
    }
    const total = await totalQuery.getCount();

    // Apply sorting and pagination
    const validSortFields = ['createdAt', 'email', 'fullName', 'isBanned'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    
    query.orderBy(`user.${sortField}`, sortOrder);
    query.skip((page - 1) * limit);
    query.take(limit);

    const rawResults = await query.getRawMany();

    // For each user, get their actual plan from BillingService
    const users: AdminUserDTO[] = await Promise.all(rawResults.map(async (raw) => {
        const activePlan = await BillingService.getActivePlan(raw.user_id);
        const activeBilling = await getActiveBilling(raw.user_id);
        
        return {
            id: raw.user_id,
            email: raw.user_email,
            fullName: raw.user_fullName,
            plan: activePlan,
            planExpiresAt: activeBilling?.endDate,
            isBanned: raw.user_isBanned,
            verified: raw.user_verified,
            provider: raw.user_provider,
            createdAt: raw.user_createdAt,
            biosCount: parseInt(raw.biosCount) || 0
        };
    }));

    return {
        users,
        total,
        pages: Math.ceil(total / limit)
    };
};

/**
 * Ban or unban a user
 */
export const setUserBanStatus = async (userId: string, isBanned: boolean): Promise<UserEntity> => {
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
        throw new ApiError(APIErrors.notFoundError, "User not found", 404);
    }

    user.isBanned = isBanned;
    await userRepository.save(user);

    logger.info(`User ${userId} ban status set to: ${isBanned}`);
    return user;
};

/**
 * Set user plan by creating a new billing record
 */
export const setUserPlan = async (
    userId: string, 
    plan: 'free' | 'standard' | 'pro', 
    durationDays?: number
): Promise<{ plan: string; planExpiresAt?: Date }> => {
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
        throw new ApiError(APIErrors.notFoundError, "User not found", 404);
    }

    // If setting to free, we just don't create a billing record (or could delete active ones)
    if (plan === 'free') {
        // Mark any active billing as expired by setting endDate to now
        const now = new Date();
        await billingRepository
            .createQueryBuilder()
            .update(BillingEntity)
            .set({ endDate: now })
            .where("userId = :userId AND endDate > :now", { userId, now })
            .execute();
        
        logger.info(`User ${userId} plan set to free (active billings expired)`);
        return { plan: 'free', planExpiresAt: undefined };
    }

    // For standard or pro, create a new billing record
    const days = durationDays && durationDays > 0 ? durationDays : 30; // Default 30 days
    const billing = await BillingService.createBilling(userId, plan, days, 0); // Price 0 for admin grants

    logger.info(`User ${userId} plan set to: ${plan} for ${days} days (expires: ${billing.endDate})`);
    return { plan: billing.plan, planExpiresAt: billing.endDate };
};

/**
 * Get admin dashboard stats - uses billing for accurate plan counts
 */
export const getAdminStats = async (): Promise<AdminStats> => {
    const totalUsers = await userRepository.count();
    const totalBios = await bioRepository.count();
    const bannedUsers = await userRepository.count({ where: { isBanned: true } });

    // Get all users and compute their active plans
    const allUsers = await userRepository.find({ select: ['id'] });
    let freeCount = 0;
    let standardCount = 0;
    let proCount = 0;

    for (const user of allUsers) {
        const plan = await BillingService.getActivePlan(user.id);
        if (plan === 'pro') proCount++;
        else if (plan === 'standard') standardCount++;
        else freeCount++;
    }

    // New users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newUsersThisMonth = await userRepository
        .createQueryBuilder('user')
        .where('user.createdAt >= :startOfMonth', { startOfMonth })
        .getCount();

    return {
        totalUsers,
        totalBios,
        planDistribution: {
            free: freeCount,
            standard: standardCount,
            pro: proCount
        },
        bannedUsers,
        newUsersThisMonth
    };
};

/**
 * Get a single user by ID for admin
 */
export const getUserById = async (userId: string): Promise<AdminUserDTO | null> => {
    const user = await userRepository.findOne({
        where: { id: userId },
        relations: ['bios']
    });

    if (!user) return null;

    const activePlan = await BillingService.getActivePlan(userId);
    const activeBilling = await getActiveBilling(userId);

    return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        plan: activePlan,
        planExpiresAt: activeBilling?.endDate,
        isBanned: user.isBanned,
        verified: user.verified,
        provider: user.provider,
        createdAt: user.createdAt,
        biosCount: user.bios?.length || 0
    };
};


/**
 * Delete a user (admin only)
 */
export const deleteUser = async (userId: string): Promise<void> => {
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
        throw new ApiError(APIErrors.notFoundError, "User not found", 404);
    }

    // 1. Delete items related to User that don't cascade at DB level
    await billingRepository.delete({ userId });
    await postRepository.delete({ user: { id: userId } });

    // 2. Delete Bios and their non-cascading children
    // We must manually delete bio children because database cascade for Bio might fail 
    // if those children (like Booking) don't have cascade on Bio delete.
    const bios = await bioRepository.find({ where: { userId } });
    for (const bio of bios) {
        await deleteBio(bio.id);
    }

    // 3. Delete User (now safe from FK constraints)
    await userRepository.remove(user);
    logger.info(`User ${userId} deleted by admin`);
};

/**
 * Get all bios for a specific user
 */
export const getUserBios = async (userId: string): Promise<BioEntity[]> => {
    return await bioRepository.find({
        where: { userId },
        order: { createdAt: "DESC" }
    });
};

/**
 * Update a bio (admin override)
 */
export const updateBio = async (bioId: string, updates: Partial<BioEntity>): Promise<BioEntity> => {
    const bio = await bioRepository.findOneBy({ id: bioId });
    if (!bio) {
        throw new ApiError(APIErrors.notFoundError, "Bio not found", 404);
    }
    
    // Validate suffix uniqueness if changing suffix
    if (updates.sufix && updates.sufix !== bio.sufix) {
        const existing = await bioRepository.findOneBy({ sufix: updates.sufix });
        if (existing) {
            throw new ApiError(APIErrors.conflictError, "Bio with this suffix already exists", 409);
        }
    }

    Object.assign(bio, updates);
    return await bioRepository.save(bio);
};

/**
 * Delete a bio (admin override)
 */
export const deleteBio = async (bioId: string): Promise<void> => {
    const bio = await bioRepository.findOneBy({ id: bioId });
    if (!bio) {
        throw new ApiError(APIErrors.notFoundError, "Bio not found", 404);
    }

    // 1. Delete items related to Bio that don't cascade at DB level
    await bookingRepository.delete({ bioId });
    await postRepository.delete({ bio: { id: bioId } });
    await formRepository.delete({ bioId });
    await bookingSettingsRepository.delete({ bioId });
    await emailTemplateRepository.delete({ bioId });
    // Entities that lack explicit bioId column but have relation
    await integrationRepository.delete({ bio: { id: bioId } });
    await qrCodeRepository.delete({ bio: { id: bioId } });
    
    // Automation, PortfolioItem, MarketingSlot, PageView have cascade set in entity.
    
    await bioRepository.remove(bio);
};
