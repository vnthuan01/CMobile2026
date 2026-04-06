import '@/global.css';
import AppDialog from '@/src/components/common/AppDialog';
import { authService } from '@/src/services/authService';
import { showErrorToast, showSuccessToast } from '@/src/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{
    email?: string;
    resetToken?: string;
  }>();

  const email = Array.isArray(params.email) ? params.email[0] : params.email;
  const resetToken = Array.isArray(params.resetToken)
    ? params.resetToken[0]
    : params.resetToken;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Đặt lại mật khẩu thành công.');

  const handleSubmit = async () => {
    if (!email || !resetToken) {
      showErrorToast('Thiếu thông tin', 'Thiếu thông tin reset token. Vui lòng thử lại từ đầu.');
      return;
    }

    if (!newPassword.trim()) {
      showErrorToast('Thiếu mật khẩu', 'Vui lòng nhập mật khẩu mới.');
      return;
    }

    if (newPassword.length < 6) {
      showErrorToast('Mật khẩu chưa hợp lệ', 'Mật khẩu mới phải từ 6 ký tự trở lên.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showErrorToast('Mật khẩu không khớp', 'Mật khẩu xác nhận không khớp.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await authService.resetForgotPassword({
        email,
        resetToken,
        newPassword,
      });

      if (!result.success) {
        showErrorToast('Không thể đặt lại mật khẩu', result.message || 'Không thể đặt lại mật khẩu.');
        return;
      }

      const message = result.message || 'Đặt lại mật khẩu thành công.';
      setSuccessMessage(message);
      showSuccessToast('Đặt lại mật khẩu thành công', message);
      setSuccessVisible(true);
    } finally {
      setSubmitting(false);
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
        <View className="w-full max-w-[420px] flex-1 self-center px-4" style={{ backgroundColor: colors.background }}>
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
              Đặt lại mật khẩu
            </Text>
          </View>

          <Text
            className="mb-2 text-sm font-semibold"
            style={{ color: colors.text }}
          >
            Mật khẩu mới
          </Text>
          <TextInput
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Nhập mật khẩu mới"
            className="mb-4 h-12 rounded-lg px-4 text-base"
            style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, color: colors.text }}
            placeholderTextColor={colors.textSecondary}
          />

          <Text
            className="mb-2 text-sm font-semibold"
            style={{ color: colors.text }}
          >
            Xác nhận mật khẩu mới
          </Text>
          <TextInput
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Nhập lại mật khẩu mới"
            className="mb-6 h-12 rounded-lg px-4 text-base"
            style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, color: colors.text }}
            placeholderTextColor={colors.textSecondary}
          />

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            className={`h-12 items-center justify-center rounded-lg ${
              submitting ? 'bg-primary/60' : 'bg-primary'
            }`}
          >
            {submitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text className="text-base font-bold text-white">
                Xác nhận mật khẩu mới
              </Text>
            )}
          </TouchableOpacity>
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
