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
    async getSales(bioId: string): Promise<SalesData> {
        const response = await api.get<SalesData>(`/analytics/sales?bioId=${bioId}`);
        return response.data;
    },
};
