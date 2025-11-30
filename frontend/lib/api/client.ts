import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
   baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
   timeout: 15 * 60 * 1000,
   headers: {
      'Content-Type': 'application/json',
   },
});

// Request interceptor
apiClient.interceptors.request.use(
   async (config) => {
      return config;
   },
   (error) => {
      return Promise.reject(error);
   }
);

// Response interceptor
apiClient.interceptors.response.use(
   (response) => {
      return response;
   },
   async (error) => {
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
