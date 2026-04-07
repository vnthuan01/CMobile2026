import '@/global.css';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import { useTheme } from '@/src/context/ThemeContext';
import { useUserProfile } from '@/src/hooks/useUserProfile';
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
  const { data, isLoading } = useUserProfile(true);

  const profile = data?.profile;

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
          <View
            className="overflow-hidden rounded-2xl border"
            style={{ borderColor: colors.border, backgroundColor: colors.card }}
          >
            <InfoRow icon="mail" value={profile?.email} />
            <InfoRow icon="call" value={profile?.phoneNumber} />
            <InfoRow icon="calendar" value={formatDate(profile?.dateOfBirth)} />
            <InfoRow
              icon="male-female"
              value={mapGender(profile?.gender)}
              isLast
            />
          </View>

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

function InfoRow({
  icon,
  value,
  isLast = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value?: string | null;
  isLast?: boolean;
}) {
  const { colors } = useTheme();

  return (
    <View
      className="flex-row items-center gap-3 px-4 py-4"
      style={{
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <View
        className="h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: colors.surface }}
      >
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <Text
        className="flex-1 text-base font-semibold"
        style={{ color: colors.text }}
      >
        {value || 'Chưa cập nhật'}
      </Text>
    </View>
  );
}
