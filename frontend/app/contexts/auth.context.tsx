import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useCookies } from 'react-cookie';

import { api } from '~/services/api';

interface User {
    id: string;
    email: string;
    fullname: string;
    sufix?: string;
    plan?: 'free' | 'standard' | 'pro';
    verified: boolean;
    role: number;
    provider?: string;
    usage?: {
        bios: number;
        automations: number;
    };
}

interface AuthContextData {
    signed: boolean;
    user: User | null;
    loading: boolean;
    login(email: string, password: string): Promise<void>;
    socialLogin(user: User, token: string): void;
    register(email: string, password: string, fullname: string, sufix: string): Promise<void>;
    logout(): void;
    // Plan checking helpers
    isPro: boolean;
    isStandard: boolean;
    isFree: boolean;
    canAccessFeature: (requiredPlan: 'free' | 'standard' | 'pro') => boolean;
    refreshUser: () => Promise<void>;
}

const PLAN_LEVELS: Record<'free' | 'standard' | 'pro', number> = {
    free: 0,
    standard: 1,
    pro: 2
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [cookies, setCookie, removeCookie] = useCookies(['@App:token', '@App:user']);

    useEffect(() => {
        const storagedUser = cookies['@App:user'];
        const storagedToken = cookies['@App:token'];

        if (storagedToken) {
            api.defaults.headers.common['Authorization'] = `Bearer ${storagedToken}`;
            if (storagedUser) {
                setUser(typeof storagedUser === 'string' ? JSON.parse(storagedUser) : storagedUser);
            }

            api.get('/user/me')
                .then(response => {
                    setUser(response.data);
                    setCookie('@App:user', JSON.stringify(response.data), { path: '/' });
                })
                .catch((error) => {
                    console.error("Failed to fetch user profile", error);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const response = await api.post("/user/login", {
            email, password
        })
        const { token, user } = response.data;
        setUser(user);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        setCookie('@App:user', JSON.stringify(user), { path: '/' });
        setCookie('@App:token', token, { path: '/' });
    }, [setCookie]);

    const socialLogin = useCallback((user: User, token: string) => {
        setUser(user);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setCookie('@App:user', JSON.stringify(user), { path: '/' });
        setCookie('@App:token', token, { path: '/' });
    }, [setCookie]);

    const register = useCallback(async (email: string, password: string, fullname: string, sufix: string) => {
        const response = await api.post("/user/", {
            sufix, fullname, email, password
        })
        const { authentification, bio } = response.data;
        setUser(authentification.user);
        api.defaults.headers.common['Authorization'] = `Bearer ${authentification.token}`;

        setCookie('@App:user', JSON.stringify(authentification.user), { path: '/' });
        setCookie('@App:token', authentification.token, { path: '/' });
    }, [setCookie]);

    const logout = useCallback(async () => {
        try {
            await api.post('/user/logout');
        } catch (error) {
            console.error("Logout failed on server", error);
        } finally {
            setUser(null);
            removeCookie('@App:user', { path: '/' });
            removeCookie('@App:token', { path: '/' });
            // Ideally also clear local storage or other persistence if any
        }
    }, [removeCookie]);

    // Plan checking helpers
    const isPro = user?.plan === 'pro';
    const isStandard = user?.plan === 'standard';
    const isFree = user?.plan === 'free' || !user?.plan;

    const canAccessFeature = useCallback((requiredPlan: 'free' | 'standard' | 'pro') => {
        if (!user) return false;
        const userPlan = user.plan || 'free';
        return PLAN_LEVELS[userPlan] >= PLAN_LEVELS[requiredPlan];
    }, [user]);

    const refreshUser = useCallback(async () => {
        try {
            const response = await api.get('/user/me');
            setUser(response.data);
            setCookie('@App:user', JSON.stringify(response.data), { path: '/' });
        } catch (error) {
            console.error("Failed to refresh user profile", error);
        }
    }, [setCookie]);

    const value = useMemo(() => ({
        signed: !!user,
        user,
        loading,
        login,
        logout,
        register,
        socialLogin,
        refreshUser,
        isPro,
        isStandard,
        isFree,
        canAccessFeature
    }), [user, loading, login, logout, register, socialLogin, refreshUser, isPro, isStandard, isFree, canAccessFeature]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext);
    return context;
}

export default AuthContext;