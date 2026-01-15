import { AppDataSource } from "../../database/datasource";
import { UserEntity } from "../../database/entity/user-entity";
import { BioEntity } from "../../database/entity/bio-entity";
import { logger } from "../utils/logger";
import { ApiError, APIErrors } from "../errors/api-error";

const userRepository = AppDataSource.getRepository(UserEntity);
const bioRepository = AppDataSource.getRepository(BioEntity);

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
            'user.plan',
            'user.planExpiresAt',
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
    const validSortFields = ['createdAt', 'email', 'fullName', 'plan', 'isBanned'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    
    query.orderBy(`user.${sortField}`, sortOrder);
    query.skip((page - 1) * limit);
    query.take(limit);

    const rawResults = await query.getRawMany();

    const users: AdminUserDTO[] = rawResults.map(raw => ({
        id: raw.user_id,
        email: raw.user_email,
        fullName: raw.user_fullName,
        plan: raw.user_plan,
        planExpiresAt: raw.user_planExpiresAt,
        isBanned: raw.user_isBanned,
        verified: raw.user_verified,
        provider: raw.user_provider,
        createdAt: raw.user_createdAt,
        biosCount: parseInt(raw.biosCount) || 0
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
 * Set user plan with optional expiration
 */
export const setUserPlan = async (
    userId: string, 
    plan: 'free' | 'standard' | 'pro', 
    durationDays?: number
): Promise<UserEntity> => {
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
        throw new ApiError(APIErrors.notFoundError, "User not found", 404);
    }

    user.plan = plan;
    
    if (durationDays && durationDays > 0) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + durationDays);
        user.planExpiresAt = expiresAt;
    } else if (plan === 'free') {
        user.planExpiresAt = undefined;
    }

    await userRepository.save(user);

    logger.info(`User ${userId} plan set to: ${plan} (expires: ${user.planExpiresAt || 'never'})`);
    return user;
};

/**
 * Get admin dashboard stats
 */
export const getAdminStats = async (): Promise<AdminStats> => {
    const totalUsers = await userRepository.count();
    const totalBios = await bioRepository.count();
    const bannedUsers = await userRepository.count({ where: { isBanned: true } });

    // Plan distribution
    const freeCount = await userRepository.count({ where: { plan: 'free' } });
    const standardCount = await userRepository.count({ where: { plan: 'standard' } });
    const proCount = await userRepository.count({ where: { plan: 'pro' } });

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

    return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        plan: user.plan,
        planExpiresAt: user.planExpiresAt,
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

    await userRepository.remove(user);
    logger.info(`User ${userId} deleted by admin`);
};
