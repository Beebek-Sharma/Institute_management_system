import api from './axios';

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

// Helper function to safely remove localStorage item
const safeRemoveLocalStorage = (key) => {
  if (!storageAvailable) return;
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    // Silently fail
  }
};

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
        safeRemoveLocalStorage('access_token');
        safeRemoveLocalStorage('refresh_token');
        safeRemoveLocalStorage('user');
    },
};
