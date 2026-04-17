import '@/global.css';
import { useTheme } from '@/src/context/ThemeContext';
import { useVolunteerHomeOverview } from '@/src/hooks/useTeamOverview';
import { rescueTeamService } from '@/src/services/rescueTeamService';
import { showErrorToast, showInfoToast } from '@/src/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

export default function VolunteerHomeContent() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const volunteerHomeQuery = useVolunteerHomeOverview();

  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const team = volunteerHomeQuery.data?.team ?? null;
  const batch = volunteerHomeQuery.data?.batch ?? null;
  const operationStatusMap = volunteerHomeQuery.data?.operationStatusMap ?? {};
  const loading = volunteerHomeQuery.isLoading || volunteerHomeQuery.isFetching;
  const errorMessage = volunteerHomeQuery.error?.message ?? null;

  useEffect(() => {
    volunteerHomeQuery.refetch();
  }, []);

  useEffect(() => {
    if (team || batch) {
      setHasLoadedOnce(true);
    }

    if (
      !volunteerHomeQuery.isLoading &&
      volunteerHomeQuery.data?.isEmpty &&
      hasLoadedOnce
    ) {
      showInfoToast('Chưa có đội', 'Bạn chưa thuộc đội nào.');
    } else if (
      !volunteerHomeQuery.isLoading &&
      errorMessage &&
      hasLoadedOnce
    ) {
      showErrorToast('Không tải được dữ liệu', errorMessage);
    }
  }, [
    batch,
    errorMessage,
    hasLoadedOnce,
    team,
    volunteerHomeQuery.data?.isEmpty,
    volunteerHomeQuery.isLoading,
  ]);

  const items = batch?.items ?? [];

  const getEffectiveStatus = useCallback(
    (item: (typeof items)[number]) => {
      const operationStatus = operationStatusMap[item.rescueRequestId];

      if (item.status === 'Done' || operationStatus === 'RescueCompleted') {
        return 'Done';
      }

      if (
        item.status === 'InProgress' ||
        ['EnRoute', 'Rescuing'].includes(operationStatus || '')
      ) {
        return 'InProgress';
      }

      if (
        item.status === 'Cancelled' ||
        ['Cancelled', 'Closed'].includes(operationStatus || '')
      ) {
        return 'Cancelled';
      }

      return 'Pending';
    },
    [items, operationStatusMap],
  );

  const currentMission = useMemo(
    () =>
      items.find((item: any) => getEffectiveStatus(item) === 'InProgress') ||
      items.find((item: any) => getEffectiveStatus(item) !== 'Done') ||
      null,
    [getEffectiveStatus, items],
  );

  const upcomingMissions = useMemo(
    () =>
      items
        .filter(
          (item: any) =>
            item.rescueBatchItemId !== currentMission?.rescueBatchItemId &&
            getEffectiveStatus(item) !== 'Done' &&
            getEffectiveStatus(item) !== 'Cancelled',
        )
        .slice(0, 3),
    [currentMission?.rescueBatchItemId, getEffectiveStatus, items],
  );

  const stats = useMemo(() => {
    const done = items.filter(
      (item: any) => getEffectiveStatus(item) === 'Done',
    ).length;
    const inProgress = items.filter(
      (item: any) => getEffectiveStatus(item) === 'InProgress',
    ).length;
    const pending = items.filter(
      (item: any) => getEffectiveStatus(item) === 'Pending',
    ).length;
    const emergency = items.filter(
      (item: any) => item.rescueRequestType === 'Emergency',
    ).length;

    return { done, inProgress, pending, emergency, total: items.length };
  }, [getEffectiveStatus, items]);

  const batchProgress =
    stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  const getPriorityLevelLabel = (value?: number | null) => {
    if (value == null) return 'Không có mức ưu tiên';
    if (value === 0) return 'Thấp';
    if (value === 1) return 'Trung bình';
    if (value === 2) return 'Cao';
    if (value === 3) return 'Khẩn cấp';
    return 'Không hợp lệ';
  };

  const getPriorityPointColors = (value?: number | null) => {
    if ((value ?? 0) >= 80) {
      return { bg: '#fee2e2', text: '#b91c1c' };
    }
    if ((value ?? 0) >= 50) {
      return { bg: '#fef3c7', text: '#92400e' };
    }
    return { bg: '#f1f5f9', text: '#334155' };
  };

  return (
    <View style={{ paddingBottom: 20 }}>
      <View className="mt-6 px-4">
        <SectionTitle
          title="Trung tâm tình nguyện"
          subtitle="Tổng quan đội và nhiệm vụ đang hoạt động"
        />
      </View>

      <View className="mt-4 px-4">
        <Card colors={colors.border} bg={colors.card}>
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <View
                  className="rounded-full px-3 py-1"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: colors.textSecondary }}
                  >
                    {team?.status || 'Chưa có đội'}
                  </Text>
                </View>
              </View>

              <Text
                className="mt-3 text-xl font-bold"
                style={{ color: colors.text }}
              >
                {team?.name || 'Chưa tham gia đội cứu hộ'}
              </Text>

              <Text
                className="mt-2 text-sm"
                style={{ color: colors.textSecondary }}
              >
                {team?.description ||
                  'Tham gia đội để nhận điều phối, nhiệm vụ và cập nhật cứu trợ theo thời gian thực.'}
              </Text>
            </View>

            <View
              className="h-12 w-12 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: `${colors.primary}20`,
              }}
            >
              <Ionicons name="people" size={24} color={colors.primary} />
            </View>
          </View>

          <View className="mt-4 flex-row gap-3">
            <MiniInfo
              label="Thành viên"
              value={String(team?.members?.length ?? 0)}
            />
            <MiniInfo
              label="Trưởng nhóm"
              value={team?.leader?.displayName || '--'}
            />
          </View>

          {!!team?.contactPhone && (
            <TouchableOpacity
              onPress={() =>
                rescueTeamService.openCallReporter(team.contactPhone)
              }
              className="mt-4 h-11 flex-row items-center justify-center gap-2 rounded-xl"
              style={{ backgroundColor: colors.surface }}
            >
              <Ionicons name="call-outline" size={18} color={colors.primary} />
              <Text className="font-semibold" style={{ color: colors.text }}>
                Liên hệ đội cứu hộ
              </Text>
            </TouchableOpacity>
          )}
        </Card>
      </View>

      {loading ? (
        <View className="mt-6 px-4">
          <Card colors={colors.border} bg={colors.card}>
            <View className="items-center py-8">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text
                className="mt-3 text-sm"
                style={{ color: colors.textSecondary }}
              >
                Đang tải nhiệm vụ và thông tin đội...
              </Text>
            </View>
          </Card>
        </View>
      ) : (
        <>
          {!!errorMessage && !team && (
            <View className="mt-6 px-4">
              <Card
                colors={colors.status.error}
                bg={
                  isDark
                    ? `${colors.status.error}20`
                    : `${colors.status.error}10`
                }
              >
                <View className="flex-row items-start gap-3">
                  <Ionicons
                    name="alert-circle"
                    size={22}
                    color={colors.status.error}
                  />
                  <View className="flex-1">
                    <Text
                      className="text-base font-bold"
                      style={{ color: colors.text }}
                    >
                      Không tải được dữ liệu
                    </Text>
                    <TouchableOpacity
                      onPress={() => volunteerHomeQuery.refetch()}
                      className="mt-4 self-start rounded-lg px-4 py-2"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Text className="font-semibold text-white">Thử lại</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            </View>
          )}

          {team && (
            <>
              <View className="mt-6 px-4">
                {/* <Text
                  className="mb-3 text-lg font-bold"
                  style={{ color: colors.text }}
                >
                  Tiến độ đợt hoạt động
                </Text>
                <View className="flex-row flex-wrap gap-3">
                  <StatCard
                    icon="checkmark-circle"
                    label="Hoàn thành"
                    value={String(stats.done)}
                    color="green"
                  />
                  <StatCard
                    icon="time"
                    label="Đang thực hiện"
                    value={String(stats.inProgress)}
                    color="blue"
                  />
                  <StatCard
                    icon="list"
                    label="Chờ xử lý"
                    value={String(stats.pending)}
                    color="orange"
                  />
                  <StatCard
                    icon="alert-circle"
                    label="Khẩn cấp"
                    value={String(stats.emergency)}
                    color="red"
                  />
                </View> */}

                {/* <Card colors={colors.border} bg={colors.card} className="mt-3">
                  <View className="flex-row items-center justify-between">
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: colors.text }}
                    >
                      Hoàn tất {stats.done}/{stats.total || 0} nhiệm vụ
                    </Text>
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: colors.primary }}
                    >
                      {batchProgress}%
                    </Text>
                  </View>
                  <View
                    className="mt-3 h-2 overflow-hidden rounded-full"
                     style={{ backgroundColor: colors.border }}
                  >
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${batchProgress}%`,
                        backgroundColor: colors.primary,
                      }}
                    />
                  </View>
                </Card> */}
              </View>

              <View className="mt-6 px-4">
                <Text
                  className="mb-3 text-lg font-bold"
                  style={{ color: colors.text }}
                >
                  Nhiệm vụ hiện tại
                </Text>

                {currentMission ? (
                  <Card colors={colors.border} bg={colors.card}>
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1">
                        <View className="mb-2 flex-row flex-wrap items-center gap-2">
                          <Badge
                            label={getPriorityLabel(
                              currentMission.rescueRequestType,
                            )}
                            bg={
                              currentMission.rescueRequestType === 'Emergency'
                                ? `${colors.status.error}22`
                                : `${colors.status.incoming}22`
                            }
                            text={
                              currentMission.rescueRequestType === 'Emergency'
                                ? colors.status.error
                                : colors.status.incoming
                            }
                          />
                          <Badge
                            label={formatMissionStatus(currentMission.status)}
                            bg={colors.surface}
                            text={colors.textSecondary}
                          />
                          <Badge
                            label={`Mức ưu tiên: ${getPriorityLevelLabel(currentMission.priorityLevel)}`}
                            bg="#fef3c7"
                            text="#92400e"
                          />
                          <Badge
                            label={`Điểm ưu tiên: ${currentMission.priorityPoint ?? 0}`}
                            bg={
                              getPriorityPointColors(
                                currentMission.priorityPoint,
                              ).bg
                            }
                            text={
                              getPriorityPointColors(
                                currentMission.priorityPoint,
                              ).text
                            }
                          />
                        </View>

                        <Text
                          className="text-lg font-bold"
                          style={{ color: colors.text }}
                        >
                          {currentMission.description || 'Nhiệm vụ cứu trợ'}
                        </Text>

                        <Text
                          className="mt-2 text-sm"
                          style={{ color: colors.textSecondary }}
                        >
                          {currentMission.address || 'Chưa có địa chỉ cụ thể'}
                        </Text>

                        <View className="mt-4 gap-2">
                          <MissionMetaRow
                            icon="person-outline"
                            text={
                              currentMission.reporterFullName ||
                              'Chưa có người báo tin'
                            }
                          />
                          <MissionMetaRow
                            icon="navigate-outline"
                            text={formatDistanceEta(
                              currentMission.distanceKm,
                              currentMission.estimatedMinutes,
                            )}
                          />
                        </View>
                      </View>

                      <View
                        className="h-12 w-12 items-center justify-center rounded-2xl"
                        style={{
                          backgroundColor: colors.surface,
                        }}
                      >
                        <Ionicons
                          name="compass"
                          size={24}
                          color={colors.primary}
                        />
                      </View>
                    </View>

                    <View className="mt-5 flex-row gap-3">
                      <ActionButton
                        label="Mở nhiệm vụ"
                        icon="arrow-forward"
                        primary
                        onPress={() => router.push('/tasks')}
                      />
                      <ActionButton
                        label="Điều hướng"
                        icon="navigate"
                        onPress={() =>
                          rescueTeamService.openExternalNavigation(
                            currentMission,
                          )
                        }
                        disabled={
                          currentMission.latitude == null ||
                          currentMission.longitude == null
                        }
                      />
                    </View>

                    <View className="mt-3 flex-row gap-3">
                      <ActionButton
                        label="Gọi người báo tin"
                        icon="call"
                        onPress={() =>
                          rescueTeamService.openCallReporter(
                            currentMission.reporterPhone,
                          )
                        }
                        disabled={!currentMission.reporterPhone}
                      />
                      <ActionButton
                        label="Làm mới"
                        icon="refresh"
                        onPress={() => volunteerHomeQuery.refetch()}
                      />
                    </View>
                  </Card>
                ) : (
                  <Card colors={colors.border} bg={colors.card}>
                    <View className="items-center py-4">
                      {/* <Ionicons
                        name="checkmark-done-circle-outline"
                        size={36}
                        color={colors.primary}
                      /> */}
                      <Text
                        className="mt-3 text-base font-bold"
                        style={{ color: colors.text }}
                      >
                        Chưa có nhiệm vụ đang hoạt động
                      </Text>
                      <Text
                        className="mt-2 text-center text-sm"
                        style={{ color: colors.textSecondary }}
                      >
                        {batch
                          ? 'Đội của bạn hiện chưa được phân công mục tiêu tiếp theo.'
                          : 'Hiện chưa có đợt hoạt động nào được giao cho đội của bạn.'}
                      </Text>
                      <TouchableOpacity
                        onPress={() => volunteerHomeQuery.refetch()}
                        className="mt-4 rounded-xl px-4 py-3"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <Text className="font-semibold text-white">
                          Kiểm tra lại
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                )}
              </View>

              <View className="mt-6 px-4">
                <Text
                  className="mb-3 text-lg font-bold"
                  style={{ color: colors.text }}
                >
                  Hàng chờ tiếp theo
                </Text>

                {upcomingMissions.length > 0 ? (
                  <View className="gap-3">
                    {upcomingMissions.map((mission: any) => (
                      <Card
                        key={mission.rescueBatchItemId}
                        colors={colors.border}
                        bg={colors.card}
                      >
                        <View className="flex-row items-start justify-between gap-3">
                          <View className="flex-1">
                            <Text
                              className="text-base font-bold"
                              style={{ color: colors.text }}
                            >
                              #{mission.sequenceOrder} ·{' '}
                              {mission.description || 'Nhiệm vụ cứu trợ'}
                            </Text>
                            <Text
                              className="mt-1 text-sm"
                              style={{ color: colors.textSecondary }}
                            >
                              {mission.address || 'Chưa có địa chỉ'}
                            </Text>
                          </View>
                          <Badge
                            label={formatMissionStatus(mission.status)}
                            bg={colors.surface}
                            text={colors.textSecondary}
                          />
                        </View>
                        <View className="mt-3 flex-row flex-wrap gap-2">
                          <Badge
                            label={`Mức ưu tiên: ${getPriorityLevelLabel(mission.priorityLevel)}`}
                            bg="#fef3c7"
                            text="#92400e"
                          />
                          <Badge
                            label={`Điểm ưu tiên: ${mission.priorityPoint ?? 0}`}
                            bg={
                              getPriorityPointColors(mission.priorityPoint).bg
                            }
                            text={
                              getPriorityPointColors(mission.priorityPoint).text
                            }
                          />
                        </View>
                      </Card>
                    ))}
                  </View>
                ) : (
                  <Card colors={colors.border} bg={colors.card}>
                    <Text
                      className="text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      Không còn nhiệm vụ chờ xử lý tiếp theo.
                    </Text>
                  </Card>
                )}
              </View>

              <View className="mt-6 px-4">
                <Text
                  className="mb-3 text-lg font-bold"
                  style={{ color: colors.text }}
                >
                  Thao tác nhanh
                </Text>
                <View className="flex-row flex-wrap gap-3">
                  <QuickAction
                    icon="list"
                    label="Toàn bộ nhiệm vụ"
                    onPress={() => router.push('/tasks')}
                  />
                  <QuickAction
                    icon="map"
                    label="Bản đồ điều phối"
                    onPress={() =>
                      router.push(
                        currentMission
                          ? { pathname: '/tasks', params: { openMap: '1' } }
                          : '/tasks',
                      )
                    }
                  />
                  <QuickAction
                    icon="heart"
                    label="Ủng hộ cứu trợ"
                    onPress={() => router.push('/fundraising')}
                  />
                  <QuickAction
                    icon="refresh"
                    label="Làm mới dữ liệu"
                    onPress={() => volunteerHomeQuery.refetch()}
                  />
                </View>
              </View>
            </>
          )}
        </>
      )}
    </View>
  );
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const { colors } = useTheme();

  return (
    <View>
      <Text className="text-xl font-bold" style={{ color: colors.text }}>
        {title}
      </Text>
      <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
        {subtitle}
      </Text>
    </View>
  );
}

function Card({
  children,
  colors,
  bg,
  className = '',
}: {
  children: React.ReactNode;
  colors: string;
  bg: string;
  className?: string;
}) {
  return (
    <View
      className={`rounded-2xl border p-4 shadow-sm ${className}`}
      style={{ borderColor: colors, backgroundColor: bg }}
    >
      {children}
    </View>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  const { colors, isDark } = useTheme();

  return (
    <View
      className="flex-1 rounded-xl p-3"
      style={{ backgroundColor: colors.surface }}
    >
      <Text className="text-xs" style={{ color: colors.textSecondary }}>
        {label}
      </Text>
      <Text
        className="mt-1 text-sm font-semibold"
        style={{ color: colors.text }}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

function Badge({
  label,
  bg,
  text,
}: {
  label: string;
  bg: string;
  text: string;
}) {
  return (
    <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: bg }}>
      <Text className="text-xs font-semibold" style={{ color: text }}>
        {label}
      </Text>
    </View>
  );
}

function MissionMetaRow({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  const { colors } = useTheme();

  return (
    <View className="flex-row items-center gap-2">
      <Ionicons name={icon} size={16} color={colors.textSecondary} />
      <Text className="flex-1 text-sm" style={{ color: colors.textSecondary }}>
        {text}
      </Text>
    </View>
  );
}

function ActionButton({
  label,
  icon,
  onPress,
  primary,
  disabled,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  const { colors, isDark } = useTheme();

  const backgroundColor = disabled
    ? colors.surface
    : primary
      ? colors.primary
      : colors.surface;

  const iconColor = disabled
    ? colors.textSecondary
    : primary
      ? colors.white
      : colors.primary;

  const textColor = disabled
    ? colors.textSecondary
    : primary
      ? colors.white
      : colors.text;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className="h-11 flex-1 flex-row items-center justify-center gap-2 rounded-xl px-3"
      style={{ backgroundColor }}
    >
      <Ionicons name={icon} size={16} color={iconColor} />
      <Text
        className="text-sm font-semibold"
        style={{ color: textColor }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      className="h-28 w-[48%] items-center justify-center gap-2 rounded-2xl border shadow-sm"
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
    >
      <Ionicons name={icon} size={26} color={colors.primary} />
      <Text className="text-sm font-semibold" style={{ color: colors.text }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: 'green' | 'blue' | 'orange' | 'red';
}) {
  const { colors, isDark } = useTheme();

  let backgroundColor = isDark ? '#111827' : '#ffffff';
  let iconColor = colors.primary;

  if (color === 'green') {
    backgroundColor = isDark ? 'rgba(34,197,94,0.15)' : '#f0fdf4';
    iconColor = isDark ? '#4ade80' : '#16a34a';
  } else if (color === 'blue') {
    backgroundColor = isDark ? 'rgba(59,130,246,0.15)' : '#eff6ff';
    iconColor = isDark ? '#60a5fa' : '#2563eb';
  } else if (color === 'orange') {
    backgroundColor = isDark ? 'rgba(249,115,22,0.15)' : '#fff7ed';
    iconColor = isDark ? '#fb923c' : '#ea580c';
  } else {
    backgroundColor = isDark ? 'rgba(239,68,68,0.15)' : '#fef2f2';
    iconColor = isDark ? '#f87171' : '#dc2626';
  }

  return (
    <View
      className="w-[48%] rounded-2xl border p-4"
      style={{ backgroundColor, borderColor: colors.border }}
    >
      <Ionicons name={icon} size={24} color={iconColor} />
      <Text className="mt-3 text-2xl font-bold" style={{ color: colors.text }}>
        {value}
      </Text>
      <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
        {label}
      </Text>
    </View>
  );
}

function formatMissionStatus(status?: string) {
  switch (status) {
    case 'InProgress':
      return 'Đang thực hiện';
    case 'Pending':
      return 'Chờ xử lý';
    case 'Done':
      return 'Hoàn thành';
    case 'Cancelled':
      return 'Đã hủy';
    default:
      return status || 'Chưa rõ';
  }
}

function getPriorityLabel(type?: string) {
  return type === 'Emergency' ? 'Ưu tiên cao' : 'Nhiệm vụ thường';
}

function formatDistanceEta(
  distanceKm?: number | null,
  estimatedMinutes?: number | null,
) {
  const distanceText =
    distanceKm != null ? `${distanceKm.toFixed(1)} km` : 'Chưa có khoảng cách';
  const etaText =
    estimatedMinutes != null ? `${estimatedMinutes} phút` : 'chưa có ETA';

  return `${distanceText} · ${etaText}`;
}
