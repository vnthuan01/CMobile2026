import '@/global.css';
import AppDialog from '@/src/components/common/AppDialog';
import { useRegister } from '@/src/hooks/useAuthActions';
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

export default function RegisterScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const registerMutation = useRegister();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Đăng ký thành công. Vui lòng xác thực OTP.');
  const loading = registerMutation.isPending;

  const handleRegister = async () => {
    if (
      !fullName.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !username.trim() ||
      !password ||
      !confirmPassword
    ) {
      showErrorToast('Thiếu thông tin', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (password !== confirmPassword) {
      showErrorToast('Mật khẩu không khớp', 'Mật khẩu xác nhận không khớp');
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
        showErrorToast('Đăng ký thất bại', result.message || 'Vui lòng thử lại.');
        return;
      }

      if (result.status === 201 || result.status === 200) {
        const message = result.message || 'Đăng ký thành công. Vui lòng xác thực OTP.';
        setSuccessMessage(message);
        showSuccessToast('Đăng ký thành công', message);
        setSuccessVisible(true);
      }
    } catch {
      showErrorToast('Có lỗi xảy ra', 'Vui lòng thử lại');
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
        <View className="w-full max-w-[420px] flex-1 self-center px-5 pb-8 pt-6">
          {/* Header */}
          <View className="mb-6 flex-row items-center justify-between">
            <TouchableOpacity
              className="h-12 w-12 items-center justify-center rounded-full"
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </TouchableOpacity>
            <Text
              className="flex-1 pr-12 text-center text-lg font-bold"
              style={{ color: colors.text }}
            >
              Đăng kí tài khoản{' '}
            </Text>
            <TouchableOpacity className="flex-row items-center gap-1 rounded-full px-3 py-1.5" style={{ backgroundColor: `${colors.status.error}18` }}>
              <Ionicons name="alert-circle" size={18} color={colors.status.error} />
              <Text className="text-sm font-bold" style={{ color: colors.status.error }}>SOS</Text>
            </TouchableOpacity>
          </View>

          {/* Headline */}
          <View className="mb-8">
            <Text
              className="mb-2 text-[32px] font-bold"
              style={{ color: colors.text }}
            >
              Tạo tài khoản để trải nghiệm ứng dụng.
            </Text>
            <Text className="text-base" style={{ color: colors.textSecondary }}>
              Nhập thông tin để kết nối với cứu trợ.
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-5">
            {/* Full Name */}
            <View>
              <Text
                className="mb-2 text-base font-medium"
                style={{ color: colors.text }}
              >
                Họ và tên
              </Text>
              <TextInput
                className="h-14 rounded-lg px-4 text-base"
                style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, color: colors.text }}
                placeholder="Nguyễn Văn A"
                placeholderTextColor={colors.textSecondary}
                value={fullName}
                onChangeText={setFullName}
                editable={!loading}
              />
            </View>

            {/* UserName */}
            <View>
              <Text
                className="mb-2 text-base font-medium"
                style={{ color: colors.text }}
              >
                Tên tài khoản
              </Text>
              <TextInput
                className="h-14 rounded-lg px-4 text-base"
                style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, color: colors.text }}
                placeholder="Nhâp tên tài khoản"
                placeholderTextColor={colors.textSecondary}
                value={username}
                onChangeText={setUsername}
                editable={!loading}
              />
            </View>

            {/* Phone */}
            <View>
              <Text
                className="mb-2 text-base font-medium"
                style={{ color: colors.text }}
              >
                Số điện thoại
              </Text>
              <TextInput
                className="h-14 rounded-lg px-4 text-base"
                style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, color: colors.text }}
                placeholder="09xx xxx xxx"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                editable={!loading}
              />
            </View>

            {/* Email */}
            <View>
              <Text
                className="mb-2 text-base font-medium"
                style={{ color: colors.text }}
              >
                Email
              </Text>
              <TextInput
                className="h-14 rounded-lg px-4 text-base"
                style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, color: colors.text }}
                placeholder="example@email.com"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
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
                  className="h-14 rounded-lg px-4 pr-12 text-base"
                  style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, color: colors.text }}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  className="absolute right-4 top-[18px]"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={{ color: colors.textSecondary }}>
                    {showPassword ? '🙈' : '👁️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View>
              <Text
                className="mb-2 text-base font-medium"
                style={{ color: colors.text }}
              >
                Xác nhận mật khẩu
              </Text>
              <View className="relative">
                <TextInput
                  className="h-14 rounded-lg px-4 pr-12 text-base"
                  style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, color: colors.text }}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  className="absolute right-4 top-[18px]"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text style={{ color: colors.textSecondary }}>
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit */}
            <TouchableOpacity
              className={`mt-4 h-14 items-center justify-center rounded-lg ${
                loading ? 'bg-primary/50' : 'bg-primary'
              }`}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text className="text-[17px] font-bold text-white">
                  Đăng ký
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="mt-10 items-center">
            <Text className="text-base" style={{ color: colors.textSecondary }}>
              Đã có tài khoản?
              <Text
                className="font-bold text-primary"
                onPress={() => router.replace('/login')}
              >
                {' '}
                Đăng nhập
              </Text>
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
        cancelLabel="Ở lại"
        confirmLabel="Nhập OTP"
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
