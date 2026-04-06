import { extractApiErrorMessage } from './apiError';
import { showErrorToast, showSuccessToast } from './toast';

export interface ApiResultLike {
  success?: boolean;
  message?: string | null;
}

export interface ApiToastOptions {
  successTitle?: string;
  successMessage?: string;
  errorTitle?: string;
  errorMessage?: string;
  showSuccess?: boolean;
}

export function getApiErrorToastMessage(
  error: unknown,
  fallback = 'Đã có lỗi xảy ra. Vui lòng thử lại.',
) {
  return extractApiErrorMessage(error, fallback);
}

export function showApiErrorToast(
  error: unknown,
  options?: Pick<ApiToastOptions, 'errorTitle' | 'errorMessage'>,
) {
  showErrorToast(
    options?.errorTitle || 'Có lỗi xảy ra',
    getApiErrorToastMessage(error, options?.errorMessage),
  );
}

export function showApiResultToast(
  result: ApiResultLike | null | undefined,
  options?: ApiToastOptions,
) {
  if (result?.success) {
    if (options?.showSuccess === false) return;

    showSuccessToast(
      options?.successTitle || 'Thành công',
      result.message || options?.successMessage,
    );
    return;
  }

  showErrorToast(
    options?.errorTitle || 'Thao tác thất bại',
    result?.message || options?.errorMessage || 'Vui lòng thử lại.',
  );
}
