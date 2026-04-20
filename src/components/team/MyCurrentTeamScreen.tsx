import '@/global.css';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import { useTheme } from '@/src/context/ThemeContext';
import { useBottomContentInset } from '@/src/hooks/useBottomContentInset';
import { useCurrentTeam } from '@/src/hooks/useTeamOverview';
import { showErrorToast, showInfoToast } from '@/src/utils/toast';
import { TeamDetailResponse, TeamSkillResponse } from '@/src/services/teamService';
import { useAuthStore } from '@/src/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface MyCurrentTeamScreenProps {
  onBack?: () => void;
  onOpenTasks?: () => void;
}

export default function MyCurrentTeamScreen({
  onBack,
  onOpenTasks,
}: MyCurrentTeamScreenProps) {
  const bottomInset = useBottomContentInset(32);
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const currentTeamQuery = useCurrentTeam();

  const [refreshing, setRefreshing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const team = (currentTeamQuery.data?.team as TeamDetailResponse | null) ?? null;
  const teamMode = currentTeamQuery.data?.teamMode ?? 'rescue';
  const loading = currentTeamQuery.isLoading && !refreshing;
  const errorMessage = currentTeamQuery.error?.message ?? null;
  const emptyState = currentTeamQuery.data?.isEmpty ?? false;

  const isLeader = useMemo(() => {
    if (!user?.id || !team?.leader?.userId) return false;
    return user.id === team.leader.userId;
  }, [team?.leader?.userId, user?.id]);

  useEffect(() => {
    if (!currentTeamQuery.isLoading && !currentTeamQuery.isFetching) {
      setRefreshing(false);
    }

    if (team) {
      setHasLoadedOnce(true);
    }

    if (emptyState && refreshing) {
      showInfoToast('Chưa có nhóm', 'Bạn hiện chưa tham gia nhóm nào.');
    } else if (errorMessage && (hasLoadedOnce || refreshing)) {
      showErrorToast('Không tải được thông tin nhóm', errorMessage || 'Vui lòng thử lại.');
    }
  }, [currentTeamQuery.isFetching, currentTeamQuery.isLoading, emptyState, errorMessage, hasLoadedOnce, refreshing, team]);

  const formatDate = (value?: string | null) => {
    if (!value) return 'Chưa rõ';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('vi-VN');
  };

  const openEmail = async (email?: string | null) => {
    if (!email) return;
    await Linking.openURL(`mailto:${email}`);
  };

  const openPhone = async (phone?: string | null) => {
    if (!phone) return;
    await Linking.openURL(`tel:${phone}`);
  };

  const statusStyle = (status?: string | null) => {
    const normalized = String(status ?? '').toLowerCase();

    switch (normalized) {
      case 'active':
        return { bg: `${colors.status.completed}22`, text: colors.status.completed, label: 'Đang hoạt động' };
      case 'draft':
        return { bg: `${colors.status.pending}22`, text: colors.status.pending, label: 'Bản nháp' };
      default:
        return {
          bg: colors.surface,
          text: colors.textSecondary,
          label: status ? String(status) : 'Không xác định',
        };
    }
  };

  const roleStyle = (role?: string | null) => {
    const normalized = String(role ?? '').toLowerCase();

    if (normalized === 'leader') {
      return { bg: `${colors.status.incoming}22`, text: colors.status.incoming, label: 'Trưởng nhóm' };
    }
    return {
      bg: colors.surface,
      text: colors.textSecondary,
      label: role ? (normalized === 'member' ? 'Thành viên' : String(role)) : 'Thành viên',
    };
  };

  const summaryConfig = teamMode === 'relief'
    ? {
        title: 'Đội cứu trợ đang phụ trách',
        description:
          'Theo dõi phân công, hỗ trợ nhu yếu phẩm và phối hợp công việc trong chiến dịch.',
        ctaLabel: isLeader ? 'Mở điều phối cứu trợ' : 'Xem công việc của đội',
        ctaIcon: 'cube-outline' as const,
      }
    : {
        title: 'Đội cứu hộ đang trực',
        description:
          'Sẵn sàng di chuyển, phối hợp hiện trường và xử lý nhiệm vụ đang mở.',
        ctaLabel: isLeader ? 'Mở nhiệm vụ hiện tại' : 'Xem nhiệm vụ chung',
        ctaIcon: 'flash-outline' as const,
      };

  const renderSkillChips = (skills?: TeamSkillResponse[]) => {
    if (!skills || skills.length === 0) {
      return (
        <Text className="text-sm" style={{ color: colors.textSecondary }}>
          Chưa cập nhật kỹ năng
        </Text>
      );
    }

    const visible = skills.slice(0, 2);
    const remaining = skills.length - visible.length;

    return (
      <View className="mt-2 flex-row flex-wrap gap-2">
        {visible.map((skill) => (
          <View
            key={skill.skillId}
            className="rounded-full px-3 py-1"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-xs font-medium" style={{ color: colors.text }}>
              {skill.name}
            </Text>
          </View>
        ))}
        {remaining > 0 ? (
          <View className="rounded-full px-3 py-1" style={{ backgroundColor: colors.surface }}>
            <Text className="text-xs font-medium" style={{ color: colors.textSecondary }}>
              +{remaining}
            </Text>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenHeader
        title="Nhóm của tôi"
        onBack={onBack}
        rightAction={
          <TouchableOpacity
            onPress={() => {
              setRefreshing(true);
              currentTeamQuery.refetch();
            }}
            className="h-10 w-10 items-center justify-center rounded-full"
          >
            <Ionicons name="refresh" size={20} color={colors.text} />
          </TouchableOpacity>
        }
      />

      {loading ? (
        <View className="flex-1 items-center justify-center px-6">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="mt-3 text-base" style={{ color: colors.textSecondary }}>
            Đang tải thông tin nhóm...
          </Text>
        </View>
      ) : emptyState ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: colors.surface }}>
            <Ionicons name="people-outline" size={34} color={colors.primary} />
          </View>
          <Text className="mt-4 text-center text-xl font-bold" style={{ color: colors.text }}>
            Bạn hiện chưa tham gia nhóm nào.
          </Text>
          <Text className="mt-2 text-center text-base" style={{ color: colors.textSecondary }}>
            Vui lòng liên hệ điều phối viên để được phân vào nhóm phù hợp.
          </Text>
        </View>
      ) : errorMessage ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={38} color={colors.status.error} />
          <Text className="mt-4 text-center text-xl font-bold" style={{ color: colors.text }}>
            Không tải được thông tin nhóm.
          </Text>
          <Text className="mt-2 text-center text-base" style={{ color: colors.textSecondary }}>
            {errorMessage}
          </Text>
          <TouchableOpacity
            onPress={() => currentTeamQuery.refetch()}
            className="mt-6 rounded-xl px-5 py-3"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="font-bold text-white">Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: bottomInset }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                currentTeamQuery.refetch();
              }}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <View className="px-4 pt-4">
            {isLeader ? (
              <View className="mb-4 rounded-2xl border p-4" style={{ borderColor: `${colors.status.incoming}33`, backgroundColor: `${colors.status.incoming}14` }}>
                <Text className="text-base font-bold" style={{ color: colors.status.incoming }}>
                  {teamMode === 'relief' ? 'Bạn đang là trưởng nhóm cứu trợ' : 'Bạn đang là trưởng nhóm cứu hộ'}
                </Text>
                <Text className="mt-1 text-sm" style={{ color: colors.status.incoming }}>
                  {teamMode === 'relief'
                    ? 'Theo dõi thành viên và điều phối công việc được giao trong chiến dịch.'
                    : 'Theo dõi thành viên, điều phối liên lạc và đi nhanh sang nhiệm vụ hiện tại.'}
                </Text>
              </View>
            ) : null}

            <View className="rounded-3xl p-5" style={{ backgroundColor: colors.secondary }}>
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-white">
                    {team?.name}
                  </Text>
                  <Text className="mt-2 text-sm leading-6 text-white/85">
                    {team?.description || 'Chưa có mô tả cho nhóm này.'}
                  </Text>
                </View>
                <View
                  className="rounded-full px-3 py-1"
                  style={{ backgroundColor: statusStyle(team?.status).bg }}
                >
                  <Text
                    className="text-xs font-bold"
                    style={{ color: statusStyle(team?.status).text }}
                  >
                    {statusStyle(team?.status).label}
                  </Text>
                </View>
              </View>

              <View className="mt-4 flex-row flex-wrap gap-3">
                <View className="w-full rounded-2xl bg-white/10 px-4 py-3">
                  <Text className="text-xs font-semibold uppercase tracking-wide text-white/70">
                    {summaryConfig.title}
                  </Text>
                  <Text className="mt-1 text-sm leading-5 text-white/90">
                    {summaryConfig.description}
                  </Text>
                </View>
                <View className="bg-white/12 rounded-2xl px-3 py-2">
                  <Text className="text-xs text-white/70">Loại đội</Text>
                  <Text className="mt-1 text-sm font-bold text-white">
                    {teamMode === 'relief' ? 'Cứu trợ' : 'Cứu hộ'}
                  </Text>
                </View>
                <View className="bg-white/12 rounded-2xl px-3 py-2">
                  <Text className="text-xs text-white/70">Thành viên</Text>
                  <Text className="mt-1 text-lg font-bold text-white">
                    {team?.members?.length || 0}
                  </Text>
                </View>
                <View className="bg-white/12 rounded-2xl px-3 py-2">
                  <Text className="text-xs text-white/70">Cập nhật</Text>
                  <Text className="mt-1 text-sm font-bold text-white">
                    {formatDate(team?.updatedAt)}
                  </Text>
                </View>
              </View>

              {team?.contactPhone ? (
                <TouchableOpacity
                  onPress={() => openPhone(team.contactPhone)}
                  className="bg-white/12 mt-4 flex-row items-center gap-2 rounded-2xl px-3 py-3"
                >
                  <Ionicons name="call-outline" size={18} color={colors.white} />
                  <Text className="font-medium text-white">
                    {team.contactPhone}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <View className="mt-4 rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.card }}>
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-bold" style={{ color: colors.text }}>
                  Trưởng nhóm hiện tại
                </Text>
                <View
                  className="rounded-full px-3 py-1"
                  style={{ backgroundColor: roleStyle('Leader').bg }}
                >
                  <Text
                    className="text-xs font-bold"
                    style={{ color: roleStyle('Leader').text }}
                  >
                    Trưởng nhóm
                  </Text>
                </View>
              </View>

              {team?.leader ? (
                <>
                  <Text className="mt-3 text-xl font-bold" style={{ color: colors.text }}>
                    {team.leader.displayName}
                  </Text>
                  <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
                    {team.leader.email}
                  </Text>
                  {renderSkillChips(team.leader.skills)}
                  <View className="mt-4 flex-row gap-3">
                    <TouchableOpacity
                      onPress={() => openEmail(team.leader?.email)}
                      className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border py-3"
                      style={{ borderColor: colors.border, backgroundColor: colors.card }}
                    >
                      <Ionicons
                        name="mail-outline"
                        size={18}
                        color={colors.primary}
                      />
                      <Text className="font-semibold" style={{ color: colors.text }}>
                        Gửi email
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={onOpenTasks}
                      className="flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Ionicons name={summaryConfig.ctaIcon} size={18} color={colors.white} />
                      <Text className="font-semibold text-white">
                        {summaryConfig.ctaLabel}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <Text className="mt-3 text-base" style={{ color: colors.textSecondary }}>
                  Chưa có trưởng nhóm
                </Text>
              )}
            </View>

            <View className="mt-4 rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.card }}>
              <Text className="text-lg font-bold" style={{ color: colors.text }}>
                Điều phối viên phụ trách
              </Text>
              {team?.moderator ? (
                <>
                  <Text className="mt-3 text-base font-semibold" style={{ color: colors.text }}>
                    {team.moderator.displayName}
                  </Text>
                  <TouchableOpacity
                    onPress={() => openEmail(team.moderator?.email)}
                  >
                    <Text className="mt-1 text-sm text-primary">
                      {team.moderator.email}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text className="mt-3 text-base" style={{ color: colors.textSecondary }}>
                  Chưa có điều phối viên
                </Text>
              )}
            </View>

            <View className="mt-4 rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.card }}>
              <Text className="text-lg font-bold" style={{ color: colors.text }}>
                Danh sách đồng đội
              </Text>
              {team?.members?.length ? (
                <View className="mt-4 gap-3">
                  {team.members.map((member) => {
                    const badge = roleStyle(member.role);
                    return (
                      <View
                        key={member.userId}
                        className="rounded-2xl border p-4"
                        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
                      >
                        <View className="flex-row items-start gap-3">
                          <View className="h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: colors.surface }}>
                            <Ionicons
                              name="person"
                              size={22}
                              color={colors.primary}
                            />
                          </View>
                          <View className="flex-1">
                            <View className="flex-row items-center justify-between gap-3">
                              <Text className="flex-1 text-base font-bold" style={{ color: colors.text }}>
                                {member.displayName}
                              </Text>
                              <View
                                className="rounded-full px-3 py-1"
                                style={{ backgroundColor: badge.bg }}
                              >
                                <Text
                                  className="text-xs font-bold"
                                  style={{ color: badge.text }}
                                >
                                  {badge.label}
                                </Text>
                              </View>
                            </View>
                            <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
                              {member.email}
                            </Text>
                            <Text className="mt-2 text-xs" style={{ color: colors.textSecondary }}>
                              Tham gia từ {formatDate(member.joinedAt)}
                            </Text>
                            {renderSkillChips(member.skills)}
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text className="mt-3 text-base" style={{ color: colors.textSecondary }}>
                  Nhóm hiện chưa có thành viên nào
                </Text>
              )}
            </View>

            <View className="mt-4 flex-row gap-3">
              <TouchableOpacity
                onPress={onOpenTasks}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border py-3"
                style={{ borderColor: colors.border, backgroundColor: colors.card }}
              >
                <Ionicons
                  name={teamMode === 'relief' ? 'clipboard-outline' : 'list-outline'}
                  size={18}
                  color={colors.primary}
                />
                <Text className="font-semibold" style={{ color: colors.text }}>
                  {teamMode === 'relief' ? 'Xem phân công cứu trợ' : 'Xem nhiệm vụ nhóm'}
                </Text>
              </TouchableOpacity>

              {team?.leader?.email ? (
                <TouchableOpacity
                  onPress={() => openEmail(team.leader?.email)}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={18}
                    color={colors.white}
                  />
                  <Text className="font-semibold text-white">
                    Liên hệ trưởng nhóm
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
