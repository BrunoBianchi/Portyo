import React, { createContext, useState, useEffect, useCallback } from "react";
import * as CompanyApi from "~/services/company-api";
import type { CompanyProfile, CompanyOffer, CreateOfferData } from "~/services/company-api";

interface CompanyAuthContextType {
    company: CompanyProfile | null;
    offers: CompanyOffer[];
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: {
        companyName: string;
        email: string;
        password: string;
        logo?: string;
        website?: string;
        description?: string;
        industry?: string;
    }) => Promise<void>;
    logout: () => void;
    fetchProfile: () => Promise<void>;
    updateProfile: (data: Partial<CompanyProfile>) => Promise<void>;
    createOffer: (data: CreateOfferData) => Promise<CompanyOffer>;
    fetchOffers: () => Promise<void>;
    togglePause: (offerId: string) => Promise<void>;
}

const CompanyAuthContext = createContext<CompanyAuthContextType>({
    company: null,
    offers: [],
    loading: false,
    isAuthenticated: false,
    login: async () => {},
    register: async () => {},
    logout: () => {},
    fetchProfile: async () => {},
    updateProfile: async () => {},
    createOffer: async () => ({} as CompanyOffer),
    fetchOffers: async () => {},
    togglePause: async () => {},
});

export function CompanyAuthProvider({ children }: { children: React.ReactNode }) {
    const [company, setCompany] = useState<CompanyProfile | null>(null);
    const [offers, setOffers] = useState<CompanyOffer[]>([]);
    const [loading, setLoading] = useState(true);

    const isAuthenticated = !!company;

    // Initialize from cookies
    useEffect(() => {
        const token = CompanyApi.getCompanyToken();
        const cached = CompanyApi.getCompanyData();
        if (token && cached) {
            setCompany(cached);
            // Fetch fresh data
            CompanyApi.fetchCompanyProfile()
                .then(profile => setCompany(profile))
                .catch(() => {
                    CompanyApi.clearCompanyToken();
                    setCompany(null);
                });
        }
        setLoading(false);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const result = await CompanyApi.companyLogin(email, password);
        setCompany(result.company);
    }, []);

    const register = useCallback(async (data: {
        companyName: string;
        email: string;
        password: string;
        logo?: string;
        website?: string;
        description?: string;
        industry?: string;
    }) => {
        const result = await CompanyApi.companyRegister(data);
        setCompany(result.company);
    }, []);

    const logout = useCallback(() => {
        CompanyApi.companyLogout();
        setCompany(null);
        setOffers([]);
    }, []);

    const fetchProfile = useCallback(async () => {
        const profile = await CompanyApi.fetchCompanyProfile();
        setCompany(profile);
    }, []);

    const updateProfile = useCallback(async (data: Partial<CompanyProfile>) => {
        const profile = await CompanyApi.updateCompanyProfile(data);
        setCompany(profile);
    }, []);

    const createOffer = useCallback(async (data: CreateOfferData) => {
        const offer = await CompanyApi.createCompanyOffer(data);
        setOffers(prev => [offer, ...prev]);
        return offer;
    }, []);

    const fetchOffers = useCallback(async () => {
        const list = await CompanyApi.fetchCompanyOffers();
        setOffers(list);
    }, []);

    const togglePause = useCallback(async (offerId: string) => {
        const updated = await CompanyApi.toggleOfferPause(offerId);
        setOffers(prev => prev.map(o => (o.id === offerId ? updated : o)));
    }, []);

    return (
        <CompanyAuthContext.Provider
            value={{
                company,
                offers,
                loading,
                isAuthenticated,
                login,
                register,
                logout,
                fetchProfile,
                updateProfile,
                createOffer,
                fetchOffers,
                togglePause,
            }}
        >
            {children}
        </CompanyAuthContext.Provider>
    );
}

export default CompanyAuthContext;
