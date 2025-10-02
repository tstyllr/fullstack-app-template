import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
   baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
   timeout: 10000,
   headers: {
      'Content-Type': 'application/json',
   },
});

// Request interceptor - add auth token if available
apiClient.interceptors.request.use(
   (config) => {
      // You can add auth token here if needed
      // const token = getAccessToken();
      // if (token) {
      //   config.headers.Authorization = `Bearer ${token}`;
      // }
      return config;
   },
   (error) => {
      return Promise.reject(error);
   }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
   (response) => {
      return response;
   },
   (error) => {
      // Handle common errors here
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
