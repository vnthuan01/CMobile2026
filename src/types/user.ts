import type { UserProfileResponse as AuthUserProfileResponse } from './auth-api';

export interface UpdateUserProfilePayload {
  displayName?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  pictureUrl?: string;
  picturePublicId?: string;
}

export interface UserProfileResponse extends AuthUserProfileResponse {
  address?: string | null;
  banReason?: string | null;
  isBanned?: boolean;
  lockoutEnd?: string | null;
  picturePublicId?: string | null;
}
