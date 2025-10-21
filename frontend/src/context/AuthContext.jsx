import React, { createContext, useState, useContext, useEffect } from 'react';
import { signupUser, loginUser } from '../services/api';
import apiClient from '../services/api';

// 1. Create the Context
const AuthContext = createContext();

// 2. Create the Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);

  // Effect to set the token in localStorage and axios headers
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token); // 
      // Set the auth token for all future axios requests
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete apiClient.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // --- Functions ---

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await loginUser({ email, password });
      setToken(response.data.token); // [cite: 19]
      setUser(response.data.user); // [cite: 19]
      setLoading(false);
      return response;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signup = async (email, password) => {
    setLoading(true);
    try {
      const response = await signupUser({ email, password });
      setToken(response.data.token); // [cite: 19]
      setUser(response.data.user); // [cite: 19]
      setLoading(false);
      return response;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  // 3. Value to be passed to consuming components
  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 4. Custom hook to easily use the context
export const useAuth = () => {
  return useContext(AuthContext);
};