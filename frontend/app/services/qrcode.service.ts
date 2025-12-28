import { api } from "./api";

export interface QrCode {
    id: string;
    value: string;
    clicks: number;
    views: number;
    createdAt: string;
}

export const getQrCodes = async (bioId: string): Promise<QrCode[]> => {
    const response = await api.get(`/qrcode/${bioId}`);
    return response.data;
};

export const createQrCode = async (bioId: string, value: string): Promise<QrCode> => {
    const response = await api.post(`/qrcode/${bioId}`, { value });
    return response.data;
};
