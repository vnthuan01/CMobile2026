import '@/global.css';
import { useTheme } from '@/src/context/ThemeContext';
import { useRescueTeamActions } from '@/src/hooks/useRescueTeamActions';
import { rescueTeamService } from '@/src/services/rescueTeamService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type Props = {
  team: any;
  batch: any;
  operationStatusMap: Record<string, string>;
  colors: any;
  isDark: boolean;
  volunteerHomeQuery: { refetch: () => void };
};

export default function RescueHomeContent({
  team,
  batch,
  operationStatusMap,
  colors,
  isDark,
  volunteerHomeQuery,
}: Props) {
  const router = useRouter();
  const { callReporter } = useRescueTeamActions();
  const items = batch?.items ?? [];

  const getEffectiveStatus = useCallback(
    (item: any) => {
      const operationStatus = operationStatusMap[item.rescueRequestId];
      if (item.status === 'Done' || operationStatus === 'RescueCompleted') return 'Done';
      if (item.status === 'InProgress' || ['EnRoute', 'Rescuing'].includes(operationStatus || '')) return 'InProgress';
      if (item.status === 'Cancelled' || ['Cancelled', 'Closed'].includes(operationStatus || '')) return 'Cancelled';
      return 'Pending';
    },
    [operationStatusMap],
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

  const getPriorityLevelLabel = (value?: number | null) => {
    if (value == null) return 'Không có mức ưu tiên';
    if (value === 0) return 'Thấp';
    if (value === 1) return 'Trung bình';
    if (value === 2) return 'Cao';
    if (value === 3) return 'Khẩn cấp';
    return 'Không hợp lệ';
  };

  const getPriorityPointColors = (value?: number | null) => {
    if ((value ?? 0) >= 80) return { bg: '#fee2e2', text: '#b91c1c' };
    if ((value ?? 0) >= 50) return { bg: '#fef3c7', text: '#92400e' };
    return { bg: '#f1f5f9', text: '#334155' };
  };

  return (
    <>
      <View className="mt-6 px-4">
        <SectionTitle title="Trung tâm cứu hộ" subtitle="Tổng quan đội và nhiệm vụ cứu hộ đang hoạt động" />
      </View>

      <View className="mt-4 px-4">
        <Card colors={colors.border} bg={colors.card}>
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <View className="rounded-full px-3 py-1" style={{ backgroundColor: colors.surface }}>
                  <Text className="text-xs font-semibold" style={{ color: colors.textSecondary }}>Đội cứu hộ</Text>
                </View>
              </View>

              <Text className="mt-3 text-xl font-bold" style={{ color: colors.text }}>
                {team?.name || 'Chưa tham gia đội cứu hộ'}
              </Text>

              <Text className="mt-2 text-sm" style={{ color: colors.textSecondary }}>
                {team?.description || 'Tham gia đội để nhận điều phối, nhiệm vụ và cập nhật cứu hộ theo thời gian thực.'}
              </Text>
            </View>

            <View className="h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: `${colors.primary}20` }}>
              <Ionicons name="people" size={24} color={colors.primary} />
            </View>
          </View>

          <View className="mt-4 flex-row gap-3">
            <MiniInfo label="Thành viên" value={String(team?.members?.length ?? 0)} />
            <MiniInfo label="Trưởng nhóm" value={team?.leader?.displayName || '--'} />
          </View>

          {!!team?.contactPhone && (
            <TouchableOpacity onPress={() => callReporter(team.contactPhone)} className="mt-4 h-11 flex-row items-center justify-center gap-2 rounded-xl" style={{ backgroundColor: colors.surface }}>
              <Ionicons name="call-outline" size={18} color={colors.primary} />
              <Text className="font-semibold" style={{ color: colors.text }}>Liên hệ đội cứu hộ</Text>
            </TouchableOpacity>
          )}
        </Card>
      </View>

      {team && (
        <>
          <View className="mt-6 px-4">
            <Text className="mb-3 text-lg font-bold" style={{ color: colors.text }}>Nhiệm vụ hiện tại</Text>

            {currentMission ? (
              <Card colors={colors.border} bg={colors.card}>
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-base font-bold" style={{ color: colors.text }}>
                      #{currentMission.sequenceOrder} · {currentMission.description || 'Nhiệm vụ cứu hộ'}
                    </Text>
                    <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
                      {currentMission.address || 'Chưa có địa chỉ'}
                    </Text>
                  </View>
                  <Badge label={formatMissionStatus(getEffectiveStatus(currentMission))} bg={colors.surface} text={colors.textSecondary} />
                </View>

                <View className="mt-3 flex-row flex-wrap gap-2">
                  <Badge label={`Mức ưu tiên: ${getPriorityLevelLabel(currentMission.priorityLevel)}`} bg="#fef3c7" text="#92400e" />
                  <Badge label={`Điểm ưu tiên: ${currentMission.priorityPoint ?? 0}`} bg={getPriorityPointColors(currentMission.priorityPoint).bg} text={getPriorityPointColors(currentMission.priorityPoint).text} />
                </View>

                <View className="mt-5 flex-row gap-3">
                  <ActionButton label="Mở nhiệm vụ" icon="arrow-forward" primary onPress={() => router.push('/tasks')} />
                  <ActionButton
                    label="Điều hướng"
                    icon="navigate"
                    onPress={() => rescueTeamService.openExternalNavigation(currentMission)}
                    disabled={currentMission.latitude == null || currentMission.longitude == null}
                  />
                </View>

                <View className="mt-3 flex-row gap-3">
                  <ActionButton label="Gọi người báo tin" icon="call" onPress={() => callReporter(currentMission.reporterPhone)} disabled={!currentMission.reporterPhone} />
                  <ActionButton label="Làm mới" icon="refresh" onPress={() => volunteerHomeQuery.refetch()} />
                </View>
              </Card>
            ) : (
              <Card colors={colors.border} bg={colors.card}>
                <View className="items-center py-4">
                  <Text className="mt-3 text-base font-bold" style={{ color: colors.text }}>Chưa có nhiệm vụ đang hoạt động</Text>
                  <Text className="mt-2 text-center text-sm" style={{ color: colors.textSecondary }}>
                    {batch ? 'Đội của bạn hiện chưa được phân công mục tiêu tiếp theo.' : 'Hiện chưa có đợt hoạt động nào được giao cho đội của bạn.'}
                  </Text>
                  <TouchableOpacity onPress={() => volunteerHomeQuery.refetch()} className="mt-4 rounded-xl px-4 py-3" style={{ backgroundColor: colors.primary }}>
                    <Text className="font-semibold text-white">Kiểm tra lại</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            )}
          </View>

          <View className="mt-6 px-4">
            <Text className="mb-3 text-lg font-bold" style={{ color: colors.text }}>Hàng chờ tiếp theo</Text>

            {upcomingMissions.length > 0 ? (
              <View className="gap-3">
                {upcomingMissions.map((mission: any) => (
                  <Card key={mission.rescueBatchItemId} colors={colors.border} bg={colors.card}>
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1">
                        <Text className="text-base font-bold" style={{ color: colors.text }}>
                          #{mission.sequenceOrder} · {mission.description || 'Nhiệm vụ cứu trợ'}
                        </Text>
                        <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
                          {mission.address || 'Chưa có địa chỉ'}
                        </Text>
                      </View>
                      <Badge label={formatMissionStatus(mission.status)} bg={colors.surface} text={colors.textSecondary} />
                    </View>
                    <View className="mt-3 flex-row flex-wrap gap-2">
                      <Badge label={`Mức ưu tiên: ${getPriorityLevelLabel(mission.priorityLevel)}`} bg="#fef3c7" text="#92400e" />
                      <Badge label={`Điểm ưu tiên: ${mission.priorityPoint ?? 0}`} bg={getPriorityPointColors(mission.priorityPoint).bg} text={getPriorityPointColors(mission.priorityPoint).text} />
                    </View>
                  </Card>
                ))}
              </View>
            ) : (
              <Card colors={colors.border} bg={colors.card}>
                <Text className="text-sm" style={{ color: colors.textSecondary }}>Không còn nhiệm vụ nào trong hàng chờ.</Text>
              </Card>
            )}
          </View>
        </>
      )}
    </>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View>
      <Text className="text-xl font-bold" style={{ color: '#111827' }}>{title}</Text>
      <Text className="mt-1 text-sm" style={{ color: '#6b7280' }}>{subtitle}</Text>
    </View>
  );
}

function Card({ children, colors, bg, className = '' }: any) {
  return <View className={`rounded-2xl border p-4 shadow-sm ${className}`} style={{ borderColor: colors, backgroundColor: bg }}>{children}</View>;
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-2xl px-3 py-3" style={{ backgroundColor: '#f8fafc' }}>
      <Text className="text-xs" style={{ color: '#64748b' }}>{label}</Text>
      <Text className="mt-1 text-base font-bold" style={{ color: '#0f172a' }}>{value}</Text>
    </View>
  );
}

function Badge({ label, bg, text }: { label: string; bg: string; text: string }) {
  return <View className="rounded-full px-3 py-1" style={{ backgroundColor: bg }}><Text className="text-xs font-semibold" style={{ color: text }}>{label}</Text></View>;
}

function ActionButton({ label, icon, onPress, primary, disabled }: any) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} className="flex-1 flex-row items-center justify-center gap-2 rounded-xl px-4 py-3" style={{ backgroundColor: primary ? '#1565C0' : '#f1f5f9', opacity: disabled ? 0.5 : 1 }}>
      <Ionicons name={icon} size={18} color={primary ? '#fff' : '#0f172a'} />
      <Text className="font-semibold" style={{ color: primary ? '#fff' : '#0f172a' }}>{label}</Text>
    </TouchableOpacity>
  );
}

function formatMissionStatus(status?: string) {
  const normalized = String(status ?? '').toLowerCase();
  if (normalized.includes('progress')) return 'Đang làm';
  if (normalized.includes('done') || normalized.includes('complete')) return 'Đã xong';
  if (normalized.includes('cancel')) return 'Đã huỷ';
  return 'Chờ xử lý';
}
