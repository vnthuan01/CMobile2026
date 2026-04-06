import '@/global.css';
import AppDialog from '@/src/components/common/AppDialog';
import { useTheme } from '@/src/context/ThemeContext';
import { showErrorToast, showSuccessToast } from '@/src/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../src/services/authService';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successDialogVisible, setSuccessDialogVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Đăng nhập thành công');

  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.2,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showErrorToast('Thiếu thông tin', 'Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.login({
        email: email.trim(),
        password: password.trim(),
      });

      if (result.success) {
        const message = result.message || 'Đăng nhập thành công';
        setSuccessMessage(message);
        showSuccessToast('Đăng nhập thành công', message);
        setSuccessDialogVisible(true);
      } else {
        showErrorToast('Đăng nhập thất bại', result.message || 'Vui lòng kiểm tra lại thông tin đăng nhập.');
      }
    } catch {
      showErrorToast('Có lỗi xảy ra', 'Vui lòng thử lại sau');
    } finally {
      setLoading(false);
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
        <View className="w-full max-w-[420px] flex-1 self-center px-6 pb-8 pt-10">
          {/* Header */}
          <View className="mb-10 items-center">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-primary">
              <Ionicons name="shield-checkmark" size={40} color={colors.white} />
            </View>
            <View className="absolute right-0 top-0">
              <TouchableOpacity
                onPress={() => router.push('/donate')}
                className="h-14 flex-row items-center rounded-full px-3"
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderWidth: 1,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  elevation: 5,
                }}
              >
                <Animated.View style={{ transform: [{ scale }] }}>
                  <Ionicons
                    name="heart-outline"
                    size={20}
                    color={colors.primary}
                    className="mt-1"
                  />
                </Animated.View>

                {/* Label che border */}
                <View className="px-1" style={{ backgroundColor: colors.card }}>
                  <Text className="text-sm font-bold" style={{ color: colors.primary }}>
                    Donation
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/hotline')}
              className="flex-row items-center gap-1 rounded-full px-3 py-1.5"
              style={{ backgroundColor: `${colors.status.error}18` }}
            >
              <Ionicons name="alert-circle" size={18} color={colors.status.error} />
              <Text className="text-sm font-bold" style={{ color: colors.status.error }}>
                Cần hỗ trợ ngay lập tức!
              </Text>
            </TouchableOpacity>

            <Text className="text-[32px] font-bold" style={{ color: colors.text }}>
              Đăng nhập
            </Text>
            <Text
              className="mt-2 text-center text-base"
              style={{ color: colors.textSecondary }}
            >
              Kết nối để nhận hỗ trợ khẩn cấp và cập nhật tình hình thiên tai.
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-5">
            {/* Email / Phone */}
            <View>
              <Text
                className="mb-2 text-base font-medium"
                style={{ color: colors.text }}
              >
                Email hoặc số điện thoại
              </Text>
              <TextInput
                className="h-14 rounded-xl px-4 text-base"
                style={{
                  borderColor: colors.border,
                  borderWidth: 1,
                  backgroundColor: colors.surface,
                  color: colors.text,
                }}
                placeholder="Nhập email hoặc số điện thoại"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            {/* Password */}
            <View>
              <Text
                className="mb-2 text-base font-medium"
                style={{ color: colors.text }}
              >
                Mật khẩu
              </Text>

              <View className="relative">
                <TextInput
                  className="h-14 rounded-xl px-4 pr-12 text-base"
                  style={{
                    borderColor: colors.border,
                    borderWidth: 1,
                    backgroundColor: colors.surface,
                    color: colors.text,
                  }}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />

                <TouchableOpacity
                  className="absolute right-4 top-[18px]"
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <Text
                    className="text-lg"
                    style={{ color: colors.textSecondary }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                className="mt-2 self-end"
                onPress={() => router.push('/forgot-password')}
              >
                <Text className="text-sm font-semibold text-primary">
                  Quên mật khẩu?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              className={`mt-4 h-12 items-center justify-center rounded-xl ${
                loading ? 'bg-primary/50' : 'bg-primary'
              }`}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text className="text-base font-bold text-white">
                  Đăng nhập
                </Text>
              )}
            </TouchableOpacity>

            {/* Biometric */}
            <View className="mt-6 items-center">
              <View className="mb-4 flex-row items-center gap-3">
                <View
                  className="h-px flex-1"
                  style={{ backgroundColor: colors.divider }}
                />
                <Text className="text-sm" style={{ color: colors.textSecondary }}>
                  Hoặc đăng nhập bằng
                </Text>
                <View
                  className="h-px flex-1"
                  style={{ backgroundColor: colors.divider }}
                />
              </View>

              <TouchableOpacity
                className="h-14 w-14 items-center justify-center rounded-full"
                style={{
                  borderColor: colors.border,
                  borderWidth: 1,
                  backgroundColor: colors.card,
                }}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={26}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}

          <Pressable
            className="mt-10 items-center"
            onPress={() => router.push('/register')}
          >
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              Chưa có tài khoản?
            </Text>
            <Text className="font-bold text-primary">Đăng ký ngay</Text>
          </Pressable>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <AppDialog
        visible={successDialogVisible}
        title="Thành công"
        message={successMessage}
        type="success"
        cancelLabel="Ở lại"
        confirmLabel="Vào ứng dụng"
        onCancel={() => setSuccessDialogVisible(false)}
        onConfirm={() => {
          setSuccessDialogVisible(false);
          router.replace('/(tabs)');
        }}
      />
    </SafeAreaView>
  );
}
