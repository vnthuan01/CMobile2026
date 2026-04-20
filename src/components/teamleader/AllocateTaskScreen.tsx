import '@/global.css';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import TaskCard, { type TaskItem } from '@/src/components/common/TaskCard';
import { useTheme } from '@/src/context/ThemeContext';
import {
  useAssignMemberTask,
  useCampaignTaskDetail,
  useCampaignTasks,
  useCampaignTeams,
  useChangeCampaignTaskStatus,
  useCreateCampaignTask,
  useDeleteCampaignTask,
} from '@/src/hooks/useLeaderTasks';
import { useMyTeam } from '@/src/hooks/useMyTeam';
import { CampaignTaskStatus, TaskPriority, type CampaignTaskDetailResponse, type CampaignTaskResponse, type CampaignTeamResponse, type MemberTaskResponse } from '@/src/types/leaderTask';
import type { TeamMemberSummary } from '@/src/types/team';
import { showErrorToast, showSuccessToast } from '@/src/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AllocateTaskScreenProps {
  onBack?: () => void;
}

const PRIORITY_OPTIONS = [
  { id: TaskPriority.Low, label: 'Thấp', color: '#6b7280' },
  { id: TaskPriority.Medium, label: 'Trung bình', color: '#1565C0' },
  { id: TaskPriority.High, label: 'Cao', color: '#F05A53' },
  { id: TaskPriority.Critical, label: 'Khẩn cấp', color: '#D32F2F' },
];

const STATUS_OPTIONS = [
  { id: CampaignTaskStatus.Planned, label: 'Kế hoạch' },
  { id: CampaignTaskStatus.InProgress, label: 'Đang làm' },
  { id: CampaignTaskStatus.Blocked, label: 'Bị chặn' },
  { id: CampaignTaskStatus.Completed, label: 'Hoàn thành' },
  { id: CampaignTaskStatus.Cancelled, label: 'Đã hủy' },
];

const initialsOf = (name?: string) =>
  (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

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

export default function AllocateTaskScreen({ onBack }: AllocateTaskScreenProps) {
  const { bottom } = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { data: myTeamData, isLoading: isTeamLoading } = useMyTeam();
  const team = myTeamData?.team;
  const teamMode = myTeamData?.teamMode ?? 'rescue';
  const campaignId = (team as any)?.assignedCampaigns?.[0]?.campaignId ?? null;
  const { data: campaignTeams = [] } = useCampaignTeams(campaignId);
  const myCampaignTeam = campaignTeams.find((item: CampaignTeamResponse) => item.teamId === team?.teamId) ?? campaignTeams[0];
  const { data: taskData, isLoading: isTasksLoading, refetch } = useCampaignTasks(campaignId, {
    pageIndex: 1,
    pageSize: 50,
    campaignTeamId: myCampaignTeam?.campaignTeamId,
  });

  const tasks = taskData?.items ?? [];
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const { data: taskDetail, isLoading: isDetailLoading } = useCampaignTaskDetail(selectedTaskId);

  useEffect(() => {
    if (!selectedTaskId && tasks.length > 0) {
      setSelectedTaskId(tasks[0].campaignTaskId);
    }
  }, [selectedTaskId, tasks]);

  const createTaskMutation = useCreateCampaignTask(campaignId || '');
  const deleteTaskMutation = useDeleteCampaignTask(campaignId || '');
  const assignMemberTaskMutation = useAssignMemberTask(selectedTaskId || '');
  const changeStatusMutation = useChangeCampaignTaskStatus(selectedTaskId || '');

  const [selectedPriority, setSelectedPriority] = useState(TaskPriority.Medium);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [subTaskTitle, setSubTaskTitle] = useState('');
  const [subTaskNote, setSubTaskNote] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(team?.members?.[0]?.userId ?? null);

  const memberOptions = useMemo(() => team?.members ?? [], [team?.members]);

  const handleCreateTask = async () => {
    if (!campaignId || !myCampaignTeam?.campaignTeamId) {
      showErrorToast('Thiếu campaign', 'Không tìm thấy chiến dịch hiện tại của nhóm.');
      return;
    }
    if (!title.trim()) {
      showErrorToast('Thiếu tiêu đề', 'Vui lòng nhập tên nhiệm vụ.');
      return;
    }
    try {
      await createTaskMutation.mutateAsync({
        campaignTeamId: myCampaignTeam.campaignTeamId,
        title: title.trim(),
        description: description.trim() || undefined,
        startDate: new Date().toISOString(),
        dueDate: dueDate.trim() || undefined,
        priority: selectedPriority,
      });
      showSuccessToast('Đã tạo nhiệm vụ');
      setTitle('');
      setDescription('');
      setDueDate('');
      refetch();
    } catch (error: any) {
      showErrorToast('Không thể tạo nhiệm vụ', error?.message);
    }
  };

  const handleAssignSubtask = async () => {
    if (!selectedTaskId || !selectedMemberId || !subTaskTitle.trim()) {
      showErrorToast('Thiếu dữ liệu', 'Chọn thành viên và nhập tên nhiệm vụ con.');
      return;
    }
    try {
      await assignMemberTaskMutation.mutateAsync({
        volunteerProfileId: selectedMemberId,
        subTaskTitle: subTaskTitle.trim(),
        taskNote: subTaskNote.trim() || undefined,
      });
      showSuccessToast('Đã giao nhiệm vụ con');
      setSubTaskTitle('');
      setSubTaskNote('');
    } catch (error: any) {
      showErrorToast('Không thể giao việc', error?.message);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTaskId) return;
    try {
      await deleteTaskMutation.mutateAsync(selectedTaskId);
      showSuccessToast('Đã xóa nhiệm vụ');
      setSelectedTaskId(null);
      refetch();
    } catch (error: any) {
      showErrorToast('Không thể xóa nhiệm vụ', error?.message);
    }
  };

  const handleChangeStatus = async (status: CampaignTaskStatus) => {
    if (!selectedTaskId) return;
    try {
      await changeStatusMutation.mutateAsync({ status });
      showSuccessToast('Đã cập nhật trạng thái');
      refetch();
    } catch (error: any) {
      showErrorToast('Không thể cập nhật trạng thái', error?.message);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenHeader title="Phân công công việc" onBack={onBack} backgroundColor={colors.secondary} titleColor="#fff" />

      <ScrollView contentContainerStyle={{ paddingBottom: bottom + 40 }} className="flex-1" showsVerticalScrollIndicator={false}>
        {teamMode !== 'relief' ? (
          <View className="m-4 rounded-xl border border-dashed p-4" style={{ borderColor: colors.border }}>
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              Chỉ áp dụng cho đội cứu trợ
            </Text>
            <Text className="mt-2 text-sm" style={{ color: colors.textSecondary }}>
              Đội cứu hộ dùng nhiệm vụ chung của team và không phân rã thành công việc riêng cho từng thành viên tại màn hình này.
            </Text>
          </View>
        ) : null}
        <View className="p-4 gap-4">
          <Text className="text-xl font-bold leading-tight" style={{ color: colors.text }}>Công việc của đội</Text>
          <View className="rounded-xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>Chiến dịch</Text>
            <Text className="mt-1 text-base font-bold" style={{ color: colors.text }}>
              {myCampaignTeam?.campaignName || myCampaignTeam?.teamName || team?.name || 'Chưa có campaign'}
            </Text>
            <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
              {tasks.length} nhiệm vụ • {taskDetail?.completedMemberTaskCount ?? 0}/{taskDetail?.memberTaskCount ?? 0} nhiệm vụ con hoàn thành
            </Text>
          </View>
        </View>

        <View className="px-4 pb-4">
          <Text className="mb-3 text-lg font-bold" style={{ color: colors.text }}>Danh sách công việc</Text>
          {isTeamLoading || isTasksLoading ? (
            <View className="items-center py-10"><ActivityIndicator size="large" color={colors.primary} /></View>
          ) : tasks.length === 0 ? (
            <View className="rounded-xl border border-dashed p-4" style={{ borderColor: colors.border }}>
              <Text style={{ color: colors.textSecondary }}>Chưa có task nào cho đội này.</Text>
            </View>
          ) : (
            <View className="gap-3">
              {tasks.map((task: CampaignTaskResponse) => (
                <TaskCard key={task.campaignTaskId} task={toTaskItem(task)} onPress={() => setSelectedTaskId(task.campaignTaskId)} />
              ))}
            </View>
          )}
        </View>

        <View className="mx-4 mb-4 rounded-xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <Text className="mb-3 text-lg font-bold" style={{ color: colors.text }}>Tạo công việc mới</Text>
          <View className="gap-3">
            <TextInput value={title} onChangeText={setTitle} placeholder="Tên công việc" placeholderTextColor={colors.textSecondary} className="rounded-lg border p-3" style={{ borderColor: colors.border, color: colors.text }} />
            <TextInput value={description} onChangeText={setDescription} placeholder="Mô tả" placeholderTextColor={colors.textSecondary} className="rounded-lg border p-3" style={{ borderColor: colors.border, color: colors.text }} />
            <TextInput value={dueDate} onChangeText={setDueDate} placeholder="Hạn hoàn thành (ISO, tuỳ chọn)" placeholderTextColor={colors.textSecondary} className="rounded-lg border p-3" style={{ borderColor: colors.border, color: colors.text }} />
            <View className="flex-row gap-2">
              {PRIORITY_OPTIONS.map((option) => (
                <TouchableOpacity key={option.id} onPress={() => setSelectedPriority(option.id)} className="flex-1 rounded-lg border p-2 items-center" style={{ borderColor: selectedPriority === option.id ? option.color : colors.border }}>
                  <Text style={{ color: selectedPriority === option.id ? option.color : colors.textSecondary }}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={handleCreateTask} className="rounded-lg py-3 items-center" style={{ backgroundColor: colors.primary }}>
              <Text className="font-bold text-white">Tạo công việc</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mx-4 mb-8 rounded-xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <Text className="mb-3 text-lg font-bold" style={{ color: colors.text }}>Chi tiết nhiệm vụ đang chọn</Text>
          {isDetailLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : !taskDetail ? (
            <Text style={{ color: colors.textSecondary }}>Chọn một task để xem chi tiết.</Text>
          ) : (
            <View className="gap-3">
              <Text className="text-base font-bold" style={{ color: colors.text }}>{taskDetail.title}</Text>
              <Text style={{ color: colors.textSecondary }}>{taskDetail.description || 'Không có mô tả'}</Text>
              <View className="flex-row flex-wrap gap-2">
                {STATUS_OPTIONS.map((status) => (
                  <TouchableOpacity key={status.id} onPress={() => handleChangeStatus(status.id)} className="rounded-full border px-3 py-1.5" style={{ borderColor: colors.border }}>
                    <Text style={{ color: colors.textSecondary }}>{status.label}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={handleDeleteTask} className="rounded-full border px-3 py-1.5" style={{ borderColor: '#ef4444' }}>
                  <Text style={{ color: '#ef4444' }}>Xóa</Text>
                </TouchableOpacity>
              </View>

              <Text className="mt-2 text-sm font-semibold" style={{ color: colors.text }}>Công việc thành viên</Text>
              {((taskDetail as CampaignTaskDetailResponse).memberTasks || []).map((memberTask: MemberTaskResponse) => (
                <View key={memberTask.memberTaskId} className="rounded-lg border p-3" style={{ borderColor: colors.border }}>
                  <Text className="font-semibold" style={{ color: colors.text }}>{memberTask.subTaskTitle}</Text>
                  <Text style={{ color: colors.textSecondary }}>{memberTask.volunteerName}</Text>
                </View>
              ))}

              <View className="mt-2 gap-3">
                <TextInput value={subTaskTitle} onChangeText={setSubTaskTitle} placeholder="Tên công việc giao cho thành viên" placeholderTextColor={colors.textSecondary} className="rounded-lg border p-3" style={{ borderColor: colors.border, color: colors.text }} />
                <TextInput value={subTaskNote} onChangeText={setSubTaskNote} placeholder="Ghi chú" placeholderTextColor={colors.textSecondary} className="rounded-lg border p-3" style={{ borderColor: colors.border, color: colors.text }} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                  {memberOptions.map((member: TeamMemberSummary) => {
                    const selected = selectedMemberId === member.userId;
                    return (
                      <TouchableOpacity key={member.userId} onPress={() => setSelectedMemberId(member.userId)} className="items-center" style={{ opacity: selected ? 1 : 0.65 }}>
                        <View className="h-12 w-12 items-center justify-center rounded-full border-2" style={{ borderColor: selected ? colors.secondary : 'transparent', backgroundColor: isDark ? '#374151' : '#e5e7eb' }}>
                          <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>{initialsOf(member.displayName)}</Text>
                        </View>
                        <Text className="mt-1 text-xs" style={{ color: selected ? colors.secondary : colors.textSecondary }}>{member.displayName}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <TouchableOpacity onPress={handleAssignSubtask} className="flex-row items-center justify-center rounded-lg py-3" style={{ backgroundColor: colors.secondary }}>
                  <Ionicons name="send" size={16} color="#fff" />
                  <Text className="ml-2 font-bold text-white">Giao việc cho thành viên</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
