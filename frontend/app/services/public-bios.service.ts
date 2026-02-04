import { api } from "./api";

export interface PublicBio {
  id: string;
  sufix: string;
  seoTitle?: string;
  fullName?: string;
  profileImage?: string;
  category?: string;
  views?: number;
}

export const getRandomPublicBios = async (limit: number = 12): Promise<PublicBio[]> => {
  try {
    const response = await api.get(`/public/bios/random?limit=${limit}`);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching random public bios:", error);
    return [];
  }
};

export const getPublicBios = async (): Promise<PublicBio[]> => {
  try {
    const response = await api.get('/public/bios');
    return response.data || [];
  } catch (error) {
    console.error("Error fetching public bios:", error);
    return [];
  }
};
