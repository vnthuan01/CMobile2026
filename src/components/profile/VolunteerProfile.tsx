import { useTheme } from '@/src/context/ThemeContext';
import { useBottomContentInset } from '@/src/hooks/useBottomContentInset';
import { useCitizenProfile } from '@/src/hooks/useCitizenProfile';
import { useMyTeam } from '@/src/hooks/useMyTeam';
import {
  useAllSkills,
  useMyVolunteerProfile,
} from '@/src/hooks/useMyVolunteerProfile';
import type {
  SkillResponse,
  VolunteerProfileResponse,
} from '@/src/types/volunteer';
import {
  resolveAvatarUrl,
  resolveDisplayName,
} from '@/src/utils/userPresentation';
import { showErrorToast } from '@/src/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';

interface VolunteerProfileProps {
  isLeader?: boolean;
  onEdit?: () => void;
  onBack?: () => void;
  onLogout?: () => void;
  onNavigate?: (
    screen:
      | '/tasks'
      | '/profile/my-volunteer-profile'
      | '/profile/requests'
      | '/profile/tasks'
      | '/profile/settings'
      | '/profile/help'
      | '/profile/change-password'
      | '/profile/dashboard-leader'
      | '/profile/my-team',
  ) => void;
}

export default function VolunteerProfile({
  isLeader = false,
  onEdit,
  onBack,
  onLogout,
  onNavigate,
}: VolunteerProfileProps) {
  const { top } = useSafeAreaInsets();
  const bottomInset = useBottomContentInset(24);
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const profileQuery = useCitizenProfile(Boolean(user));
  const volunteerProfileQuery = useMyVolunteerProfile(Boolean(user));
  const myTeamQuery = useMyTeam(Boolean(user));
  const allSkillsQuery = useAllSkills(Boolean(user));
  const profile = profileQuery.data?.profile ?? null;
  const volunteerProfile = volunteerProfileQuery.data?.profile ?? null;
  const teamMode = myTeamQuery.data?.teamMode ?? 'rescue';
  const allSkills = useMemo(
    () => (allSkillsQuery.data ?? []) as SkillResponse[],
    [allSkillsQuery.data],
  );
  const headerBg = colors.secondary;
  const cardBg = colors.card;
  const subtleBg = colors.surface;
  const iconAccent = colors.secondary;
  const neutralBorder = colors.border;
  const phoneNumber = profile?.phoneNumber || '--';
  const emailAddress = profile?.email || user?.email || '--';
  const displayName = resolveDisplayName({
    profileDisplayName: profile?.displayName,
    authUserName: user?.user_name,
    email: user?.email,
  });
  const avatarUrl = resolveAvatarUrl({
    profilePictureUrl: profile?.pictureUrl,
    authPictureUrl: null,
  });

  const volunteerSkills = useMemo(() => {
    if (!volunteerProfile?.skills?.length) return [] as string[];

    return volunteerProfile.skills
      .map((skillEntry: VolunteerProfileResponse['skills'][number]) => {
        const id = getProfileSkillId(skillEntry);
        const matched = allSkills.find(
          (skill: SkillResponse) => skill.skillId === id,
        );
        return getLocalizedSkillName(matched?.name || id, matched?.code);
      })
      .filter(Boolean);
  }, [allSkills, volunteerProfile?.skills]);

  const volunteerCertificates: VolunteerProfileResponse['certificates'] =
    volunteerProfile?.certificates ?? [];

  useEffect(() => {
    if (profileQuery.error) {
      showErrorToast('Không tải được hồ sơ', profileQuery.error.message);
    }
  }, [profileQuery.error]);

  useEffect(() => {
    if (volunteerProfileQuery.error) {
      showErrorToast(
        'Không tải được hồ sơ tình nguyện viên',
        volunteerProfileQuery.error.message,
      );
    }
  }, [volunteerProfileQuery.error]);

  useEffect(() => {
    if (allSkillsQuery.error) {
      showErrorToast('Không tải được kỹ năng', allSkillsQuery.error.message);
    }
  }, [allSkillsQuery.error]);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header Section */}
      <View
        className="relative pb-16 pt-4"
        style={{ backgroundColor: headerBg }}
      >
        <View
          style={{ paddingTop: top }}
          className="z-20 mb-4 flex-row items-center justify-between px-4"
        >
          <View className="w-10 items-start justify-center">
            {onBack && (
              <TouchableOpacity
                onPress={onBack}
                className="rounded-full p-2"
              >
                <Ionicons name="chevron-back" size={24} color={colors.white} />
              </TouchableOpacity>
            )}
          </View>
          <Text className="text-lg font-bold" style={{ color: colors.white }}>
            Hồ sơ cá nhân
          </Text>
          <View className="w-10 items-end justify-center">
            {onEdit && (
              <TouchableOpacity
                onPress={onEdit}
                className="items-center justify-center rounded-full bg-white/20 px-3"
                style={{ minWidth: 44, height: 36 }}
              >
                <Text
                  className="text-xs font-semibold"
                  numberOfLines={1}
                  style={{ color: colors.white }}
                >
                  Sửa
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Profile Info */}
        <View className="z-20 mt-2 items-center">
          <View className="relative mb-3">
            <View
              className="h-24 w-24 rounded-full border-4 border-white/20 shadow-lg"
              style={{ backgroundColor: subtleBg }}
            >
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  className="h-full w-full rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <View
                  className="flex-1 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${colors.black}40` }}
                >
                  <Ionicons name="person" size={40} color={colors.white} />
                </View>
              )}
            </View>
            <View
              className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 shadow-sm"
              style={{
                borderColor: colors.secondary,
                backgroundColor: colors.status.completed,
              }}
              accessibilityLabel="Đã xác minh"
            >
              <Ionicons name="checkmark" size={14} color={colors.white} />
            </View>
          </View>
          <Text
            className="mb-1 text-xl font-bold"
            style={{ color: colors.white }}
          >
            {displayName}
          </Text>
          <View className="rounded-full bg-white/20 px-2.5 py-0.5">
            <Text
              className="text-xs font-medium"
              style={{ color: colors.white }}
            >
              Tình nguyện viên
            </Text>
          </View>
        </View>

        {/* Bottom Curve */}
        <View
          className="absolute bottom-[-1px] left-0 h-10 w-full rounded-tl-3xl rounded-tr-3xl"
          style={{ backgroundColor: colors.background }}
        />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        className="z-10 -mt-2 flex-1 px-4"
        contentContainerStyle={{ paddingBottom: bottomInset }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-col gap-4">
          {/* Team */}
          <View
            className="rounded-2xl border p-5 shadow-sm"
            style={{ borderColor: neutralBorder, backgroundColor: cardBg }}
          >
            <View className="flex-row items-center justify-between gap-4">
              <View className="flex-1">
                <Text
                  className="text-base font-bold"
                  style={{ color: colors.text }}
                >
                  Đội của tôi
                </Text>
                <Text
                  className="mt-1 text-xs leading-relaxed"
                  style={{ color: colors.textSecondary }}
                >
                  Xem danh sách thành viên và kỹ năng của team.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => onNavigate?.('/profile/my-team')}
                className="rounded-xl bg-primary px-4 py-2.5"
              >
                <Text className="font-semibold text-white">Mở</Text>
              </TouchableOpacity>
            </View>
          </View>

          {isLeader ? (
            <View
              className="rounded-2xl border p-5 shadow-sm"
              style={{ borderColor: neutralBorder, backgroundColor: cardBg }}
            >
              <View className="flex-row items-center justify-between gap-4">
                <View className="flex-1">
                  <Text className="text-base font-bold" style={{ color: colors.text }}>
                    Dashboard nhóm trưởng
                  </Text>
                  <Text className="mt-1 text-xs leading-relaxed" style={{ color: colors.textSecondary }}>
                    {teamMode === 'relief'
                      ? 'Theo dõi tiến độ công việc và phân công cho từng thành viên.'
                      : 'Điều hành đội cứu hộ và theo dõi nhiệm vụ chung của nhóm.'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    teamMode === 'relief'
                      ? onNavigate?.('/profile/dashboard-leader')
                      : onNavigate?.('/tasks')
                  }
                  className="rounded-xl bg-primary px-4 py-2.5"
                >
                  <Text className="font-semibold text-white">Mở</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {/* Skills */}
          <View
            className="rounded-2xl border p-5 shadow-sm"
            style={{ borderColor: neutralBorder, backgroundColor: cardBg }}
          >
            <View className="mb-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="h-5 w-1 rounded-full bg-primary" />
                <Text
                  className="text-base font-bold"
                  style={{ color: colors.text }}
                >
                  Kỹ năng chuyên môn
                </Text>
              </View>
            </View>
            {volunteerProfileQuery.isLoading || allSkillsQuery.isLoading ? (
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                Đang tải kỹ năng chuyên môn...
              </Text>
            ) : volunteerSkills.length > 0 ? (
              <View className="flex-row flex-wrap gap-2.5">
                {volunteerSkills.map((skill: string, index: number) => (
                  <View
                    key={`${skill}-${index}`}
                    className="flex-row items-center gap-2 rounded-xl border px-3 py-2"
                    style={{
                      borderColor: neutralBorder,
                      backgroundColor: colors.surface,
                    }}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={iconAccent}
                    />
                    <Text
                      className="text-sm font-medium"
                      style={{ color: colors.text }}
                    >
                      {skill}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                Chưa có kỹ năng chuyên môn.
              </Text>
            )}
          </View>

          {/* Certifications and Badges */}
          <View className="pt-2">
            <View className="mb-3 flex-row items-center justify-between px-1">
              <View className="flex-row items-center gap-2">
                <View className="h-5 w-1 rounded-full bg-primary" />
                <Text
                  className="text-base font-bold"
                  style={{ color: colors.text }}
                >
                  Chứng chỉ
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => onNavigate?.('/profile/my-volunteer-profile')}
              >
                <Text
                  className="text-xs font-medium"
                  style={{ color: colors.textSecondary }}
                >
                  Xem tất cả
                </Text>
              </TouchableOpacity>
            </View>
            <View
              className="rounded-2xl border p-4"
              style={{ borderColor: neutralBorder, backgroundColor: cardBg }}
            >
              {volunteerProfileQuery.isLoading ? (
                <Text
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Đang tải chứng chỉ...
                </Text>
              ) : volunteerCertificates.length > 0 ? (
                <View className="gap-3">
                  {volunteerCertificates
                    .slice(0, 3)
                    .map(
                      (
                        certificate: VolunteerProfileResponse['certificates'][number],
                        index: number,
                      ) => (
                        <View
                          key={`${certificate.name}-${index}`}
                          className="flex-row items-start gap-3"
                        >
                          <Ionicons
                            name="document-text-outline"
                            size={18}
                            color={colors.primary}
                          />
                          <View className="flex-1">
                            <Text
                              className="text-sm font-semibold"
                              style={{ color: colors.text }}
                            >
                              {certificate.name || 'Chứng chỉ'}
                            </Text>
                            <Text
                              className="text-xs"
                              style={{ color: colors.textSecondary }}
                            >
                              {certificate.issuedBy || 'Không rõ đơn vị cấp'}
                            </Text>
                          </View>
                        </View>
                      ),
                    )}
                </View>
              ) : (
                <Text
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Chưa có chứng chỉ chuyên môn.
                </Text>
              )}
            </View>
          </View>

          {/* Contact Information */}
          <View className="pb-4">
            <View className="mb-3 flex-row items-center gap-2 px-1">
              <View className="h-5 w-1 rounded-full bg-primary" />
              <Text
                className="text-base font-bold"
                style={{ color: colors.text }}
              >
                Thông tin liên hệ
              </Text>
            </View>
            <View
              className="overflow-hidden rounded-2xl border shadow-sm"
              style={{ borderColor: neutralBorder, backgroundColor: cardBg }}
            >
              {/* Phone */}
              <View
                className="flex-row items-center gap-4 border-b p-4"
                style={{ borderColor: neutralBorder }}
              >
                <View
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Ionicons name="call" size={18} color={iconAccent} />
                </View>
                <View className="flex-1">
                  <Text
                    className="mb-0.5 text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: colors.textSecondary }}
                  >
                    Số điện thoại
                  </Text>
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: colors.text }}
                  >
                    {phoneNumber}
                  </Text>
                </View>
              </View>

              {/* Email */}
              <View className="flex-row items-center gap-4 p-4">
                <View
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Ionicons name="mail" size={18} color={iconAccent} />
                </View>
                <View className="flex-1">
                  <Text
                    className="mb-0.5 text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: colors.textSecondary }}
                  >
                    Email
                  </Text>
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: colors.text }}
                  >
                    {emailAddress}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Navigation Section */}
          <View className="pb-4">
            <View className="mb-3 flex-row items-center gap-2 px-1">
              <View className="h-5 w-1 rounded-full bg-primary" />
              <Text
                className="text-base font-bold"
                style={{ color: colors.text }}
              >
                Chức năng & Hệ thống
              </Text>
            </View>
            <View
              className="overflow-hidden rounded-2xl border shadow-sm"
              style={{ borderColor: neutralBorder, backgroundColor: cardBg }}
            >
              <TouchableOpacity
                onPress={() => onNavigate?.('/profile/my-volunteer-profile')}
                className="flex-row items-center gap-4 border-b p-4"
                style={{ borderColor: neutralBorder }}
              >
                <View
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Ionicons name="person" size={18} color={iconAccent} />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: colors.text }}
                  >
                    Hồ sơ tình nguyện viên
                  </Text>
                  <Text
                    className="text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    Email, số điện thoại, ngày sinh, giới tính và kỹ năng
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  onNavigate?.(teamMode === 'relief' ? '/profile/tasks' : '/tasks')
                }
                className="flex-row items-center gap-4 border-b p-4"
                style={{ borderColor: neutralBorder }}
              >
                <View
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Ionicons name="clipboard" size={18} color={iconAccent} />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: colors.text }}
                  >
                    {teamMode === 'relief' ? 'Công việc của đội' : 'Trung tâm nhiệm vụ'}
                  </Text>
                  <Text
                    className="text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    {teamMode === 'relief'
                      ? 'Xem công việc được giao trong chiến dịch'
                      : 'Xem và cập nhật trạng thái nhiệm vụ cứu hộ'}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              {isLeader && teamMode === 'relief' ? (
                <TouchableOpacity
                  onPress={() => onNavigate?.('/profile/dashboard-leader')}
                  className="flex-row items-center gap-4 border-b p-4"
                  style={{ borderColor: neutralBorder }}
                >
                  <View
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${iconAccent}18` }}
                  >
                    <Ionicons name="people" size={18} color={iconAccent} />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: colors.text }}
                    >
                      {teamMode === 'relief' ? 'Bảng điều phối nhóm' : 'Điều hành đội'}
                    </Text>
                    <Text
                      className="text-xs"
                      style={{ color: colors.textSecondary }}
                    >
                      {teamMode === 'relief'
                        ? 'Quản lý nhóm và phân công công việc'
                        : 'Theo dõi đội và mở nhanh nhiệm vụ chung'}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                onPress={() => onNavigate?.('/profile/change-password')}
                className="flex-row items-center gap-4 border-b p-4"
                style={{ borderColor: neutralBorder }}
              >
                <View
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Ionicons name="lock-closed" size={18} color={iconAccent} />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: colors.text }}
                  >
                    Đổi mật khẩu
                  </Text>
                  <Text
                    className="text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    Cập nhật mật khẩu bảo mật
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
                className="flex-row items-center gap-4 border-b p-4"
                style={{ borderColor: neutralBorder }}
              >
                <View
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Ionicons name="settings" size={18} color={iconAccent} />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: colors.text }}
                  >
                    Cài đặt ứng dụng
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
                className="flex-row items-center gap-4 p-4"
              >
                <View
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Ionicons name="help-circle" size={18} color={iconAccent} />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: colors.text }}
                  >
                    Trung tâm trợ giúp
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout Button */}
          <View className="mb-4 mt-2">
            <TouchableOpacity
              onPress={onLogout}
              className="flex-row items-center justify-center gap-2 rounded-xl border py-4 shadow-sm"
              style={{
                borderColor: `${colors.status.error}33`,
                backgroundColor: cardBg,
              }}
            >
              <Ionicons
                name="log-out-outline"
                size={20}
                color={colors.status.error}
              />
              <Text
                className="font-bold"
                style={{ color: colors.status.error }}
              >
                Đăng xuất
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function getLocalizedSkillName(name?: string | null, code?: string | null) {
  const source = `${code || ''} ${name || ''}`.toLowerCase().trim();

  if (!source) return 'Kỹ năng';
  if (
    source.includes('first') ||
    source.includes('aid') ||
    source.includes('sơ cứu')
  ) {
    return 'Sơ cứu';
  }
  if (source.includes('medical') || source.includes('y tế')) {
    return 'Hỗ trợ y tế';
  }
  if (source.includes('swim') || source.includes('bơi')) {
    return 'Bơi cứu hộ';
  }
  if (
    source.includes('drive') ||
    source.includes('driver') ||
    source.includes('lái xe')
  ) {
    return 'Lái xe cứu trợ';
  }
  if (source.includes('logistic') || source.includes('hậu cần')) {
    return 'Hậu cần';
  }
  if (source.includes('communicat') || source.includes('liên lạc')) {
    return 'Liên lạc điều phối';
  }
  if (source.includes('rescue') || source.includes('cứu hộ')) {
    return 'Cứu hộ';
  }
  if (source.includes('search') || source.includes('tìm kiếm')) {
    return 'Tìm kiếm cứu nạn';
  }

  return name || code || 'Kỹ năng';
}

function getProfileSkillId(
  skillEntry: VolunteerProfileResponse['skills'][number],
) {
  if (typeof skillEntry === 'string') return skillEntry;
  return skillEntry?.skillId || skillEntry?.code || skillEntry?.name || '';
}
