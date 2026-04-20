import '@/global.css';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import TaskCard, { type TaskItem } from '@/src/components/common/TaskCard';
import { useTheme } from '@/src/context/ThemeContext';
import {
  useCampaignTaskDetail,
  useCampaignTasks,
  useCampaignTeams,
} from '@/src/hooks/useLeaderTasks';
import { useMyTeam } from '@/src/hooks/useMyTeam';
import {
  CampaignTaskStatus,
  TaskPriority,
  type CampaignTaskDetailResponse,
  type CampaignTaskResponse,
  type CampaignTeamResponse,
  type MemberTaskResponse,
} from '@/src/types/leaderTask';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ReliefTasksScreenProps {
  onBack?: () => void;
}

const toTaskItem = (task: CampaignTaskResponse): TaskItem => ({
  id: task.campaignTaskId,
  title: task.title,
  description: task.description || 'Không có mô tả',
  priority:
    task.priority === TaskPriority.Low
      ? 'low'
      : task.priority === TaskPriority.High
        ? 'high'
        : task.priority === TaskPriority.Critical
          ? 'emergency'
          : 'medium',
  status:
    task.status === CampaignTaskStatus.Completed
      ? 'done'
      : task.status === CampaignTaskStatus.Planned
        ? 'unassigned'
        : 'pending',
  assignee: task.campaignTeamName,
  assigneeCount: 1,
});

export default function ReliefTasksScreen({ onBack }: ReliefTasksScreenProps) {
  const { bottom } = useSafeAreaInsets();
  const { colors } = useTheme();
  const { data: myTeamData, isLoading: isTeamLoading } = useMyTeam();
  const team = myTeamData?.team;
  const teamMode = myTeamData?.teamMode ?? 'rescue';
  const campaignId = team?.assignedCampaigns?.[0]?.campaignId ?? null;

  const { data: campaignTeams = [] } = useCampaignTeams(
    teamMode === 'relief' ? campaignId : null,
  );
  const myCampaignTeam =
    campaignTeams.find((item: CampaignTeamResponse) => item.teamId === team?.teamId) ??
    campaignTeams[0];

  const { data: taskData, isLoading: isTasksLoading } = useCampaignTasks(
    teamMode === 'relief' ? campaignId : null,
    {
      pageIndex: 1,
      pageSize: 50,
      campaignTeamId: myCampaignTeam?.campaignTeamId,
    },
  );

  const tasks = taskData?.items ?? [];
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const { data: taskDetail, isLoading: isDetailLoading } = useCampaignTaskDetail(selectedTaskId);

  useEffect(() => {
    if (!selectedTaskId && tasks.length > 0) {
      setSelectedTaskId(tasks[0].campaignTaskId);
    }
  }, [selectedTaskId, tasks]);

  const completed = tasks.filter((task: CampaignTaskResponse) => task.status === CampaignTaskStatus.Completed).length;
  const inProgress = tasks.filter((task: CampaignTaskResponse) => task.status === CampaignTaskStatus.InProgress).length;
  const blocked = tasks.filter((task: CampaignTaskResponse) => task.status === CampaignTaskStatus.Blocked).length;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenHeader title="Trung tâm công việc" onBack={onBack} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {isTeamLoading || isTasksLoading ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : teamMode !== 'relief' ? (
          <View className="rounded-2xl border border-dashed p-5" style={{ borderColor: colors.border }}>
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              Màn hình này dành cho đội cứu trợ
            </Text>
            <Text className="mt-2 text-sm" style={{ color: colors.textSecondary }}>
              Đội cứu hộ sử dụng Trung tâm cứu hộ tại tab nhiệm vụ chung của nhóm.
            </Text>
          </View>
        ) : (
          <View className="gap-4">
            <View className="rounded-3xl p-5" style={{ backgroundColor: colors.secondary }}>
              <Text className="text-xs font-semibold text-white/80">Chiến dịch hiện tại</Text>
              <Text className="mt-2 text-2xl font-bold text-white">
                {team?.assignedCampaigns?.[0]?.campaignName || team?.name || 'Đội cứu trợ'}
              </Text>
              <Text className="mt-2 text-sm text-white/80">
                Xem công việc của đội và phần việc thành viên được giao bởi nhóm trưởng.
              </Text>

              <View className="mt-4 flex-row gap-3">
                <SummaryChip label="Tổng việc" value={String(tasks.length)} />
                <SummaryChip label="Đang làm" value={String(inProgress)} />
                <SummaryChip label="Bị chặn" value={String(blocked)} />
                <SummaryChip label="Hoàn thành" value={String(completed)} />
              </View>
            </View>

            <View className="rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.card }}>
              <Text className="text-lg font-bold" style={{ color: colors.text }}>
                Danh sách công việc
              </Text>
              <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
                Mỗi công việc có thể được giao cho nhiều thành viên trong đội.
              </Text>

              <View className="mt-4 gap-3">
                {tasks.length > 0 ? (
                  tasks.map((task: CampaignTaskResponse) => (
                    <TaskCard
                      key={task.campaignTaskId}
                      task={toTaskItem(task)}
                      onPress={() => setSelectedTaskId(task.campaignTaskId)}
                    />
                  ))
                ) : (
                  <View className="rounded-xl border border-dashed p-4" style={{ borderColor: colors.border }}>
                    <Text style={{ color: colors.textSecondary }}>
                      Nhóm trưởng chưa tạo công việc nào cho đội này.
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View className="rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.card }}>
              <Text className="text-lg font-bold" style={{ color: colors.text }}>
                Chi tiết công việc
              </Text>
              {isDetailLoading ? (
                <View className="items-center py-6">
                  <ActivityIndicator color={colors.primary} />
                </View>
              ) : !taskDetail ? (
                <Text className="mt-3" style={{ color: colors.textSecondary }}>
                  Chọn một công việc để xem danh sách phần việc của thành viên.
                </Text>
              ) : (
                <View className="mt-3 gap-3">
                  <Text className="text-base font-bold" style={{ color: colors.text }}>
                    {taskDetail.title}
                  </Text>
                  <Text style={{ color: colors.textSecondary }}>
                    {taskDetail.description || 'Không có mô tả'}
                  </Text>

                  <View className="flex-row flex-wrap gap-2">
                    <StatusPill label={`Bắt đầu: ${formatDate(taskDetail.startDate)}`} color={colors.primary} />
                    <StatusPill label={`Hạn: ${formatDate(taskDetail.dueDate)}`} color={colors.textSecondary} />
                    <StatusPill label={`${taskDetail.completedMemberTaskCount}/${taskDetail.memberTaskCount} phần việc hoàn thành`} color={colors.status.completed} />
                  </View>

                  <Text className="mt-2 text-sm font-semibold" style={{ color: colors.text }}>
                    Phần việc thành viên
                  </Text>
                  {((taskDetail as CampaignTaskDetailResponse).memberTasks || []).length > 0 ? (
                    (taskDetail as CampaignTaskDetailResponse).memberTasks.map((memberTask: MemberTaskResponse) => (
                      <View
                        key={memberTask.memberTaskId}
                        className="rounded-xl border p-3"
                        style={{ borderColor: colors.border }}
                      >
                        <View className="flex-row items-start justify-between gap-3">
                          <View className="flex-1">
                            <Text className="font-semibold" style={{ color: colors.text }}>
                              {memberTask.subTaskTitle}
                            </Text>
                            <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
                              {memberTask.volunteerName}
                            </Text>
                            <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
                              {memberTask.taskNote || 'Chưa có ghi chú'}
                            </Text>
                          </View>
                          <View className="rounded-full px-3 py-1" style={{ backgroundColor: `${colors.primary}18` }}>
                            <Text className="text-xs font-bold" style={{ color: colors.primary }}>
                              {memberTask.status === 2 ? 'Đã xong' : memberTask.status === 1 ? 'Đang làm' : 'Đã giao'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={{ color: colors.textSecondary }}>
                      Chưa có phần việc nào được giao cho thành viên.
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-2xl bg-white/12 px-3 py-2">
      <Text className="text-xs text-white/70">{label}</Text>
      <Text className="mt-1 text-base font-bold text-white">{value}</Text>
    </View>
  );
}

function StatusPill({ label, color }: { label: string; color: string }) {
  return (
    <View className="rounded-full px-3 py-1" style={{ backgroundColor: `${color}18` }}>
      <Text className="text-xs font-semibold" style={{ color }}>
        {label}
      </Text>
    </View>
  );
}

function formatDate(value?: string | null) {
  if (!value) return 'Chưa đặt';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN');
}
