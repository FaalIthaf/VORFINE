/**
 * Data Transfer Object (DTO) untuk Autentikasi & Keamanan Token (VORFÍNE)
 * Didesain berdasarkan spesifikasi token authentication:
 * - Request payload (email & password)
 * - Response payload (access_token, token_type, expires_in, user info)
 */

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  user?: {
    id: string;
    email: string;
    fullName?: string;
    role?: string;
    [key: string]: any;
  };
  message?: string;
}

export interface AuthSessionDTO {
  access_token: string;
  isAuthenticated: boolean;
  user?: any;
  savedAt: string;
}

