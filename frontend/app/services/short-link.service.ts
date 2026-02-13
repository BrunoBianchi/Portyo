import { api } from "~/services/api";

export interface ShortLink {
    id: string;
    title: string;
    slug: string;
    destinationUrl: string;
    clicks: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export const getShortLinks = async (bioId: string): Promise<ShortLink[]> => {
    const response = await api.get("/short-links", { params: { bioId } });
    return response.data || [];
};

export const createShortLink = async (payload: {
    bioId: string;
    title: string;
    slug: string;
    destinationUrl: string;
}): Promise<ShortLink> => {
    const response = await api.post("/short-links", payload);
    return response.data;
};

export const updateShortLink = async (
    id: string,
    payload: Partial<Pick<ShortLink, "title" | "slug" | "destinationUrl" | "isActive">>
): Promise<ShortLink> => {
    const response = await api.patch(`/short-links/${id}`, payload);
    return response.data;
};

export const deleteShortLink = async (id: string): Promise<void> => {
    await api.delete(`/short-links/${id}`);
};
