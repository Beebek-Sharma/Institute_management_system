import axios from 'axios';

// Check if localStorage is available
const isStorageAvailable = () => {
    try {
        if (typeof window === 'undefined') return false;
        const test = '__localStorage_test__';
        window.localStorage.setItem(test, test);
        window.localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
};

const storageAvailable = isStorageAvailable();

// Helper function to safely get localStorage
const safeGetLocalStorage = (key) => {
    if (!storageAvailable) return null;
    try {
        return window.localStorage.getItem(key);
    } catch (error) {
        return null;
    }
};

// Helper function to safely set localStorage
const safeSetLocalStorage = (key, value) => {
    if (!storageAvailable) return;
    try {
        window.localStorage.setItem(key, value);
    } catch (error) {
        // Silently fail
    }
};

// Helper function to safely remove localStorage item
const safeRemoveLocalStorage = (key) => {
    if (!storageAvailable) return;
    try {
        window.localStorage.removeItem(key);
    } catch (error) {
        // Silently fail
    }
};

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
    (config) => {
        const token = safeGetLocalStorage('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Remove Content-Type header for FormData to let axios set multipart/form-data
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = safeGetLocalStorage('refresh_token');
                if (refreshToken) {
                    const response = await axios.post(
                        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/auth/refresh/`,
                        { refresh: refreshToken }
                    );

                    const { access } = response.data;
                    safeSetLocalStorage('access_token', access);

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${access}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, logout user
                safeRemoveLocalStorage('access_token');
                safeRemoveLocalStorage('refresh_token');
                safeRemoveLocalStorage('user');
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
