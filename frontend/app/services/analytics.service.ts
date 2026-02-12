import { api } from "./api";

export interface AnalyticsData {
    views: {
        total: number;
        currentMonth: number;
        lastMonth: number;
        change: number;
    };
    clicks: {
        total: number;
        currentMonth: number;
        lastMonth: number;
        change: number;
    };
    ctr: {
        average: number;
        currentMonth: number;
        lastMonth: number;
        change: number;
    };
}

export interface TopProduct {
    name: string;
    revenue: number;
    sales: number;
}

export interface DailyRevenue {
    date: string;
    amount: number;
}

export interface Transaction {
    id: string;
    amount: number;
    currency: string;
    description: string;
    date: string;
    status: string;
}

export interface SalesData {
    connected: boolean;
    error?: string;
    sales: {
        current: number;
        lastMonth: number;
        change: number;
    };
    revenue: {
        current: number;
        lastMonth: number;
        change: number;
        currency: string;
    };
    averageOrderValue: number;
    topProducts: TopProduct[];
    dailyRevenue: DailyRevenue[];
    recentTransactions: Transaction[];
    range?: {
        startDate: string;
        endDate: string;
    };
}

export interface SalesRangeFilters {
    days?: number;
    startDate?: string;
    endDate?: string;
}

export const AnalyticsService = {
    /**
     * Get analytics data for a bio
     */
    async getAnalytics(bioId: string): Promise<AnalyticsData> {
        const response = await api.get<AnalyticsData>(`/analytics/overview?bioId=${bioId}`);
        return response.data;
    },

    /**
     * Get detailed sales data for a bio
     */
    async getSales(bioId: string, filters?: SalesRangeFilters): Promise<SalesData> {
        const params = new URLSearchParams({ bioId });

        if (filters?.days) params.set("days", String(filters.days));
        if (filters?.startDate) params.set("startDate", filters.startDate);
        if (filters?.endDate) params.set("endDate", filters.endDate);

        const response = await api.get<SalesData>(`/analytics/sales?${params.toString()}`);
        return response.data;
    },
};
