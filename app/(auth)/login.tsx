import '@/global.css';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { authService } from '../../src/services/authService';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng nhập đầy đủ email và mật khẩu',
      });
      return;
    }

    setLoading(true);

    try {
      const result = await authService.login({
        email: email.trim(),
        password: password.trim(),
      });

      if (result.success) {
        Alert.alert('Thành công', result.message || 'Đăng nhập thành công', [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: result.message || 'Đăng nhập thất bại',
        });
      }
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Có lỗi xảy ra, vui lòng thử lại',
      });
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
        <View className="w-full max-w-[420px] flex-1 self-center px-6 pb-8 pt-10">
          {/* Header */}
          <View className="mb-10 items-center">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-primary">
              <Ionicons name="shield-checkmark" size={40} color="#ffffff" />
            </View>
            <View className="absolute right-0 top-0">
              <TouchableOpacity
                onPress={() => router.push('/donate')}
                className="h-14 flex-row items-center rounded-full border border-surface-dark bg-white px-3"
                style={{
                  shadowColor: '#ff4a4aff',
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
                    color="#DA251D"
                    className="mt-1"
                  />
                </Animated.View>

                {/* Label che border */}
                <View className="bg-white px-1">
                  <Text className="text-sm font-bold text-[#DA251D]">
                    Donation
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/hotline')}
              className="flex-row items-center gap-1 rounded-full bg-red-50 px-3 py-1.5"
            >
              <Ionicons name="alert-circle" size={18} color="#dc2626" />
              <Text className="text-sm font-bold text-red-600">
                Cần hỗ trợ ngay lập tức!
              </Text>
            </TouchableOpacity>

            <Text className="text-[32px] font-bold text-text-primary">
              Đăng nhập
            </Text>
            <Text className="mt-2 text-center text-base text-text-secondary">
              Kết nối để nhận hỗ trợ khẩn cấp và cập nhật tình hình thiên tai.
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-5">
            {/* Email / Phone */}
            <View>
              <Text className="mb-2 text-base font-medium text-text-primary">
                Email hoặc số điện thoại
              </Text>
              <TextInput
                className="h-14 rounded-xl border border-surface-dark bg-surface px-4 text-base text-text-primary"
                placeholder="Nhập email hoặc số điện thoại"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
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
                  className="h-14 rounded-xl border border-surface-dark bg-surface px-4 pr-12 text-base text-text-primary"
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor="#9CA3AF"
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
                  <Text className="text-lg text-text-secondary">
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
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-base font-bold text-white">
                  Đăng nhập
                </Text>
              )}
            </TouchableOpacity>

            {/* Biometric */}
            <View className="mt-6 items-center">
              <View className="mb-4 flex-row items-center gap-3">
                <View className="h-px flex-1 bg-surface-dark" />
                <Text className="text-sm text-text-secondary">
                  Hoặc đăng nhập bằng
                </Text>
                <View className="h-px flex-1 bg-surface-dark" />
              </View>

              <TouchableOpacity className="h-14 w-14 items-center justify-center rounded-full border border-surface-dark bg-white">
                <Ionicons
                  name="lock-closed-outline"
                  size={26}
                  color="#111827"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}

          <Pressable
            className="mt-10 items-center"
            onPress={() => router.push('/register')}
          >
            <Text className="text-sm text-text-secondary">
              Chưa có tài khoản?
            </Text>
            <Text className="font-bold text-primary">Đăng ký ngay</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
