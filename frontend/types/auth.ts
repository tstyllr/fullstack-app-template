// User type
export interface User {
   id: number;
   phone: string;
   name: string | null;
   isAdmin: boolean;
}

// Send code
export interface SendCodeRequest {
   phone: string;
}

export interface SendCodeResponse {
   message: string;
}

// Login with code
export interface LoginWithCodeRequest {
   phone: string;
   code: string;
   singleDeviceMode?: boolean;
}

export interface LoginWithCodeResponse {
   accessToken: string;
   refreshToken: string;
   user: User;
}

// Login with password
export interface LoginWithPasswordRequest {
   phone: string;
   password: string;
   singleDeviceMode?: boolean;
}

export interface LoginWithPasswordResponse {
   accessToken: string;
   refreshToken: string;
   user: User;
}

// Set password
export interface SetPasswordRequest {
   phone: string;
   code: string;
   password: string;
}

export interface SetPasswordResponse {
   message: string;
}

// Refresh token
export interface RefreshRequest {
   refreshToken: string;
}

export interface RefreshResponse {
   accessToken: string;
   user: User;
}

// Logout
export interface LogoutRequest {
   refreshToken: string;
}

export interface LogoutResponse {
   message: string;
}

// Error response
export interface ErrorResponse {
   error: string;
}
