import axios from 'axios';

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

  if (envUrl) {
    return normalize(envUrl);
  }

  return normalize(PREFERRED_STAGING_API_URL);
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
