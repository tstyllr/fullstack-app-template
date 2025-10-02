import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const LOGIN_METHOD_KEY = 'loginMethod';
const SAVED_PHONE_KEY = 'savedPhone';
const SAVED_PASSWORD_KEY = 'savedPassword';
const REMEMBER_ME_KEY = 'rememberMe';

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

/**
 * Save login method preference (code or password)
 */
export const saveLoginMethod = async (isCodeMode: boolean): Promise<void> => {
   try {
      await AsyncStorage.setItem(
         LOGIN_METHOD_KEY,
         isCodeMode ? 'code' : 'password'
      );
   } catch (error) {
      console.error('Failed to save login method:', error);
   }
};

/**
 * Get login method preference
 * @returns true for code mode, false for password mode, null if not set
 */
export const getLoginMethod = async (): Promise<boolean | null> => {
   try {
      const method = await AsyncStorage.getItem(LOGIN_METHOD_KEY);
      if (method === null) return null;
      return method === 'code';
   } catch (error) {
      console.error('Failed to get login method:', error);
      return null;
   }
};

/**
 * Save phone number
 */
export const savePhone = async (phone: string): Promise<void> => {
   try {
      await AsyncStorage.setItem(SAVED_PHONE_KEY, phone);
   } catch (error) {
      console.error('Failed to save phone:', error);
   }
};

/**
 * Get saved phone number
 */
export const getPhone = async (): Promise<string | null> => {
   try {
      return await AsyncStorage.getItem(SAVED_PHONE_KEY);
   } catch (error) {
      console.error('Failed to get phone:', error);
      return null;
   }
};

/**
 * Save password (only on native platforms, not on web for security)
 */
export const savePassword = async (password: string): Promise<void> => {
   try {
      if (isWeb) {
         // Do not save password on web for security reasons
         console.warn('Password storage is disabled on web platform');
         return;
      }
      await SecureStore.setItemAsync(SAVED_PASSWORD_KEY, password);
   } catch (error) {
      console.error('Failed to save password:', error);
   }
};

/**
 * Get saved password (only on native platforms)
 */
export const getPassword = async (): Promise<string | null> => {
   try {
      if (isWeb) {
         return null;
      }
      return await SecureStore.getItemAsync(SAVED_PASSWORD_KEY);
   } catch (error) {
      console.error('Failed to get password:', error);
      return null;
   }
};

/**
 * Save remember me preference
 */
export const saveRememberMe = async (remember: boolean): Promise<void> => {
   try {
      await AsyncStorage.setItem(REMEMBER_ME_KEY, remember ? 'true' : 'false');
   } catch (error) {
      console.error('Failed to save remember me preference:', error);
   }
};

/**
 * Get remember me preference
 */
export const getRememberMe = async (): Promise<boolean> => {
   try {
      const value = await AsyncStorage.getItem(REMEMBER_ME_KEY);
      return value === 'true';
   } catch (error) {
      console.error('Failed to get remember me preference:', error);
      return false;
   }
};

/**
 * Clear saved credentials (phone and password)
 */
export const clearSavedCredentials = async (): Promise<void> => {
   try {
      await AsyncStorage.removeItem(SAVED_PHONE_KEY);
      await AsyncStorage.removeItem(REMEMBER_ME_KEY);
      if (!isWeb) {
         await SecureStore.deleteItemAsync(SAVED_PASSWORD_KEY);
      }
   } catch (error) {
      console.error('Failed to clear saved credentials:', error);
   }
};
