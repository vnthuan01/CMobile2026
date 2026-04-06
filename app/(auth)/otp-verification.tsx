import '@/global.css';
import AppDialog from '@/src/components/common/AppDialog';
import { authService } from '@/src/services/authService';
import { showErrorToast, showSuccessToast } from '@/src/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OTPScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ email?: string; mode?: string }>();

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [counter, setCounter] = useState(30);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Xác thực OTP thành công.');
  const inputsRef = useRef<TextInput[]>([]);

  const email = Array.isArray(params.email) ? params.email[0] : params.email;
  const mode = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const isForgotPasswordMode = mode === 'forgot-password';

  useEffect(() => {
    if (counter === 0) return;
    const timer = setTimeout(() => setCounter((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [counter]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const next = [...otp];
    next[index] = value;
    setOtp(next);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (!email) {
      showErrorToast(
        'Thiếu email',
        isForgotPasswordMode
          ? 'Không tìm thấy email để khôi phục mật khẩu. Vui lòng thử lại.'
          : 'Không tìm thấy email để xác thực. Vui lòng đăng ký lại.',
      );
      return;
    }

    const code = otp.join('');
    if (code.length < 6) {
      showErrorToast('Thiếu mã OTP', 'Vui lòng nhập đủ 6 số OTP.');
      return;
    }

    setVerifying(true);
    try {
      if (isForgotPasswordMode) {
        const forgotResult = await authService.verifyForgotPasswordOtp({
          email,
          otpCode: code,
        });

        if (!forgotResult.success || !forgotResult.resetToken) {
          showErrorToast('Xác thực OTP thất bại', forgotResult.message || 'Xác thực OTP thất bại.');
          return;
        }

        showSuccessToast('Xác minh thành công', forgotResult.message || 'Bạn có thể đặt lại mật khẩu mới.');
        router.replace({
          pathname: '/(auth)/reset-password',
          params: {
            email,
            resetToken: forgotResult.resetToken,
          },
        });
        return;
      }

      const result = await authService.verifyEmailOtp({ email, code });
      if (!result.success) {
        showErrorToast('Xác thực OTP thất bại', result.message || 'Xác thực OTP thất bại.');
        return;
      }

      const message = result.message || 'Xác thực OTP thành công.';
      setSuccessMessage(message);
      showSuccessToast('Xác thực OTP thành công', message);
      setSuccessVisible(true);
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email || counter > 0 || resending) return;

    setResending(true);
    try {
      if (isForgotPasswordMode) {
        const forgotResend = await authService.sendForgotPasswordOtp({ email });
        if (!forgotResend.success) {
          showErrorToast('Không thể gửi lại OTP', forgotResend.message || 'Không thể gửi lại OTP.');
          return;
        }

        setCounter(30);
        setOtp(Array(6).fill(''));
        inputsRef.current[0]?.focus();
        showSuccessToast('Đã gửi lại OTP', forgotResend.message || 'Đã gửi lại mã OTP.');
        return;
      }

      const result = await authService.resendEmailOtp(email);
      if (!result.success) {
        showErrorToast('Không thể gửi lại OTP', result.message || 'Không thể gửi lại OTP.');
        return;
      }

      setCounter(30);
      setOtp(Array(6).fill(''));
      inputsRef.current[0]?.focus();
      showSuccessToast('Đã gửi lại OTP', result.message || 'Đã gửi lại mã OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        style={{ backgroundColor: colors.background }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="w-full max-w-md flex-1 self-center" style={{ backgroundColor: colors.background }}>
          <View className="sticky top-0 z-10 flex-row items-center px-4 py-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full"
            >
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </TouchableOpacity>

            <Text
              className="flex-1 pr-10 text-center text-lg font-bold"
              style={{ color: colors.text }}
            >
              {isForgotPasswordMode ? 'Xác minh OTP khôi phục' : 'Xác minh OTP'}
            </Text>
          </View>

          <View className="flex-1 items-center px-6 pt-10">
            <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Ionicons name="mail-outline" size={40} color={colors.secondary} />
            </View>

            <Text
              className="mb-3 text-center text-2xl font-bold"
              style={{ color: colors.text }}
            >
              {isForgotPasswordMode
                ? 'Nhập mã OTP khôi phục'
                : 'Nhập mã xác thực'}
            </Text>

            <Text
              className="mb-8 max-w-xs text-center text-base leading-relaxed"
              style={{ color: colors.textSecondary }}
            >
              {isForgotPasswordMode
                ? 'Chúng tôi đã gửi một mã OTP 6 số để khôi phục mật khẩu, mã này sẽ có tác dụng trong 10p.'
                : 'Chúng tôi đã gửi một mã OTP 6 số đến gmail của bạn, mã này sẽ có tác dụng trong 10p.'}
              {`\n`}
              <Text className="font-bold" style={{ color: colors.text }}>
                {email || 'email của bạn'}
              </Text>
            </Text>

            <View className="mb-8 flex-row gap-2">
              {otp.map((value, index) => (
                <TextInput
                  key={index}
                  ref={(el: TextInput | null) => {
                    if (el) inputsRef.current[index] = el;
                  }}
                  value={value}
                  keyboardType="number-pad"
                  maxLength={1}
                  onChangeText={(v: string) => handleChange(v, index)}
                  onKeyPress={(event: any) => handleKeyPress(event.nativeEvent.key, index)}
                  className="h-14 w-12 rounded-xl text-center text-xl font-bold"
                  style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, color: colors.text }}
                />
              ))}
            </View>

            <View className="mb-8 flex-row items-center gap-2">
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                Chưa nhận được mã?
              </Text>
              <TouchableOpacity
                disabled={counter > 0 || resending}
                onPress={handleResend}
              >
                <Text
                  className="text-sm font-medium"
                  style={{
                    color:
                      counter > 0 || resending
                        ? colors.textSecondary
                        : colors.primary,
                  }}
                >
                  {resending
                    ? 'Đang gửi lại...'
                    : `Gửi lại ${counter > 0 ? `(00:${String(counter).padStart(2, '0')})` : ''}`}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleVerify}
              disabled={verifying}
              className={`h-14 w-full items-center justify-center rounded-xl shadow-lg shadow-primary/30 ${
                verifying ? 'bg-primary/60' : 'bg-primary'
              }`}
            >
              {verifying ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text className="text-lg font-bold text-white">Xác minh</Text>
              )}
            </TouchableOpacity>

            <View className="mt-8 flex-row items-center gap-2">
              <Ionicons name="help-circle-outline" size={18} color={colors.textSecondary} />
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                Cần trợ giúp?
              </Text>
            </View>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <AppDialog
        visible={successVisible}
        title="Thành công"
        message={successMessage}
        type="success"
        cancelLabel="Ở lại"
        confirmLabel="Đăng nhập"
        onCancel={() => setSuccessVisible(false)}
        onConfirm={() => {
          setSuccessVisible(false);
          router.replace('/login');
        }}
      />
    </SafeAreaView>
  );
}
