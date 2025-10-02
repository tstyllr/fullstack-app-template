import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Use SecureStore on native, AsyncStorage on web
const isWeb = Platform.OS === 'web';

/**
 * Save access token to secure storage
 */
export const saveAccessToken = async (token: string): Promise<void> => {
   try {
      if (isWeb) {
         await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
      } else {
         await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
      }
   } catch (error) {
      console.error('Failed to save access token:', error);
      throw error;
   }
};

/**
 * Get access token from secure storage
 */
export const getAccessToken = async (): Promise<string | null> => {
   try {
      if (isWeb) {
         return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      } else {
         return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      }
   } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
   }
};

/**
 * Save refresh token to secure storage
 */
export const saveRefreshToken = async (token: string): Promise<void> => {
   try {
      if (isWeb) {
         await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
      } else {
         await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
      }
   } catch (error) {
      console.error('Failed to save refresh token:', error);
      throw error;
   }
};

/**
 * Get refresh token from secure storage
 */
export const getRefreshToken = async (): Promise<string | null> => {
   try {
      if (isWeb) {
         return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      } else {
         return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      }
   } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
   }
};

/**
 * Clear all tokens from secure storage
 */
export const clearTokens = async (): Promise<void> => {
   try {
      if (isWeb) {
         await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
      } else {
         await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
         await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      }
   } catch (error) {
      console.error('Failed to clear tokens:', error);
      throw error;
   }
};

/**
 * Save both tokens at once
 */
export const saveTokens = async (
   accessToken: string,
   refreshToken: string
): Promise<void> => {
   await Promise.all([
      saveAccessToken(accessToken),
      saveRefreshToken(refreshToken),
   ]);
};
