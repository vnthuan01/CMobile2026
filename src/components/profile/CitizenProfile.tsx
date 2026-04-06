import { Colors } from '@/src/constants/theme';
import { authService, UserProfileResponse } from '@/src/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CitizenProfileProps {
  onEdit?: () => void;
  onBack?: () => void;
  onLogout?: () => void;
  onNavigate?: (
    screen:
      | 'profile'
      | 'requests'
      | 'tasks'
      | 'settings'
      | 'help'
      | 'change-password'
      | 'register-volunteer'
      | 'my-volunteer-profile',
  ) => void;
}

export default function CitizenProfile({
  onEdit,
  onBack,
  onLogout,
  onNavigate,
}: CitizenProfileProps) {
  const { top, bottom } = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    const result = await authService.getProfile();
    if (result.success && result.data) {
      setProfile(result.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

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
    <View className="flex-row items-center gap-3 border-b border-surface-dark px-4 py-4">
      <View className="h-9 w-9 items-center justify-center rounded-full bg-surface">
        <Ionicons name={icon} size={18} color={Colors.light.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-xs text-text-secondary">{label}</Text>
        <Text className="mt-1 text-base font-semibold text-text-primary">
          {value || 'Chưa cập nhật'}
        </Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-background-light">
      <View className="bg-primary px-4 pb-10" style={{ paddingTop: top + 8 }}>
        <View className="mb-4 flex-row items-center justify-between">
          <View className="w-10">
            {onBack ? (
              <TouchableOpacity
                onPress={onBack}
                className="h-10 w-10 items-center justify-center rounded-full"
              >
                <Ionicons name="chevron-back" size={22} color="#fff" />
              </TouchableOpacity>
            ) : null}
          </View>
          <Text className="text-lg font-bold text-white">Hồ sơ người dùng</Text>
          <TouchableOpacity
            onPress={loadProfile}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
          >
            <Ionicons name="refresh" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <View className="items-center">
          {profile?.pictureUrl ? (
            <Image
              source={{ uri: profile.pictureUrl }}
              className="h-24 w-24 rounded-full"
            />
          ) : (
            <View className="h-24 w-24 items-center justify-center rounded-full bg-white/20">
              <Ionicons name="person" size={42} color="#fff" />
            </View>
          )}
          <Text className="mt-3 text-xl font-bold text-white">
            {profile?.displayName || 'Người dùng'}
          </Text>
          <Text className="mt-1 text-sm text-white/90">
            ID: {profile?.id || '---'}
          </Text>

          <View className="mt-3 flex-row flex-wrap items-center justify-center gap-2">
            {(profile?.roles || []).map((role) => (
              <View key={role} className="rounded-full bg-white/20 px-3 py-1">
                <Text className="text-xs font-bold text-white">{role}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text className="mt-3 text-text-secondary">
            Đang tải thông tin hồ sơ...
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-2"
          contentContainerStyle={{ paddingBottom: bottom + 120 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="overflow-hidden rounded-2xl border border-surface-dark bg-white">
            <InfoRow icon="mail" label="Email" value={profile?.email} />
            <InfoRow
              icon="call"
              label="Số điện thoại"
              value={profile?.phoneNumber}
            />
            <InfoRow
              icon="calendar"
              label="Ngày sinh"
              value={formatDate(profile?.dateOfBirth)}
            />
            <InfoRow
              icon="male-female"
              label="Giới tính"
              value={mapGender(profile?.gender)}
            />
          </View>

          <View className="mt-4 overflow-hidden rounded-2xl border border-surface-dark bg-white">
            <TouchableOpacity
              onPress={onEdit}
              className="flex-row items-center justify-between border-b border-surface-dark px-4 py-4"
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="create-outline" size={20} color="#c01515" />
                <Text className="text-base font-medium text-text-primary">
                  Cập nhật hồ sơ
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onNavigate?.('my-volunteer-profile')}
              className="flex-row items-center justify-between border-b border-surface-dark px-4 py-4"
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="heart-outline" size={20} color="#DA251D" />
                <Text className="text-base font-medium text-text-primary">
                  Hồ sơ tình nguyện viên
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onNavigate?.('change-password')}
              className="flex-row items-center justify-between border-b border-surface-dark px-4 py-4"
            >
              <View className="flex-row items-center gap-3">
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#DA251D"
                />
                <Text className="text-base font-medium text-text-primary">
                  Đổi mật khẩu
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onNavigate?.('settings')}
              className="flex-row items-center justify-between border-b border-surface-dark px-4 py-4"
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="settings-outline" size={20} color="#DA251D" />
                <Text className="text-base font-medium text-text-primary">
                  Cài đặt
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onNavigate?.('help')}
              className="flex-row items-center justify-between px-4 py-4"
            >
              <View className="flex-row items-center gap-3">
                <Ionicons
                  name="help-circle-outline"
                  size={20}
                  color="#DA251D"
                />
                <Text className="text-base font-medium text-text-primary">
                  Trợ giúp
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={onLogout}
            className="mt-4 flex-row items-center justify-center gap-2 rounded-xl border border-red-200 bg-white py-4"
          >
            <Ionicons name="log-out-outline" size={20} color="#DA251D" />
            <Text className="font-bold text-[#DA251D]">Đăng xuất</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}
