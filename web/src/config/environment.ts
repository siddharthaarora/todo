// Environment detection and configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// API URL configuration
const getApiUrl = () => {
  // If explicitly set in environment, use that
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Auto-detect based on environment
  if (isProduction || !isLocalhost) {
    return 'https://dizx41dtz85gc.cloudfront.net/api';
  }
  
  // Local development - temporarily use production for testing
  return 'https://dizx41dtz85gc.cloudfront.net/api';
};

// Google Client ID
const getGoogleClientId = () => {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || '669267381643-81uck4b8mrj06sgq2qp2p20r5kue4drb.apps.googleusercontent.com';
};

export const config = {
  isDevelopment,
  isProduction,
  isLocalhost,
  apiUrl: getApiUrl(),
  googleClientId: getGoogleClientId(),
};

// Log environment info for debugging
console.log('Environment Configuration:', {
  isDevelopment,
  isProduction,
  isLocalhost,
  apiUrl: config.apiUrl,
  hostname: window.location.hostname,
  origin: window.location.origin,
}); 