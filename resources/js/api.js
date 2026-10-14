import axios from 'axios';

export const api = axios.create({
    baseURL: '/api',
    headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('gpi_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (r) => r,
    (error) => {
        if (error.response?.status === 401 && !error.config.url.includes('/login')) {
            localStorage.removeItem('gpi_token');
            localStorage.removeItem('gpi_user');
            if (!window.location.pathname.includes('/connexion')) {
                window.location.href = '/connexion';
            }
        }
        return Promise.reject(error);
    },
);
