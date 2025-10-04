import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          // Verify token is still valid
          const response = await userAPI.getProfile();
          setUser({ token, ...response.data });
        } catch (error) {
          console.log('Auth check failed:', error.response?.status);
          // Only clear token if it's actually invalid (401/403)
          if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          } else {
            // Network error - keep token but don't set user
            console.log('Network error, keeping token');
          }
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const newToken = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser({ token: newToken });
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await authAPI.register(username, email, password);
      const newToken = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser({ token: newToken });
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};