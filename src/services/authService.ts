import { useAuthStore } from '../store/authStore';
import { decodeJWT } from '../utils/jwt';
import api from './api';

export interface RegisterRequest {
  fullName: string;
  phone: string;
  email: string;
  username: string;
  password: string;
}

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
      console.error('Register error:', error);
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
      console.error('Confirm email error:', error);
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
      console.error('Verify email OTP error:', error);
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
      console.error('Resend email OTP error:', error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          'Gửi lại OTP thất bại',
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
          console.error('Get profile error:', error);
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
      console.error('Login error:', error);

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
    await useAuthStore.getState().restoreToken();
  },

  mapToRegisterDto: async (data: RegisterRequest) => ({
    email: data.email,
    userName: data.username,
    password: data.password,
    phoneNumber: data.phone,
    fullName: data.fullName,
  }),
};
