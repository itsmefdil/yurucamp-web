import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            // Use Basic Auth for public access if configured
            const user = import.meta.env.VITE_BASIC_AUTH_USER;
            const pass = import.meta.env.VITE_BASIC_AUTH_PASSWORD;

            if (user && pass) {
                const credentials = btoa(`${user}:${pass}`);
                config.headers.Authorization = `Basic ${credentials}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

function refreshAccessToken(): Promise<string | null> {
    if (!refreshPromise) {
        refreshPromise = api.post('/auth/refresh')
            .then((res) => {
                const newToken = res.data?.token;
                if (newToken) localStorage.setItem('token', newToken);
                return newToken || null;
            })
            .catch((err) => {
                localStorage.removeItem('token');
                return null;
            })
            .finally(() => {
                isRefreshing = false;
                refreshPromise = null;
            });
    }
    isRefreshing = true;
    return refreshPromise;
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const newToken = await refreshAccessToken();
            if (newToken) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } else {
                // Refresh failed, redirect to login
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;
