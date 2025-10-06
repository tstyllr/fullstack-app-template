import axios from 'axios';
import { getAccessToken } from '@/lib/storage/token-storage';
import { isTokenExpiringSoon } from '@/lib/utils/jwt';

// Create axios instance with base configuration
const apiClient = axios.create({
   baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
   timeout: 15 * 60 * 1000,
   headers: {
      'Content-Type': 'application/json',
   },
});

// Store refresh token callback (will be set by AuthContext)
let refreshTokenCallback: (() => Promise<string | null>) | null = null;

// Refresh lock to prevent concurrent refresh requests
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export const setRefreshTokenCallback = (
   callback: () => Promise<string | null>
) => {
   refreshTokenCallback = callback;
};

// Request interceptor - proactive token refresh and add auth token
apiClient.interceptors.request.use(
   async (config) => {
      let token = await getAccessToken();

      // Proactive refresh: if token is expiring soon, refresh it before making request
      if (token && isTokenExpiringSoon(token) && refreshTokenCallback) {
         // If already refreshing, wait for the existing refresh to complete
         if (isRefreshing && refreshPromise) {
            token = (await refreshPromise) || token;
         } else {
            // Start a new refresh
            isRefreshing = true;
            refreshPromise = refreshTokenCallback()
               .then((newToken) => {
                  isRefreshing = false;
                  refreshPromise = null;
                  return newToken;
               })
               .catch((error) => {
                  isRefreshing = false;
                  refreshPromise = null;
                  console.error('Proactive token refresh failed:', error);
                  return null;
               });

            const newToken = await refreshPromise;
            if (newToken) {
               token = newToken;
            }
         }
      }

      if (token) {
         config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
   },
   (error) => {
      return Promise.reject(error);
   }
);

// Response interceptor - handle errors and fallback refresh on 401 (reactive strategy)
apiClient.interceptors.response.use(
   (response) => {
      return response;
   },
   async (error) => {
      const originalRequest = error.config;

      // If 401 and we haven't retried yet, try to refresh token
      if (
         error.response?.status === 401 &&
         !originalRequest._retry &&
         refreshTokenCallback
      ) {
         originalRequest._retry = true;

         try {
            const newToken = await refreshTokenCallback();
            if (newToken) {
               originalRequest.headers.Authorization = `Bearer ${newToken}`;
               return apiClient(originalRequest);
            }
         } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            return Promise.reject(refreshError);
         }
      }

      // Handle common errors
      if (error.response) {
         // Server responded with error status
         return Promise.reject(error.response.data);
      } else if (error.request) {
         // Request was made but no response received
         return Promise.reject({ error: 'Network error' });
      } else {
         // Something else happened
         return Promise.reject({ error: error.message });
      }
   }
);

export default apiClient;
