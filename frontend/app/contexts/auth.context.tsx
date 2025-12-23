import React, { createContext, useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';

import { api } from '~/services/api';

interface User {
    id: string;
    email: string;
    fullname: string;
    sufix?: string;
    plan?: 'free' | 'standard' | 'pro';
    verified:boolean;
    role: number;
}

interface AuthContextData {
    signed: boolean;
    user: User | null;
    loading: boolean;
    login(email: string, password: string): Promise<void>;
    register(email: string, password: string, fullname: string, sufix: string): Promise<void>;
    logout(): void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [cookies, setCookie, removeCookie] = useCookies(['@App:token', '@App:user']);

    useEffect(() => {
        const storagedUser = cookies['@App:user'];
        const storagedToken = cookies['@App:token'];

        if (storagedToken && storagedUser) {
            setUser(storagedUser);
            api.defaults.headers.common['Authorization'] = `Bearer ${storagedToken}`;
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const response = await api.post("/user/login", {
            email, password
        })
        const { token, user } = response.data;
        setUser(user);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        setCookie('@App:user', JSON.stringify(user), { path: '/' });
        setCookie('@App:token', token, { path: '/' });
    }

    const register = async (email: string, password: string, fullname: string, sufix: string) => {
        const response = await api.post("/user/", {
            sufix, fullname, email, password
        })
        const { authentification,bio } = response.data;
        setUser(authentification.user);
        api.defaults.headers.common['Authorization'] = `Bearer ${authentification.token}`;

        setCookie('@App:user', JSON.stringify(authentification.user), { path: '/' });
        setCookie('@App:token', authentification.token, { path: '/' });
    }

    const logout = () => {
        setUser(null);
        removeCookie('@App:user', { path: '/' });
        removeCookie('@App:token', { path: '/' });
    };

    return (
        <AuthContext.Provider value={{ signed: !!user, user, loading, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;