import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../api/auth';

const AuthContext = createContext(null);

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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = safeGetLocalStorage('user');
    const accessToken = safeGetLocalStorage('access_token');

    if (storedUser && accessToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authAPI.login(email, password);

      setUser(data.user);
      safeSetLocalStorage('user', JSON.stringify(data.user));
      safeSetLocalStorage('access_token', data.tokens.access);
      safeSetLocalStorage('refresh_token', data.tokens.refresh);

      return { success: true, user: data.user };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      const data = await authAPI.register(userData);

      setUser(data.user);
      safeSetLocalStorage('user', JSON.stringify(data.user));
      safeSetLocalStorage('access_token', data.tokens.access);
      safeSetLocalStorage('refresh_token', data.tokens.refresh);

      return { success: true, user: data.user };
    } catch (error) {
      const errorMessage = error.response?.data?.error
        || error.response?.data?.username?.[0]
        || error.response?.data?.email?.[0]
        || error.response?.data?.password?.[0]
        || error.response?.data?.non_field_errors?.[0]
        || 'Registration failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  const updateProfile = (updatedUserData) => {
    // If it's a direct user object (from Settings.js), just update it
    if (updatedUserData && typeof updatedUserData === 'object') {
      setUser(updatedUserData);
      safeSetLocalStorage('user', JSON.stringify(updatedUserData));
      return { success: true, user: updatedUserData };
    }
    return { success: false, error: 'Invalid user data' };
  };

  const setAuthData = (userData, tokens) => {
    // Directly set authentication data (for unified auth flow)
    setUser(userData);
    safeSetLocalStorage('user', JSON.stringify(userData));
    safeSetLocalStorage('access_token', tokens.access);
    safeSetLocalStorage('refresh_token', tokens.refresh);
    return { success: true, user: userData };
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateProfile, setAuthData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};