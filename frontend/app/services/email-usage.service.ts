import { api } from "./api";

export interface EmailUsage {
    sent: number;
    limit: number;
    plan: string;
}

export const EmailUsageService = {
    /**
     * Get current email usage statistics
     */
    async getEmailUsage(): Promise<EmailUsage> {
        const response = await api.get<EmailUsage>("/user/email-usage");
        return response.data;
    },
};
