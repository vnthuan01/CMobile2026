import '@/global.css';
import { authService } from '@/src/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

export default function OTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; mode?: string }>();

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [counter, setCounter] = useState(30);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
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
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: isForgotPasswordMode
          ? 'Không tìm thấy email để khôi phục mật khẩu. Vui lòng thử lại.'
          : 'Không tìm thấy email để xác thực. Vui lòng đăng ký lại.',
      });
      return;
    }

    const code = otp.join('');
    if (code.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng nhập đủ 6 số OTP.',
      });
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
          Toast.show({
            type: 'error',
            text1: 'Lỗi',
            text2: forgotResult.message || 'Xác thực OTP thất bại.',
          });
          return;
        }

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
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: result.message || 'Xác thực OTP thất bại.',
        });
        return;
      }

      Alert.alert('Thành công', result.message || 'Xác thực OTP thành công.', [
        {
          text: 'Đăng nhập',
          onPress: () => router.replace('/login'),
        },
      ]);
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
          Toast.show({
            type: 'error',
            text1: 'Lỗi',
            text2: forgotResend.message || 'Không thể gửi lại OTP.',
          });
          return;
        }

        setCounter(30);
        setOtp(Array(6).fill(''));
        inputsRef.current[0]?.focus();
        Toast.show({
          type: 'success',
          text1: 'Thông báo',
          text2: forgotResend.message || 'Đã gửi lại mã OTP.',
        });
        return;
      }

      const result = await authService.resendEmailOtp(email);
      if (!result.success) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: result.message || 'Không thể gửi lại OTP.',
        });
        return;
      }

      setCounter(30);
      setOtp(Array(6).fill(''));
      inputsRef.current[0]?.focus();
      Toast.show({
        type: 'success',
        text1: 'Thông báo',
        text2: result.message || 'Đã gửi lại mã OTP.',
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background-light"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="w-full max-w-md flex-1 self-center bg-white">
          <View className="sticky top-0 z-10 flex-row items-center px-4 py-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full"
            >
              <Ionicons name="chevron-back" size={22} color="#0f172a" />
            </TouchableOpacity>

            <Text className="flex-1 pr-10 text-center text-lg font-bold text-text-primary">
              {isForgotPasswordMode ? 'Xác minh OTP khôi phục' : 'Xác minh OTP'}
            </Text>
          </View>

          <View className="flex-1 items-center px-6 pt-10">
            <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Ionicons name="mail-outline" size={40} color="#1565C0" />
            </View>

            <Text className="mb-3 text-center text-2xl font-bold text-text-primary">
              {isForgotPasswordMode
                ? 'Nhập mã OTP khôi phục'
                : 'Nhập mã xác thực'}
            </Text>

            <Text className="mb-8 max-w-xs text-center text-base leading-relaxed text-text-secondary">
              {isForgotPasswordMode
                ? 'Chúng tôi đã gửi một mã OTP 6 số để khôi phục mật khẩu, mã này sẽ có tác dụng trong 10p.'
                : 'Chúng tôi đã gửi một mã OTP 6 số đến gmail của bạn, mã này sẽ có tác dụng trong 10p.'}
              {`\n`}
              <Text className="font-bold text-text-primary">
                {email || 'email của bạn'}
              </Text>
            </Text>

            <View className="mb-8 flex-row gap-2">
              {otp.map((value, index) => (
                <TextInput
                  key={index}
                  ref={(el) => {
                    if (el) inputsRef.current[index] = el;
                  }}
                  value={value}
                  keyboardType="number-pad"
                  maxLength={1}
                  onChangeText={(v) => handleChange(v, index)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(nativeEvent.key, index)
                  }
                  className="h-14 w-12 rounded-xl border border-surface-dark bg-background-light text-center text-xl font-bold text-text-primary"
                />
              ))}
            </View>

            <View className="mb-8 flex-row items-center gap-2">
              <Text className="text-sm text-text-secondary">
                Chưa nhận được mã?
              </Text>
              <TouchableOpacity
                disabled={counter > 0 || resending}
                onPress={handleResend}
              >
                <Text
                  className={`text-sm font-medium ${
                    counter > 0 || resending
                      ? 'text-text-secondary'
                      : 'text-primary'
                  }`}
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
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-lg font-bold text-white">Xác minh</Text>
              )}
            </TouchableOpacity>

            <View className="mt-8 flex-row items-center gap-2">
              <Ionicons name="help-circle-outline" size={18} color="#64748b" />
              <Text className="text-sm text-text-secondary">Cần trợ giúp?</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
