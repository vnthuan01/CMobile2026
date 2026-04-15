import '@/global.css';
import { AppDialog } from '@/src/components/common/AppDialog';
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
  const fieldRadius = 16;
  const fieldFontSize = isShortScreen ? 15 : 16;
  const fieldIconSize = isShortScreen ? 18 : 20;

  const dangerRed = '#E52521';
  const neutralLine = '#E6E6E6';

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
            paddingBottom: isShortScreen ? 28 : 40,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            className="w-full self-center px-5"
            style={{
              paddingTop: isShortScreen ? 8 : 14,
              paddingBottom: isShortScreen ? 8 : 16,
            }}
          >
            <View className="mb-6">
              <View className="flex-row items-center">
                <TouchableOpacity
                  className="h-10 w-10 items-center justify-center rounded-full"
                  onPress={() => router.back()}
                >
                  <Ionicons name="chevron-back" size={20} color="#1F2937" />
                </TouchableOpacity>
                <Text
                  className="ml-2 text-2xl font-bold"
                  style={{ color: '#1F2937' }}
                >
                  Đăng kí tài khoản
                </Text>
              </View>
            </View>

            <View className="rounded-xl" style={{ backgroundColor: '#FFFFFF' }}>
              <View className="mb-3">
                <Text
                  className="mb-2 text-sm font-semibold"
                  style={{ color: '#111827' }}
                >
                  Họ và tên
                </Text>
                <View
                  className="flex-row items-center px-3"
                  style={{
                    height: fieldHeight,
                    borderRadius: fieldRadius,
                    borderWidth: 1,
                    borderColor: neutralLine,
                    backgroundColor: '#F9F9F9',
                  }}
                >
                  <TextInput
                    className="flex-1"
                    style={{
                      color: '#111827',
                      fontSize: fieldFontSize,
                    }}
                    placeholder="Nguyễn Văn A"
                    placeholderTextColor="#9CA3AF"
                    value={fullName}
                    onChangeText={setFullName}
                    editable={!loading}
                  />
                </View>
              </View>

              <View className="mb-3">
                <Text
                  className="mb-2 text-sm font-semibold"
                  style={{ color: '#111827' }}
                >
                  Tên tài khoản
                </Text>
                <View
                  className="flex-row items-center px-3"
                  style={{
                    height: fieldHeight,
                    borderRadius: fieldRadius,
                    borderWidth: 1,
                    borderColor: neutralLine,
                    backgroundColor: '#F9F9F9',
                  }}
                >
                  <TextInput
                    className="flex-1"
                    style={{
                      color: '#111827',
                      fontSize: fieldFontSize,
                    }}
                    placeholder="Nhập tên tài khoản"
                    placeholderTextColor="#9CA3AF"
                    value={username}
                    onChangeText={setUsername}
                    editable={!loading}
                  />
                </View>
              </View>

              <View className="mb-3">
                <Text
                  className="mb-2 text-sm font-semibold"
                  style={{ color: '#111827' }}
                >
                  Số điện thoại
                </Text>
                <View
                  className="flex-row items-center px-3"
                  style={{
                    height: fieldHeight,
                    borderRadius: fieldRadius,
                    borderWidth: 1,
                    borderColor: neutralLine,
                    backgroundColor: '#F9F9F9',
                  }}
                >
                  <TextInput
                    className="flex-1"
                    style={{
                      color: '#111827',
                      fontSize: fieldFontSize,
                    }}
                    placeholder="09xx xxx xxx"
                    placeholderTextColor="#9CA3AF"
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
                  style={{ color: '#111827' }}
                >
                  Email
                </Text>
                <View
                  className="flex-row items-center px-3"
                  style={{
                    height: fieldHeight,
                    borderRadius: fieldRadius,
                    borderWidth: 1,
                    borderColor: neutralLine,
                    backgroundColor: '#F9F9F9',
                  }}
                >
                  <TextInput
                    className="flex-1"
                    style={{
                      color: '#111827',
                      fontSize: fieldFontSize,
                    }}
                    placeholder="example@email.com"
                    placeholderTextColor="#9CA3AF"
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
                    backgroundColor: '#F9F9F9',
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
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View>
                <Text
                  className="mb-2 text-sm font-semibold"
                  style={{ color: '#111827' }}
                >
                  Xác nhận mật khẩu
                </Text>
                <View
                  className="flex-row items-center px-3"
                  style={{
                    height: fieldHeight,
                    borderRadius: fieldRadius,
                    borderWidth: 1,
                    borderColor: neutralLine,
                    backgroundColor: '#F9F9F9',
                  }}
                >
                  <TextInput
                    className="flex-1"
                    style={{
                      color: '#111827',
                      fontSize: fieldFontSize,
                    }}
                    placeholder="Nhập lại mật khẩu"
                    placeholderTextColor="#9CA3AF"
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
                className="mt-5 h-12 items-center justify-center rounded-xl"
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.85}
                style={{
                  borderRadius: 14,
                  backgroundColor: loading ? '#F4A9A6' : dangerRed,
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
              <Text className="text-sm" style={{ color: '#6B7280' }}>
                Đã có tài khoản?
              </Text>
              <Text
                className="mt-1 font-bold"
                style={{ color: dangerRed }}
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
