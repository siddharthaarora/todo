import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { config } from '../config/environment';
import { User } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
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
        
        // Try to fetch full user profile from backend in the background
        fetchUserProfile(storedToken).catch(error => {
          console.error('Failed to fetch user profile on mount, but user is still logged in:', error);
        });
      } catch (error) {
        console.error('Error decoding stored token:', error);
        localStorage.removeItem('token');
      }
    } else {
      console.log('AuthContext: No stored token found');
    }
  }, []);

  const fetchUserProfile = async (token: string) => {
    try {
      console.log('AuthContext: Attempting to fetch user profile from:', `${config.apiUrl}/auth/me`);
      
      const response = await fetch(`${config.apiUrl}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const userProfile = await response.json();
        console.log('AuthContext: Successfully fetched user profile from backend');
        setUser(userProfile);
      } else if (response.status === 401) {
        // Token is invalid or expired
        console.warn('AuthContext: Token is invalid or expired, clearing authentication');
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      } else {
        // Other errors (like backend not running)
        console.warn('AuthContext: Could not fetch user profile (backend may not be running):', response.status);
      }
    } catch (error) {
      // Network errors (like backend not running)
      console.warn('AuthContext: Could not fetch user profile (backend may not be running):', error);
    }
  };

  const login = async (newToken: string) => {
    try {
      console.log('AuthContext: Login called with token');
      const decoded = jwtDecode<User>(newToken);
      console.log('AuthContext: Decoded user:', decoded);
      
      // Set user state immediately from JWT token
      setUser(decoded);
      setToken(newToken);
      localStorage.setItem('token', newToken);
      console.log('AuthContext: User state updated, isAuthenticated should be true');
      
      // Try to fetch full user profile from backend in the background
      console.log('AuthContext: About to fetch user profile...');
      fetchUserProfile(newToken).catch(error => {
        console.error('Failed to fetch user profile, but user is still logged in:', error);
      });
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const updateUser = (userData: User) => {
    console.log('AuthContext: Updating user data:', userData);
    setUser(userData);
  };

  const logout = () => {
    console.log('Logging out user');
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const clientId = config.googleClientId;

  const isAuthenticated = !!user;
  // Only log when authentication state changes
  if (isAuthenticated) {
    console.log('AuthContext: User is authenticated');
  }
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthContext.Provider
        value={{
          user,
          token,
          login,
          logout,
          updateUser,
          isAuthenticated,
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