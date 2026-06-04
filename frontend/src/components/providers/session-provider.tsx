'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const AuthContext = createContext<{
  user: any;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}>({ user: null, token: null, login: () => {}, logout: () => {} });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('jwt');

    if (token) {
      setToken(token);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setUser(data.user);
        })
        .catch(() => {
          logout();
        });
    }
  }, [token]);

  const login = (token: string) => {
    localStorage.setItem('jwt', token);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    setToken(null);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
