import axios from 'axios';
import { Platform } from 'react-native';

const PREFERRED_STAGING_API_URL = 'https://staging.reliefhub.info.vn/api';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    skipAuthRefresh?: boolean;
    _retry?: boolean;
  }
}

const resolveBaseURL = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  const normalize = (url: string) => url.replace(/\/+$/, '');
  const envCandidate = envUrl ? normalize(envUrl) : '';
  const preferredCandidate = normalize(PREFERRED_STAGING_API_URL);

  // Prefer hosted staging endpoint when env still points to local addresses.
  const shouldUsePreferredStaging =
    !envCandidate ||
    envCandidate.includes('localhost') ||
    envCandidate.includes('127.0.0.1') ||
    envCandidate.includes('10.0.2.2') ||
    envCandidate.includes('192.168.') ||
    envCandidate.includes('172.16.') ||
    envCandidate.includes('172.17.') ||
    envCandidate.includes('172.18.') ||
    envCandidate.includes('172.19.') ||
    envCandidate.includes('172.20.') ||
    envCandidate.includes('172.21.') ||
    envCandidate.includes('172.22.') ||
    envCandidate.includes('172.23.') ||
    envCandidate.includes('172.24.') ||
    envCandidate.includes('172.25.') ||
    envCandidate.includes('172.26.') ||
    envCandidate.includes('172.27.') ||
    envCandidate.includes('172.28.') ||
    envCandidate.includes('172.29.') ||
    envCandidate.includes('172.30.') ||
    envCandidate.includes('172.31.');

  const selectedUrl = shouldUsePreferredStaging
    ? preferredCandidate
    : envCandidate;

  if (!selectedUrl) {
    throw new Error(
      'Thiếu EXPO_PUBLIC_API_URL và không có URL dự phòng hợp lệ.',
    );
  }

  if (Platform.OS !== 'android') {
    return selectedUrl;
  }

  try {
    const parsed = new URL(selectedUrl);
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      parsed.hostname = '10.0.2.2';
      return normalize(parsed.toString());
    }
    return normalize(parsed.toString());
  } catch {
    if (
      selectedUrl.includes('localhost') ||
      selectedUrl.includes('127.0.0.1')
    ) {
      return normalize(
        selectedUrl
          .replace('://localhost', '://10.0.2.2')
          .replace('://127.0.0.1', '://10.0.2.2'),
      );
    }
    return normalize(selectedUrl);
  }
};

const API_BASE_URL = resolveBaseURL();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

if (__DEV__) {
  console.info('[API] Using baseURL:', API_BASE_URL);
}

let refreshPromise: Promise<string> | null = null;

api.interceptors.request.use(
  async (config) => {
    // Thêm header Authorization
    // Import động để tránh circular dependency
    const { useAuthStore } = await import('../store/authStore');
    const token = useAuthStore.getState().accessToken;
    if (token && !config.headers?.Authorization) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest.skipAuthRefresh &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const { useAuthStore } = await import('../store/authStore');
        const authState = useAuthStore.getState();
        const currentRefreshToken = authState.refreshToken;

        if (!currentRefreshToken) {
          await authState.logout();
          return Promise.reject(error);
        }

        if (!refreshPromise) {
          refreshPromise = (async () => {
            const { authService } = await import('./authService');
            const refreshed =
              await authService.refreshSession(currentRefreshToken);
            return refreshed.accessToken;
          })().finally(() => {
            refreshPromise = null;
          });
        }

        const nextAccessToken = await refreshPromise;
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        const { useAuthStore } = await import('../store/authStore');
        await useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
