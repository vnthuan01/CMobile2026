import { useTheme } from '@/src/context/ThemeContext';
import { useCitizenProfile } from '@/src/hooks/useCitizenProfile';
import { useAuthStore } from '@/src/store/authStore';
import { showErrorToast } from '@/src/utils/toast';
import {
    resolveAvatarUrl,
    resolveDisplayName,
} from '@/src/utils/userPresentation';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
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
      | '/profile/requests'
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
  const user = useAuthStore((s) => s.user);
  const profileQuery = useCitizenProfile();
  const profile = profileQuery.data?.profile ?? null;
  const loading = profileQuery.isLoading;
  const headerRed = '#E52521';
  const iconRed = '#D73A34';
  const roleLabel =
    (user?.role ?? '').toLowerCase() === 'user' ? 'Người dân' : 'Người dùng';
  const displayName = resolveDisplayName({
    profileDisplayName: profile?.displayName,
    authUserName: user?.user_name,
    email: user?.email,
  });
  const avatarUrl = resolveAvatarUrl({
    profilePictureUrl: profile?.pictureUrl,
    authPictureUrl: null,
  });

  useEffect(() => {
    if (profileQuery.data?.errorMessage) {
      showErrorToast('Không tải được hồ sơ', profileQuery.data.errorMessage);
    }
  }, [profileQuery.data?.errorMessage]);

  const formatDate = (date?: string | null) => {
    if (!date) return 'Chưa cập nhật';
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return date;
    return d.toLocaleDateString('vi-VN');
  };

  const mapGender = (gender?: string | null) => {
    if (!gender) return 'Chưa cập nhật';
    const g = gender.toLowerCase();
    if (g === 'male') return 'Nam';
    if (g === 'female') return 'Nữ';
    return gender;
  };

  const InfoRow = ({
    icon,
    label,
    value,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value?: string | null;
  }) => (
    <View
      className="flex-row items-center gap-3 border-b px-4 py-4"
      style={{ borderBottomColor: colors.border }}
    >
      <View
        className="h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: colors.surface }}
      >
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-xs" style={{ color: colors.textSecondary }}>
          {label}
        </Text>
        <Text
          className="mt-1 text-base font-semibold"
          style={{ color: colors.text }}
        >
          {value || 'Chưa cập nhật'}
        </Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View
        className="px-4 pb-10"
        style={{ backgroundColor: headerRed, paddingTop: top + 8 }}
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
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              className="h-24 w-24 rounded-full"
            />
          ) : (
            <View
              className="h-24 w-24 items-center justify-center rounded-full"
              style={{ backgroundColor: '#FFFFFF3D' }}
            >
              <Ionicons name="person" size={42} color={colors.white} />
            </View>
          )}
          <Text
            className="mt-3 text-xl font-bold"
            style={{ color: colors.white }}
          >
            {displayName}
          </Text>

          <View className="mt-3 flex-row flex-wrap items-center justify-center gap-2">
            <View
              className="rounded-full px-3 py-1"
              style={{ backgroundColor: '#FFFFFF3D' }}
            >
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
          style={{ borderColor: '#EFEFF0', backgroundColor: '#FFFFFF' }}
        >
          <TouchableOpacity
            onPress={() => onNavigate?.('/profile/user-profile')}
            className="flex-row items-center justify-between border-b px-4 py-4"
            style={{ borderBottomColor: '#EFEFF0' }}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons
                name="person-circle-outline"
                size={20}
                color={iconRed}
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
            onPress={() => onNavigate?.('/profile/my-volunteer-profile')}
            className="flex-row items-center justify-between border-b px-4 py-4"
            style={{ borderBottomColor: '#EFEFF0' }}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name="heart-outline" size={20} color={iconRed} />
              <View>
                <Text
                  className="text-base font-medium"
                  style={{ color: colors.text }}
                >
                  Hồ sơ tình nguyện viên
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
            style={{ borderBottomColor: '#EFEFF0' }}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name="lock-closed-outline" size={20} color={iconRed} />
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
            style={{ borderBottomColor: '#EFEFF0' }}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name="settings-outline" size={20} color={iconRed} />
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
              <Ionicons name="help-circle-outline" size={20} color={iconRed} />
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
            borderColor: '#F2B8B5',
            backgroundColor: '#FFFFFF',
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={headerRed} />
          <Text className="font-bold" style={{ color: headerRed }}>
            Đăng xuất
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
