export interface User {
  id: string;
  email: string;
  user_name: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string | null;
}

export interface StoredAuthTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string | null;
  accessTokenExpires?: string | null;
  message?: string | null;
}
