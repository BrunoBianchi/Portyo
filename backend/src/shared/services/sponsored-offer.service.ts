import { AppDataSource } from "../../database/datasource";
import { SponsoredOfferEntity } from "../../database/entity/sponsored-offer-entity";
import { ApiError, APIErrors } from "../errors/api-error";
import { MoreThan, In, LessThanOrEqual, IsNull, Not, ILike } from "typeorm";

const OfferRepository = AppDataSource.getRepository(SponsoredOfferEntity);

export interface CreateOfferData {
    title: string;
    description: string;
    linkUrl: string;
    imageUrl?: string;
    category?: string;
    cpcRate: number;
    dailyBudget?: number;
    totalBudget?: number;
    startsAt?: Date;
    expiresAt?: Date;
    targetCountries?: string[];
    minBioTier?: string;
    backgroundColor?: string;
    textColor?: string;
    layout?: string;
}

export async function createOffer(companyId: string, data: CreateOfferData): Promise<SponsoredOfferEntity> {
    if (data.cpcRate < 0.01) {
        throw new ApiError(APIErrors.validationError, "CPC rate must be at least $0.01", 400);
    }

    if (!data.title || !data.linkUrl) {
        throw new ApiError(APIErrors.validationError, "Title and link URL are required", 400);
    }

    const offer = OfferRepository.create({
        companyId,
        title: data.title,
        description: data.description,
        linkUrl: data.linkUrl,
        imageUrl: data.imageUrl,
        category: data.category || "other",
        cpcRate: data.cpcRate,
        dailyBudget: data.dailyBudget,
        totalBudget: data.totalBudget,
        startsAt: data.startsAt,
        expiresAt: data.expiresAt,
        targetCountries: data.targetCountries,
        minBioTier: data.minBioTier || "any",
        backgroundColor: data.backgroundColor,
        textColor: data.textColor,
        layout: data.layout || "card",
        status: "active",
        totalSpent: 0,
        totalClicks: 0,
        totalImpressions: 0,
    });

    return OfferRepository.save(offer);
}

export async function updateOffer(companyId: string, offerId: string, data: Partial<CreateOfferData>): Promise<SponsoredOfferEntity> {
    const offer = await OfferRepository.findOne({ where: { id: offerId, companyId } });
    if (!offer) {
        throw new ApiError(APIErrors.notFoundError, "Offer not found", 404);
    }

    if (data.cpcRate !== undefined && data.cpcRate < 0.01) {
        throw new ApiError(APIErrors.validationError, "CPC rate must be at least $0.01", 400);
    }

    Object.assign(offer, data);
    return OfferRepository.save(offer);
}

export async function getOfferById(id: string): Promise<SponsoredOfferEntity | null> {
    return OfferRepository.findOne({ where: { id }, relations: ["company"] });
}

export async function getCompanyOffers(companyId: string): Promise<SponsoredOfferEntity[]> {
    return OfferRepository.find({
        where: { companyId },
        order: { createdAt: "DESC" },
    });
}

export async function listMarketplaceOffers(filters: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
}): Promise<{ offers: SponsoredOfferEntity[]; total: number }> {
    const { category, search, page = 1, limit = 20 } = filters;

    const where: any = {
        status: "active",
    };

    if (category && category !== "all") {
        where.category = category;
    }

    const qb = OfferRepository.createQueryBuilder("offer")
        .leftJoinAndSelect("offer.company", "company")
        .where("offer.status = :status", { status: "active" })
        .andWhere("(offer.expiresAt IS NULL OR offer.expiresAt > :now)", { now: new Date() })
        .andWhere("(offer.startsAt IS NULL OR offer.startsAt <= :now)", { now: new Date() });

    if (category && category !== "all") {
        qb.andWhere("offer.category = :category", { category });
    }

    if (search) {
        qb.andWhere("(offer.title ILIKE :search OR offer.description ILIKE :search)", {
            search: `%${search}%`,
        });
    }

    qb.orderBy("offer.cpcRate", "DESC")
        .skip((page - 1) * limit)
        .take(limit);

    const [offers, total] = await qb.getManyAndCount();
    return { offers, total };
}

export async function pauseOffer(companyId: string, offerId: string): Promise<SponsoredOfferEntity> {
    const offer = await OfferRepository.findOne({ where: { id: offerId, companyId } });
    if (!offer) {
        throw new ApiError(APIErrors.notFoundError, "Offer not found", 404);
    }

    offer.status = offer.status === "paused" ? "active" : "paused";
    return OfferRepository.save(offer);
}

export async function getOfferStats(companyId: string, offerId: string): Promise<{
    offer: SponsoredOfferEntity;
    adoptionCount: number;
}> {
    const offer = await OfferRepository.findOne({ where: { id: offerId, companyId } });
    if (!offer) {
        throw new ApiError(APIErrors.notFoundError, "Offer not found", 404);
    }

    const { SponsoredAdoptionEntity } = await import("../../database/entity/sponsored-adoption-entity");
    const AdoptionRepository = AppDataSource.getRepository(SponsoredAdoptionEntity);
    const adoptionCount = await AdoptionRepository.count({
        where: { offerId, status: "active" },
    });

    return { offer, adoptionCount };
}
