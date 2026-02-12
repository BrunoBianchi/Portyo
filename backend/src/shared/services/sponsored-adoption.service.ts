import { AppDataSource } from "../../database/datasource";
import { SponsoredAdoptionEntity } from "../../database/entity/sponsored-adoption-entity";
import { SponsoredOfferEntity } from "../../database/entity/sponsored-offer-entity";
import { BioEntity } from "../../database/entity/bio-entity";
import { UserEntity } from "../../database/entity/user-entity";
import { BillingService } from "../../services/billing.service";
import { ApiError, APIErrors } from "../errors/api-error";
import crypto from "crypto";

function generateTrackingCode(length = 12): string {
    return crypto.randomBytes(length).toString("base64url").slice(0, length);
}

const AdoptionRepository = AppDataSource.getRepository(SponsoredAdoptionEntity);
const OfferRepository = AppDataSource.getRepository(SponsoredOfferEntity);
const BioRepository = AppDataSource.getRepository(BioEntity);

// Plan limits for sponsored links
const PLAN_LIMITS: Record<string, number> = {
    free: 1,
    standard: 3,
    pro: 10,
};

// Bio tier thresholds
const BIO_TIERS: Record<string, { min: number; cpcFloor: number }> = {
    starter: { min: 0, cpcFloor: 0.01 },
    growing: { min: 1001, cpcFloor: 0.03 },
    established: { min: 10001, cpcFloor: 0.05 },
};

export function getBioTier(views: number): string {
    if (views >= 10001) return "established";
    if (views >= 1001) return "growing";
    return "starter";
}

function getTierOrder(tier: string): number {
    const order: Record<string, number> = { any: 0, starter: 1, growing: 2, established: 3 };
    return order[tier] ?? 0;
}

export async function adoptOffer(userId: string, bioId: string, offerId: string): Promise<SponsoredAdoptionEntity> {
    // Check bio ownership
    const bio = await BioRepository.findOne({ where: { id: bioId, userId } });
    if (!bio) {
        throw new ApiError(APIErrors.notFoundError, "Bio not found or not owned by you", 404);
    }

    // Check plan limits
    const plan = await BillingService.getActivePlan(userId) || "free";
    const maxAdoptions = PLAN_LIMITS[plan] ?? 1;
    const currentCount = await AdoptionRepository.count({
        where: { userId, status: "active" },
    });

    if (currentCount >= maxAdoptions) {
        throw new ApiError(
            APIErrors.paymentRequiredError,
            `Your plan (${plan}) allows max ${maxAdoptions} sponsored links. Upgrade to add more.`,
            402,
        );
    }

    // Check offer exists and is active
    const offer = await OfferRepository.findOne({ where: { id: offerId } });
    if (!offer || offer.status !== "active") {
        throw new ApiError(APIErrors.notFoundError, "Offer not found or not active", 404);
    }

    // Check expiry and budget
    if (offer.expiresAt && new Date(offer.expiresAt) < new Date()) {
        throw new ApiError(APIErrors.forbiddenError, "Offer has expired", 403);
    }
    if (offer.totalBudget && Number(offer.totalSpent) >= Number(offer.totalBudget)) {
        throw new ApiError(APIErrors.forbiddenError, "Offer budget is exhausted", 403);
    }

    // Check bio tier requirement
    const bioTier = getBioTier(bio.views || 0);
    if (offer.minBioTier !== "any" && getTierOrder(bioTier) < getTierOrder(offer.minBioTier)) {
        throw new ApiError(
            APIErrors.forbiddenError,
            `This offer requires a bio tier of "${offer.minBioTier}" or higher. Your bio tier is "${bioTier}".`,
            403,
        );
    }

    // Check CPC meets tier floor
    const tierConfig = BIO_TIERS[bioTier];
    if (tierConfig && Number(offer.cpcRate) < tierConfig.cpcFloor) {
        throw new ApiError(
            APIErrors.forbiddenError,
            `CPC rate ($${offer.cpcRate}) is below the minimum for your bio tier ($${tierConfig.cpcFloor})`,
            403,
        );
    }

    // Check duplicate adoption
    const existing = await AdoptionRepository.findOne({
        where: { userId, offerId, status: "active" },
    });
    if (existing) {
        throw new ApiError(APIErrors.conflictError, "You have already adopted this offer", 409);
    }

    // Generate tracking code
    const trackingCode = generateTrackingCode(12);

    // Get next position  
    const lastAdoption = await AdoptionRepository.findOne({
        where: { bioId, status: "active" },
        order: { position: "DESC" },
    });
    const position = lastAdoption ? Number(lastAdoption.position) + 1 : 0;

    const adoption = AdoptionRepository.create({
        userId,
        bioId,
        offerId,
        trackingCode,
        status: "active",
        totalClicks: 0,
        totalEarnings: 0,
        position,
    });

    const saved = await AdoptionRepository.save(adoption);

    // Auto-add a sponsored_links block to the bio if one doesn't exist yet
    try {
        const currentBlocks: any[] = Array.isArray(bio.blocks) ? bio.blocks : [];
        const hasSponsoredBlock = currentBlocks.some((b: any) => b.type === "sponsored_links");
        if (!hasSponsoredBlock) {
            const newBlock = {
                id: crypto.randomUUID(),
                type: "sponsored_links",
                title: "Sponsored Links",
                visible: true,
            };
            bio.blocks = [...currentBlocks, newBlock];
            await BioRepository.save(bio);
        }
    } catch (err) {
        // Non-critical: log but don't fail the adoption
        console.error("[sponsored] Failed to auto-add sponsored_links block:", err);
    }

    return saved;
}

export async function removeAdoption(userId: string, adoptionId: string): Promise<void> {
    const adoption = await AdoptionRepository.findOne({
        where: { id: adoptionId, userId },
    });
    if (!adoption) {
        throw new ApiError(APIErrors.notFoundError, "Adoption not found", 404);
    }

    adoption.status = "removed";
    await AdoptionRepository.save(adoption);
}

export async function getUserAdoptions(userId: string, bioId?: string): Promise<SponsoredAdoptionEntity[]> {
    const where: any = { userId, status: "active" };
    if (bioId) where.bioId = bioId;

    return AdoptionRepository.find({
        where,
        relations: ["offer", "offer.company"],
        order: { position: "ASC" },
    });
}

export async function getBioAdoptions(bioId: string): Promise<SponsoredAdoptionEntity[]> {
    return AdoptionRepository.find({
        where: { bioId, status: "active" },
        relations: ["offer", "offer.company"],
        order: { position: "ASC" },
    });
}

export async function getAdoptionByTracking(trackingCode: string): Promise<SponsoredAdoptionEntity | null> {
    return AdoptionRepository.findOne({
        where: { trackingCode, status: "active" },
        relations: ["offer"],
    });
}

export async function getUserEarnings(userId: string): Promise<{
    totalEarnings: number;
    monthlyEarnings: number;
    totalClicks: number;
    activeLinks: number;
}> {
    const adoptions = await AdoptionRepository.find({
        where: { userId },
    });

    const totalEarnings = adoptions.reduce((sum, a) => sum + Number(a.totalEarnings), 0);
    const totalClicks = adoptions.reduce((sum, a) => sum + Number(a.totalClicks), 0);
    const activeLinks = adoptions.filter(a => a.status === "active").length;

    // Monthly earnings from clicks
    const { SponsoredClickEntity } = await import("../../database/entity/sponsored-click-entity");
    const ClickRepository = AppDataSource.getRepository(SponsoredClickEntity);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const activeAdoptionIds = adoptions.filter(a => a.status === "active").map(a => a.id);

    let monthlyEarnings = 0;
    if (activeAdoptionIds.length > 0) {
        const result = await ClickRepository.createQueryBuilder("click")
            .select("COALESCE(SUM(click.earnedAmount), 0)", "total")
            .where("click.adoptionId IN (:...ids)", { ids: activeAdoptionIds })
            .andWhere("click.isValid = true")
            .andWhere("click.createdAt >= :start", { start: startOfMonth })
            .getRawOne();
        monthlyEarnings = Number(result?.total || 0);
    }

    return { totalEarnings, monthlyEarnings, totalClicks, activeLinks };
}

export async function getEarningsHistory(userId: string, page: number = 1, limit: number = 20): Promise<{
    clicks: any[];
    total: number;
}> {
    const { SponsoredClickEntity } = await import("../../database/entity/sponsored-click-entity");
    const ClickRepository = AppDataSource.getRepository(SponsoredClickEntity);

    const adoptions = await AdoptionRepository.find({ where: { userId } });
    const adoptionIds = adoptions.map(a => a.id);

    if (adoptionIds.length === 0) {
        return { clicks: [], total: 0 };
    }

    const [clicks, total] = await ClickRepository.createQueryBuilder("click")
        .leftJoinAndSelect("click.offer", "offer")
        .where("click.adoptionId IN (:...ids)", { ids: adoptionIds })
        .andWhere("click.isValid = true")
        .orderBy("click.createdAt", "DESC")
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

    return { clicks, total };
}
