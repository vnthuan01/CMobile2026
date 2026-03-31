import '@/global.css';
import { authService } from '@/src/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email.trim()) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập email' });
      return;
    }

    setLoading(true);
    try {
      const result = await authService.sendForgotPasswordOtp({
        email: email.trim(),
      });

      if (!result.success) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: result.message || 'Không thể gửi mã, vui lòng thử lại',
        });
        return;
      }

      Alert.alert('Thành công', result.message || 'Mã xác thực đã được gửi', [
        {
          text: 'OK',
          onPress: () => {
            router.push({
              pathname: '/otp-verification',
              params: { email: email.trim(), mode: 'forgot-password' },
            });
          },
        },
      ]);
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể gửi mã, vui lòng thử lại',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background-light"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-[420px] flex-1 self-center bg-white px-4">
          {/* Top App Bar */}
          <View className="flex-row items-center justify-between py-4">
            <TouchableOpacity
              className="h-12 w-12 items-center justify-center rounded-full"
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="#0f172a" />
            </TouchableOpacity>

            <Text className="flex-1 pr-12 text-center text-lg font-bold text-text-primary">
              Quên mật khẩu
            </Text>
          </View>

          {/* Headline */}
          <View className="pb-2 pt-4">
            <Text className="text-3xl font-bold text-text-primary">
              Bạn không nhớ mật khẩu của mình?
            </Text>
          </View>

          {/* Description */}
          <View className="pb-6 pt-1">
            <Text className="text-base leading-relaxed text-text-secondary">
              Đừng lo lắng. Hãy nhập email hoặc số điện thoại đã đăng ký của bạn
              dưới đây để nhận mã xác thực khôi phục tài khoản.
            </Text>
          </View>

          {/* Input */}
          <View className="py-2">
            <Text className="mb-2 text-sm font-semibold text-text-primary">
              Email
            </Text>

            <View className="relative">
              <TextInput
                className="h-14 rounded-lg border border-surface-dark bg-background-light px-12 text-base text-text-primary"
                placeholder="vidu@email.com"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />

              <View className="absolute left-4 top-[18px]">
                <Ionicons name="mail-outline" size={20} color="#64748b" />
              </View>
            </View>
          </View>

          {/* Button */}
          <View className="mt-2 py-6">
            <TouchableOpacity
              className={`h-12 w-full items-center justify-center rounded-lg ${
                loading ? 'bg-primary/50' : 'bg-primary'
              }`}
              onPress={handleSendCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View className="flex-row items-center gap-2">
                  <Text className="text-base font-bold text-white">
                    Gửi mã xác thực
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Spacer */}
          <View className="flex-1" />

          {/* Footer */}
          <View className="items-center gap-4 py-8">
            <View className="my-2 h-px w-full bg-surface-dark" />

            <TouchableOpacity className="flex-row items-center gap-2 rounded-full px-4 py-2">
              <Ionicons name="alert-circle" size={18} color="#ef4444" />
              <Text className="text-sm font-semibold text-red-500">
                Cần hỗ trợ ngay lập tức?
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
