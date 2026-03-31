import '@/global.css';
import { authService } from '@/src/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

export default function ResetPasswordScreen() {
  const router = useRouter();
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

  const handleSubmit = async () => {
    if (!email || !resetToken) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Thiếu thông tin reset token. Vui lòng thử lại từ đầu.',
      });
      return;
    }

    if (!newPassword.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng nhập mật khẩu mới.',
      });
      return;
    }

    if (newPassword.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Mật khẩu mới phải từ 6 ký tự trở lên.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Mật khẩu xác nhận không khớp.',
      });
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
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: result.message || 'Không thể đặt lại mật khẩu.',
        });
        return;
      }

      Alert.alert(
        'Thành công',
        result.message || 'Đặt lại mật khẩu thành công.',
        [{ text: 'Đăng nhập', onPress: () => router.replace('/login') }],
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background-light"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="w-full max-w-[420px] flex-1 self-center bg-white px-4">
          <View className="flex-row items-center justify-between py-4">
            <TouchableOpacity
              className="h-12 w-12 items-center justify-center rounded-full"
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="#0f172a" />
            </TouchableOpacity>

            <Text className="flex-1 pr-12 text-center text-lg font-bold text-text-primary">
              Đặt lại mật khẩu
            </Text>
          </View>

          <Text className="mb-2 text-sm font-semibold text-text-primary">
            Mật khẩu mới
          </Text>
          <TextInput
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Nhập mật khẩu mới"
            className="mb-4 h-12 rounded-lg border border-surface-dark bg-background-light px-4 text-base text-text-primary"
          />

          <Text className="mb-2 text-sm font-semibold text-text-primary">
            Xác nhận mật khẩu mới
          </Text>
          <TextInput
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Nhập lại mật khẩu mới"
            className="mb-6 h-12 rounded-lg border border-surface-dark bg-background-light px-4 text-base text-text-primary"
          />

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            className={`h-12 items-center justify-center rounded-lg ${
              submitting ? 'bg-primary/60' : 'bg-primary'
            }`}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-base font-bold text-white">
                Xác nhận mật khẩu mới
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
