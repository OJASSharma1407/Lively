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
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (authChecked) return; // Prevent multiple auth checks
    
    const checkAuth = async () => {
      console.log('Checking auth, token exists:', !!token);
      if (token) {
        try {
          // Verify token is still valid
          const response = await userAPI.getProfile();
          console.log('Auth check successful');
          setUser({ token, ...response.data });
        } catch (error) {
          console.log('Auth check failed:', {
            status: error.response?.status,
            message: error.response?.data?.error || error.message
          });
          // Clear invalid token
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } else {
        console.log('No token found');
      }
      setLoading(false);
      setAuthChecked(true);
    };
    
    checkAuth();
  }, [token, authChecked]);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const newToken = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser({ token: newToken });
      setAuthChecked(false); // Reset to allow new auth check
      
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
    setAuthChecked(true); // Mark as checked to prevent auth loop
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