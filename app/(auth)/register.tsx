import '@/global.css';
import { AppDialog } from '@/src/components/common/AppDialog';
import { useTheme } from '@/src/context/ThemeContext';
import { useRegister } from '@/src/hooks/useAuthActions';
import { showErrorToast } from '@/src/utils/toast';
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
    useWindowDimensions,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { height } = useWindowDimensions();
  const registerMutation = useRegister();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [successVisible, setSuccessVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState(
    'Đăng ký thành công. Vui lòng xác thực OTP.',
  );
  const loading = registerMutation.isPending;
  const isShortScreen = height < 700;
  const fieldHeight = isShortScreen ? 46 : 52;
  const fieldRadius = 12;
  const fieldFontSize = isShortScreen ? 15 : 16;
  const fieldIconSize = isShortScreen ? 18 : 20;

  const handleRegister = async () => {
    if (
      !fullName.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !username.trim() ||
      !password ||
      !confirmPassword
    ) {
      const msg = 'Vui lòng nhập đầy đủ thông tin.';
      setInlineError(msg);
      showErrorToast('Thiếu thông tin', msg);
      return;
    }

    if (password !== confirmPassword) {
      const msg = 'Mật khẩu xác nhận không khớp.';
      setInlineError(msg);
      showErrorToast('Mật khẩu không khớp', msg);
      return;
    }

    try {
      const result = await registerMutation.mutateAsync({
        fullName,
        phone,
        email,
        username,
        password,
      });

      if (!result.success) {
        console.error('[Register failed detail]:', result.message);
        const msg = 'Đăng ký thất bại. Vui lòng thử lại.';
        setInlineError(msg);
        showErrorToast('Đăng ký thất bại');
        return;
      }

      if (result.status === 201 || result.status === 200) {
        setSuccessMessage('Tạo tài khoản thành công. Vui lòng nhập mã OTP.');
        setSuccessVisible(true);
      }
    } catch {
      showErrorToast('Có lỗi xảy ra', 'Vui lòng thử lại');
    }
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
            paddingBottom: isShortScreen ? 28 : 40,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            className="w-full self-center px-5"
            style={{
              paddingTop: isShortScreen ? 16 : 24,
              paddingBottom: isShortScreen ? 8 : 16,
            }}
          >
            <View className="mb-6">
              <View className="flex-row items-center">
                <TouchableOpacity
                  className="h-10 w-10 items-center justify-center rounded-full"
                  onPress={() => router.back()}
                >
                  <Ionicons
                    name="chevron-back"
                    size={20}
                    color={colors.textPrimary}
                  />
                </TouchableOpacity>
                <Text
                  className="ml-2 text-2xl font-bold"
                  style={{ color: colors.textPrimary }}
                >
                  Đăng ký
                </Text>
              </View>
              <Text
                className="ml-12 mt-1 text-sm"
                style={{ color: colors.textSecondary }}
              >
                Tạo tài khoản để sử dụng ứng dụng.
              </Text>
            </View>

            <View className="rounded-xl" style={{ backgroundColor: colors.bg }}>
              <View className="mb-3">
                <Text
                  className="mb-2 text-sm font-semibold"
                  style={{ color: colors.textPrimary }}
                >
                  Họ và tên
                </Text>
                <View
                  className="flex-row items-center px-3"
                  style={{
                    height: fieldHeight,
                    borderRadius: fieldRadius,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Ionicons
                    name="person-outline"
                    size={fieldIconSize}
                    color={colors.textSecondary}
                  />
                  <TextInput
                    className="ml-2 flex-1"
                    style={{
                      color: colors.textPrimary,
                      fontSize: fieldFontSize,
                    }}
                    placeholder="Nguyễn Văn A"
                    placeholderTextColor={colors.textDisabled}
                    value={fullName}
                    onChangeText={setFullName}
                    editable={!loading}
                  />
                </View>
              </View>

              <View className="mb-3">
                <Text
                  className="mb-2 text-sm font-semibold"
                  style={{ color: colors.textPrimary }}
                >
                  Tên tài khoản
                </Text>
                <View
                  className="flex-row items-center px-3"
                  style={{
                    height: fieldHeight,
                    borderRadius: fieldRadius,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Ionicons
                    name="person-outline"
                    size={fieldIconSize}
                    color={colors.textSecondary}
                  />
                  <TextInput
                    className="ml-2 flex-1"
                    style={{
                      color: colors.textPrimary,
                      fontSize: fieldFontSize,
                    }}
                    placeholder="Nhập tên tài khoản"
                    placeholderTextColor={colors.textDisabled}
                    value={username}
                    onChangeText={setUsername}
                    editable={!loading}
                  />
                </View>
              </View>

              <View className="mb-3">
                <Text
                  className="mb-2 text-sm font-semibold"
                  style={{ color: colors.textPrimary }}
                >
                  Số điện thoại
                </Text>
                <View
                  className="flex-row items-center px-3"
                  style={{
                    height: fieldHeight,
                    borderRadius: fieldRadius,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Ionicons
                    name="call-outline"
                    size={fieldIconSize}
                    color={colors.textSecondary}
                  />
                  <TextInput
                    className="ml-2 flex-1"
                    style={{
                      color: colors.textPrimary,
                      fontSize: fieldFontSize,
                    }}
                    placeholder="09xx xxx xxx"
                    placeholderTextColor={colors.textDisabled}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    editable={!loading}
                  />
                </View>
              </View>

              <View className="mb-3">
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
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    editable={!loading}
                  />
                </View>
              </View>

              <View className="mb-3">
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
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
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

              <View>
                <Text
                  className="mb-2 text-sm font-semibold"
                  style={{ color: colors.textPrimary }}
                >
                  Xác nhận mật khẩu
                </Text>
                <View
                  className="flex-row items-center px-3"
                  style={{
                    height: fieldHeight,
                    borderRadius: fieldRadius,
                    borderWidth: 1,
                    borderColor: colors.border,
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
                    placeholder="Nhập lại mật khẩu"
                    placeholderTextColor={colors.textDisabled}
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword((prev) => !prev)}
                    disabled={loading}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? 'eye-off-outline' : 'eye-outline'
                      }
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
                className="mt-5 h-12 items-center justify-center rounded-xl"
                onPress={handleRegister}
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
                    Đăng ký
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View className="mt-8 items-center">
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                Đã có tài khoản?
              </Text>
              <Text
                className="mt-1 font-bold"
                style={{ color: colors.primary }}
                onPress={() => router.replace('/login')}
              >
                Đăng nhập
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AppDialog
        visible={successVisible}
        title="Thành công"
        message={successMessage}
        type="success"
        confirmLabel="Nhập OTP"
        showCancel={false}
        onCancel={() => setSuccessVisible(false)}
        onConfirm={() => {
          setSuccessVisible(false);
          router.replace({
            pathname: '/otp-verification',
            params: { email: email.trim() },
          });
        }}
      />
    </SafeAreaView>
  );
}
