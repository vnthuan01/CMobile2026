import '@/global.css';
import { useConfirmEmail } from '@/src/hooks/useAuthActions';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';

type VerifyStatus = 'loading' | 'success' | 'error';

export default function ConfirmEmailScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const confirmEmailMutation = useConfirmEmail();
  const params = useLocalSearchParams();

  const [status, setStatus] = useState<VerifyStatus>('loading');
  const [message, setMessage] = useState('Đang xác thực email của bạn...');

  useEffect(() => {
    const verifyEmail = async () => {
      const emailParam = Array.isArray(params.email)
        ? params.email[0]
        : params.email;
      const tokenParam = Array.isArray(params.token)
        ? params.token[0]
        : params.token;

      if (!emailParam || !tokenParam) {
        setStatus('error');
        setMessage('Liên kết xác thực không hợp lệ hoặc đã bị thiếu dữ liệu.');
        return;
      }

      const result = await confirmEmailMutation.mutateAsync({
        email: emailParam,
        token: tokenParam,
      });

      if (result.success) {
        setStatus('success');
        setMessage(result.message || 'Xác thực email thành công.');
        return;
      }

      setStatus('error');
      setMessage(result.message || 'Xác thực email thất bại.');
    };

    verifyEmail();
  }, [params.email, params.token]);

  return (
    <View
      className="flex-1 items-center justify-center px-6"
      style={{ backgroundColor: colors.background }}
    >
      <View
        className="w-full max-w-[420px] items-center rounded-2xl border p-6"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
      >
        {status === 'loading' ? (
          <>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text
              className="mt-4 text-center text-base"
              style={{ color: colors.textSecondary }}
            >
              {message}
            </Text>
          </>
        ) : (
          <>
            <View
              className={`h-16 w-16 items-center justify-center rounded-full ${
                status === 'success' ? '' : ''
              }`}
              style={{
                backgroundColor:
                  status === 'success'
                    ? `${colors.status.completed}20`
                    : `${colors.status.error}20`,
              }}
            >
              <Ionicons
                name={
                  status === 'success' ? 'checkmark-circle' : 'close-circle'
                }
                size={40}
                color={
                  status === 'success'
                    ? colors.status.completed
                    : colors.status.error
                }
              />
            </View>

            <Text
              className="mt-4 text-center text-xl font-bold"
              style={{ color: colors.text }}
            >
              {status === 'success'
                ? 'Xác thực thành công'
                : 'Xác thực thất bại'}
            </Text>

            <Text
              className="mt-2 text-center text-base"
              style={{ color: colors.textSecondary }}
            >
              {message}
            </Text>

            <TouchableOpacity
              className="mt-6 h-12 w-full items-center justify-center rounded-xl bg-primary"
              onPress={() => router.replace('/login')}
            >
              <Text className="text-base font-bold text-white">
                Đi đến đăng nhập
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}
