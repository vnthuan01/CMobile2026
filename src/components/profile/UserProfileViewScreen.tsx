import '@/global.css';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import { useTheme } from '@/src/context/ThemeContext';
import { useBottomContentInset } from '@/src/hooks/useBottomContentInset';
import { useUserProfile } from '@/src/hooks/useUserProfile';
import { useAuthStore } from '@/src/store/authStore';
import {
    resolveAvatarUrl,
    resolveDisplayName,
} from '@/src/utils/userPresentation';
import { Ionicons } from '@expo/vector-icons';
import { type ReactNode, useMemo } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface UserProfileViewScreenProps {
  onBack?: () => void;
  onEdit?: () => void;
}

export default function UserProfileViewScreen({
  onBack,
  onEdit,
}: UserProfileViewScreenProps) {
  const bottomInset = useBottomContentInset(24);
  const { colors } = useTheme();
  const authUser = useAuthStore((state) => state.user);
  const { data, isLoading } = useUserProfile(true);

  const profile = data?.profile;
  const displayName = resolveDisplayName({
    profileDisplayName: profile?.displayName,
    authUserName: authUser?.user_name,
    email: profile?.email ?? authUser?.email,
  });
  const avatarUrl = resolveAvatarUrl({
    profilePictureUrl: profile?.pictureUrl,
    authPictureUrl: null,
  });

  const initial = useMemo(() => {
    const normalized = displayName?.trim();
    if (!normalized) return 'U';
    return normalized.charAt(0).toUpperCase();
  }, [displayName]);

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

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenHeader title="Hồ sơ người dùng" onBack={onBack} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: bottomInset }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 pt-4">
          <View
            className="rounded-[28px] border p-5"
            style={{
              borderColor: `${colors.primary}20`,
              backgroundColor: `${colors.primary}10`,
            }}
          >
            <View className="flex-row items-center gap-4">
              <View
                className="h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2"
                style={{
                  backgroundColor: colors.primary,
                  borderColor: colors.card,
                }}
              >
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Text
                    className="text-2xl font-extrabold"
                    style={{ color: colors.white }}
                  >
                    {initial}
                  </Text>
                )}
              </View>

              <View className="flex-1">
                <Text
                  className="text-[22px] font-extrabold"
                  style={{ color: colors.text }}
                >
                  {displayName}
                </Text>
                <Text
                  className="mt-1 text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  {profile?.email || authUser?.email || 'Chưa cập nhật email'}
                </Text>
                <Text
                  className="mt-1 text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  {profile?.phoneNumber || 'Chưa cập nhật số điện thoại'}
                </Text>
              </View>
            </View>

            <View className="mt-4 flex-row flex-wrap gap-2">
              <MetaChip
                icon="male-female-outline"
                label={mapGender(profile?.gender)}
              />
              <MetaChip
                icon="calendar-outline"
                label={formatDate(profile?.dateOfBirth)}
              />
            </View>

            <TouchableOpacity
              onPress={onEdit}
              className="mt-5 h-12 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: colors.primary,
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              <Text className="text-base font-bold text-white">
                Cập nhật hồ sơ
              </Text>
            </TouchableOpacity>
          </View>

          <ProfileSection title="Thông tin cá nhân">
            <ProfileFieldRow
              icon="person-outline"
              label="Họ và tên"
              value={displayName}
            />
            <View className="mt-3 flex-row gap-3">
              <ProfileFieldCell
                icon="male-female-outline"
                label="Giới tính"
                value={mapGender(profile?.gender)}
              />
              <ProfileFieldCell
                icon="calendar-outline"
                label="Ngày sinh"
                value={formatDate(profile?.dateOfBirth)}
              />
            </View>
          </ProfileSection>

          <ProfileSection title="Liên hệ">
            <View className="gap-3">
              <ProfileFieldRow
                icon="mail-outline"
                label="Email"
                value={profile?.email || authUser?.email || 'Chưa cập nhật'}
                multiline
              />
              <ProfileFieldRow
                icon="call-outline"
                label="Số điện thoại"
                value={profile?.phoneNumber || 'Chưa cập nhật'}
              />
            </View>
          </ProfileSection>

          <ProfileSection title="Địa chỉ">
            <ProfileFieldRow
              icon="location-outline"
              label="Nơi ở hiện tại"
              value={profile?.address || 'Chưa cập nhật'}
              multiline
            />
          </ProfileSection>
        </View>
      </ScrollView>
    </View>
  );
}

function ProfileSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const { colors } = useTheme();

  return (
    <View
      className="mt-5 rounded-[24px] border p-4"
      style={{ borderColor: colors.border, backgroundColor: colors.card }}
    >
      <Text
        className="text-sm font-bold uppercase tracking-wide"
        style={{ color: colors.textSecondary }}
      >
        {title}
      </Text>
      <View className="mt-3">{children}</View>
    </View>
  );
}

function MetaChip({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  const { colors } = useTheme();

  return (
    <View
      className="flex-row items-center gap-2 rounded-full px-3 py-2"
      style={{ backgroundColor: colors.card }}
    >
      <Ionicons name={icon} size={14} color={colors.primary} />
      <Text className="text-xs font-semibold" style={{ color: colors.text }}>
        {label}
      </Text>
    </View>
  );
}

function ProfileFieldRow({
  icon,
  label,
  value,
  multiline = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  multiline?: boolean;
}) {
  const { colors } = useTheme();

  return (
    <View
      className="flex-row items-start gap-3 rounded-2xl p-4"
      style={{ backgroundColor: colors.surface }}
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: colors.card }}
      >
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View className="flex-1">
        <Text
          className="text-xs font-semibold uppercase"
          style={{ color: colors.textSecondary }}
        >
          {label}
        </Text>
        <Text
          className="mt-1 text-base font-semibold"
          style={{ color: colors.text }}
          numberOfLines={multiline ? undefined : 2}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function ProfileFieldCell({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  const { colors } = useTheme();

  return (
    <View
      className="flex-1 rounded-2xl p-4"
      style={{ backgroundColor: colors.surface }}
    >
      <View className="flex-row items-center gap-2">
        <Ionicons name={icon} size={16} color={colors.primary} />
        <Text
          className="text-xs font-semibold uppercase"
          style={{ color: colors.textSecondary }}
        >
          {label}
        </Text>
      </View>
      <Text
        className="mt-3 text-sm font-semibold"
        style={{ color: colors.text }}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}
