import '@/global.css';
import { AppDialog } from '@/src/components/common/AppDialog';
import { SosFloatingButton } from '@/src/components/common/SosFloatingButton';
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
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
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
  const fieldRadius = 16;
  const fieldFontSize = isShortScreen ? 15 : 16;
  const fieldIconSize = isShortScreen ? 18 : 20;

  const dangerRed = '#E52521';
  const neutralLine = '#E6E6E6';

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
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
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
            style={{ paddingTop: isShortScreen ? 10 : 18 }}
          >
            <View className="mb-4 mt-2 flex-row items-center justify-end">
              <TouchableOpacity
                onPress={() => router.push('/donate')}
                className="flex-row items-center gap-1 rounded-full border px-4 py-2"
                style={{
                  borderColor: '#F3D1D0',
                  backgroundColor: '#FFFFFF',
                  shadowColor: '#CB2D28',
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 0.08,
                  shadowRadius: 10,
                  elevation: 2,
                }}
              >
                <Ionicons name="heart-outline" size={16} color={dangerRed} />
                <Text className="font-semibold" style={{ color: dangerRed }}>
                  Donation
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: isShortScreen ? 20 : 24 }}>
              <Text
                className="mt-2 text-[46px] font-extrabold"
                style={{ color: '#1F2937', lineHeight: 52 }}
              >
                Đăng nhập
              </Text>
              <Text className="mt-2 text-base" style={{ color: '#4B5563' }}>
                Kết nối để nhận hỗ trợ khẩn cấp và cập nhật tình{`\n`}hình thiên
                tai.
              </Text>
            </View>

            <View className="rounded-xl" style={{ backgroundColor: '#FFFFFF' }}>
              <View className="mb-4">
                <Text
                  className="mb-2 text-sm font-semibold"
                  style={{ color: '#111827' }}
                >
                  Email hoặc số điện thoại
                </Text>
                <View
                  className="flex-row items-center px-3"
                  style={{
                    height: fieldHeight,
                    borderRadius: fieldRadius,
                    borderWidth: 1,
                    borderColor: neutralLine,
                    backgroundColor: '#F5F5F5',
                  }}
                >
                  <TextInput
                    className="flex-1"
                    style={{
                      color: '#111827',
                      fontSize: fieldFontSize,
                    }}
                    placeholder="Nhập email hoặc số điện thoại"
                    placeholderTextColor="#9CA3AF"
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
                  style={{ color: '#111827' }}
                >
                  Mật khẩu
                </Text>
                <View
                  className="flex-row items-center px-3"
                  style={{
                    height: fieldHeight,
                    borderRadius: fieldRadius,
                    borderWidth: 1,
                    borderColor: neutralLine,
                    backgroundColor: '#F5F5F5',
                  }}
                >
                  <TextInput
                    className="flex-1"
                    style={{
                      color: '#111827',
                      fontSize: fieldFontSize,
                    }}
                    placeholder="Nhập mật khẩu"
                    placeholderTextColor="#9CA3AF"
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
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {!!inlineError && (
                <View className="mt-3 flex-row items-center">
                  <Ionicons
                    name="alert-circle-outline"
                    size={16}
                    color={dangerRed}
                  />
                  <Text
                    className="ml-1 flex-1 text-sm"
                    style={{ color: dangerRed }}
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
                  style={{ color: dangerRed }}
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
                  borderRadius: 999,
                  backgroundColor: loading ? '#F4A9A6' : dangerRed,
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
                    style={{ backgroundColor: neutralLine }}
                  />
                  <Text className="mx-3 text-sm" style={{ color: '#6B7280' }}>
                    Hoặc đăng nhập bằng
                  </Text>
                  <View
                    className="h-px flex-1"
                    style={{ backgroundColor: neutralLine }}
                  />
                </View>

                <TouchableOpacity
                  className="h-12 w-full flex-row items-center justify-center rounded-xl"
                  style={{
                    borderColor: neutralLine,
                    borderWidth: 1,
                    backgroundColor: '#FFFFFF',
                  }}
                  onPress={handleGoogleLogin}
                  activeOpacity={0.85}
                >
                  <Ionicons name="logo-google" size={20} color={dangerRed} />
                  <Text
                    className="ml-2 text-base font-semibold"
                    style={{ color: '#1F2937' }}
                  >
                    Tiếp tục với Google
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Pressable
              className="items-center"
              style={{ marginTop: isShortScreen ? 24 : 32 }}
              onPress={() => router.push('/register')}
            >
              <Text className="text-sm" style={{ color: '#6B7280' }}>
                Chưa có tài khoản?
              </Text>
              <Text className="mt-1 font-bold" style={{ color: dangerRed }}>
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

      <SosFloatingButton
        align="center"
        size={78}
        bottom={bottom + 28}
        onPress={() => router.push('/sos-request')}
      />
    </SafeAreaView>
  );
}
