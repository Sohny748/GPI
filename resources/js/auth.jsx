import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('gpi_user'));
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('gpi_token');
        if (!token) {
            setLoading(false);
            return;
        }
        api.get('/me')
            .then(({ data }) => setUser(data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    const login = async (identifier, password) => {
        const { data } = await api.post('/login', { email: identifier, password });
        localStorage.setItem('gpi_token', data.token);
        localStorage.setItem('gpi_user', JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
    };

    /* Recharge l'utilisateur connecté (après une modification de profil) et met à
       jour le cache local pour que la topbar affiche les nouvelles infos. */
    const refresh = async () => {
        try {
            const { data } = await api.get('/me');
            localStorage.setItem('gpi_user', JSON.stringify(data));
            setUser(data);
            return data;
        } catch {
            return null;
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } finally {
            localStorage.removeItem('gpi_token');
            localStorage.removeItem('gpi_user');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
