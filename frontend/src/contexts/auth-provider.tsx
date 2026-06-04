
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  setToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const setToken = (newToken: string) => {
    setTokenState(newToken);
    localStorage.setItem('token', newToken);
    // Re-fetch user profile or decode token
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setTokenState(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      // Fetch user data from token
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setUser({ ...decodedToken, id: decodedToken.sub }); 
      setLoading(false);
    } else {
      setUser(null);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const data = await res.json();
      setToken(data.accessToken);
      toast.success('Connexion réussie');
    } else {
      toast.error('Échec de la connexion');
      throw new Error('Login failed');
    }
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    if (res.ok) {
      const data = await res.json();
      setToken(data.accessToken);
      toast.success('Inscription réussie');
    } else {
      toast.error("Échec de l'inscription");
      throw new Error('Registration failed');
    }
  };

  const logout = () => {
    setTokenState(null);
    localStorage.removeItem('token');
    router.push('/login');
    toast.info('Vous avez été déconnecté');
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, login, register, logout, setToken }}>
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
