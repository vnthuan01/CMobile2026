import '@/global.css';
import AppDialog from '@/src/components/common/AppDialog';
import { useSendForgotPasswordOtp } from '@/src/hooks/useAuthActions';
import { showErrorToast, showSuccessToast } from '@/src/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const sendForgotPasswordOtpMutation = useSendForgotPasswordOtp();
  const [email, setEmail] = useState('');
  const [successVisible, setSuccessVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Mã xác thực đã được gửi');
  const loading = sendForgotPasswordOtpMutation.isPending;

  const handleSendCode = async () => {
    if (!email.trim()) {
      showErrorToast('Thiếu email', 'Vui lòng nhập email');
      return;
    }

    try {
      const result = await sendForgotPasswordOtpMutation.mutateAsync({
        email: email.trim(),
      });

      if (!result.success) {
        showErrorToast('Không thể gửi mã', result.message || 'Không thể gửi mã, vui lòng thử lại');
        return;
      }

      const message = result.message || 'Mã xác thực đã được gửi';
      setSuccessMessage(message);
      showSuccessToast('Đã gửi mã xác thực', message);
      setSuccessVisible(true);
    } catch {
      showErrorToast('Không thể gửi mã', 'Không thể gửi mã, vui lòng thử lại');
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        style={{ backgroundColor: colors.background }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
        <View className="w-full max-w-[420px] flex-1 self-center px-4" style={{ backgroundColor: colors.background }}>
          {/* Top App Bar */}
          <View className="flex-row items-center justify-between py-4">
            <TouchableOpacity
              className="h-12 w-12 items-center justify-center rounded-full"
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>

            <Text
              className="flex-1 pr-12 text-center text-lg font-bold"
              style={{ color: colors.text }}
            >
              Quên mật khẩu
            </Text>
          </View>

          {/* Headline */}
          <View className="pb-2 pt-4">
            <Text className="text-3xl font-bold" style={{ color: colors.text }}>
              Bạn không nhớ mật khẩu của mình?
            </Text>
          </View>

          {/* Description */}
          <View className="pb-6 pt-1">
            <Text
              className="text-base leading-relaxed"
              style={{ color: colors.textSecondary }}
            >
              Đừng lo lắng. Hãy nhập email hoặc số điện thoại đã đăng ký của bạn
              dưới đây để nhận mã xác thực khôi phục tài khoản.
            </Text>
          </View>

          {/* Input */}
          <View className="py-2">
            <Text
              className="mb-2 text-sm font-semibold"
              style={{ color: colors.text }}
            >
              Email
            </Text>

            <View className="relative">
              <TextInput
                className="h-14 rounded-lg px-12 text-base"
                style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, color: colors.text }}
                placeholder="vidu@email.com"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />

              <View className="absolute left-4 top-[18px]">
                <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
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
                <ActivityIndicator color={colors.white} />
              ) : (
                <View className="flex-row items-center gap-2">
                  <Text className="text-base font-bold text-white">
                    Gửi mã xác thực
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color={colors.white} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Spacer */}
          <View className="flex-1" />

          {/* Footer */}
          <View className="items-center gap-4 py-8">
            <View
              className="my-2 h-px w-full"
              style={{ backgroundColor: colors.divider }}
            />

            <TouchableOpacity className="flex-row items-center gap-2 rounded-full px-4 py-2">
              <Ionicons name="alert-circle" size={18} color={colors.status.error} />
              <Text className="text-sm font-semibold" style={{ color: colors.status.error }}>
                Cần hỗ trợ ngay lập tức?
              </Text>
            </TouchableOpacity>
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
        confirmLabel="Nhập OTP"
        onCancel={() => setSuccessVisible(false)}
        onConfirm={() => {
          setSuccessVisible(false);
          router.push({
            pathname: '/otp-verification',
            params: { email: email.trim(), mode: 'forgot-password' },
          });
        }}
      />
    </SafeAreaView>
  );
}
