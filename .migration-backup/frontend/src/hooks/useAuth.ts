import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  // Add other user properties as needed
}

interface Auth {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

// This is a mock implementation. In a real application, you would use a state management library
// like Zustand, Redux, or Context API, and likely integrate with an authentication service.
const useAuth = (): Auth => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing user session, e.g., from localStorage or cookies
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return { user, login, logout };
};

export { useAuth };
