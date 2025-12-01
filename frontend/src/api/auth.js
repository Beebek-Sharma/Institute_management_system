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
        // Check if userData is FormData (for file uploads)
        if (userData instanceof FormData) {
            const response = await api.patch('/api/auth/profile/update/', userData);
            return response.data;
        }
        // Regular JSON data
        const response = await api.patch('/api/auth/profile/update/', userData);
        return response.data;
    },

    // Logout (client-side only, clear tokens)
    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    },
};
