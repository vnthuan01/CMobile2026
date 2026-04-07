import { useTheme } from '@/src/context/ThemeContext';
import { useUserProfile } from '@/src/hooks/useUserProfile';
import { useAuthStore } from '@/src/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CitizenProfileProps {
  onBack?: () => void;
  onLogout?: () => void;
  onNavigate?: (
    screen:
      | '/profile/user-profile'
      | '/profile/my-volunteer-profile'
      | '/profile/change-password'
      | '/profile/settings'
      | '/profile/help',
  ) => void;
}

export default function CitizenProfile({
  onBack,
  onLogout,
  onNavigate,
}: CitizenProfileProps) {
  const { top, bottom } = useSafeAreaInsets();
  const { colors } = useTheme();
  const authRole = useAuthStore((state) => state.user?.role ?? '');
  const { data } = useUserProfile(true);
  const profile = data?.profile;

  const roleLabel =
    authRole.toLowerCase() === 'volunteer' ? 'Tình nguyện viên' : 'Người dân';

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View
        className="px-4 pb-10"
        style={{ backgroundColor: colors.primary, paddingTop: top + 8 }}
      >
        <View className="mb-4 flex-row items-center justify-between">
          <View className="w-10">
            {onBack ? (
              <TouchableOpacity
                onPress={onBack}
                className="h-10 w-10 items-center justify-center rounded-full"
              >
                <Ionicons name="chevron-back" size={22} color={colors.white} />
              </TouchableOpacity>
            ) : null}
          </View>
          <Text className="text-lg font-bold" style={{ color: colors.white }}>
            Hồ sơ người dùng
          </Text>
          <View className="w-10" />
        </View>

        <View className="items-center">
          {profile?.pictureUrl ? (
            <Image
              source={{ uri: profile.pictureUrl }}
              className="h-24 w-24 rounded-full"
            />
          ) : (
            <View className="h-24 w-24 items-center justify-center rounded-full bg-white/20">
              <Ionicons name="person" size={42} color={colors.white} />
            </View>
          )}
          <Text
            className="mt-3 text-xl font-bold"
            style={{ color: colors.white }}
          >
            {profile?.displayName || 'Người dùng'}
          </Text>

          <View className="mt-3 flex-row flex-wrap items-center justify-center gap-2">
            <View className="rounded-full bg-white/20 px-3 py-1">
              <Text className="text-xs font-bold text-white">{roleLabel}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-2"
        contentContainerStyle={{ paddingBottom: bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="mt-4 overflow-hidden rounded-2xl border"
          style={{ borderColor: colors.border, backgroundColor: colors.card }}
        >
          <TouchableOpacity
            onPress={() => onNavigate?.('/profile/user-profile')}
            className="flex-row items-center justify-between border-b px-4 py-4"
            style={{ borderBottomColor: colors.border }}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons
                name="person-circle-outline"
                size={20}
                color={colors.primary}
              />
              <View>
                <Text
                  className="text-base font-medium"
                  style={{ color: colors.text }}
                >
                  Hồ sơ người dùng
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onNavigate?.('/profile/change-password')}
            className="flex-row items-center justify-between border-b px-4 py-4"
            style={{ borderBottomColor: colors.border }}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.primary}
              />
              <Text
                className="text-base font-medium"
                style={{ color: colors.text }}
              >
                Đổi mật khẩu
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onNavigate?.('/profile/settings')}
            className="flex-row items-center justify-between border-b px-4 py-4"
            style={{ borderBottomColor: colors.border }}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons
                name="settings-outline"
                size={20}
                color={colors.primary}
              />
              <Text
                className="text-base font-medium"
                style={{ color: colors.text }}
              >
                Cài đặt
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onNavigate?.('/profile/help')}
            className="flex-row items-center justify-between px-4 py-4"
          >
            <View className="flex-row items-center gap-3">
              <Ionicons
                name="help-circle-outline"
                size={20}
                color={colors.primary}
              />
              <Text
                className="text-base font-medium"
                style={{ color: colors.text }}
              >
                Trợ giúp
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={onLogout}
          className="mt-4 flex-row items-center justify-center gap-2 rounded-xl border py-4"
          style={{
            borderColor: `${colors.status.error}44`,
            backgroundColor: colors.card,
          }}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color={colors.status.error}
          />
          <Text className="font-bold" style={{ color: colors.status.error }}>
            Đăng xuất
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
