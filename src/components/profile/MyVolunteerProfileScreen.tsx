import '@/global.css';
import { AppDialog, useDialog } from '@/src/components/common/AppDialog';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import { useTheme } from '@/src/context/ThemeContext';
import { useBottomContentInset } from '@/src/hooks/useBottomContentInset';
import { useCitizenProfile } from '@/src/hooks/useCitizenProfile';
import { useMyTeam } from '@/src/hooks/useMyTeam';
import {
  useAllSkills,
  useMyVolunteerProfile,
  volunteerProfileKeys,
} from '@/src/hooks/useMyVolunteerProfile';
import {
  SkillResponse,
  TeamRolePreference,
  VolunteerProfileResponse,
} from '@/src/services/volunteerService';
import { useAuthStore } from '@/src/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface MyVolunteerProfileScreenProps {
  onBack?: () => void;
  onCreate?: () => void;
  onResubmit?: (profile: VolunteerProfileResponse) => void;
  justSubmitted?: boolean;
}

export default function MyVolunteerProfileScreen({
  onBack,
  onCreate,
  onResubmit,
  justSubmitted = false,
}: MyVolunteerProfileScreenProps) {
  const bottomInset = useBottomContentInset(24);
  const { colors } = useTheme();
  const router = useRouter();
  const { dialogProps, showDialog } = useDialog();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const currentRole = (user?.role ?? '').toLowerCase();
  const isCurrentVolunteerRole =
    currentRole === 'volunteer' || currentRole === 'leader';
  const { data: myTeamData } = useMyTeam(Boolean(user));
  const team = myTeamData?.team;
  const isLeader = useMemo(() => {
    if (!user?.id || !team?.leader?.userId) return false;
    return user.id === team.leader.userId;
  }, [team?.leader?.userId, user?.id]);
  const hasShownRoleChangeDialogRef = useRef(false);

  const queryClient = useQueryClient();
  const profileQuery = useMyVolunteerProfile(
    true,
    justSubmitted || !isCurrentVolunteerRole ? 5000 : false,
  );
  const skillsQuery = useAllSkills();
  const citizenProfileQuery = useCitizenProfile(
    Boolean(user),
    justSubmitted || !isCurrentVolunteerRole ? 5000 : false,
  );
  const profile = profileQuery.data?.profile ?? null;
  const errorMessage = profileQuery.data?.errorMessage ?? null;
  const skills = skillsQuery.data ?? [];
  const loading = profileQuery.isLoading || skillsQuery.isLoading;
  const backendRoles = citizenProfileQuery.data?.profile?.roles ?? [];
  const backendHasVolunteerRole = backendRoles.some((role: string) => {
    const normalized = String(role).toLowerCase();
    return normalized === 'volunteer' || normalized === 'leader';
  });

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: volunteerProfileKeys.all });
    }, [queryClient]),
  );

  const normalizedStatus = useMemo(() => {
    const raw = String(profile?.verificationStatus ?? '').toLowerCase();
    if (raw.includes('reject')) return 'Rejected';
    if (raw.includes('approve')) return 'Approved';
    if (raw.includes('pending')) return 'Pending';
    return profile?.reason ? 'Rejected' : 'Pending';
  }, [profile?.reason, profile?.verificationStatus]);

  const statusMeta = useMemo(() => {
    switch (normalizedStatus) {
      case 'Approved':
        return {
          bg: `${colors.status.completed}22`,
          text: colors.status.completed,
          title: 'Đã chấp nhận',
          description: 'Bạn đã trở thành tình nguyện viên.',
          icon: 'checkmark-circle' as const,
        };
      case 'Rejected':
        return {
          bg: `${colors.status.error}22`,
          text: colors.status.error,
          title: 'Bị từ chối',
          description: 'Hồ sơ của bạn cần được chỉnh sửa và gửi lại.',
          icon: 'close-circle' as const,
        };
      default:
        return {
          bg: `${colors.status.pending}22`,
          text: colors.status.pending,
          title: 'Chờ duyệt',
          description: 'Hồ sơ của bạn đang chờ duyệt.',
          icon: 'time' as const,
        };
    }
  }, [normalizedStatus]);

  useEffect(() => {
    if (hasShownRoleChangeDialogRef.current) return;
    if (normalizedStatus !== 'Approved') return;
    if (!backendHasVolunteerRole) return;
    if (isCurrentVolunteerRole) return;

    hasShownRoleChangeDialogRef.current = true;
    showDialog({
      title: 'Hồ sơ đã được duyệt',
      message:
        'Tài khoản của bạn đã được duyệt thành tình nguyện viên. Vui lòng đăng xuất và đăng nhập lại để cập nhật quyền mới.',
      type: 'success',
      cancelLabel: 'Để sau',
      confirmLabel: 'Đăng xuất',
      onConfirm: async () => {
        await logout();
        router.replace('/login');
      },
    });
  }, [
    backendHasVolunteerRole,
    isCurrentVolunteerRole,
    logout,
    normalizedStatus,
    router,
    showDialog,
  ]);

  if (loading) {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <ScreenHeader title="Hồ sơ tình nguyện viên" onBack={onBack} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="mt-3 text-text-secondary">Đang tải hồ sơ...</Text>
        </View>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <ScreenHeader title="Hồ sơ tình nguyện viên" onBack={onBack} />
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons
            name="alert-circle-outline"
            size={36}
            color={colors.status.error}
          />
          <Text className="mt-4 text-center text-lg font-bold text-text-primary">
            Không thể tải hồ sơ tình nguyện viên
          </Text>
          <Text className="mt-2 text-center text-text-secondary">
            {errorMessage}
          </Text>
          <TouchableOpacity
            onPress={() =>
              queryClient.invalidateQueries({
                queryKey: volunteerProfileKeys.all,
              })
            }
            className="mt-6 rounded-xl bg-primary px-5 py-3"
          >
            <Text className="font-bold text-white">Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!profile) {
    if (justSubmitted) {
      return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
          <ScreenHeader title="Hồ sơ tình nguyện viên" onBack={onBack} />
          <View className="flex-1 items-center justify-center px-6">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="mt-4 text-center text-lg font-bold text-text-primary">
              Đang cập nhật hồ sơ đã gửi
            </Text>
            <Text className="mt-2 text-center text-text-secondary">
              Hệ thống đang kiểm tra trạng thái hồ sơ của bạn mỗi 5 giây.
            </Text>
            <TouchableOpacity
              onPress={() =>
                queryClient.invalidateQueries({
                  queryKey: volunteerProfileKeys.all,
                })
              }
              className="mt-6 rounded-xl bg-primary px-5 py-3"
            >
              <Text className="font-bold text-white">Làm mới ngay</Text>
            </TouchableOpacity>
          </View>
          <AppDialog {...dialogProps} />
        </View>
      );
    }

    return (
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <ScreenHeader title="Hồ sơ tình nguyện viên" onBack={onBack} />
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons
            name="document-text-outline"
            size={36}
            color={colors.textSecondary}
          />
          <Text className="mt-4 text-center text-lg font-bold text-text-primary">
            Bạn chưa có hồ sơ tình nguyện viên
          </Text>
          <Text className="mt-2 text-center text-text-secondary">
            Tạo hồ sơ để đăng ký trở thành tình nguyện viên.
          </Text>
          <TouchableOpacity
            onPress={onCreate}
            className="mt-6 rounded-xl bg-primary px-5 py-3"
          >
            <Text className="font-bold text-white">
              Tạo hồ sơ tình nguyện viên
            </Text>
          </TouchableOpacity>
        </View>
        <AppDialog {...dialogProps} />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenHeader title="Hồ sơ tình nguyện viên" onBack={onBack} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: bottomInset }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 pt-4">
          <View
            className="rounded-3xl p-5"
            style={{ backgroundColor: colors.secondary }}
          >
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1">
                <View
                  className="self-start rounded-full px-3 py-1"
                  style={{ backgroundColor: statusMeta.bg }}
                >
                  <Text
                    className="text-xs font-bold"
                    style={{ color: statusMeta.text }}
                  >
                    {statusMeta.title}
                  </Text>
                </View>
                <Text className="mt-4 text-xl font-bold text-white">
                  {profile.fullName || 'Hồ sơ tình nguyện viên'}
                </Text>
                <Text className="mt-2 text-sm text-white/80">
                  {statusMeta.description}
                </Text>
              </View>
              <View className="rounded-2xl bg-white/15 p-3">
                <Ionicons
                  name={statusMeta.icon}
                  size={24}
                  color={colors.white}
                />
              </View>
            </View>

            {normalizedStatus === 'Rejected' && profile.reason ? (
              <View className="mt-4 rounded-2xl bg-white/10 p-4">
                <Text className="text-xs font-semibold uppercase tracking-wide text-white/70">
                  Lý do từ chối
                </Text>
                <Text className="mt-2 text-sm leading-6 text-white">
                  {profile.reason}
                </Text>
              </View>
            ) : null}

            {isLeader ? (
              <View className="mt-4 gap-3">
                <TouchableOpacity
                  onPress={() => router.push('/profile/dashboard-leader' as any)}
                  className="flex-row items-center justify-between rounded-2xl bg-white/12 px-4 py-3"
                >
                  <View className="flex-1 pr-3">
                    <Text className="text-sm font-bold text-white">
                      Bảng điều phối nhóm trưởng
                    </Text>
                    <Text className="mt-1 text-xs text-white/75">
                      Theo dõi nhiệm vụ và thành viên trong chiến dịch.
                    </Text>
                  </View>
                  <Ionicons name="speedometer-outline" size={20} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push('/profile/allocate-task' as any)}
                  className="flex-row items-center justify-between rounded-2xl bg-white/12 px-4 py-3"
                >
                  <View className="flex-1 pr-3">
                    <Text className="text-sm font-bold text-white">
                      Phân công công việc
                    </Text>
                    <Text className="mt-1 text-xs text-white/75">
                      Tạo và giao nhiệm vụ cho đội trong chiến dịch cứu trợ.
                    </Text>
                  </View>
                  <Ionicons name="git-branch-outline" size={20} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push('/profile/tasks' as any)}
                  className="flex-row items-center justify-between rounded-2xl bg-white/12 px-4 py-3"
                >
                  <View className="flex-1 pr-3">
                    <Text className="text-sm font-bold text-white">
                      Công việc của đội
                    </Text>
                    <Text className="mt-1 text-xs text-white/75">
                      Xem chi tiết nhiệm vụ, điểm phát và tiến độ thực hiện.
                    </Text>
                  </View>
                  <Ionicons name="clipboard-outline" size={20} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push('/profile/report-progress-team-leader' as any)}
                  className="flex-row items-center justify-between rounded-2xl bg-white/12 px-4 py-3"
                >
                  <View className="flex-1 pr-3">
                    <Text className="text-sm font-bold text-white">
                      Báo cáo nhóm trưởng
                    </Text>
                    <Text className="mt-1 text-xs text-white/75">
                      Mở nhanh màn hình tổng hợp tiến độ và báo cáo của đội.
                    </Text>
                  </View>
                  <Ionicons name="bar-chart-outline" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>

        <SectionCard title="Thông tin hồ sơ" icon="person-outline">
          <InfoRow label="Họ tên" value={profile.fullName || '--'} />
          <InfoRow label="Email" value={profile.email || '--'} />
          <InfoRow label="Số điện thoại" value={profile.phoneNumber || '--'} />
          <InfoRow
            label="Vai trò mong muốn"
            value={mapPreferredRole(profile.preferredTeamRole)}
          />
          <InfoRow
            label="Số năm kinh nghiệm"
            value={
              profile.yearsOfExperience != null
                ? `${profile.yearsOfExperience} năm`
                : '--'
            }
          />
          <View className="mt-4">
            <Text
              className="text-sm font-semibold"
              style={{ color: colors.textSecondary }}
            >
              Mô tả
            </Text>
            <Text
              className="mt-2 text-base leading-6"
              style={{ color: colors.text }}
            >
              {profile.descriptions || '--'}
            </Text>
          </View>
        </SectionCard>

        <SectionCard title="Kỹ năng" icon="sparkles-outline">
          {profile.skills?.length ? (
            <View className="flex-row flex-wrap gap-2">
              {profile.skills.map(
                (skillEntry: VolunteerProfileResponse['skills'][number]) => (
                  <View
                    key={getProfileSkillId(skillEntry)}
                    className="rounded-full bg-primary/10 px-3 py-2"
                  >
                    <Text className="text-sm font-medium text-primary">
                      {getLocalizedSkillName(
                        skills.find(
                          (skill: SkillResponse) =>
                            skill.skillId === getProfileSkillId(skillEntry),
                        )?.name || getProfileSkillId(skillEntry),
                        skills.find(
                          (skill: SkillResponse) =>
                            skill.skillId === getProfileSkillId(skillEntry),
                        )?.code,
                      )}
                    </Text>
                  </View>
                ),
              )}
            </View>
          ) : (
            <EmptyInline text="Chưa có kỹ năng nào được chọn." />
          )}
        </SectionCard>

        <SectionCard title="Chứng chỉ" icon="document-attach-outline">
          {profile.certificates?.length ? (
            <View className="gap-3">
              {profile.certificates.map(
                (
                  certificate: VolunteerProfileResponse['certificates'][number],
                  index: number,
                ) => (
                  <View
                    key={`${certificate.fileUrl}-${index}`}
                    className="rounded-2xl border p-4"
                    style={{
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                    }}
                  >
                    <Text
                      className="text-base font-bold"
                      style={{ color: colors.text }}
                    >
                      {certificate.name}
                    </Text>
                    <Text
                      className="mt-1 text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      {certificate.issuedBy}
                    </Text>
                    <Text
                      className="mt-2 text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      Cấp ngày {formatDate(certificate.issuedDate)}
                      {certificate.expiryDate
                        ? ` • Hết hạn ${formatDate(certificate.expiryDate)}`
                        : ''}
                    </Text>
                    {!!certificate.fileUrl && (
                      <View
                        className="mt-3 overflow-hidden rounded-xl border"
                        style={{ borderColor: colors.border }}
                      >
                        <Image
                          source={{ uri: certificate.fileUrl }}
                          className="h-40 w-full"
                          resizeMode="cover"
                        />
                      </View>
                    )}
                  </View>
                ),
              )}
            </View>
          ) : (
            <EmptyInline text="Chưa có chứng chỉ nào được đính kèm." />
          )}
        </SectionCard>

        {normalizedStatus === 'Rejected' ? (
          <View className="px-4 pt-2">
            <TouchableOpacity
              onPress={() => onResubmit?.(profile)}
              className="h-12 items-center justify-center rounded-xl bg-primary"
            >
              <Text className="text-base font-bold text-white">
                Chỉnh sửa và gửi lại
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
      <AppDialog {...dialogProps} />
    </View>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();

  return (
    <View className="mt-4 px-4">
      <View
        className="rounded-2xl border p-4"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
      >
        <View className="mb-4 flex-row items-center gap-2">
          <Ionicons name={icon} size={18} color={colors.primary} />
          <Text className="text-base font-bold" style={{ color: colors.text }}>
            {title}
          </Text>
        </View>
        {children}
      </View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View className="mb-3">
      <Text
        className="text-sm font-semibold"
        style={{ color: colors.textSecondary }}
      >
        {label}
      </Text>
      <Text className="mt-1 text-base" style={{ color: colors.text }}>
        {value}
      </Text>
    </View>
  );
}

function EmptyInline({ text }: { text: string }) {
  const { colors } = useTheme();
  return (
    <Text className="text-sm" style={{ color: colors.textSecondary }}>
      {text}
    </Text>
  );
}

function formatDate(value?: string | null) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN');
}

function mapPreferredRole(value?: TeamRolePreference | number | null) {
  switch (value) {
    case TeamRolePreference.Leader:
    case 2:
      return 'Đội trưởng';
    case TeamRolePreference.Driver:
    case 3:
      return 'Tài xế';
    case TeamRolePreference.Member:
    case 1:
    default:
      return 'Member';
  }
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
