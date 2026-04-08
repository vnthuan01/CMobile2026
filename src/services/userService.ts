import type {
  UpdateUserProfilePayload,
  UserProfileResponse,
} from '../types/user';
import { extractApiErrorMessage } from '../utils/apiError';
import api from './api';

export type {
  UpdateUserProfilePayload,
  UserProfileResponse
} from '../types/user';

function normalizeUserProfile(raw: any): UserProfileResponse {
  return {
    id: raw?.id ?? raw?.userId ?? '',
    displayName: raw?.displayName ?? raw?.fullName ?? null,
    email: raw?.email ?? '',
    phoneNumber: raw?.phoneNumber ?? raw?.phone ?? null,
    address: raw?.address ?? null,
    dateOfBirth: raw?.dateOfBirth ?? null,
    gender: raw?.gender ?? null,
    pictureUrl: raw?.pictureUrl ?? raw?.avatarUrl ?? null,
    picturePublicId: raw?.picturePublicId ?? null,
    banReason: raw?.banReason ?? null,
    isBanned: Boolean(raw?.isBanned),
    lockoutEnd: raw?.lockoutEnd ?? null,
    roles: Array.isArray(raw?.roles) ? raw.roles : [],
  };
}

function toProfileFormData(payload: UpdateUserProfilePayload) {
  const formData = new FormData();
  const fieldMap: Record<string, string> = {
    displayName: 'DisplayName',
    phoneNumber: 'PhoneNumber',
    address: 'Address',
    dateOfBirth: 'DateOfBirth',
    gender: 'Gender',
    pictureUrl: 'PictureUrl',
    picturePublicId: 'PicturePublicId',
  };

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    formData.append(fieldMap[key] ?? key, String(value));
  });

  return formData;
}

function toProfileRequestBody(payload: UpdateUserProfilePayload) {
  const fieldMap: Record<string, string> = {
    displayName: 'DisplayName',
    phoneNumber: 'PhoneNumber',
    address: 'Address',
    dateOfBirth: 'DateOfBirth',
    gender: 'Gender',
    pictureUrl: 'PictureUrl',
    picturePublicId: 'PicturePublicId',
  };

  return Object.entries(payload).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      if (value === undefined || value === null) return acc;
      acc[fieldMap[key] ?? key] = String(value);
      return acc;
    },
    {},
  );
}

export const userService = {
  getProfile: async () => {
    const routes = ['/User/profile', '/api/User/profile'];

    for (const route of routes) {
      try {
        const response = await api.get<UserProfileResponse>(route);
        return {
          success: response.status === 200,
          data: normalizeUserProfile(response.data),
          message: 'Lấy hồ sơ người dùng thành công',
        };
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          return {
            success: false,
            data: null,
            status: error?.response?.status,
            message: extractApiErrorMessage(
              error,
              'Không thể tải hồ sơ người dùng.',
            ),
          };
        }
      }
    }

    return {
      success: false,
      data: null,
      status: 404,
      message: 'Không tìm thấy endpoint User/profile.',
    };
  },

  updateProfile: async (payload: UpdateUserProfilePayload) => {
    const routes = ['/User/profile', '/api/User/profile'];
    const formData = toProfileFormData(payload);
    const jsonBody = toProfileRequestBody(payload);

    for (const route of routes) {
      try {
        const response = await api.put<UserProfileResponse>(route, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        return {
          success: response.status === 200,
          data: normalizeUserProfile(response.data),
          message: 'Cập nhật hồ sơ thành công',
        };
      } catch (error: any) {
        // Some mobile environments can fail multipart PUT with network error.
        // Retry with JSON body while preserving backend PascalCase field names.
        if (!error?.response) {
          try {
            const retryResponse = await api.put<UserProfileResponse>(
              route,
              jsonBody,
              {
                headers: {
                  'Content-Type': 'application/json',
                },
              },
            );

            return {
              success: retryResponse.status === 200,
              data: normalizeUserProfile(retryResponse.data),
              message: 'Cập nhật hồ sơ thành công',
            };
          } catch (retryError: any) {
            if (retryError?.response?.status !== 404) {
              return {
                success: false,
                data: null,
                status: retryError?.response?.status,
                message: extractApiErrorMessage(
                  retryError,
                  'Không thể cập nhật hồ sơ người dùng.',
                ),
              };
            }
          }
        }

        if (error?.response?.status !== 404) {
          return {
            success: false,
            data: null,
            status: error?.response?.status,
            message: extractApiErrorMessage(
              error,
              'Không thể cập nhật hồ sơ người dùng.',
            ),
          };
        }
      }
    }

    return {
      success: false,
      data: null,
      status: 404,
      message: 'Không tìm thấy endpoint User/profile.',
    };
  },
};
