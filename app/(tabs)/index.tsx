import '@/global.css';
import UserHomeContent from '@/src/components/home/UserHomeContent';
import VolunteerHomeContent from '@/src/components/home/VolunteerHomeContent';
import { useTheme } from '@/src/context/ThemeContext';
import { useAuthStore } from '@/src/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    Image,
    ImageBackground,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function IndexScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const role = (user?.role ?? '').toLowerCase();
  const isVolunteer = role === 'volunteer';

  const { colors, isDark } = useTheme();

  const STICKY_HEIGHT = 88; // chiều cao khu SOS
  const iconWrapperBg = isDark ? 'bg-gray-700' : 'bg-gray-100'; // Keep or refactor to style if specific color needed

  const avatarSource = require('@/src/assets/images/Anh-avatar-nam-dep.jpeg');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const flashAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 700,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Flash icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 0.4,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <View
      className="relative flex-1 justify-center"
      style={{ backgroundColor: colors.background }}
    >
      {/* ===== CONTENT ===== */}
      <ScrollView
        style={{ paddingTop: top }}
        contentContainerStyle={{ paddingBottom: bottom + STICKY_HEIGHT }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="bg-transparent px-4 py-6 shadow-sm">
          <View className="flex-row items-center justify-between">
            {/* Avatar + Text */}
            <View className="flex-row items-center gap-3">
              <Image
                source={avatarSource}
                className="rounded-full"
                resizeMode="cover"
                style={{ width: 48, height: 48 }}
              />

              <View>
                <Text
                  className="text-lg font-bold"
                  style={{ color: colors.text }}
                >
                  Xin chào, {user?.user_name}
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  {isVolunteer ? 'Tình nguyện viên' : 'Người dùng'}
                </Text>
              </View>
            </View>

            {/* Icon */}
            <TouchableOpacity
              className={`h-10 w-10 items-center justify-center rounded-full ${iconWrapperBg}`}
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color={isDark ? '#fff' : '#111418'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Map */}
        <View className="mb-4 px-4">
          <View
            className={`h-48 items-center justify-center overflow-hidden rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}
          >
            <Ionicons name="map" size={48} color="#6b7280" />
            <Text className="mt-2 text-sm text-gray-500">
              Bản đồ khu vực cứu trợ
            </Text>
          </View>
        </View>

        {/* Featured Card */}
        {!isVolunteer && (
          <View className="px-4">
            <TouchableOpacity
              activeOpacity={0.9}
              className="flex-col overflow-hidden rounded-xl border shadow-sm"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
            >
              <ImageBackground
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADA3ptc33mj9-QnO5js6wAoZXkoUSE1R17u2KWXra7ld4GqZO2f8mzYWqTSzfDyEh-5-MUjBGTOecWmqk602YOJctr9Z_vRqQj53t46_OAEVjxx-mVNcjJyKXudNlKoG_XFIAa5z9oQnEpS_1U57h-rthlqgNarTuDzjVRKjqfFGbu1Fdn9cp8uOIWTF0RFaERy8fam04bvXFNEC2Q2Ojasy0dYAA1E9jZetQbSi3FWmlIMJlWJx9MsuTJlu40BRQcu8Y3b0TsbH0',
                }}
                className="h-40 w-full justify-end"
                resizeMode="cover"
              >
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  className="absolute inset-0"
                />
                <View className="p-4">
                  <View className="mb-1 self-start rounded bg-primary px-2 py-1">
                    <Text className="text-[10px] font-bold uppercase text-white">
                      Ưu tiên
                    </Text>
                  </View>
                  <Text className="text-xl font-bold leading-tight text-white">
                    Gửi yêu cầu cứu trợ
                  </Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          </View>
        )}

        {/* Role content */}
        {isVolunteer ? <VolunteerHomeContent /> : <UserHomeContent />}
      </ScrollView>

      {/* ===== STICKY SOS ===== */}
      <View
        style={{
          position: 'absolute',
          right: 10,
          bottom: 10, // tránh tab bar / home indicator
          zIndex: 100,
        }}
      >
        <Animated.View
          style={{
            transform: [{ scale: pulseAnim }],
          }}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            className="h-12 w-12 items-center justify-center rounded-full bg-red-600 shadow-lg"
          >
            {/* Icon flash */}
            <Animated.View style={{ opacity: flashAnim }}>
              <Ionicons name="warning" size={30} color="#ffdd00ff" />
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}
