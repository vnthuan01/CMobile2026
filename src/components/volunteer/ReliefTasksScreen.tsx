import '@/global.css';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import TaskCard, { type TaskItem } from '@/src/components/common/TaskCard';
import { useTheme } from '@/src/context/ThemeContext';
import { useActiveAssignedCampaign } from '@/src/hooks/useActiveAssignedCampaign';
import { useAssignedCampaigns } from '@/src/hooks/useAssignedCampaigns';
import { useCampaignDetail } from '@/src/hooks/useDonation';
import {
  useCampaignTaskDetail,
  useCampaignTasks,
  useCampaignTeams,
  useChangeMemberTaskStatus,
} from '@/src/hooks/useLeaderTasks';
import { useMyTeam } from '@/src/hooks/useMyTeam';
import {
  useCampaignHouseholds,
  useDistributionPoints,
} from '@/src/hooks/useReliefDistribution';
import { useAuthStore } from '@/src/store/authStore';
import {
  CampaignTaskStatus,
  MemberTaskStatus,
  TaskPriority,
  type CampaignTaskDetailResponse,
  type CampaignTaskResponse,
  type CampaignTeamResponse,
  type MemberTaskResponse,
} from '@/src/types/leaderTask';
import type { DistributionPointResponse } from '@/src/types/reliefDistribution';
import { showErrorToast, showSuccessToast } from '@/src/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ReliefTasksScreenProps {
  onBack?: () => void;
}

const MEMBER_STATUS_MAP: Record<
  MemberTaskStatus,
  { label: string; color: string; icon: string }
> = {
  [MemberTaskStatus.Assigned]: {
    label: 'Đã giao',
    color: '#6b7280',
    icon: 'person-add',
  },
  [MemberTaskStatus.InProgress]: {
    label: 'Đang làm',
    color: '#1565C0',
    icon: 'time',
  },
  [MemberTaskStatus.Completed]: {
    label: 'Hoàn thành',
    color: '#2e7d32',
    icon: 'checkmark-circle',
  },
  [MemberTaskStatus.Failed]: {
    label: 'Thất bại',
    color: '#d32f2f',
    icon: 'close-circle',
  },
  [MemberTaskStatus.Cancelled]: {
    label: 'Đã hủy',
    color: '#9e9e9e',
    icon: 'ban',
  },
};

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

const dinhDangNgay = (value?: string | null) => {
  if (!value) return 'Chưa xác định';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
};

const getVolunteerDisplayName = (
  memberTask: MemberTaskResponse,
  members?: { volunteerProfileId?: string | null; displayName: string }[],
) => {
  if (memberTask.volunteerName?.trim()) return memberTask.volunteerName.trim();
  const matchedMember = members?.find(
    (member) => member.volunteerProfileId === memberTask.volunteerProfileId,
  );
  return matchedMember?.displayName || 'Chưa rõ tình nguyện viên';
};

export default function ReliefTasksScreen({ onBack }: ReliefTasksScreenProps) {
  const { bottom } = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const { data: myTeamData, isLoading: isTeamLoading } = useMyTeam();
  const team = myTeamData?.team;
  const { data: fallbackAssignedCampaigns, isLoading: isCampaignsLoading } =
    useAssignedCampaigns(team?.teamId ?? '', !!team?.teamId);
  const { activeCampaign, campaignId, assignedCampaigns } =
    useActiveAssignedCampaign(
      team,
      selectedCampaignId || null,
      fallbackAssignedCampaigns || [],
    );
  const { data: campaignDetail } = useCampaignDetail(
    campaignId || undefined,
    !!campaignId,
  );

  const isLeader = useMemo(() => {
    if (!user?.id || !team?.leader?.userId) return false;
    return user.id === team.leader.userId;
  }, [team?.leader?.userId, user?.id]);

  const teamMode = myTeamData?.teamMode ?? 'rescue';

  const { data: campaignTeams = [] } = useCampaignTeams(
    teamMode === 'relief' ? campaignId : null,
  );
  const myCampaignTeam =
    campaignTeams.find(
      (item: CampaignTeamResponse) => item.teamId === team?.teamId,
    ) ?? campaignTeams[0];

  const { data: taskData, isLoading: isTasksLoading } = useCampaignTasks(
    teamMode === 'relief' ? campaignId : null,
    {
      pageIndex: 1,
      pageSize: 50,
      campaignTeamId: myCampaignTeam?.campaignTeamId,
    },
  );

  // Relief distribution data
  const { data: distributionPointsData } = useDistributionPoints(
    teamMode === 'relief' ? campaignId : null,
    { campaignTeamId: myCampaignTeam?.campaignTeamId, pageSize: 50 },
  );
  const distributionPoints = distributionPointsData?.items ?? [];

  const { data: householdsData } = useCampaignHouseholds(
    teamMode === 'relief' ? campaignId : null,
    { campaignTeamId: myCampaignTeam?.campaignTeamId, deliveryMode: 1, pageSize: 50 },
  );
  const households = (householdsData?.items ?? []).filter(
    (household) =>
      (!myCampaignTeam?.campaignTeamId || household.campaignTeamId === myCampaignTeam.campaignTeamId) &&
      household.deliveryMode === 1,
  );
  const pendingHouseholds = households.filter((h) => h.fulfillmentStatus === 0);

  const tasks = taskData?.items ?? [];
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const { data: taskDetail, isLoading: isDetailLoading } =
    useCampaignTaskDetail(selectedTaskId);
  const [activeTab, setActiveTab] = useState<'tasks' | 'points'>('tasks');

  // Identify current user's subtasks
  const myMemberTasks = useMemo(() => {
    if (!taskDetail || !user?.id) return [];
    const detail = taskDetail as CampaignTaskDetailResponse;
    return (detail.memberTasks || []).filter((mt: MemberTaskResponse) => {
      // Match by volunteer name or profile id from team data
      const myMember = team?.members?.find((m) => m.userId === user.id);
      return myMember && mt.volunteerProfileId === myMember.volunteerProfileId;
    });
  }, [taskDetail, user?.id, team?.members]);

  const changeMemberStatusMutation = useChangeMemberTaskStatus();

  useEffect(() => {
    if (!selectedCampaignId && assignedCampaigns.length > 0) {
      setSelectedCampaignId(assignedCampaigns[0].campaignId);
    }
  }, [assignedCampaigns, selectedCampaignId]);

  useEffect(() => {
    if (!selectedTaskId && tasks.length > 0) {
      setSelectedTaskId(tasks[0].campaignTaskId);
    }
  }, [selectedTaskId, tasks]);

  const completed = tasks.filter(
    (task: CampaignTaskResponse) =>
      task.status === CampaignTaskStatus.Completed,
  ).length;
  const inProgress = tasks.filter(
    (task: CampaignTaskResponse) =>
      task.status === CampaignTaskStatus.InProgress,
  ).length;
  const blocked = tasks.filter(
    (task: CampaignTaskResponse) => task.status === CampaignTaskStatus.Blocked,
  ).length;
  const campaignOptions = useMemo(
    () =>
      assignedCampaigns.map((campaign) => ({
        label: campaign.campaignName || campaign.campaignId,
        value: campaign.campaignId,
      })),
    [assignedCampaigns],
  );
  const campaignName =
    campaignDetail?.name ||
    activeCampaign?.campaignName ||
    team?.name ||
    'Đội cứu trợ';
  const campaignStartDate =
    campaignDetail?.startDate || activeCampaign?.startDate;
  const campaignEndDate = campaignDetail?.endDate || activeCampaign?.endDate;
  const groupedMemberTasks = useMemo(() => {
    const groups = new Map<
      string,
      {
        title: string;
        members: MemberTaskResponse[];
        completedCount: number;
        totalCount: number;
      }
    >();

    (
      (taskDetail as CampaignTaskDetailResponse | undefined)?.memberTasks || []
    ).forEach((memberTask: MemberTaskResponse) => {
      const key =
        memberTask.subTaskTitle?.trim().toLowerCase() ||
        memberTask.memberTaskId;
      const existing = groups.get(key);

      if (existing) {
        existing.members.push(memberTask);
        existing.totalCount += 1;
        if (memberTask.status === MemberTaskStatus.Completed)
          existing.completedCount += 1;
        return;
      }

      groups.set(key, {
        title: memberTask.subTaskTitle,
        members: [memberTask],
        completedCount:
          memberTask.status === MemberTaskStatus.Completed ? 1 : 0,
        totalCount: 1,
      });
    });

    return Array.from(groups.values());
  }, [taskDetail]);
  const bottomSheetMaxHeight = Math.round(
    Dimensions.get('window').height * 0.5,
  );

  const handleChangeMemberStatus = async (
    memberTaskId: string,
    newStatus: MemberTaskStatus,
  ) => {
    const statusInfo = MEMBER_STATUS_MAP[newStatus];
    Alert.alert(
      'Xác nhận thay đổi',
      `Bạn muốn đổi trạng thái sang "${statusInfo.label}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              await changeMemberStatusMutation.mutateAsync({
                memberTaskId,
                request: { status: newStatus },
              });
              showSuccessToast(`Đã cập nhật: ${statusInfo.label}`);
            } catch (error: any) {
              showErrorToast('Cập nhật thất bại', error?.message);
            }
          },
        },
      ],
    );
  };

  const openTaskProgress = (campaignTaskId: string) => {
    router.push({
      pathname: '/profile/progress-for-relief' as any,
      params: {
        campaignTaskId,
        initialTab: 'subtask',
      },
    });
  };

  const openDistributionPointDeliveries = (distributionPointId: string) => {
    router.push({
      pathname: '/profile/progress-for-relief' as any,
      params: {
        distributionPointId,
        initialTab: 'delivery',
      },
    });
  };

  const getNextStatusOptions = (
    currentStatus: MemberTaskStatus,
  ): MemberTaskStatus[] => {
    switch (currentStatus) {
      case MemberTaskStatus.Assigned:
        return [MemberTaskStatus.InProgress];
      case MemberTaskStatus.InProgress:
        return [MemberTaskStatus.Completed, MemberTaskStatus.Failed];
      case MemberTaskStatus.Failed:
        return [MemberTaskStatus.InProgress];
      default:
        return [];
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenHeader title="Trung tâm công việc" onBack={onBack} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {isTeamLoading || isCampaignsLoading || isTasksLoading ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : teamMode !== 'relief' ? (
          <View
            className="rounded-2xl border border-dashed p-5"
            style={{ borderColor: colors.border }}
          >
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              Màn hình này dành cho đội cứu trợ
            </Text>
            <Text
              className="mt-2 text-sm"
              style={{ color: colors.textSecondary }}
            >
              Đội cứu hộ sử dụng Trung tâm cứu hộ tại tab nhiệm vụ chung của
              nhóm.
            </Text>
          </View>
        ) : (
          <View className="gap-4">
            {/* Thông tin chiến dịch */}
            <View
              className="rounded-3xl p-5"
              style={{ backgroundColor: colors.secondary }}
            >
              <Text className="text-xs font-semibold text-white/80">
                Chiến dịch hiện tại
              </Text>
              <TouchableOpacity
                onPress={() => setShowCampaignModal(true)}
                activeOpacity={0.85}
                className="bg-white/14 mt-3 rounded-2xl px-4 py-3"
              >
                <View className="flex-row items-center justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-[11px] font-semibold text-white/70">
                      Bấm để đổi chiến dịch
                    </Text>
                    <Text className="mt-1 text-sm font-bold text-white">
                      {campaignName}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={18} color="#fff" />
                </View>
              </TouchableOpacity>
              <Text className="mt-2 text-2xl font-bold text-white">
                {campaignName}
              </Text>
              <Text className="mt-2 text-sm text-white/80">
                Xem công việc của đội và phần việc thành viên được giao bởi nhóm
                trưởng.
              </Text>

              <View className="bg-white/12 mt-3 rounded-2xl px-4 py-3">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="time-outline" size={16} color="#fff" />
                  <Text className="text-xs font-semibold text-white">
                    Thời gian hoạt động chiến dịch
                  </Text>
                </View>
                <Text className="mt-1 text-sm text-white/80">
                  {dinhDangNgay(campaignStartDate)} -{' '}
                  {dinhDangNgay(campaignEndDate)}
                </Text>
              </View>

              <View className="mt-4 flex-row gap-3">
                <SummaryChip label="Tổng việc" value={String(tasks.length)} />
                <SummaryChip label="Đang làm" value={String(inProgress)} />
                <SummaryChip label="Bị chặn" value={String(blocked)} />
                <SummaryChip label="Hoàn thành" value={String(completed)} />
              </View>

              {/* Thống kê nhanh */}
              <View className="mt-3 flex-row gap-3">
                <SummaryChip
                  label="Điểm phát"
                  value={String(distributionPoints.length)}
                />
                <SummaryChip
                  label="Hộ chờ phát"
                  value={String(pendingHouseholds.length)}
                />
              </View>

              {isLeader ? (
                <TouchableOpacity
                  onPress={() => router.push('/profile/allocate-task' as any)}
                  className="mt-4 flex-row items-center justify-center rounded-xl bg-white/20 py-3"
                >
                  <Ionicons name="construct-outline" size={18} color="#fff" />
                  <Text className="ml-2 font-bold text-white">
                    Quản lý & phân phối nhiệm vụ
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Tab selector */}
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setActiveTab('tasks')}
                className="flex-1 items-center rounded-xl py-3"
                style={{
                  backgroundColor:
                    activeTab === 'tasks' ? colors.primary : colors.card,
                  borderWidth: 1,
                  borderColor:
                    activeTab === 'tasks' ? colors.primary : colors.border,
                }}
              >
                <Text
                  className="text-sm font-bold"
                  style={{
                    color:
                      activeTab === 'tasks' ? '#fff' : colors.textSecondary,
                  }}
                >
                  Công việc ({tasks.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab('points')}
                className="flex-1 items-center rounded-xl py-3"
                style={{
                  backgroundColor:
                    activeTab === 'points' ? colors.primary : colors.card,
                  borderWidth: 1,
                  borderColor:
                    activeTab === 'points' ? colors.primary : colors.border,
                }}
              >
                <Text
                  className="text-sm font-bold"
                  style={{
                    color:
                      activeTab === 'points' ? '#fff' : colors.textSecondary,
                  }}
                >
                  Điểm phát ({distributionPoints.length})
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'tasks' ? (
              <>
                {/* Danh sách công việc */}
                <View
                  className="rounded-2xl border p-4"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                  }}
                >
                  <Text
                    className="text-lg font-bold"
                    style={{ color: colors.text }}
                  >
                    Danh sách công việc
                  </Text>
                  <Text
                    className="mt-1 text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    Mỗi công việc có thể được giao cho nhiều thành viên trong
                    đội.
                  </Text>

                  <View className="mt-4 gap-3">
                    {tasks.length > 0 ? (
                      tasks.map((task: CampaignTaskResponse) => (
                        <View key={task.campaignTaskId} className="gap-2">
                          <TaskCard
                            task={toTaskItem(task)}
                            onPress={() => setSelectedTaskId(task.campaignTaskId)}
                          />
                          <TouchableOpacity
                            onPress={() => openTaskProgress(task.campaignTaskId)}
                            className="flex-row items-center justify-center rounded-xl py-3"
                            style={{
                              backgroundColor: `${colors.primary}12`,
                              borderWidth: 1,
                              borderColor: `${colors.primary}33`,
                            }}
                          >
                            <Ionicons name="create-outline" size={16} color={colors.primary} />
                            <Text className="ml-2 text-sm font-bold" style={{ color: colors.primary }}>
                              Cập nhật tiến độ nhiệm vụ này
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ))
                    ) : (
                      <View
                        className="rounded-xl border border-dashed p-4"
                        style={{ borderColor: colors.border }}
                      >
                        <Text style={{ color: colors.textSecondary }}>
                          Nhóm trưởng chưa tạo công việc nào cho đội này.
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Chi tiết công việc và cập nhật trạng thái phần việc */}
                <View
                  className="rounded-2xl border p-4"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                  }}
                >
                  <Text
                    className="text-lg font-bold"
                    style={{ color: colors.text }}
                  >
                    Chi tiết công việc
                  </Text>
                  {isDetailLoading ? (
                    <View className="items-center py-6">
                      <ActivityIndicator color={colors.primary} />
                    </View>
                  ) : !taskDetail ? (
                    <Text
                      className="mt-3"
                      style={{ color: colors.textSecondary }}
                    >
                      Chọn một công việc để xem danh sách phần việc của thành
                      viên.
                    </Text>
                  ) : (
                    <View className="mt-3 gap-3">
                      <Text
                        className="text-base font-bold"
                        style={{ color: colors.text }}
                      >
                        {taskDetail.title}
                      </Text>
                      <Text style={{ color: colors.textSecondary }}>
                        {taskDetail.description || 'Không có mô tả'}
                      </Text>

                      <View className="flex-row flex-wrap gap-2">
                        <StatusPill
                          label={`Bắt đầu: ${formatDate(taskDetail.startDate)}`}
                          color={colors.primary}
                        />
                        <StatusPill
                          label={`Hạn: ${formatDate(taskDetail.dueDate)}`}
                          color={colors.textSecondary}
                        />
                        <StatusPill
                          label={`${taskDetail.completedMemberTaskCount}/${taskDetail.memberTaskCount} hoàn thành`}
                          color={colors.status.completed}
                        />
                      </View>

                      <Text
                        className="mt-2 text-sm font-semibold"
                        style={{ color: colors.text }}
                      >
                        Phần việc thành viên
                      </Text>
                      {(
                        (taskDetail as CampaignTaskDetailResponse)
                          .memberTasks || []
                      ).length > 0 ? (
                        groupedMemberTasks.map((group, index) => (
                          <View
                            key={`${group.title}-${index}`}
                            className="rounded-xl border p-3"
                            style={{ borderColor: colors.border }}
                          >
                            <View className="flex-row items-start justify-between gap-3">
                              <View className="flex-1">
                                <Text
                                  className="font-semibold"
                                  style={{ color: colors.text }}
                                >
                                  {group.title}
                                </Text>
                                <Text
                                  className="mt-1 text-xs"
                                  style={{ color: colors.textSecondary }}
                                >
                                  {group.completedCount}/{group.totalCount}{' '}
                                  thành viên hoàn thành
                                </Text>
                              </View>
                              <View
                                className="rounded-full px-3 py-1"
                                style={{
                                  backgroundColor: `${colors.primary}18`,
                                }}
                              >
                                <Text
                                  className="text-xs font-bold"
                                  style={{ color: colors.primary }}
                                >
                                  {group.totalCount} người
                                </Text>
                              </View>
                            </View>

                            <View className="mt-3 gap-2">
                              {group.members.map((memberTask) => {
                                const statusInfo =
                                  MEMBER_STATUS_MAP[memberTask.status] ||
                                  MEMBER_STATUS_MAP[MemberTaskStatus.Assigned];
                                const nextStatuses = getNextStatusOptions(
                                  memberTask.status,
                                );
                                const isMyTask = myMemberTasks.some(
                                  (mt) =>
                                    mt.memberTaskId === memberTask.memberTaskId,
                                );
                                return (
                                  <View
                                    key={memberTask.memberTaskId}
                                    className="rounded-xl border p-3"
                                    style={{
                                      borderColor: isMyTask
                                        ? colors.secondary
                                        : colors.border,
                                      borderWidth: isMyTask ? 1.5 : 1,
                                      backgroundColor: `${colors.primary}06`,
                                    }}
                                  >
                                    <View className="flex-row items-start justify-between gap-3">
                                      <View className="flex-1">
                                        <View className="flex-row items-center gap-2">
                                          <Text
                                            className="font-semibold"
                                            style={{ color: colors.text }}
                                          >
                                            {getVolunteerDisplayName(
                                              memberTask,
                                              team?.members,
                                            )}
                                          </Text>
                                          {isMyTask && (
                                            <View
                                              className="rounded-full px-2 py-0.5"
                                              style={{
                                                backgroundColor: `${colors.secondary}20`,
                                              }}
                                            >
                                              <Text
                                                className="text-xs font-bold"
                                                style={{
                                                  color: colors.secondary,
                                                }}
                                              >
                                                Của tôi
                                              </Text>
                                            </View>
                                          )}
                                        </View>
                                        <Text
                                          className="mt-1 text-sm"
                                          style={{
                                            color: colors.textSecondary,
                                          }}
                                        >
                                          {memberTask.taskNote ||
                                            'Chưa có ghi chú'}
                                        </Text>
                                      </View>
                                      <View
                                        className="rounded-full px-3 py-1"
                                        style={{
                                          backgroundColor: `${statusInfo.color}18`,
                                        }}
                                      >
                                        <Text
                                          className="text-xs font-bold"
                                          style={{ color: statusInfo.color }}
                                        >
                                          {statusInfo.label}
                                        </Text>
                                      </View>
                                    </View>

                                    {isMyTask && nextStatuses.length > 0 && (
                                      <View className="mt-3 flex-row gap-2">
                                        {nextStatuses.map((ns) => {
                                          const nsInfo = MEMBER_STATUS_MAP[ns];
                                          return (
                                            <TouchableOpacity
                                              key={ns}
                                              onPress={() =>
                                                handleChangeMemberStatus(
                                                  memberTask.memberTaskId,
                                                  ns,
                                                )
                                              }
                                              disabled={
                                                changeMemberStatusMutation.isPending
                                              }
                                              className="flex-1 flex-row items-center justify-center gap-1 rounded-lg border py-2"
                                              style={{
                                                borderColor: nsInfo.color,
                                                backgroundColor: `${nsInfo.color}12`,
                                                opacity:
                                                  changeMemberStatusMutation.isPending
                                                    ? 0.6
                                                    : 1,
                                              }}
                                            >
                                              <Ionicons
                                                name={nsInfo.icon as any}
                                                size={14}
                                                color={nsInfo.color}
                                              />
                                              <Text
                                                className="text-xs font-bold"
                                                style={{ color: nsInfo.color }}
                                              >
                                                {nsInfo.label}
                                              </Text>
                                            </TouchableOpacity>
                                          );
                                        })}
                                      </View>
                                    )}
                                  </View>
                                );
                              })}
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
              </>
            ) : (
              /* Tab điểm phát */
              <View
                className="rounded-2xl border p-4"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                }}
              >
                <Text
                  className="text-lg font-bold"
                  style={{ color: colors.text }}
                >
                  Điểm phát hàng
                </Text>
                <Text
                  className="mt-1 text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Các điểm phân phối hàng cứu trợ trong chiến dịch.
                </Text>
                <View className="mt-4 gap-3">
                  {distributionPoints.length > 0 ? (
                    distributionPoints.map((dp: DistributionPointResponse) => (
                      <TouchableOpacity
                        key={dp.distributionPointId}
                        onPress={() => openDistributionPointDeliveries(dp.distributionPointId)}
                        activeOpacity={0.85}
                        className="rounded-xl border p-4"
                        style={{ borderColor: colors.border }}
                      >
                        <View className="flex-row items-start justify-between">
                          <View className="flex-1">
                            <Text
                              className="font-bold"
                              style={{ color: colors.text }}
                            >
                              {dp.name}
                            </Text>
                            <Text
                              className="mt-1 text-sm"
                              style={{ color: colors.textSecondary }}
                            >
                              {dp.address || 'Chưa có địa chỉ'}
                            </Text>
                          </View>
                          <View
                            className="rounded-full px-2.5 py-1"
                            style={{
                              backgroundColor: dp.isActive
                                ? `${colors.status.completed}18`
                                : `${colors.status.pending}18`,
                            }}
                          >
                            <Text
                              className="text-xs font-bold"
                              style={{
                                color: dp.isActive
                                  ? colors.status.completed
                                  : colors.status.pending,
                              }}
                            >
                              {dp.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                            </Text>
                          </View>
                        </View>

                        <View className="mt-3 flex-row gap-2">
                          <View
                            className="flex-1 items-center rounded-lg p-2"
                            style={{ backgroundColor: `${colors.primary}12` }}
                          >
                            <Text
                              className="text-lg font-bold"
                              style={{ color: colors.primary }}
                            >
                              {dp.assignedHouseholdCount}
                            </Text>
                            <Text
                              className="text-xs"
                              style={{ color: colors.textSecondary }}
                            >
                              Hộ giao
                            </Text>
                          </View>
                          <View
                            className="flex-1 items-center rounded-lg p-2"
                            style={{
                              backgroundColor: `${colors.status.pending}12`,
                            }}
                          >
                            <Text
                              className="text-lg font-bold"
                              style={{ color: colors.status.pending }}
                            >
                              {dp.pendingDeliveryCount}
                            </Text>
                            <Text
                              className="text-xs"
                              style={{ color: colors.textSecondary }}
                            >
                              Chờ phát
                            </Text>
                          </View>
                          <View
                            className="flex-1 items-center rounded-lg p-2"
                            style={{
                              backgroundColor: `${colors.status.completed}12`,
                            }}
                          >
                            <Text
                              className="text-lg font-bold"
                              style={{ color: colors.status.completed }}
                            >
                              {dp.totalDeliveryCount}
                            </Text>
                            <Text
                              className="text-xs"
                              style={{ color: colors.textSecondary }}
                            >
                              Tổng
                            </Text>
                          </View>
                        </View>

                        <View className="mt-2 flex-row items-center gap-1">
                          <Ionicons
                            name="time-outline"
                            size={14}
                            color={colors.textSecondary}
                          />
                          <Text
                            className="text-xs"
                            style={{ color: colors.textSecondary }}
                          >
                            Bắt đầu: {formatDate(dp.startsAt)}{' '}
                            {dp.endsAt ? ` → ${formatDate(dp.endsAt)}` : ''}
                          </Text>
                        </View>

                        <Text
                          className="mt-2 text-xs"
                          style={{ color: colors.textSecondary }}
                        >
                          Chế độ:{' '}
                          {dp.deliveryMode === 0
                            ? 'Giao tận nhà'
                            : 'Nhận tại điểm'}
                        </Text>
                        <View className="mt-3 flex-row items-center justify-between rounded-lg px-3 py-2" style={{ backgroundColor: `${colors.primary}10` }}>
                          <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
                            Xem hộ dân đang chờ phát
                          </Text>
                          <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                        </View>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View
                      className="rounded-xl border border-dashed p-4"
                      style={{ borderColor: colors.border }}
                    >
                      <Text style={{ color: colors.textSecondary }}>
                        Chưa có điểm phát nào được tạo cho chiến dịch này.
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showCampaignModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCampaignModal(false)}
      >
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          onPress={() => setShowCampaignModal(false)}
        >
          <Pressable
            className="rounded-t-3xl px-4 pb-8 pt-4"
            style={{ backgroundColor: colors.card }}
            onPress={(e) => e.stopPropagation()}
          >
            <View>
              <Text
                className="text-lg font-bold"
                style={{ color: colors.text }}
              >
                Chọn chiến dịch
              </Text>
              <Text
                className="mt-1 text-sm"
                style={{ color: colors.textSecondary }}
              >
                Đổi chiến dịch để xem công việc và thống kê tương ứng.
              </Text>
            </View>

            <ScrollView
              className="mt-4"
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: bottomSheetMaxHeight, height: 300 }}
            >
              <View className="gap-3">
                {campaignOptions.map((campaign) => {
                  const selected = campaign.value === selectedCampaignId;
                  return (
                    <TouchableOpacity
                      key={campaign.value}
                      onPress={() => {
                        setSelectedCampaignId(campaign.value);
                        setShowCampaignModal(false);
                      }}
                      className="rounded-2xl border p-4"
                      style={{
                        borderColor: selected ? colors.primary : colors.border,
                        backgroundColor: selected
                          ? `${colors.primary}10`
                          : colors.card,
                      }}
                    >
                      <View className="flex-row items-center justify-between gap-3">
                        <View className="flex-1">
                          <Text
                            className="font-bold"
                            style={{
                              color: selected ? colors.primary : colors.text,
                            }}
                          >
                            {campaign.label}
                          </Text>
                        </View>
                        {selected ? (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={colors.primary}
                          />
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <View className="bg-white/12 flex-1 rounded-2xl px-3 py-2">
      <Text className="text-xs text-white/70">{label}</Text>
      <Text className="mt-1 text-base font-bold text-white">{value}</Text>
    </View>
  );
}

function StatusPill({ label, color }: { label: string; color: string }) {
  return (
    <View
      className="rounded-full px-3 py-1"
      style={{ backgroundColor: `${color}18` }}
    >
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
