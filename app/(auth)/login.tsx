import '@/global.css';
import { AppDialog } from '@/src/components/common/AppDialog';
import { SosFloatingButton } from '@/src/components/common/SosFloatingButton';
import { useLogin } from '@/src/hooks/useAuthActions';
import { getScreenScaleConfig } from '@/src/utils/responsive';
import { showErrorToast } from '@/src/utils/toast';
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
  const { width, height, fontScale } = useWindowDimensions();
  const screenScale = getScreenScaleConfig(width, height, fontScale);
  const loginMutation = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [successDialogVisible, setSuccessDialogVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Đăng nhập thành công');
  const loading = loginMutation.isPending;
  const isShortScreen = screenScale.isCompactHeight;
  const fieldHeight = Math.round((isShortScreen ? 46 : 52) * screenScale.scale);
  const fieldRadius = 16;
  const fieldFontSize = Math.round(
    (isShortScreen ? 15 : 16) * screenScale.scale,
  );
  const fieldIconSize = Math.round(
    (isShortScreen ? 18 : 20) * screenScale.scale,
  );
  const sosSize = 78;
  const sosBottomOffset = bottom + 28;
  const scrollBottomPadding = sosBottomOffset + sosSize + 20;

  const dangerRed = '#E52521';
  const neutralLine = '#E6E6E6';

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      const msg = 'Vui lòng nhập đầy đủ email và mật khẩu.';
      setInlineError(msg);
      showErrorToast('Thiếu thông tin', msg);
      return;
    }

    setInlineError(null);

    try {
      const result = await loginMutation.mutateAsync({
        email: email.trim(),
        password: password.trim(),
      });

      if (result.success) {
        setSuccessMessage('Đăng nhập thành công. Chào mừng bạn quay lại!');
        setSuccessDialogVisible(true);
      } else {
        const msg =
          result.message?.trim() || 'Đăng nhập thất bại. Vui lòng thử lại.';
        setInlineError(msg);
        showErrorToast('Đăng nhập thất bại', msg);
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Vui lòng thử lại sau';
      setInlineError(msg);
      showErrorToast('Có lỗi xảy ra', msg);
    }
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
            paddingBottom: Math.max(
              isShortScreen ? 24 : 36,
              scrollBottomPadding,
            ),
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            className="w-full self-center"
            style={{
              paddingTop: isShortScreen ? 10 : 18,
              paddingHorizontal: screenScale.horizontalPadding,
              maxWidth: screenScale.contentMaxWidth,
            }}
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
                  Ủng hộ
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: isShortScreen ? 20 : 24 }}>
              <Text
                className="mt-2 font-extrabold"
                style={{
                  color: '#1F2937',
                  lineHeight: Math.round(52 * screenScale.scale),
                  fontSize: Math.round(46 * screenScale.scale),
                }}
              >
                Đăng nhập
              </Text>
              <Text
                className="mt-2 text-base"
                style={{
                  color: '#4B5563',
                  lineHeight: Math.round(24 * screenScale.scale),
                }}
              >
                Kết nối để nhận hỗ trợ khẩn cấp và cập nhật tình hình thiên tai.
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
            </View>

            <Pressable
              className="items-center"
              style={{
                marginTop: isShortScreen ? 24 : 32,
                width: '100%',
              }}
              onPress={() => router.push('/register')}
            >
              <Text
                className="text-sm"
                style={{ color: '#6B7280', textAlign: 'center' }}
              >
                Chưa có tài khoản?
              </Text>
              <Text
                className="mt-1 font-bold"
                style={{ color: dangerRed, textAlign: 'center' }}
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

      <SosFloatingButton
        align="center"
        size={sosSize}
        bottom={sosBottomOffset}
        onPress={() => router.push('/sos-request')}
      />
    </SafeAreaView>
  );
}
