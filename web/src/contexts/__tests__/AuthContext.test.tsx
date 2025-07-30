import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { mockJwtDecode } from '../../test/mocks';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
global.localStorage = localStorageMock;

const TestComponent = () => {
  const { user, token, isAuthenticated, login, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="user">{JSON.stringify(user)}</div>
      <div data-testid="token">{token}</div>
      <div data-testid="isAuthenticated">{isAuthenticated.toString()}</div>
      <button data-testid="login" onClick={() => login('test-token')}>Login</button>
      <button data-testid="logout" onClick={logout}>Logout</button>
    </div>
  );
};

const renderWithAuth = (component: React.ReactNode) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  describe('initial state', () => {
    it('should start with no user and not authenticated', () => {
      renderWithAuth(<TestComponent />);
      
      expect(screen.getByTestId('user')).toHaveTextContent('null');
      // Handle both "null" and empty string cases
      const tokenElement = screen.getByTestId('token');
      expect(tokenElement.textContent === 'null' || tokenElement.textContent === '').toBe(true);
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    });

    it('should load user from localStorage if token exists', () => {
      const mockUser = { id: '123', email: 'test@example.com', name: 'Test User' };
      const mockToken = 'valid-token';
      
      localStorageMock.getItem.mockReturnValue(mockToken);
      mockJwtDecode.mockReturnValue(mockUser);
      
      renderWithAuth(<TestComponent />);
      
      expect(mockJwtDecode).toHaveBeenCalledWith(mockToken);
      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
      expect(screen.getByTestId('token')).toHaveTextContent(mockToken);
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
    });

    it('should handle invalid token in localStorage', () => {
      localStorageMock.getItem.mockReturnValue('invalid-token');
      mockJwtDecode.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      renderWithAuth(<TestComponent />);
      
      expect(screen.getByTestId('user')).toHaveTextContent('null');
      // Handle both "null" and empty string cases
      const tokenElement = screen.getByTestId('token');
      expect(tokenElement.textContent === 'null' || tokenElement.textContent === '').toBe(true);
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });
  });

  describe('login', () => {
    it('should login user with valid token', () => {
      const mockUser = { id: '123', email: 'test@example.com', name: 'Test User' };
      mockJwtDecode.mockReturnValue(mockUser);
      
      renderWithAuth(<TestComponent />);
      
      act(() => {
        screen.getByTestId('login').click();
      });
      
      expect(mockJwtDecode).toHaveBeenCalledWith('test-token');
      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
      expect(screen.getByTestId('token')).toHaveTextContent('test-token');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'test-token');
    });

    it('should handle login with invalid token', () => {
      mockJwtDecode.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      renderWithAuth(<TestComponent />);
      
      act(() => {
        screen.getByTestId('login').click();
      });
      
      expect(screen.getByTestId('user')).toHaveTextContent('null');
      // Handle both "null" and empty string cases
      const tokenElement = screen.getByTestId('token');
      expect(tokenElement.textContent === 'null' || tokenElement.textContent === '').toBe(true);
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    });
  });

  describe('logout', () => {
    it('should logout user and clear state', () => {
      const mockUser = { id: '123', email: 'test@example.com', name: 'Test User' };
      mockJwtDecode.mockReturnValue(mockUser);
      
      renderWithAuth(<TestComponent />);
      
      // First login
      act(() => {
        screen.getByTestId('login').click();
      });
      
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      
      // Then logout
      act(() => {
        screen.getByTestId('logout').click();
      });
      
      expect(screen.getByTestId('user')).toHaveTextContent('null');
      // Handle both "null" and empty string cases
      const tokenElement = screen.getByTestId('token');
      expect(tokenElement.textContent === 'null' || tokenElement.textContent === '').toBe(true);
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');
      
      consoleSpy.mockRestore();
    });
  });
}); 