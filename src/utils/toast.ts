import Toast from 'react-native-toast-message';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ShowToastOptions {
  type: ToastType;
  title: string;
  message?: string;
  /** Duration in ms. Defaults to 3500 */
  duration?: number;
}

/**
 * Generic toast helper.
 * Uses the custom `appToastConfig` registered in _layout.tsx.
 */
export function showToast({ type, title, message, duration = 3500 }: ShowToastOptions): void {
  Toast.show({
    type,
    text1: title,
    text2: message,
    visibilityTime: duration,
    position: 'top',
    topOffset: 56,
  });
}

export function showSuccessToast(title: string, message?: string): void {
  showToast({ type: 'success', title, message });
}

export function showErrorToast(title: string, message?: string): void {
  showToast({ type: 'error', title, message });
}

export function showInfoToast(title: string, message?: string): void {
  showToast({ type: 'info', title, message });
}

export function showWarningToast(title: string, message?: string): void {
  showToast({ type: 'warning', title, message });
}
