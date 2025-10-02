import apiClient from './client';
import type {
   SendCodeRequest,
   SendCodeResponse,
   LoginWithCodeRequest,
   LoginWithCodeResponse,
   LoginWithPasswordRequest,
   LoginWithPasswordResponse,
   SetPasswordRequest,
   SetPasswordResponse,
   RefreshRequest,
   RefreshResponse,
   LogoutRequest,
   LogoutResponse,
} from '../../types/auth';

/**
 * Send SMS verification code to phone
 * POST /api/auth/send-code
 */
export const sendCode = async (
   data: SendCodeRequest
): Promise<SendCodeResponse> => {
   const response = await apiClient.post<SendCodeResponse>(
      '/auth/send-code',
      data
   );
   return response.data;
};

/**
 * Login or register with phone + SMS verification code
 * POST /api/auth/login-with-code
 */
export const loginWithCode = async (
   data: LoginWithCodeRequest
): Promise<LoginWithCodeResponse> => {
   const response = await apiClient.post<LoginWithCodeResponse>(
      '/auth/login-with-code',
      data
   );
   return response.data;
};

/**
 * Login with phone + password
 * POST /api/auth/login-with-password
 */
export const loginWithPassword = async (
   data: LoginWithPasswordRequest
): Promise<LoginWithPasswordResponse> => {
   const response = await apiClient.post<LoginWithPasswordResponse>(
      '/auth/login-with-password',
      data
   );
   return response.data;
};

/**
 * Set or update password (requires SMS verification)
 * POST /api/auth/set-password
 */
export const setPassword = async (
   data: SetPasswordRequest
): Promise<SetPasswordResponse> => {
   const response = await apiClient.post<SetPasswordResponse>(
      '/auth/set-password',
      data
   );
   return response.data;
};

/**
 * Refresh access token using refresh token
 * POST /api/auth/refresh
 */
export const refresh = async (
   data: RefreshRequest
): Promise<RefreshResponse> => {
   const response = await apiClient.post<RefreshResponse>(
      '/auth/refresh',
      data
   );
   return response.data;
};

/**
 * Logout by revoking refresh token
 * POST /api/auth/logout
 */
export const logout = async (data: LogoutRequest): Promise<LogoutResponse> => {
   const response = await apiClient.post<LogoutResponse>('/auth/logout', data);
   return response.data;
};
