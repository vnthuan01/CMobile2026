import '@/global.css';
import { authService } from '@/src/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

type VerifyStatus = 'loading' | 'success' | 'error';

export default function ConfirmEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; token?: string }>();

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

      const result = await authService.confirmEmail({
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
    <View className="flex-1 items-center justify-center bg-background-light px-6">
      <View className="w-full max-w-[420px] items-center rounded-2xl border border-surface-dark bg-white p-6">
        {status === 'loading' ? (
          <>
            <ActivityIndicator size="large" color="#DA251D" />
            <Text className="mt-4 text-center text-base text-text-secondary">
              {message}
            </Text>
          </>
        ) : (
          <>
            <View
              className={`h-16 w-16 items-center justify-center rounded-full ${
                status === 'success' ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              <Ionicons
                name={
                  status === 'success' ? 'checkmark-circle' : 'close-circle'
                }
                size={40}
                color={status === 'success' ? '#16A34A' : '#DC2626'}
              />
            </View>

            <Text className="mt-4 text-center text-xl font-bold text-text-primary">
              {status === 'success'
                ? 'Xác thực thành công'
                : 'Xác thực thất bại'}
            </Text>

            <Text className="mt-2 text-center text-base text-text-secondary">
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
