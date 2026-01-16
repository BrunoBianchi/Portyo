import { AppDataSource } from "../../database/datasource";
import { MarketingSlotEntity } from "../../database/entity/marketing-slot-entity";
import { UserEntity } from "../../database/entity/user-entity";
import { BioEntity } from "../../database/entity/bio-entity";
import { ApiError, APIErrors } from "../errors/api-error";
import { LessThan } from "typeorm";

const SlotRepository = AppDataSource.getRepository(MarketingSlotEntity);
const UserRepository = AppDataSource.getRepository(UserEntity);
const BioRepository = AppDataSource.getRepository(BioEntity);

// Plan limits
const SLOT_LIMITS = {
    free: 0,
    standard: 2,
    pro: 5
};

export interface CreateSlotData {
    bioId: string;
    slotName: string;
    priceMin: number;
    priceMax: number;
    duration: number;
    acceptOtherPrices: boolean;
    position?: number;
}

export interface UpdateSlotData {
    slotName?: string;
    priceMin?: number;
    priceMax?: number;
    duration?: number;
    acceptOtherPrices?: boolean;
    position?: number;
}

// Check if user can create slots
export async function canCreateSlot(userId: string): Promise<boolean> {
    const user = await UserRepository.findOne({ where: { id: userId } });
    if (!user) return false;
    
    const plan = (user.plan || 'free').toLowerCase();
    return plan === 'standard' || plan === 'pro';
}

// Get slot limit for user
export async function getSlotLimit(userId: string): Promise<number> {
    const user = await UserRepository.findOne({ where: { id: userId } });
    if (!user) return 0;
    
    const plan = (user.plan || 'free').toLowerCase() as keyof typeof SLOT_LIMITS;
    return SLOT_LIMITS[plan] || 0;
}

// Create new marketing slot
export async function createSlot(userId: string, data: CreateSlotData): Promise<MarketingSlotEntity> {
    // Check permissions
    if (!await canCreateSlot(userId)) {
        throw new ApiError(
            APIErrors.forbiddenError,
            "Marketing slots are only available for Standard and Pro plans",
            403
        );
    }

    // Check  limit
    const limit = await getSlotLimit(userId);
    const currentCount = await SlotRepository.count({ where: { userId } });
    
    if (currentCount >= limit) {
        throw new ApiError(
            APIErrors.forbiddenError,
            `You have reached your slot limit (${limit} slots)`,
            403
        );
    }

    // Validate bio ownership
    const bio = await BioRepository.findOne({ 
        where: { id: data.bioId, userId },
        relations: ['integrations']
    });
    if (!bio) {
        throw new ApiError(
            APIErrors.notFoundError,
            "Bio not found or you don't have permission",
            404
        );
    }

    // Check Stripe Connection
    const stripeIntegration = bio.integrations?.find(i => i.name === 'stripe' && i.account_id);
    if (!stripeIntegration) {
        throw new ApiError(
            APIErrors.forbiddenError,
            "You must connect your Stripe account to create marketing slots",
            403
        );
    }

    // Validate price range
    if (data.priceMin < 0 || data.priceMax < data.priceMin) {
        throw new ApiError(
            APIErrors.validationError,
            "Invalid price range. Max must be greater than min, and both must be positive",
            400
        );
    }

    // Validate duration
    if (data.duration < 1 || data.duration > 365) {
        throw new ApiError(
            APIErrors.validationError,
            "Duration must be between 1 and 365 days",
            400
        );
    }

    const slot = SlotRepository.create({
        userId,
        bioId: data.bioId,
        slotName: data.slotName,
        priceMin: data.priceMin,
        priceMax: data.priceMax,
        duration: data.duration,
        acceptOtherPrices: data.acceptOtherPrices,
        position: data.position || 0,
        status: 'available',
        avgImpressions: 0,
        avgClicks: 0,
        avgCTR: 0,
        totalRevenue: 0,
        totalProposals: 0
    });

    return await SlotRepository.save(slot);
}

// Get all slots for a user
export async function getSlotsByUser(userId: string): Promise<MarketingSlotEntity[]> {
    return await SlotRepository.find({
        where: { userId },
        order: { position: 'ASC', createdAt: 'DESC' }
    });
}

// Get available slots (public endpoint for companies)
export async function getAvailableSlots(filters?: {
    priceMax?: number;
    minImpressions?: number;
    bioId?: string;
}): Promise<MarketingSlotEntity[]> {
    const query = SlotRepository.createQueryBuilder('slot')
        .where('slot.status = :status', { status: 'available' });

    if (filters?.priceMax) {
        query.andWhere('slot.priceMin <= :priceMax', { priceMax: filters.priceMax });
    }

    if (filters?.minImpressions) {
        query.andWhere('slot.avgImpressions >= :minImpressions', { minImpressions: filters.minImpressions });
    }

    if (filters?.bioId) {
        query.andWhere('slot.bioId = :bioId', { bioId: filters.bioId });
    }

    return await query
        .leftJoinAndSelect('slot.bio', 'bio')
        .leftJoinAndSelect('slot.user', 'user')
        .orderBy('slot.avgCTR', 'DESC')
        .getMany();
}

// Get slot by ID
export async function getSlotById(slotId: string, userId?: string): Promise<MarketingSlotEntity> {
    const slot = await SlotRepository.findOne({
        where: { id: slotId },
        relations: ['bio', 'user', 'activeProposal']
    });

    if (!slot) {
        throw new ApiError(APIErrors.notFoundError, "Slot not found", 404);
    }

    // If userId provided, verify ownership
    if (userId && slot.userId !== userId) {
        throw new ApiError(APIErrors.forbiddenError, "Not authorized", 403);
    }

    return slot;
}

// Update slot
export async function updateSlot(slotId: string, userId: string, data: UpdateSlotData): Promise<MarketingSlotEntity> {
    const slot = await getSlotById(slotId, userId);

    // Can't update occupied slots
    if (slot.status === 'occupied') {
        throw new ApiError(
            APIErrors.forbiddenError,
            "Cannot update occupied slot. Wait for it to expire or manually release it.",
            403
        );
    }

    // Validate price range if updating
    if (data.priceMin !== undefined || data.priceMax !== undefined) {
        const newMin = data.priceMin ?? slot.priceMin;
        const newMax = data.priceMax ?? slot.priceMax;
        
        if (newMin < 0 || newMax < newMin) {
            throw new ApiError(
                APIErrors.validationError,
                "Invalid price range",
                400
            );
        }
    }

    // Validate duration if updating
    if (data.duration !== undefined && (data.duration < 1 || data.duration > 365)) {
        throw new ApiError(
            APIErrors.validationError,
            "Duration must be between 1 and 365 days",
            400
        );
    }

    Object.assign(slot, data);
    return await SlotRepository.save(slot);
}

// Delete slot
export async function deleteSlot(slotId: string, userId: string): Promise<void> {
    const slot = await getSlotById(slotId, userId);

    const isCampaignInProgress = slot.status !== 'available'
        || slot.activeProposal?.status === 'in_progress'
        || slot.activeProposal?.status === 'active';

    // Can't delete slots once a campaign has started
    if (isCampaignInProgress) {
        throw new ApiError(
            APIErrors.forbiddenError,
            "Cannot delete this slot while a campaign is in progress.",
            403
        );
    }

    await SlotRepository.remove(slot);
}

// Expire slots (cronjob)
export async function expireOccupiedSlots(): Promise<void> {
    const expiredSlots = await SlotRepository.find({
        where: {
            status: 'occupied' as const,
            expiresAt: LessThan(new Date())
        }
    });

    for (const slot of expiredSlots) {
        slot.status = 'available';
        slot.activeProposalId = null;
        slot.activeSince = null;
        slot.expiresAt = null;
        
        await SlotRepository.save(slot);
        
        // TODO: Notificar usuário que o slot está disponível novamente
        // TODO: Atualizar proposta como 'expired'
    }
}
