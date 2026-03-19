import '@/global.css';
import { authService } from '@/src/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

export default function RegisterScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (
      !fullName.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !username.trim() ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);

    try {
      // TODO: gọi API register
      const result = await authService.register({
        fullName,
        phone,
        email,
        username,
        password,
      });

      if (!result.success) {
        Alert.alert('Lỗi', result.message);
        return;
      }

      if (result.status == 201 || result.status == 200) {
        router.replace({
          pathname: '/otp-verification',
          params: { email: email.trim() },
        });
      }
    } catch {
      Alert.alert('Lỗi', 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background-light"
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
              <Ionicons name="chevron-back" size={22} color="#0f172a" />
            </TouchableOpacity>
            <Text className="flex-1 pr-12 text-center text-lg font-bold text-text-primary">
              Đăng kí tài khoản{' '}
            </Text>
            <TouchableOpacity className="flex-row items-center gap-1 rounded-full bg-red-50 px-3 py-1.5">
              <Ionicons name="alert-circle" size={18} color="#dc2626" />
              <Text className="text-sm font-bold text-red-600">SOS</Text>
            </TouchableOpacity>
          </View>

          {/* Headline */}
          <View className="mb-8">
            <Text className="mb-2 text-[32px] font-bold text-text-primary">
              Tạo tài khoản để trải nghiệm ứng dụng.
            </Text>
            <Text className="text-base text-text-secondary">
              Nhập thông tin để kết nối với cứu trợ.
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-5">
            {/* Full Name */}
            <View>
              <Text className="mb-2 text-base font-medium text-text-primary">
                Họ và tên
              </Text>
              <TextInput
                className="h-14 rounded-lg border border-surface-dark bg-white px-4 text-base text-text-primary"
                placeholder="Nguyễn Văn A"
                placeholderTextColor="#9CA3AF"
                value={fullName}
                onChangeText={setFullName}
                editable={!loading}
              />
            </View>

            {/* UserName */}
            <View>
              <Text className="mb-2 text-base font-medium text-text-primary">
                Tên tài khoản
              </Text>
              <TextInput
                className="h-14 rounded-lg border border-surface-dark bg-white px-4 text-base text-text-primary"
                placeholder="Nhâp tên tài khoản"
                placeholderTextColor="#9CA3AF"
                value={username}
                onChangeText={setUsername}
                editable={!loading}
              />
            </View>

            {/* Phone */}
            <View>
              <Text className="mb-2 text-base font-medium text-text-primary">
                Số điện thoại
              </Text>
              <TextInput
                className="h-14 rounded-lg border border-surface-dark bg-white px-4 text-base text-text-primary"
                placeholder="09xx xxx xxx"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                editable={!loading}
              />
            </View>

            {/* Email */}
            <View>
              <Text className="mb-2 text-base font-medium text-text-primary">
                Email
              </Text>
              <TextInput
                className="h-14 rounded-lg border border-surface-dark bg-white px-4 text-base text-text-primary"
                placeholder="example@email.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />
            </View>

            {/* Password */}
            <View>
              <Text className="mb-2 text-base font-medium text-text-primary">
                Mật khẩu
              </Text>
              <View className="relative">
                <TextInput
                  className="h-14 rounded-lg border border-surface-dark bg-white px-4 pr-12 text-base text-text-primary"
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  className="absolute right-4 top-[18px]"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View>
              <Text className="mb-2 text-base font-medium text-text-primary">
                Xác nhận mật khẩu
              </Text>
              <View className="relative">
                <TextInput
                  className="h-14 rounded-lg border border-surface-dark bg-white px-4 pr-12 text-base text-text-primary"
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  className="absolute right-4 top-[18px]"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text>{showConfirmPassword ? '🙈' : '👁️'}</Text>
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
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-[17px] font-bold text-white">
                  Đăng ký
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="mt-10 items-center">
            <Text className="text-base text-text-secondary">
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
  );
}
