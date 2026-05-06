// Auth API request/response DTOs (transport layer, not domain models)

export interface RegisterRequest {
  fullName: string;
  phone: string;
  email: string;
  username: string;
  password: string;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  userId: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: string;
  message: string | null;
  resetToken?: string | null;
}

export interface ConfirmEmailRequest {
  email: string;
  token: string;
}

export interface VerifyEmailOtpRequest {
  email: string;
  code: string;
}

export interface ForgotPasswordSendOtpRequest {
  email: string;
}

export interface ForgotPasswordVerifyOtpRequest {
  email: string;
  otpCode: string;
}

export interface ForgotPasswordVerifyOtpResponse {
  userId: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpires: string | null;
  message: string | null;
  resetToken: string | null;
}

export interface ForgotPasswordResetRequest {
  email: string;
  resetToken: string;
  newPassword: string;
}

export interface UserProfileResponse {
  id: string;
  displayName: string | null;
  email: string;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  pictureUrl: string | null;
  roles: string[];
}
