import React, { createContext, useState, useCallback } from "react";
import * as SponsoredApi from "~/services/sponsored-api";
import type {
    SponsoredOffer,
    SponsoredAdoption,
    EarningsSummary,
} from "~/services/sponsored-api";

interface SponsoredLinksContextType {
    offers: SponsoredOffer[];
    totalOffers: number;
    myLinks: SponsoredAdoption[];
    earnings: EarningsSummary | null;
    loading: boolean;
    loadingLinks: boolean;
    loadingEarnings: boolean;
    fetchMarketplace: (filters?: {
        category?: string;
        search?: string;
        page?: number;
    }) => Promise<void>;
    adoptOffer: (offerId: string, bioId: string) => Promise<SponsoredAdoption>;
    removeAdoption: (adoptionId: string) => Promise<void>;
    fetchMyLinks: (bioId?: string) => Promise<void>;
    fetchEarnings: () => Promise<void>;
}

const SponsoredLinksContext = createContext<SponsoredLinksContextType>({
    offers: [],
    totalOffers: 0,
    myLinks: [],
    earnings: null,
    loading: false,
    loadingLinks: false,
    loadingEarnings: false,
    fetchMarketplace: async () => {},
    adoptOffer: async () => ({} as SponsoredAdoption),
    removeAdoption: async () => {},
    fetchMyLinks: async () => {},
    fetchEarnings: async () => {},
});

export function SponsoredLinksProvider({ children }: { children: React.ReactNode }) {
    const [offers, setOffers] = useState<SponsoredOffer[]>([]);
    const [totalOffers, setTotalOffers] = useState(0);
    const [myLinks, setMyLinks] = useState<SponsoredAdoption[]>([]);
    const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingLinks, setLoadingLinks] = useState(false);
    const [loadingEarnings, setLoadingEarnings] = useState(false);

    const fetchMarketplace = useCallback(async (filters?: {
        category?: string;
        search?: string;
        page?: number;
    }) => {
        setLoading(true);
        try {
            const result = await SponsoredApi.fetchMarketplace(filters);
            setOffers(result.offers);
            setTotalOffers(result.total);
        } finally {
            setLoading(false);
        }
    }, []);

    const adoptOffer = useCallback(async (offerId: string, bioId: string) => {
        const adoption = await SponsoredApi.adoptOffer(offerId, bioId);
        setMyLinks(prev => [...prev, adoption]);
        return adoption;
    }, []);

    const removeAdoption = useCallback(async (adoptionId: string) => {
        await SponsoredApi.removeAdoption(adoptionId);
        setMyLinks(prev => prev.filter(l => l.id !== adoptionId));
    }, []);

    const fetchMyLinks = useCallback(async (bioId?: string) => {
        setLoadingLinks(true);
        try {
            const links = await SponsoredApi.fetchMyLinks(bioId);
            setMyLinks(links);
        } finally {
            setLoadingLinks(false);
        }
    }, []);

    const fetchEarnings = useCallback(async () => {
        setLoadingEarnings(true);
        try {
            const data = await SponsoredApi.fetchEarnings();
            setEarnings(data);
        } finally {
            setLoadingEarnings(false);
        }
    }, []);

    return (
        <SponsoredLinksContext.Provider
            value={{
                offers,
                totalOffers,
                myLinks,
                earnings,
                loading,
                loadingLinks,
                loadingEarnings,
                fetchMarketplace,
                adoptOffer,
                removeAdoption,
                fetchMyLinks,
                fetchEarnings,
            }}
        >
            {children}
        </SponsoredLinksContext.Provider>
    );
}

export default SponsoredLinksContext;
