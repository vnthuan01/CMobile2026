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

    if (key === 'dateOfBirth') {
      const normalizedDate = normalizeDateOfBirth(value);
      if (!normalizedDate) return;
      formData.append(fieldMap[key] ?? key, normalizedDate);
      return;
    }

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

      if (key === 'dateOfBirth') {
        const normalizedDate = normalizeDateOfBirth(value);
        if (!normalizedDate) return acc;
        acc[fieldMap[key] ?? key] = normalizedDate;
        return acc;
      }

      acc[fieldMap[key] ?? key] = String(value);
      return acc;
    },
    {},
  );
}

function normalizeDateOfBirth(value: unknown): string | null {
  const raw = String(value ?? '').trim();
  if (!raw) return null;

  // Backend schema expects date-time; enrich plain date to midnight time.
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return `${raw}T00:00:00`;
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  return null;
}

export const userService = {
  getProfile: async () => {
    const routes = ['/api/User/profile', '/User/profile'];

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
    const routes = ['/api/User/profile', '/User/profile'];
    const formData = toProfileFormData(payload);
    const jsonBody = toProfileRequestBody(payload);
    const jsonBodyCamel = Object.entries(payload).reduce<
      Record<string, string>
    >((acc, [key, value]) => {
      if (value === undefined || value === null) return acc;
      if (key === 'dateOfBirth') {
        const normalizedDate = normalizeDateOfBirth(value);
        if (!normalizedDate) return acc;
        acc[key] = normalizedDate;
        return acc;
      }
      acc[key] = String(value);
      return acc;
    }, {});

    for (const route of routes) {
      try {
        const response = await api.put<UserProfileResponse>(route, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const isSuccessStatus = response.status >= 200 && response.status < 300;
        const normalizedData = response.data
          ? normalizeUserProfile(response.data)
          : null;

        return {
          success: isSuccessStatus,
          status: response.status,
          data: normalizedData,
          message: 'Cập nhật hồ sơ thành công',
        };
      } catch (error: any) {
        // Retry JSON payloads (PascalCase then camelCase) when multipart is not accepted.
        const tryJsonPayload = async (body: Record<string, string>) => {
          const retryResponse = await api.put<UserProfileResponse>(
            route,
            body,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            },
          );

          const isSuccessStatus =
            retryResponse.status >= 200 && retryResponse.status < 300;
          const normalizedData = retryResponse.data
            ? normalizeUserProfile(retryResponse.data)
            : null;

          return {
            success: isSuccessStatus,
            status: retryResponse.status,
            data: normalizedData,
            message: 'Cập nhật hồ sơ thành công',
          };
        };

        try {
          return await tryJsonPayload(jsonBody);
        } catch {
          try {
            return await tryJsonPayload(jsonBodyCamel);
          } catch (retryErrorCamel: any) {
            if (retryErrorCamel?.response?.status !== 404) {
              return {
                success: false,
                data: null,
                status: retryErrorCamel?.response?.status,
                message: extractApiErrorMessage(
                  retryErrorCamel,
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
