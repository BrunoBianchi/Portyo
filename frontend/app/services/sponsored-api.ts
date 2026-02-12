import { api } from "./api";

// ==================== MARKETPLACE ====================

export async function fetchMarketplace(filters?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
}) {
    const params = new URLSearchParams();
    if (filters?.category) params.set("category", filters.category);
    if (filters?.search) params.set("search", filters.search);
    if (filters?.page) params.set("page", String(filters.page));
    if (filters?.limit) params.set("limit", String(filters.limit));

    const { data } = await api.get(`/sponsored/marketplace?${params.toString()}`);
    return data as { offers: SponsoredOffer[]; total: number };
}

export async function fetchOfferDetails(offerId: string) {
    const { data } = await api.get(`/sponsored/marketplace/${offerId}`);
    return data as SponsoredOffer;
}

// ==================== ADOPTIONS ====================

export async function adoptOffer(offerId: string, bioId: string) {
    const { data } = await api.post("/sponsored/adopt", { offerId, bioId });
    return data as SponsoredAdoption;
}

export async function removeAdoption(adoptionId: string) {
    const { data } = await api.delete(`/sponsored/adopt/${adoptionId}`);
    return data;
}

export async function fetchMyLinks(bioId?: string) {
    const params = bioId ? `?bioId=${bioId}` : "";
    const { data } = await api.get(`/sponsored/my-links${params}`);
    return data as SponsoredAdoption[];
}

// ==================== EARNINGS ====================

export async function fetchEarnings() {
    const { data } = await api.get("/sponsored/earnings");
    return data as EarningsSummary;
}

export async function fetchEarningsHistory(page?: number, limit?: number) {
    const params = new URLSearchParams();
    if (page) params.set("page", String(page));
    if (limit) params.set("limit", String(limit));
    const { data } = await api.get(`/sponsored/earnings/history?${params.toString()}`);
    return data as { clicks: any[]; total: number };
}

// ==================== PUBLIC ====================

export async function fetchBioSponsoredLinks(bioId: string) {
    const { data } = await api.get(`/public/sponsored/bio/${bioId}`);
    return data as SponsoredLinkPublic[];
}

// ==================== TYPES ====================

export interface SponsoredOffer {
    id: string;
    companyId: string;
    title: string;
    description: string;
    linkUrl: string;
    imageUrl?: string;
    category: string;
    cpcRate: number;
    dailyBudget?: number;
    totalBudget?: number;
    totalSpent: number;
    totalClicks: number;
    totalImpressions: number;
    status: string;
    startsAt?: string;
    expiresAt?: string;
    targetCountries?: string[];
    minBioTier: string;
    backgroundColor?: string;
    textColor?: string;
    layout: string;
    createdAt: string;
    company?: {
        id: string;
        companyName: string;
        logo?: string;
        website?: string;
        industry?: string;
    };
}

export interface SponsoredAdoption {
    id: string;
    userId: string;
    bioId: string;
    offerId: string;
    trackingCode: string;
    status: string;
    totalClicks: number;
    totalEarnings: number;
    position: number;
    createdAt: string;
    offer: SponsoredOffer;
}

export interface EarningsSummary {
    totalEarnings: number;
    monthlyEarnings: number;
    totalClicks: number;
    activeLinks: number;
}

export interface SponsoredLinkPublic {
    id: string;
    trackingCode: string;
    position: number;
    offer: {
        id: string;
        title: string;
        description: string;
        imageUrl?: string;
        linkUrl: string;
        category: string;
        backgroundColor?: string;
        textColor?: string;
        layout: string;
        companyName?: string;
        companyLogo?: string;
    };
}
