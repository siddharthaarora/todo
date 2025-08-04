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
    console.log('AuthContext: Checking for stored token on mount');
    const storedToken = localStorage.getItem('token');
    console.log('AuthContext: Stored token found:', !!storedToken);
    
    if (storedToken) {
      try {
        console.log('AuthContext: Decoding stored token...');
        const decoded = jwtDecode<User>(storedToken);
        console.log('AuthContext: Decoded user from stored token:', decoded);
        setUser(decoded);
        setToken(storedToken);
        console.log('AuthContext: Authentication state restored from localStorage');
      } catch (error) {
        console.error('Error decoding stored token:', error);
        localStorage.removeItem('token');
      }
    } else {
      console.log('AuthContext: No stored token found');
    }
  }, []);

  const login = (newToken: string) => {
    try {
      console.log('AuthContext: Login called with token');
      const decoded = jwtDecode<User>(newToken);
      console.log('AuthContext: Decoded user:', decoded);
      setUser(decoded);
      setToken(newToken);
      localStorage.setItem('token', newToken);
      console.log('AuthContext: User state updated, isAuthenticated should be true');
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
  console.log('Expected client ID: 669267381643-81uck4b8mrj06sgq2qp2p20r5kue4drb.apps.googleusercontent.com');
  console.log('Client ID match:', clientId === '669267381643-81uck4b8mrj06sgq2qp2p20r5kue4drb.apps.googleusercontent.com');

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