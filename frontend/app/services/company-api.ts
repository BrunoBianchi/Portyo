import axios from "axios";
import { resolveApiBaseURL } from "./api";


export const companyApi = axios.create({
    baseURL: resolveApiBaseURL(),
    withCredentials: true,
});

// Token management
const COMPANY_TOKEN_KEY = "@App:companyToken";
const COMPANY_DATA_KEY = "@App:companyData";

export function setCompanyToken(token: string) {
    if (typeof document !== "undefined") {
        document.cookie = `${COMPANY_TOKEN_KEY}=${token}; path=/; max-age=${7 * 24 * 3600}`;
    }
    companyApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export function getCompanyToken(): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp(`${COMPANY_TOKEN_KEY}=([^;]+)`));
    return match ? match[1] : null;
}

export function clearCompanyToken() {
    if (typeof document !== "undefined") {
        document.cookie = `${COMPANY_TOKEN_KEY}=; Max-Age=0; path=/;`;
        document.cookie = `${COMPANY_DATA_KEY}=; Max-Age=0; path=/;`;
    }
    delete companyApi.defaults.headers.common["Authorization"];
}

export function setCompanyData(company: CompanyProfile) {
    if (typeof document !== "undefined") {
        document.cookie = `${COMPANY_DATA_KEY}=${encodeURIComponent(JSON.stringify(company))}; path=/; max-age=${7 * 24 * 3600}`;
    }
}

export function getCompanyData(): CompanyProfile | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp(`${COMPANY_DATA_KEY}=([^;]+)`));
    if (!match) return null;
    try {
        return JSON.parse(decodeURIComponent(match[1]));
    } catch {
        return null;
    }
}

// Initialize token from cookie
const existingToken = getCompanyToken();
if (existingToken) {
    companyApi.defaults.headers.common["Authorization"] = `Bearer ${existingToken}`;
}

// ==================== AUTH ====================

export async function companyRegister(data: {
    companyName: string;
    email: string;
    password: string;
    logo?: string;
    website?: string;
    description?: string;
    industry?: string;
}) {
    const { data: result } = await companyApi.post("/company/auth/register", data);
    setCompanyToken(result.token);
    setCompanyData(result.company);
    return result as { token: string; company: CompanyProfile };
}

export async function companyLogin(email: string, password: string) {
    const { data: result } = await companyApi.post("/company/auth/login", { email, password });
    setCompanyToken(result.token);
    setCompanyData(result.company);
    return result as { token: string; company: CompanyProfile };
}

export function companyLogout() {
    clearCompanyToken();
}

// ==================== PROFILE ====================

export async function fetchCompanyProfile() {
    const { data } = await companyApi.get("/company/profile");
    return data as CompanyProfile;
}

export async function updateCompanyProfile(profile: Partial<CompanyProfile>) {
    const { data } = await companyApi.put("/company/profile", profile);
    return data as CompanyProfile;
}

// ==================== OFFERS ====================

export async function createCompanyOffer(offer: CreateOfferData) {
    const { data } = await companyApi.post("/company/offers", offer);
    return data as CompanyOffer;
}

export async function fetchCompanyOffers() {
    const { data } = await companyApi.get("/company/offers");
    return data as CompanyOffer[];
}

export async function updateCompanyOffer(offerId: string, updates: Partial<CreateOfferData>) {
    const { data } = await companyApi.put(`/company/offers/${offerId}`, updates);
    return data as CompanyOffer;
}

export async function toggleOfferPause(offerId: string) {
    const { data } = await companyApi.patch(`/company/offers/${offerId}/pause`);
    return data as CompanyOffer;
}

export async function fetchOfferStats(offerId: string) {
    const { data } = await companyApi.get(`/company/offers/${offerId}/stats`);
    return data as { offer: CompanyOffer; adoptionCount: number };
}

// ==================== TYPES ====================

export interface CompanyProfile {
    id: string;
    companyName: string;
    email: string;
    logo?: string;
    website?: string;
    description?: string;
    industry?: string;
    balance: number;
    totalSpent: number;
    verified?: boolean;
    createdAt?: string;
}

export interface CreateOfferData {
    title: string;
    description: string;
    linkUrl: string;
    imageUrl?: string;
    category?: string;
    cpcRate: number;
    dailyBudget?: number;
    totalBudget?: number;
    startsAt?: string;
    expiresAt?: string;
    targetCountries?: string[];
    minBioTier?: string;
    backgroundColor?: string;
    textColor?: string;
    layout?: string;
}

export interface CompanyOffer {
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
}
