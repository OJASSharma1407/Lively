import React, { createContext, useContext, useState, useEffect } from 'react';
import { userAPI } from '../utils/api';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const loadTheme = async () => {
    try {
      // Try to get theme from backend
      const response = await userAPI.getProfile();
      const userTheme = response.data?.theme || 'light';
      setTheme(userTheme);
    } catch (error) {
      // Fallback to localStorage
      const savedTheme = localStorage.getItem('theme') || 'light';
      setTheme(savedTheme);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // Save to localStorage immediately
    localStorage.setItem('theme', newTheme);
    
    // Save to backend
    try {
      await userAPI.updateTheme(newTheme);
    } catch (error) {
      console.error('Failed to save theme to backend:', error);
    }
  };

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
    loading
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};