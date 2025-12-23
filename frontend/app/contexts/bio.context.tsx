import React, { createContext, useState, useEffect } from "react";
import { api } from "~/services/api";

interface Bio {
    id: string;
    sufix: string;
    html: string;
    views: number;
    clicks: number;
    userId: string;
}

interface BioData {
    bios: Bio[];
    bio: Bio | null;
    createBio(sufix: string): Promise<void>;
    getBio(sufix: string): Promise<void>;
    getBios(): Promise<void>;
    selectBio(bio: Bio): void;
}

const BioContext = createContext<BioData>({} as BioData)

export const BioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [bios, setBios] = useState<Bio[]>([])
    const [bio, setBio] = useState<Bio | null>(null)

    const getBios = async () => {
        try {
            const response = await api.get("/bio/")
            setBios(response.data)
            if (response.data.length > 0 && !bio) {
                setBio(response.data[0])
            }
        } catch (error) {
            console.error("Failed to fetch bios", error)
        }
    }

    const createBio = async (sufix: string) => {
        try {
            await api.post("/bio/", { sufix })
            await getBios()
           
        } catch (error) {
            console.error("Failed to create bio", error)
            throw error;
        }
    }

    const getBio = async (sufix: string) => {
        try {
            const response = await api.get(`/bio/${sufix}`)
            setBio(response.data)
        } catch (error) {
            console.error("Failed to fetch bio", error)
        }
    }

    const selectBio = (selectedBio: Bio) => {
        setBio(selectedBio)
    }

    useEffect(() => {
        getBios()
    }, [bio,bios])

    return (
        <BioContext.Provider value={{ bio, bios, createBio, getBio, getBios, selectBio }}>
            {children}
        </BioContext.Provider>
    )
}


export default BioContext;