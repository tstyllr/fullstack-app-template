import React, {
   createContext,
   useState,
   useContext,
   useEffect,
   useRef,
   useCallback,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import type { User } from '@/types/auth';
import {
   getAccessToken,
   getRefreshToken,
   saveTokens,
   clearTokens,
} from '@/lib/storage/token-storage';
import { refresh as refreshTokenApi } from '@/lib/api/auth';
import { setRefreshTokenCallback } from '@/lib/api/client';
import { isTokenExpiringSoon } from '@/lib/utils/jwt';

interface AuthContextType {
   user: User | null;
   accessToken: string | null;
   refreshToken: string | null;
   isLoading: boolean;
   isAuthenticated: boolean;
   login: (
      accessToken: string,
      refreshToken: string,
      user: User
   ) => Promise<void>;
   logout: () => Promise<void>;
   refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
   children,
}) => {
   const [user, setUser] = useState<User | null>(null);
   const [accessToken, setAccessToken] = useState<string | null>(null);
   const [refreshToken, setRefreshToken] = useState<string | null>(null);
   const [isLoading, setIsLoading] = useState(true);

   // Refs for background token check
   const tokenCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
      null
   );
   const appStateRef = useRef<AppStateStatus>(AppState.currentState);

   const clearStoredAuth = useCallback(async () => {
      await clearTokens();
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
   }, []);

   const refreshAccessToken = useCallback(async (): Promise<string | null> => {
      if (!refreshToken) {
         return null;
      }

      try {
         const response = await refreshTokenApi({ refreshToken });
         const newAccessToken = response.accessToken;

         await saveTokens(newAccessToken, refreshToken);
         setAccessToken(newAccessToken);
         setUser(response.user);

         return newAccessToken;
      } catch (error) {
         console.error('Failed to refresh access token:', error);
         await clearStoredAuth();
         return null;
      }
   }, [refreshToken, clearStoredAuth]);

   const loadStoredAuth = useCallback(async () => {
      try {
         const [storedAccessToken, storedRefreshToken] = await Promise.all([
            getAccessToken(),
            getRefreshToken(),
         ]);

         if (storedAccessToken && storedRefreshToken) {
            setAccessToken(storedAccessToken);
            setRefreshToken(storedRefreshToken);

            // Try to refresh to get user info
            try {
               const response = await refreshTokenApi({
                  refreshToken: storedRefreshToken,
               });
               setAccessToken(response.accessToken);
               setUser(response.user);
               await saveTokens(response.accessToken, storedRefreshToken);
            } catch (error) {
               // If refresh fails, clear tokens
               console.error('Failed to refresh token on startup:', error);
               await clearStoredAuth();
            }
         }
      } catch (error) {
         console.error('Failed to load stored auth:', error);
      } finally {
         setIsLoading(false);
      }
   }, [clearStoredAuth]);

   const login = useCallback(
      async (
         newAccessToken: string,
         newRefreshToken: string,
         newUser: User
      ) => {
         try {
            await saveTokens(newAccessToken, newRefreshToken);
            setAccessToken(newAccessToken);
            setRefreshToken(newRefreshToken);
            setUser(newUser);
         } catch (error) {
            console.error('Failed to login:', error);
            throw error;
         }
      },
      []
   );

   const logout = useCallback(async () => {
      try {
         await clearStoredAuth();
      } catch (error) {
         console.error('Failed to logout:', error);
         throw error;
      }
   }, [clearStoredAuth]);

   // Check and refresh token if expiring soon (background check)
   const checkAndRefreshToken = useCallback(async () => {
      try {
         const token = await getAccessToken();
         if (token && isTokenExpiringSoon(token, 10)) {
            // 10 minutes threshold for background check
            console.log('Background check: Token expiring soon, refreshing...');
            await refreshAccessToken();
         }
      } catch (error) {
         console.error('Background token check failed:', error);
      }
   }, [refreshAccessToken]);

   // Stop background token check interval
   const stopTokenCheckInterval = useCallback(() => {
      if (tokenCheckIntervalRef.current) {
         clearInterval(tokenCheckIntervalRef.current);
         tokenCheckIntervalRef.current = null;
      }
   }, []);

   // Start background token check interval
   const startTokenCheckInterval = useCallback(() => {
      // Clear existing interval if any
      if (tokenCheckIntervalRef.current) {
         clearInterval(tokenCheckIntervalRef.current);
      }

      // Check immediately when starting
      checkAndRefreshToken();

      // Check every 3 minutes
      tokenCheckIntervalRef.current = setInterval(
         () => {
            checkAndRefreshToken();
         },
         3 * 60 * 1000
      );
   }, [checkAndRefreshToken]);

   // Load tokens from secure storage on mount
   useEffect(() => {
      loadStoredAuth();
      // Set refresh token callback for API client
      setRefreshTokenCallback(refreshAccessToken);
   }, [loadStoredAuth, refreshAccessToken]);

   // Start/stop background token check based on authentication status
   useEffect(() => {
      if (accessToken && !isLoading) {
         startTokenCheckInterval();
      } else {
         stopTokenCheckInterval();
      }

      // Cleanup on unmount
      return () => {
         stopTokenCheckInterval();
      };
   }, [
      accessToken,
      isLoading,
      startTokenCheckInterval,
      stopTokenCheckInterval,
   ]);

   // Monitor app state changes for token refresh
   useEffect(() => {
      const subscription = AppState.addEventListener(
         'change',
         (nextAppState) => {
            // When app comes to foreground from background
            if (
               appStateRef.current.match(/inactive|background/) &&
               nextAppState === 'active'
            ) {
               // Check and refresh token immediately when app becomes active
               if (accessToken) {
                  checkAndRefreshToken();
               }
            }

            appStateRef.current = nextAppState;
         }
      );

      return () => {
         subscription.remove();
      };
   }, [accessToken, checkAndRefreshToken]);

   const value: AuthContextType = {
      user,
      accessToken,
      refreshToken,
      isLoading,
      isAuthenticated: !!user && !!accessToken,
      login,
      logout,
      refreshAccessToken,
   };

   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
   const context = useContext(AuthContext);
   if (context === undefined) {
      throw new Error('useAuth must be used within an AuthProvider');
   }
   return context;
};
