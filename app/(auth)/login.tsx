import '@/global.css';
import { AppDialog } from '@/src/components/common/AppDialog';
import { useTheme } from '@/src/context/ThemeContext';
import { useLogin } from '@/src/hooks/useAuthActions';
import { showErrorToast, showInfoToast } from '@/src/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { height } = useWindowDimensions();
  const loginMutation = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [successDialogVisible, setSuccessDialogVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Đăng nhập thành công');
  const loading = loginMutation.isPending;
  const isShortScreen = height < 700;
  const fieldHeight = isShortScreen ? 46 : 52;
  const fieldRadius = 12;
  const fieldFontSize = isShortScreen ? 15 : 16;
  const fieldIconSize = isShortScreen ? 18 : 20;

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      const msg = 'Vui lòng nhập đầy đủ email và mật khẩu.';
      setInlineError(msg);
      showErrorToast('Thiếu thông tin', msg);
      return;
    }

    try {
      const result = await loginMutation.mutateAsync({
        email: email.trim(),
        password: password.trim(),
      });

      if (result.success) {
        setSuccessMessage('Đăng nhập thành công. Chào mừng bạn quay lại!');
        setSuccessDialogVisible(true);
      } else {
        console.error('[Login failed detail]:', result.message);
        const msg = 'Đăng nhập thất bại. Vui lòng thử lại.';
        setInlineError(msg);
        showErrorToast('Đăng nhập thất bại');
      }
    } catch {
      showErrorToast('Có lỗi xảy ra', 'Vui lòng thử lại sau');
    }
  };

  const handleGoogleLogin = () => {
    showInfoToast('Thông báo', 'Tính năng đang được phát triển');
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: isShortScreen ? 24 : 36,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            className="w-full self-center px-5"
            style={{ paddingTop: isShortScreen ? 20 : 40 }}
          >
            <View style={{ marginBottom: isShortScreen ? 20 : 28 }}>
              <Text
                className="text-[30px] font-bold"
                style={{ color: colors.textPrimary }}
              >
                Đăng nhập
              </Text>
              <Text
                className="mt-2 text-base"
                style={{ color: colors.textSecondary }}
              >
                Nhập thông tin để tiếp tục nhận hỗ trợ.
              </Text>
            </View>

            <View className="rounded-xl" style={{ backgroundColor: colors.bg }}>
              <View className="mb-4">
                <Text
                  className="mb-2 text-sm font-semibold"
                  style={{ color: colors.textPrimary }}
                >
                  Email
                </Text>
                <View
                  className="flex-row items-center px-3"
                  style={{
                    height: fieldHeight,
                    borderRadius: fieldRadius,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                  }}
                >
                  <Ionicons
                    name="mail-outline"
                    size={fieldIconSize}
                    color={colors.textSecondary}
                  />
                  <TextInput
                    className="ml-2 flex-1"
                    style={{
                      color: colors.textPrimary,
                      fontSize: fieldFontSize,
                    }}
                    placeholder="example@email.com"
                    placeholderTextColor={colors.textDisabled}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!loading}
                  />
                </View>
              </View>

              <View>
                <Text
                  className="mb-2 text-sm font-semibold"
                  style={{ color: colors.textPrimary }}
                >
                  Mật khẩu
                </Text>
                <View
                  className="flex-row items-center px-3"
                  style={{
                    height: fieldHeight,
                    borderRadius: fieldRadius,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                  }}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={fieldIconSize}
                    color={colors.textSecondary}
                  />
                  <TextInput
                    className="ml-2 flex-1"
                    style={{
                      color: colors.textPrimary,
                      fontSize: fieldFontSize,
                    }}
                    placeholder="Nhập mật khẩu"
                    placeholderTextColor={colors.textDisabled}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((prev) => !prev)}
                    disabled={loading}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={fieldIconSize}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {!!inlineError && (
                <View className="mt-3 flex-row items-center">
                  <Ionicons
                    name="alert-circle-outline"
                    size={16}
                    color={colors.emergency}
                  />
                  <Text
                    className="ml-1 flex-1 text-sm"
                    style={{ color: colors.emergency }}
                  >
                    {inlineError}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                className="mt-3 self-end"
                onPress={() => router.push('/forgot-password')}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: colors.primary }}
                >
                  Quên mật khẩu?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="mt-5 h-12 items-center justify-center rounded-xl"
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
                style={{
                  backgroundColor: loading
                    ? colors.textDisabled
                    : colors.primary,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-base font-bold text-white">
                    Đăng nhập
                  </Text>
                )}
              </TouchableOpacity>

              <View className="mt-6 items-center">
                <View className="mb-4 w-full flex-row items-center">
                  <View
                    className="h-px flex-1"
                    style={{ backgroundColor: colors.border }}
                  />
                  <Text
                    className="mx-3 text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    Hoặc đăng nhập bằng
                  </Text>
                  <View
                    className="h-px flex-1"
                    style={{ backgroundColor: colors.border }}
                  />
                </View>

                <TouchableOpacity
                  className="h-12 w-full flex-row items-center justify-center rounded-xl"
                  style={{
                    borderColor: colors.border,
                    borderWidth: 1,
                    backgroundColor: colors.card,
                  }}
                  onPress={handleGoogleLogin}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name="logo-google"
                    size={20}
                    color={colors.primary}
                  />
                  <Text
                    className="ml-2 text-base font-semibold"
                    style={{ color: colors.textPrimary }}
                  >
                    Tiếp tục với Google
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Pressable
              className="items-center"
              style={{ marginTop: isShortScreen ? 24 : 40 }}
              onPress={() => router.push('/register')}
            >
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                Chưa có tài khoản?
              </Text>
              <Text
                className="mt-1 font-bold"
                style={{ color: colors.primary }}
              >
                Đăng ký ngay
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AppDialog
        visible={successDialogVisible}
        title="Thành công"
        message={successMessage}
        type="success"
        confirmLabel="Vào ứng dụng"
        showCancel={false}
        onCancel={() => setSuccessDialogVisible(false)}
        onConfirm={() => {
          setSuccessDialogVisible(false);
          router.replace('/(tabs)');
        }}
      />
    </SafeAreaView>
  );
}
