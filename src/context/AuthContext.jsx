import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../lib/api';
import { getAuthState, setAuthState, clearAuthState, setStoredToken, setStoredRefreshToken, setStoredUser, clearStoredUser } from '../lib/auth';
import { fetchAndCachePreviousEmails } from '../lib/previousEmails';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const { user: storedUser, isAuthenticated: storedAuth } = getAuthState();
    if (storedAuth && storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { user: userData, access_token, refresh_token } = response.data;

      setStoredToken(access_token);
      setStoredRefreshToken(refresh_token);
      setStoredUser(userData);
      setUser(userData);
      setIsAuthenticated(true);

      // Preload previous emails after login
      fetchAndCachePreviousEmails();

      return { success: true, user: userData };
    } catch (error) {
      // Handle different error scenarios
      let message = 'Login failed. Please try again.';
      
      if (error.response) {
        // Server responded with an error status (4xx, 5xx)
        const errorData = error.response.data;
        
        // Handle nested error structure: { error: { code, message } }
        if (errorData?.error?.message && errorData.error.message.trim()) {
          message = errorData.error.message;
        } else if (errorData?.error && typeof errorData.error === 'string' && errorData.error.trim()) {
          message = errorData.error;
        } else if (error.response.status === 401) {
          message = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.response.status === 429) {
          message = 'Too many attempts. Please try again later.';
        }
      } else if (error.request) {
        // Network error - request was made but no response received
        message = 'Unable to connect to server. Please check your internet connection.';
      }
      
      return { success: false, error: message };
    }
  }, []);

  const register = useCallback(async (email, password) => {
    try {
      const response = await authAPI.register({ email, password });
      const { user: userData, access_token, refresh_token } = response.data;

      setStoredToken(access_token);
      setStoredRefreshToken(refresh_token);
      setStoredUser(userData);
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      // Handle different error scenarios
      let message = 'Registration failed. Please try again.';
      
      if (error.response) {
        // Server responded with an error status (4xx, 5xx)
        const errorData = error.response.data;
        
        // Handle nested error structure: { error: { code, message } }
        if (errorData?.error?.message && errorData.error.message.trim()) {
          message = errorData.error.message;
        } else if (errorData?.error && typeof errorData.error === 'string' && errorData.error.trim()) {
          message = errorData.error;
        } else if (error.response.status === 409) {
          message = 'An account with this email already exists.';
        } else if (error.response.status === 429) {
          message = 'Too many attempts. Please try again later.';
        }
      } else if (error.request) {
        // Network error - request was made but no response received
        message = 'Unable to connect to server. Please check your internet connection.';
      }
      
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {
      // Ignore logout errors, clear local state anyway
    } finally {
      clearAuthState();
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const response = await authAPI.me();
      const userData = response.data;
      setStoredUser(userData);
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    try {
      await authAPI.forgotPassword(email);
      return { success: true };
    } catch (error) {
      // Always return success to prevent email enumeration
      // The backend always returns success if email exists
      return { success: true };
    }
  }, []);

  const resetPassword = useCallback(async (email, otp, newPassword) => {
    try {
      await authAPI.resetPassword({ email, otp, new_password: newPassword });
      return { success: true };
    } catch (error) {
      let message = 'Password reset failed. Please try again.';

      if (error.response) {
        const errorData = error.response.data;

        if (errorData?.error?.message && errorData.error.message.trim()) {
          message = errorData.error.message;
        } else if (errorData?.error && typeof errorData.error === 'string' && errorData.error.trim()) {
          message = errorData.error;
        } else if (error.response.status === 429) {
          message = 'Too many attempts. Please try again later.';
        } else if (error.response.status === 400) {
          message = 'Invalid or expired OTP. Please request a new one.';
        }
      } else if (error.request) {
        message = 'Unable to connect to server. Please check your internet connection.';
      }

      return { success: false, error: message };
    }
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    fetchUser,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
