import api from './axios';

export const authAPI = {
    // Register new user
    register: async (userData) => {
        const response = await api.post('/api/auth/register/', userData);
        return response.data;
    },

    // Login user
    login: async (username, password) => {
        const response = await api.post('/api/auth/login/', { username, password });
        return response.data;
    },

    // Get user profile
    getProfile: async () => {
        const response = await api.get('/api/auth/profile/');
        return response.data;
    },

    // Update user profile
    updateProfile: async (userData) => {
        const response = await api.put('/api/auth/profile/update/', userData);
        return response.data;
    },

    // Logout (client-side only, clear tokens)
    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    },
};
