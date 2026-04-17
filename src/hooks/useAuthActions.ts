import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { showApiErrorToast } from '../utils/apiToast';

export function useLogin() {
  return useMutation({
    mutationFn: authService.login,
    onError: (error: unknown) => {
      showApiErrorToast(error, {
        errorTitle: 'Đăng nhập thất bại',
        errorMessage: 'Vui lòng thử lại.',
      });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: authService.register,
    onError: (error: unknown) => {
      showApiErrorToast(error, {
        errorTitle: 'Đăng ký thất bại',
        errorMessage: 'Vui lòng thử lại.',
      });
    },
  });
}

export function useConfirmEmail() {
  return useMutation({
    mutationFn: authService.confirmEmail,
    onError: (error: unknown) => {
      showApiErrorToast(error, {
        errorTitle: 'Xác thực email thất bại',
        errorMessage: 'Không thể xác thực email.',
      });
    },
  });
}

export function useVerifyEmailOtp() {
  return useMutation({
    mutationFn: authService.verifyEmailOtp,
    onError: (error: unknown) => {
      showApiErrorToast(error, {
        errorTitle: 'Xác thực OTP thất bại',
        errorMessage: 'Không thể xác thực OTP.',
      });
    },
  });
}

export function useResendEmailOtp() {
  return useMutation({
    mutationFn: authService.resendEmailOtp,
    onError: (error: unknown) => {
      showApiErrorToast(error, {
        errorTitle: 'Không thể gửi lại OTP',
        errorMessage: 'Không thể gửi lại OTP.',
      });
    },
  });
}

export function useSendForgotPasswordOtp() {
  return useMutation({
    mutationFn: authService.sendForgotPasswordOtp,
    onError: (error: unknown) => {
      showApiErrorToast(error, {
        errorTitle: 'Không thể gửi mã',
        errorMessage: 'Không thể gửi mã xác thực.',
      });
    },
  });
}

export function useVerifyForgotPasswordOtp() {
  return useMutation({
    mutationFn: authService.verifyForgotPasswordOtp,
    onError: (error: unknown) => {
      showApiErrorToast(error, {
        errorTitle: 'Xác thực OTP thất bại',
        errorMessage: 'Không thể xác thực OTP khôi phục.',
      });
    },
  });
}

export function useResetForgotPassword() {
  return useMutation({
    mutationFn: authService.resetForgotPassword,
    onError: (error: unknown) => {
      showApiErrorToast(error, {
        errorTitle: 'Không thể đặt lại mật khẩu',
        errorMessage: 'Không thể đặt lại mật khẩu.',
      });
    },
  });
}
