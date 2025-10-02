/**
 * JWT utility functions for token management
 */

interface JWTPayload {
   exp?: number;
   iat?: number;
   [key: string]: unknown;
}

/**
 * Decode JWT token without verification
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export const decodeJWT = (token: string): JWTPayload | null => {
   try {
      const parts = token.split('.');
      if (parts.length !== 3) {
         return null;
      }

      const payload = parts[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
   } catch (error) {
      console.error('Failed to decode JWT:', error);
      return null;
   }
};

/**
 * Get token expiry timestamp in milliseconds
 * @param token - JWT token string
 * @returns Expiry timestamp in ms or null if not available
 */
export const getTokenExpiry = (token: string): number | null => {
   const payload = decodeJWT(token);
   if (!payload?.exp) {
      return null;
   }
   return payload.exp * 1000; // Convert to milliseconds
};

/**
 * Check if token is expired
 * @param token - JWT token string
 * @returns True if expired, false otherwise
 */
export const isTokenExpired = (token: string): boolean => {
   const expiry = getTokenExpiry(token);
   if (!expiry) {
      return false;
   }
   return Date.now() >= expiry;
};

/**
 * Check if token is expiring soon (within specified minutes)
 * @param token - JWT token string
 * @param minutesBefore - Minutes before expiry to consider "expiring soon" (default: 5)
 * @returns True if expiring soon, false otherwise
 */
export const isTokenExpiringSoon = (
   token: string,
   minutesBefore: number = 5
): boolean => {
   const expiry = getTokenExpiry(token);
   if (!expiry) {
      return false;
   }

   const expiryThreshold = minutesBefore * 60 * 1000; // Convert to milliseconds
   const timeUntilExpiry = expiry - Date.now();

   return timeUntilExpiry > 0 && timeUntilExpiry < expiryThreshold;
};

/**
 * Get time remaining until token expiry in milliseconds
 * @param token - JWT token string
 * @returns Milliseconds until expiry, or 0 if expired/invalid
 */
export const getTimeUntilExpiry = (token: string): number => {
   const expiry = getTokenExpiry(token);
   if (!expiry) {
      return 0;
   }

   const timeRemaining = expiry - Date.now();
   return Math.max(0, timeRemaining);
};
