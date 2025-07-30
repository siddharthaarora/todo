import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for token in localStorage on mount
    const storedToken = localStorage.getItem('token');
    
    if (storedToken) {
      try {
        const decoded = jwtDecode<User>(storedToken);
        setUser(decoded);
        setToken(storedToken);
      } catch (error) {
        console.error('Error decoding stored token:', error);
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = (newToken: string) => {
    try {
      const decoded = jwtDecode<User>(newToken);
      setUser(decoded);
      setToken(newToken);
      localStorage.setItem('token', newToken);
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const logout = () => {
    console.log('Logging out user');
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  console.log('Client ID from env:', clientId);
  console.log('Current origin:', window.location.origin);
  console.log('Full URL:', window.location.href);

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthContext.Provider
        value={{
          user,
          token,
          login,
          logout,
          isAuthenticated: !!user,
        }}
      >
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 