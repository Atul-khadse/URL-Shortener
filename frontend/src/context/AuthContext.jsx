import React, { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [email, setEmail] = useState(localStorage.getItem('email') || null);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: jwt, email: userEmail } = response.data;
    localStorage.setItem('token', jwt);
    localStorage.setItem('email', userEmail);
    setToken(jwt);
    setEmail(userEmail);
  };

  const register = async (email, password) => {
    const response = await api.post('/auth/register', { email, password });
    const { token: jwt, email: userEmail } = response.data;
    localStorage.setItem('token', jwt);
    localStorage.setItem('email', userEmail);
    setToken(jwt);
    setEmail(userEmail);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    setToken(null);
    setEmail(null);
  };

  return (
    <AuthContext.Provider value={{ token, email, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);