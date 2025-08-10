import { vi } from 'vitest';

// Mock jwt-decode
export const mockJwtDecode = vi.fn();
vi.mock('jwt-decode', () => ({
  jwtDecode: mockJwtDecode,
}));

// Mock Google OAuth Provider
vi.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }: { children: React.ReactNode }) => {
    const React = require('react');
    return React.createElement('div', {}, children);
  },
}));

// Mock react-beautiful-dnd
vi.mock('react-beautiful-dnd', () => ({
  DragDropContext: ({ children }: { children: React.ReactNode }) => {
    const React = require('react');
    return React.createElement('div', {}, children);
  },
  Droppable: ({ children }: { children: any }) => children({
    droppableProps: {},
    innerRef: vi.fn(),
    placeholder: null,
  }),
  Draggable: ({ children }: { children: any }) => children({
    draggableProps: {},
    dragHandleProps: {},
    innerRef: vi.fn(),
  }),
}));

// Mock axios - since the API service uses axios directly, not axios.create()
export const mockAxios = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn(),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
};

vi.mock('axios', () => ({
  default: mockAxios,
}));

// Mock theme
export const mockTheme = {
  colors: {
    primary: '#3b82f6',
    primaryDark: '#2563EB',
    secondary: '#4f46e5',
    success: '#22c55e',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    white: '#ffffff',
    red: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
      800: '#991B1B',
      900: '#7F1D1D',
    },
    gray: {
      50: '#F9FAFB',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },
  typography: {
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  transitions: {
    fast: '150ms ease-in-out',
    default: '200ms ease-in-out',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
};

vi.mock('../theme', () => ({
  default: mockTheme,
}));

vi.mock('../types/theme', () => ({
  Theme: {} as any,
}));

// Mock React Router
export const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Reset all mocks before each test
export const resetMocks = () => {
  vi.clearAllMocks();
  mockJwtDecode.mockReset();
  mockAxios.get.mockReset();
  mockAxios.post.mockReset();
  mockAxios.put.mockReset();
  mockAxios.delete.mockReset();
  mockAxios.patch.mockReset();
  mockNavigate.mockReset();
}; 