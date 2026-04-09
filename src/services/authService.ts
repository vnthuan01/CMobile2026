import { useAuthStore } from '../store/authStore';
import type { RefreshTokenResponse } from '../types/auth';
import { decodeJWT } from '../utils/jwt';
import { isTokenExpired } from '../utils/jwt';
import api from './api';
import type { RegisterRequest, UserProfileResponse } from '../types/auth-api';

export type { RegisterRequest, UserProfileResponse } from '../types/auth-api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  userId: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: string;
  message: string | null;
  resetToken?: string | null;
}

interface ConfirmEmailRequest {
  email: string;
  token: string;
}

interface VerifyEmailOtpRequest {
  email: string;
  code: string;
}

interface ForgotPasswordSendOtpRequest {
  email: string;
}

interface ForgotPasswordVerifyOtpRequest {
  email: string;
  otpCode: string;
}

interface ForgotPasswordVerifyOtpResponse {
  userId: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpires: string | null;
  message: string | null;
  resetToken: string | null;
}

interface ForgotPasswordResetRequest {
  email: string;
  resetToken: string;
  newPassword: string;
}

const getNoResponseErrorMessage = (error: any) => {
  const code = error?.code;
  const message = String(error?.message || '').toLowerCase();

  if (code === 'ECONNABORTED') {
    return 'Yêu cầu đến máy chủ bị quá thời gian. Vui lòng thử lại.';
  }

  if (code === 'ERR_NETWORK' || message.includes('network error')) {
    return 'Không thể kết nối máy chủ. Vui lòng kiểm tra Internet hoặc địa chỉ API.';
  }

  return 'Không thể kết nối đến máy chủ (lỗi mạng/bảo mật). Vui lòng thử lại sau.';
};

export const authService = {
  register: async (data: RegisterRequest) => {
    try {
      const dto = await authService.mapToRegisterDto(data);
      const response = await api.post('/Auth/register', dto);
      return {
        status: response.status,
        success: response.status === 200 || response.status === 201,
        message: response.data.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || error.message || 'Đăng ký thất bại',
      };
    }
  },

  confirmEmail: async (data: ConfirmEmailRequest) => {
    try {
      const response = await api.get('/Auth/confirm-email', {
        params: {
          email: data.email,
          token: data.token,
        },
      });

      return {
        success: response.status === 200,
        message:
          response.data?.message ||
          'Xác thực email thành công. Vui lòng đăng nhập.',
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          'Xác thực email thất bại',
      };
    }
  },

  verifyEmailOtp: async (data: VerifyEmailOtpRequest) => {
    try {
      const response = await api.post('/Auth/verify-email-otp', {
        email: data.email,
        code: data.code,
      });

      return {
        success: response.status === 200,
        message:
          response.data?.message ||
          'Xác thực OTP thành công. Vui lòng đăng nhập.',
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          'Xác thực OTP thất bại',
      };
    }
  },

  resendEmailOtp: async (email: string) => {
    try {
      const response = await api.post('/Auth/resend-email-otp', {
        email,
      });

        return {
          success: response.status === 200,
          message: response.data?.message || 'Đã gửi lại mã OTP.',
        };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          'Gửi lại OTP thất bại',
      };
    }
  },

  sendForgotPasswordOtp: async (data: ForgotPasswordSendOtpRequest) => {
    try {
      const response = await api.post('/Auth/forgot-password/send-otp', {
        email: data.email,
      });

        return {
          success: response.status >= 200 && response.status < 300,
          message: response.data?.message || 'Đã gửi mã OTP khôi phục mật khẩu.',
        };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.response?.data?.detail ||
          error.message ||
          'Không thể gửi OTP',
      };
    }
  },

  verifyForgotPasswordOtp: async (data: ForgotPasswordVerifyOtpRequest) => {
    try {
      const response = await api.post<ForgotPasswordVerifyOtpResponse>(
        '/Auth/forgot-password/verify-otp',
        {
          email: data.email,
          otpCode: data.otpCode,
        },
      );

        return {
          success: response.status === 200,
          resetToken: response.data?.resetToken,
          message: response.data?.message || 'Xác minh OTP thành công.',
        };
    } catch (error: any) {
      return {
        success: false,
        resetToken: null,
        message:
          error.response?.data?.errors?.Code?.[0] ||
          error.response?.data?.detail ||
          error.message ||
          'Xác minh OTP thất bại',
      };
    }
  },

  resetForgotPassword: async (data: ForgotPasswordResetRequest) => {
    try {
      const response = await api.post('/Auth/forgot-password/reset', {
        email: data.email,
        resetToken: data.resetToken,
        newPassword: data.newPassword,
      });

        return {
          success: response.status === 204,
          message: response.data?.message || 'Đặt lại mật khẩu thành công.',
        };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.response?.data?.detail ||
          error.message ||
          'Đặt lại mật khẩu thất bại',
      };
    }
  },

  getProfile: async () => {
    const profileRoutes = ['/User/profile'];

    for (const route of profileRoutes) {
      try {
        const response = await api.get<UserProfileResponse>(route);
        return {
          success: response.status === 200,
          data: response.data,
          message: response.data
            ? 'Lấy profile thành công'
            : 'Không có dữ liệu',
        };
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          return {
            success: false,
            data: null,
            message:
              error.response?.data?.message ||
              error.message ||
              'Không thể lấy thông tin hồ sơ',
          };
        }
      }
    }

    return {
      success: false,
      data: null,
      message:
        'Không tìm thấy endpoint profile. Kiểm tra lại route backend (ví dụ: /Auth/profile hoặc /User/profile).',
    };
  },

  /**
   * Login user
   */
  login: async (credentials: LoginCredentials) => {
    try {
      const response = await api.post<LoginResponse>(
        '/Auth/login',
        credentials,
      );

      const { accessToken, refreshToken } = response.data;

      if (!accessToken) {
        return {
          success: false,
          message: 'Không nhận được accessToken',
        };
      }

      const user = decodeJWT(accessToken);

      if (!user) {
        return {
          success: false,
          message: 'Token không hợp lệ',
        };
      }

      await useAuthStore.getState().setTokens(accessToken, refreshToken);
      await useAuthStore.getState().setUser(user);

      return {
        success: true,
        message: 'Đăng nhập thành công',
        user,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          'Đăng nhập thất bại',
      };
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    await useAuthStore.getState().logout();
  },

  /**
   * Get current access token
   */
  getAccessToken: () => {
    return useAuthStore.getState().accessToken;
  },

  /**
   * Restore token from AsyncStorage on app start
   */
  restoreToken: async () => {
    const authStore = useAuthStore.getState();

    authStore.setLoading(true);

    try {
      await authStore.hydrateAuth();

      const { accessToken, refreshToken } = useAuthStore.getState();

      if (!accessToken) {
        await authStore.logout();
        return;
      }

      if (!isTokenExpired(accessToken)) {
        authStore.setLoading(false);
        return;
      }

      if (!refreshToken) {
        await authStore.logout();
        return;
      }

       await authService.refreshSession(refreshToken);
    } catch {
      await authStore.logout();
    } finally {
      useAuthStore.getState().setLoading(false);
    }
  },

  refreshSession: async (refreshToken?: string | null) => {
    const currentRefreshToken =
      refreshToken ?? useAuthStore.getState().refreshToken;

    if (!currentRefreshToken) {
      throw new Error('Missing refresh token');
    }

    const refreshRoutes = ['/Auth/refresh-token', '/Auth/refresh'];
    let lastError: unknown;

    for (const route of refreshRoutes) {
      try {
        const requestConfig = {
          headers: {
            Authorization: undefined,
          },
          skipAuthRefresh: true,
        } as any;

        const response = await api.post<RefreshTokenResponse>(
          route,
          { refreshToken: currentRefreshToken },
          requestConfig,
        );

        const responseData = response.data as RefreshTokenResponse;
        const nextAccessToken = responseData.accessToken;
        const nextRefreshToken =
          responseData.refreshToken ?? currentRefreshToken;

        if (!nextAccessToken) {
          throw new Error('Missing access token in refresh response');
        }

        const user = decodeJWT(nextAccessToken);

        if (!user) {
          throw new Error('Invalid refreshed token');
        }

        await useAuthStore
          .getState()
          .setTokens(nextAccessToken, nextRefreshToken);
        await useAuthStore.getState().setUser(user);

        return {
          success: true,
          accessToken: nextAccessToken,
          refreshToken: nextRefreshToken,
          user,
        };
      } catch (error: any) {
        if (error?.response?.status === 404) {
          lastError = error;
          continue;
        }

        lastError = error;
        break;
      }
    }

    throw lastError ?? new Error('Token refresh failed');
  },

  mapToRegisterDto: async (data: RegisterRequest) => ({
    email: data.email,
    userName: data.username,
    password: data.password,
    phoneNumber: data.phone,
    fullName: data.fullName,
  }),
};
