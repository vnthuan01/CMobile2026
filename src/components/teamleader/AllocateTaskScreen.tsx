import '@/global.css';
import CustomDropdown from '@/src/components/CustomDropdown';
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
import { useActiveAssignedCampaign } from '@/src/hooks/useActiveAssignedCampaign';
import { useAssignedCampaigns } from '@/src/hooks/useAssignedCampaigns';
import { useMyTeam } from '@/src/hooks/useMyTeam';
import { CampaignTaskStatus, TaskPriority, type CampaignTaskDetailResponse, type CampaignTaskResponse, type CampaignTeamResponse, type MemberTaskResponse } from '@/src/types/leaderTask';
import type { TeamMemberSummary } from '@/src/types/team';
import { showErrorToast, showSuccessToast } from '@/src/utils/toast';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AllocateTaskScreenProps {
  onBack?: () => void;
}

type CreateSubtaskDraft = {
  id: string;
  volunteerProfileId: string;
  volunteerName: string;
  subTaskTitle: string;
  taskNote: string;
};

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
  const scrollRef = useRef<ScrollView>(null);
  const detailSectionYRef = useRef(0);
  const { data: myTeamData, isLoading: isTeamLoading } = useMyTeam();
  const team = myTeamData?.team;
  const teamMode = myTeamData?.teamMode ?? 'rescue';
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const { data: fallbackAssignedCampaigns = [] } = useAssignedCampaigns(team?.teamId, !!team?.teamId);
  const { activeCampaign, assignedCampaigns, campaignId } = useActiveAssignedCampaign(
    team,
    selectedCampaignId || null,
    fallbackAssignedCampaigns,
  );
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

  useEffect(() => {
    setSelectedTaskId(tasks[0]?.campaignTaskId ?? null);
  }, [campaignId]);

  const createTaskMutation = useCreateCampaignTask();
  const deleteTaskMutation = useDeleteCampaignTask();
  const assignMemberTaskMutation = useAssignMemberTask();
  const changeStatusMutation = useChangeCampaignTaskStatus();

  const [selectedPriority, setSelectedPriority] = useState(TaskPriority.Medium);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateObj, setDateObj] = useState(new Date());
  const [createSubtaskTitle, setCreateSubtaskTitle] = useState('');
  const [createSubtaskNote, setCreateSubtaskNote] = useState('');
  const [createSelectedMemberId, setCreateSelectedMemberId] = useState<string | null>(team?.members?.[0]?.userId ?? null);
  const [createSubtasks, setCreateSubtasks] = useState<CreateSubtaskDraft[]>([]);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [detailSubTaskTitle, setDetailSubTaskTitle] = useState('');
  const [detailSubTaskNote, setDetailSubTaskNote] = useState('');
  const [detailSelectedMemberId, setDetailSelectedMemberId] = useState<string | null>(team?.members?.[0]?.userId ?? null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isAssigningMemberTask, setIsAssigningMemberTask] = useState(false);

  const memberOptions = useMemo(() => team?.members ?? [], [team?.members]);
  const campaignOptions = useMemo(
    () =>
      assignedCampaigns.map((campaign: { campaignName?: string | null; campaignId: string }) => ({
        label: campaign.campaignName || campaign.campaignId,
        value: campaign.campaignId,
      })),
    [assignedCampaigns],
  );

  useEffect(() => {
    if (!selectedCampaignId && assignedCampaigns.length > 0) {
      setSelectedCampaignId(assignedCampaigns[0].campaignId);
    }
  }, [assignedCampaigns, selectedCampaignId]);

  useEffect(() => {
    if (!createSelectedMemberId && team?.members?.length) {
      setCreateSelectedMemberId(team.members[0].userId);
    }
    if (!detailSelectedMemberId && team?.members?.length) {
      setDetailSelectedMemberId(team.members[0].userId);
    }
  }, [createSelectedMemberId, detailSelectedMemberId, team?.members]);

  const addCreateSubtask = () => {
    if (!createSelectedMemberId || !createSubtaskTitle.trim()) {
      showErrorToast('Thiếu dữ liệu', 'Chọn thành viên và nhập tên phần việc trước khi thêm.');
      return;
    }

    const normalizedTitle = createSubtaskTitle.trim().toLowerCase();
    const duplicate = createSubtasks.some(
      (item) =>
        item.id !== editingDraftId &&
        item.volunteerProfileId === createSelectedMemberId &&
        item.subTaskTitle.trim().toLowerCase() === normalizedTitle,
    );

    if (duplicate) {
      showErrorToast('Phần việc bị trùng', 'Không được tạo trùng cùng thành viên và cùng tên phần việc.');
      return;
    }

    const member = memberOptions.find((item: TeamMemberSummary) => item.userId === createSelectedMemberId);
    setCreateSubtasks((prev) => {
      if (editingDraftId) {
        return prev.map((item) =>
          item.id === editingDraftId
            ? {
                ...item,
                volunteerProfileId: createSelectedMemberId,
                volunteerName: member?.displayName || 'Thành viên',
                subTaskTitle: createSubtaskTitle.trim(),
                taskNote: createSubtaskNote.trim(),
              }
            : item,
        );
      }

      return [
        ...prev,
        {
          id: `${createSelectedMemberId}-${Date.now()}`,
          volunteerProfileId: createSelectedMemberId,
          volunteerName: member?.displayName || 'Thành viên',
          subTaskTitle: createSubtaskTitle.trim(),
          taskNote: createSubtaskNote.trim(),
        },
      ];
    });
    setCreateSubtaskTitle('');
    setCreateSubtaskNote('');
    setEditingDraftId(null);
  };

  const removeCreateSubtask = (id: string) => {
    setCreateSubtasks((prev) => prev.filter((item) => item.id !== id));
    if (editingDraftId === id) {
      setEditingDraftId(null);
      setCreateSubtaskTitle('');
      setCreateSubtaskNote('');
    }
  };

  const editCreateSubtask = (draft: CreateSubtaskDraft) => {
    setEditingDraftId(draft.id);
    setCreateSelectedMemberId(draft.volunteerProfileId);
    setCreateSubtaskTitle(draft.subTaskTitle);
    setCreateSubtaskNote(draft.taskNote);
  };

  const handleCreateTask = async () => {
    if (!campaignId || !myCampaignTeam?.campaignTeamId) {
      showErrorToast('Thiếu campaign', 'Không tìm thấy chiến dịch hiện tại của nhóm.');
      return;
    }
    if (!title.trim()) {
      showErrorToast('Thiếu tiêu đề', 'Vui lòng nhập tên nhiệm vụ.');
      return;
    }
    setIsCreatingTask(true);
    try {
      const createdTask = await createTaskMutation.mutateAsync({
        campaignId,
        request: {
          campaignTeamId: myCampaignTeam.campaignTeamId,
          title: title.trim(),
          description: description.trim() || undefined,
          startDate: new Date().toISOString(),
          dueDate: dueDate || undefined,
          priority: selectedPriority,
        },
      });

      if (createdTask?.campaignTaskId && createSubtasks.length > 0) {
        await Promise.all(
          createSubtasks.map((subtask) =>
            assignMemberTaskMutation.mutateAsync({
              campaignTaskId: createdTask.campaignTaskId,
              request: {
                volunteerProfileId: subtask.volunteerProfileId,
                subTaskTitle: subtask.subTaskTitle,
                taskNote: subtask.taskNote || undefined,
              },
            }),
          ),
        );
      }

      showSuccessToast('Đã tạo nhiệm vụ');
      if (createdTask?.campaignTaskId) {
        setSelectedTaskId(createdTask.campaignTaskId);
      }
      setTitle('');
      setDescription('');
      setDueDate(null);
      setCreateSubtasks([]);
      setCreateSubtaskTitle('');
      setCreateSubtaskNote('');
      await refetch();
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          y: Math.max(detailSectionYRef.current - 16, 0),
          animated: true,
        });
      }, 300);
    } catch (error: any) {
      showErrorToast('Không thể tạo nhiệm vụ', error?.message);
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleAssignSubtask = async () => {
    if (!selectedTaskId || !detailSelectedMemberId || !detailSubTaskTitle.trim()) {
      showErrorToast('Thiếu dữ liệu', 'Chọn thành viên và nhập tên nhiệm vụ con.');
      return;
    }
    setIsAssigningMemberTask(true);
    try {
      await assignMemberTaskMutation.mutateAsync({
        campaignTaskId: selectedTaskId,
        request: {
          volunteerProfileId: detailSelectedMemberId,
          subTaskTitle: detailSubTaskTitle.trim(),
          taskNote: detailSubTaskNote.trim() || undefined,
        },
      });
      showSuccessToast('Đã giao nhiệm vụ con');
      setDetailSubTaskTitle('');
      setDetailSubTaskNote('');
    } catch (error: any) {
      showErrorToast('Không thể giao việc', error?.message);
    } finally {
      setIsAssigningMemberTask(false);
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
      await changeStatusMutation.mutateAsync({
        campaignTaskId: selectedTaskId,
        request: { status },
      });
      showSuccessToast('Đã cập nhật trạng thái');
      refetch();
    } catch (error: any) {
      showErrorToast('Không thể cập nhật trạng thái', error?.message);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenHeader title="Phân công công việc" onBack={onBack} backgroundColor={colors.secondary} titleColor="#fff" />

      <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: bottom + 40 }} className="flex-1" showsVerticalScrollIndicator={false}>
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
            <Text className="text-sm" style={{ color: colors.textSecondary }}>Chiến dịch đang thao tác</Text>
            <View className="mt-2">
              <CustomDropdown
                items={campaignOptions}
                selectedValue={selectedCampaignId}
                onValueChange={setSelectedCampaignId}
                placeholder="Chọn chiến dịch để tạo công việc"
                title="Chọn chiến dịch"
              />
            </View>
            <Text className="mt-1 text-base font-bold" style={{ color: colors.text }}>
              {activeCampaign?.campaignName || myCampaignTeam?.campaignName || myCampaignTeam?.teamName || team?.name || 'Chưa có campaign'}
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
            <TouchableOpacity onPress={() => setShowDatePicker(true)} className="flex-row items-center justify-between rounded-lg border p-3" style={{ borderColor: colors.border }}>
              <Text style={{ color: dueDate ? colors.text : colors.textSecondary }}>
                {dueDate ? `Hạn: ${new Date(dueDate).toLocaleDateString('vi-VN')}` : 'Hạn hoàn thành (tuỳ chọn)'}
              </Text>
              <Ionicons name="calendar" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={dueDate ? new Date(dueDate) : dateObj}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (event.type === 'set' && selectedDate) {
                    setDateObj(selectedDate);
                    setDueDate(selectedDate.toISOString().split('T')[0]);
                  } else if (event.type === 'dismissed') {
                    setShowDatePicker(false);
                  }
                }}
              />
            )}

            <View className="flex-row gap-2 mt-2">
              {PRIORITY_OPTIONS.map((option) => (
                <TouchableOpacity key={option.id} onPress={() => setSelectedPriority(option.id)} className="flex-1 rounded-lg border p-2 items-center" style={{ backgroundColor: selectedPriority === option.id ? `${option.color}15` : 'transparent', borderColor: selectedPriority === option.id ? option.color : colors.border }}>
                  <Text style={{ color: selectedPriority === option.id ? option.color : colors.textSecondary, fontWeight: selectedPriority === option.id ? 'bold' : 'normal', fontSize: 12 }}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="rounded-xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
              <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                Phần việc thành viên khi tạo task (tuỳ chọn)
              </Text>
              <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
                Bạn có thể thêm nhiều phần việc để hệ thống tạo và giao cùng lúc ngay sau khi task được tạo.
              </Text>
              <View className="mt-3 gap-3">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                  {memberOptions.map((member: TeamMemberSummary) => {
                    const selected = createSelectedMemberId === member.userId;
                    return (
                      <TouchableOpacity key={member.userId} onPress={() => setCreateSelectedMemberId(member.userId)} className="items-center" style={{ opacity: selected ? 1 : 0.65 }}>
                        <View className="h-12 w-12 items-center justify-center rounded-full border-2" style={{ borderColor: selected ? colors.secondary : 'transparent', backgroundColor: isDark ? '#374151' : '#e5e7eb' }}>
                          <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>{initialsOf(member.displayName)}</Text>
                        </View>
                        <Text className="mt-1 text-xs" style={{ color: selected ? colors.secondary : colors.textSecondary }}>{member.displayName}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <TextInput value={createSubtaskTitle} onChangeText={setCreateSubtaskTitle} placeholder="Tên phần việc" placeholderTextColor={colors.textSecondary} className="rounded-lg border p-3" style={{ borderColor: colors.border, color: colors.text }} />
                <TextInput value={createSubtaskNote} onChangeText={setCreateSubtaskNote} placeholder="Ghi chú phần việc" placeholderTextColor={colors.textSecondary} className="rounded-lg border p-3" style={{ borderColor: colors.border, color: colors.text }} />
                <TouchableOpacity onPress={addCreateSubtask} className="rounded-lg border py-3 items-center" style={{ borderColor: colors.secondary }}>
                  <Text style={{ color: colors.secondary, fontWeight: '700' }}>
                    {editingDraftId ? 'Cập nhật phần việc' : '+ Thêm phần việc'}
                  </Text>
                </TouchableOpacity>
                {createSubtasks.length > 0 ? (
                  <View className="gap-2">
                    {createSubtasks.map((item) => (
                      <View key={item.id} className="rounded-lg border p-3" style={{ borderColor: colors.border }}>
                        <View className="flex-row items-start justify-between gap-3">
                          <View className="flex-1">
                            <Text className="font-semibold" style={{ color: colors.text }}>{item.subTaskTitle}</Text>
                            <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>{item.volunteerName}</Text>
                            <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>{item.taskNote || 'Không có ghi chú'}</Text>
                          </View>
                          <View className="flex-row items-center gap-3">
                            <TouchableOpacity onPress={() => editCreateSubtask(item)}>
                              <Ionicons name="create-outline" size={20} color={colors.secondary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => removeCreateSubtask(item.id)}>
                              <Ionicons name="close-circle" size={20} color="#ef4444" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            </View>

            <TouchableOpacity onPress={handleCreateTask} disabled={isCreatingTask} className="rounded-lg py-3 items-center flex-row justify-center" style={{ backgroundColor: colors.primary, opacity: isCreatingTask ? 0.7 : 1 }}>
              {isCreatingTask ? <ActivityIndicator color="#fff" /> : null}
              <Text className="font-bold text-white" style={{ marginLeft: isCreatingTask ? 8 : 0 }}>
                {isCreatingTask ? 'Đang tạo...' : 'Tạo công việc'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View onLayout={(e) => { detailSectionYRef.current = e.nativeEvent.layout.y; }} className="mx-4 mb-8 rounded-xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
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
                <TextInput value={detailSubTaskTitle} onChangeText={setDetailSubTaskTitle} placeholder="Tên công việc giao cho thành viên" placeholderTextColor={colors.textSecondary} className="rounded-lg border p-3" style={{ borderColor: colors.border, color: colors.text }} />
                <TextInput value={detailSubTaskNote} onChangeText={setDetailSubTaskNote} placeholder="Ghi chú" placeholderTextColor={colors.textSecondary} className="rounded-lg border p-3" style={{ borderColor: colors.border, color: colors.text }} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                  {memberOptions.map((member: TeamMemberSummary) => {
                    const selected = detailSelectedMemberId === member.userId;
                    return (
                      <TouchableOpacity key={member.userId} onPress={() => setDetailSelectedMemberId(member.userId)} className="items-center" style={{ opacity: selected ? 1 : 0.65 }}>
                        <View className="h-12 w-12 items-center justify-center rounded-full border-2" style={{ borderColor: selected ? colors.secondary : 'transparent', backgroundColor: isDark ? '#374151' : '#e5e7eb' }}>
                          <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>{initialsOf(member.displayName)}</Text>
                        </View>
                        <Text className="mt-1 text-xs" style={{ color: selected ? colors.secondary : colors.textSecondary }}>{member.displayName}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <TouchableOpacity onPress={handleAssignSubtask} disabled={isAssigningMemberTask} className="flex-row items-center justify-center rounded-lg py-3" style={{ backgroundColor: colors.secondary, opacity: isAssigningMemberTask ? 0.7 : 1 }}>
                  {isAssigningMemberTask ? <ActivityIndicator color="#fff" /> : <Ionicons name="send" size={16} color="#fff" />}
                  <Text className="ml-2 font-bold text-white">{isAssigningMemberTask ? 'Đang giao việc...' : 'Giao việc cho thành viên'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

