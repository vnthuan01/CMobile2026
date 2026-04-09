import '@/global.css';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import { useTheme } from '@/src/context/ThemeContext';
import { useUserProfile } from '@/src/hooks/useUserProfile';
import { useAuthStore } from '@/src/store/authStore';
import { resolveDisplayName } from '@/src/utils/userPresentation';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface UserProfileViewScreenProps {
  onBack?: () => void;
  onEdit?: () => void;
}

export default function UserProfileViewScreen({
  onBack,
  onEdit,
}: UserProfileViewScreenProps) {
  const { bottom } = useSafeAreaInsets();
  const { colors } = useTheme();
  const authUser = useAuthStore((state) => state.user);
  const { data, isLoading } = useUserProfile(true);

  const profile = data?.profile;
  const displayName = resolveDisplayName({
    profileDisplayName: profile?.displayName,
    authUserName: authUser?.user_name,
    email: profile?.email ?? authUser?.email,
  });

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
        contentContainerStyle={{ paddingBottom: bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 pt-4">
          <ProfileInfoCard
            icon="person"
            label="Họ và tên"
            value={displayName}
          />
          <ProfileInfoCard icon="mail" label="Email" value={profile?.email} />
          <ProfileInfoCard
            icon="call"
            label="Số điện thoại"
            value={profile?.phoneNumber}
          />
          <ProfileInfoCard
            icon="calendar"
            label="Ngày sinh"
            value={formatDate(profile?.dateOfBirth)}
          />
          <ProfileInfoCard
            icon="male-female"
            label="Giới tính"
            value={mapGender(profile?.gender)}
          />
          <ProfileInfoCard
            icon="location"
            label="Địa chỉ"
            value={profile?.address}
          />

          <TouchableOpacity
            onPress={onEdit}
            className="mt-4 h-12 items-center justify-center rounded-xl"
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
      </ScrollView>
    </View>
  );
}

function ProfileInfoCard({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string | null;
}) {
  const { colors } = useTheme();

  return (
    <View
      className="mb-3 flex-row items-center gap-3 rounded-2xl border px-4 py-4"
      style={{ borderColor: colors.border, backgroundColor: colors.card }}
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
}
