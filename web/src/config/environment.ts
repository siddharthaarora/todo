// Environment detection and configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// API URL configuration
const getApiUrl = () => {
  console.log('getApiUrl() called with:', {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    isLocalhost,
    hostname: window.location.hostname,
    origin: window.location.origin
  });

  // If explicitly set in environment, use that
  if (import.meta.env.VITE_API_URL) {
    console.log('Using VITE_API_URL:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // Runtime detection based on current hostname
  if (isLocalhost) {
    // Local development - use localhost
    console.log('Using localhost API URL');
    return 'http://localhost:3001/api';
  } else {
    // Production - use API subdomain
    console.log('Using production API URL');
    return 'https://api.proxyc.app/api';
  }
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
  envVars: {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
  }
}); 