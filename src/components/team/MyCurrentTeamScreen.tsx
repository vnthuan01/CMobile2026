import '@/global.css';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import { useTheme } from '@/src/context/ThemeContext';
import {
  TeamDetailResponse,
  teamService,
  TeamSkillResponse,
} from '@/src/services/teamService';
import { useAuthStore } from '@/src/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MyCurrentTeamScreenProps {
  onBack?: () => void;
  onOpenTasks?: () => void;
}

export default function MyCurrentTeamScreen({
  onBack,
  onOpenTasks,
}: MyCurrentTeamScreenProps) {
  const { bottom } = useSafeAreaInsets();
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);

  const [team, setTeam] = useState<TeamDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emptyState, setEmptyState] = useState(false);

  const isLeader = useMemo(() => {
    if (!user?.id || !team?.leader?.userId) return false;
    return user.id === team.leader.userId;
  }, [team?.leader?.userId, user?.id]);

  const loadTeam = useCallback(async (isRefresh?: boolean) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErrorMessage(null);
    setEmptyState(false);

    try {
      const result = await teamService.getMyTeam();
      if (!result.success || !result.data) {
        if (
          result.status === 404 ||
          /chưa|not found|không thuộc team/i.test(result.message || '')
        ) {
          setEmptyState(true);
          setTeam(null);
          return;
        }

        setErrorMessage(result.message || 'Không tải được thông tin team.');
        setTeam(null);
        return;
      }

      setTeam(result.data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

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
        return { bg: '#DCFCE7', text: '#166534', label: 'Đang hoạt động' };
      case 'draft':
        return { bg: '#FEF3C7', text: '#92400E', label: 'Bản nháp' };
      default:
        return {
          bg: '#E2E8F0',
          text: '#475569',
          label: status ? String(status) : 'Không xác định',
        };
    }
  };

  const roleStyle = (role?: string | null) => {
    const normalized = String(role ?? '').toLowerCase();

    if (normalized === 'leader') {
      return { bg: '#DBEAFE', text: '#1D4ED8', label: 'Leader' };
    }
    return {
      bg: '#E2E8F0',
      text: '#475569',
      label: role ? String(role) : 'Member',
    };
  };

  const renderSkillChips = (skills?: TeamSkillResponse[]) => {
    if (!skills || skills.length === 0) {
      return (
        <Text className="text-sm text-text-secondary">
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
            className="rounded-full bg-surface px-3 py-1"
          >
            <Text className="text-xs font-medium text-text-primary">
              {skill.name}
            </Text>
          </View>
        ))}
        {remaining > 0 ? (
          <View className="rounded-full bg-surface px-3 py-1">
            <Text className="text-xs font-medium text-text-secondary">
              +{remaining}
            </Text>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background-light">
      <ScreenHeader
        title="Team của tôi"
        onBack={onBack}
        rightAction={
          <TouchableOpacity
            onPress={() => loadTeam(true)}
            className="h-10 w-10 items-center justify-center rounded-full"
          >
            <Ionicons name="refresh" size={20} color={colors.text} />
          </TouchableOpacity>
        }
      />

      {loading ? (
        <View className="flex-1 items-center justify-center px-6">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="mt-3 text-base text-text-secondary">
            Đang tải thông tin team...
          </Text>
        </View>
      ) : emptyState ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-surface">
            <Ionicons name="people-outline" size={34} color={colors.primary} />
          </View>
          <Text className="mt-4 text-center text-xl font-bold text-text-primary">
            Bạn hiện chưa tham gia team nào.
          </Text>
          <Text className="mt-2 text-center text-base text-text-secondary">
            Vui lòng liên hệ moderator để được phân vào team phù hợp.
          </Text>
        </View>
      ) : errorMessage ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={38} color="#DC2626" />
          <Text className="mt-4 text-center text-xl font-bold text-text-primary">
            Không tải được thông tin team.
          </Text>
          <Text className="mt-2 text-center text-base text-text-secondary">
            {errorMessage}
          </Text>
          <TouchableOpacity
            onPress={() => loadTeam()}
            className="mt-6 rounded-xl bg-primary px-5 py-3"
          >
            <Text className="font-bold text-white">Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: bottom + 32 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadTeam(true)}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <View className="px-4 pt-4">
            {isLeader ? (
              <View className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <Text className="text-base font-bold text-blue-800">
                  Bạn đang là trưởng nhóm của team này
                </Text>
                <Text className="mt-1 text-sm text-blue-700">
                  Theo dõi thành viên, điều phối liên lạc và đi nhanh sang nhiệm
                  vụ hiện tại.
                </Text>
              </View>
            ) : null}

            <View className="rounded-3xl bg-secondary p-5">
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-white">
                    {team?.name}
                  </Text>
                  <Text className="mt-2 text-sm leading-6 text-white/85">
                    {team?.description || 'Chưa có mô tả cho team này.'}
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
                  <Ionicons name="call-outline" size={18} color="#fff" />
                  <Text className="font-medium text-white">
                    {team.contactPhone}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <View className="mt-4 rounded-2xl border border-surface-dark bg-white p-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-bold text-text-primary">
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
                    Leader
                  </Text>
                </View>
              </View>

              {team?.leader ? (
                <>
                  <Text className="mt-3 text-xl font-bold text-text-primary">
                    {team.leader.displayName}
                  </Text>
                  <Text className="mt-1 text-sm text-text-secondary">
                    {team.leader.email}
                  </Text>
                  {renderSkillChips(team.leader.skills)}
                  <View className="mt-4 flex-row gap-3">
                    <TouchableOpacity
                      onPress={() => openEmail(team.leader?.email)}
                      className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-surface-dark py-3"
                    >
                      <Ionicons
                        name="mail-outline"
                        size={18}
                        color={colors.primary}
                      />
                      <Text className="font-semibold text-text-primary">
                        Gửi email
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={onOpenTasks}
                      className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3"
                    >
                      <Ionicons name="map-outline" size={18} color="#fff" />
                      <Text className="font-semibold text-white">
                        {isLeader ? 'Xem nhiệm vụ hiện tại' : 'Xem nhiệm vụ'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <Text className="mt-3 text-base text-text-secondary">
                  Chưa có trưởng nhóm
                </Text>
              )}
            </View>

            <View className="mt-4 rounded-2xl border border-surface-dark bg-white p-4">
              <Text className="text-lg font-bold text-text-primary">
                Moderator quản lý
              </Text>
              {team?.moderator ? (
                <>
                  <Text className="mt-3 text-base font-semibold text-text-primary">
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
                <Text className="mt-3 text-base text-text-secondary">
                  Chưa có moderator
                </Text>
              )}
            </View>

            <View className="mt-4 rounded-2xl border border-surface-dark bg-white p-4">
              <Text className="text-lg font-bold text-text-primary">
                Danh sách đồng đội
              </Text>
              {team?.members?.length ? (
                <View className="mt-4 gap-3">
                  {team.members.map((member) => {
                    const badge = roleStyle(member.role);
                    return (
                      <View
                        key={member.userId}
                        className="rounded-2xl border border-surface-dark bg-background-light p-4"
                      >
                        <View className="flex-row items-start gap-3">
                          <View className="h-12 w-12 items-center justify-center rounded-full bg-surface">
                            <Ionicons
                              name="person"
                              size={22}
                              color={colors.primary}
                            />
                          </View>
                          <View className="flex-1">
                            <View className="flex-row items-center justify-between gap-3">
                              <Text className="flex-1 text-base font-bold text-text-primary">
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
                            <Text className="mt-1 text-sm text-text-secondary">
                              {member.email}
                            </Text>
                            <Text className="mt-2 text-xs text-text-secondary">
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
                <Text className="mt-3 text-base text-text-secondary">
                  Team hiện chưa có thành viên nào
                </Text>
              )}
            </View>

            <View className="mt-4 flex-row gap-3">
              <TouchableOpacity
                onPress={onOpenTasks}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-surface-dark bg-white py-3"
              >
                <Ionicons
                  name="list-outline"
                  size={18}
                  color={colors.primary}
                />
                <Text className="font-semibold text-text-primary">
                  Xem nhiệm vụ team
                </Text>
              </TouchableOpacity>

              {team?.leader?.email ? (
                <TouchableOpacity
                  onPress={() => openEmail(team.leader?.email)}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3"
                >
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={18}
                    color="#fff"
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
