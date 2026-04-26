import '@/global.css';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import TaskCard, { type TaskItem } from '@/src/components/common/TaskCard';
import { useTheme } from '@/src/context/ThemeContext';
import {
  useAssignMemberTask,
  useBulkAssignMemberTasks,
  useCampaignTaskDetail,
  useCampaignTasks,
  useCampaignTeams,
  useCreateCampaignTask,
  useDeleteCampaignTask,
} from '@/src/hooks/useLeaderTasks';
import { useActiveAssignedCampaign } from '@/src/hooks/useActiveAssignedCampaign';
import { useAssignedCampaigns } from '@/src/hooks/useAssignedCampaigns';
import { useCampaignDetail } from '@/src/hooks/useDonation';
import { useMyTeam } from '@/src/hooks/useMyTeam';
import {
  CampaignTaskStatus,
  MemberTaskStatus,
  TaskPriority,
  type CampaignTaskDetailResponse,
  type CampaignTaskResponse,
  type CampaignTeamResponse,
  type MemberTaskResponse,
} from '@/src/types/leaderTask';
import type { TeamMemberSummary } from '@/src/types/team';
import { showErrorToast, showSuccessToast } from '@/src/utils/toast';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { Platform } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
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

const MEMBER_STATUS_INFO: Record<number, { label: string; color: string }> = {
  [MemberTaskStatus.Assigned]: { label: 'Đã giao', color: '#6b7280' },
  [MemberTaskStatus.InProgress]: { label: 'Đang làm', color: '#1565C0' },
  [MemberTaskStatus.Completed]: { label: 'Hoàn thành', color: '#2e7d32' },
  [MemberTaskStatus.Failed]: { label: 'Thất bại', color: '#d32f2f' },
  [MemberTaskStatus.Cancelled]: { label: 'Đã hủy', color: '#9e9e9e' },
};

const initialsOf = (name?: string) =>
  (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

const getVolunteerDisplayName = (
  memberTask: MemberTaskResponse,
  members?: TeamMemberSummary[],
) => {
  if (memberTask.volunteerName?.trim()) return memberTask.volunteerName.trim();
  const matchedMember = members?.find(
    (member) => member.volunteerProfileId === memberTask.volunteerProfileId,
  );
  return matchedMember?.displayName || 'Chưa rõ thành viên';
};

const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';
const GMT7_OFFSET_HOURS = 7;
const GMT7_OFFSET_MS = GMT7_OFFSET_HOURS * 60 * 60 * 1000;

const toGmt7Date = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getTime() + GMT7_OFFSET_MS);
};

const toUtcEndOfDayIso = (date: Date) => {
  const utcDate = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23 - GMT7_OFFSET_HOURS, 59, 59, 999),
  );
  return utcDate.toISOString();
};

const dinhDangNgay = (value?: string | null) => {
  if (!value) return 'Chưa xác định';
  const date = toGmt7Date(value);
  if (!date) return value;
  return date.toLocaleDateString('vi-VN', { timeZone: VIETNAM_TIMEZONE });
};

const dinhDangNgayGio = (value?: string | null) => {
  if (!value) return 'Chưa xác định';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN', {
    timeZone: VIETNAM_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const layNgayBatDau = (value?: string | null) => {
  const date = toGmt7Date(value);
  if (!date) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const layNgayKetThuc = (value?: string | null) => {
  const date = toGmt7Date(value);
  if (!date) return null;
  date.setHours(23, 59, 59, 999);
  return date;
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
      : 'pending',
  assignee: task.campaignTeamName,
  assigneeCount: 1,
  isMainTask: true,
  showUnassignedState: false,
});

export default function AllocateTaskScreen({ onBack }: AllocateTaskScreenProps) {
  const { bottom } = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const params = useLocalSearchParams<{ campaignId?: string }>();
  const scrollRef = useRef<ScrollView>(null);
  const detailSectionYRef = useRef(0);
  const { data: myTeamData, isLoading: isTeamLoading } = useMyTeam();
  const team = myTeamData?.team;
  const teamMode = myTeamData?.teamMode ?? 'rescue';
  const routeCampaignId =
    typeof params.campaignId === 'string' ? params.campaignId : '';
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    routeCampaignId,
  );
  const { data: fallbackAssignedCampaigns = [] } = useAssignedCampaigns(team?.teamId, !!team?.teamId);
  const { activeCampaign, assignedCampaigns, campaignId } = useActiveAssignedCampaign(
    team,
    selectedCampaignId || null,
    fallbackAssignedCampaigns,
  );
  const { data: campaignDetail } = useCampaignDetail(campaignId || undefined, !!campaignId);
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
  const bulkAssignMutation = useBulkAssignMemberTasks();

  // Biểu mẫu tạo nhiệm vụ
  const [selectedPriority, setSelectedPriority] = useState(TaskPriority.Medium);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateObj, setDateObj] = useState(new Date());
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // Biểu mẫu giao nhiệm vụ con
  const [assignMode, setAssignMode] = useState<'single' | 'bulk'>('single');
  const [subTaskTitle, setSubTaskTitle] = useState('');
  const [subTaskNote, setSubTaskNote] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(
    team?.members?.[0]?.volunteerProfileId ?? null,
  );
  const [bulkSelectedMemberIds, setBulkSelectedMemberIds] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  const memberOptions = useMemo(() => team?.members ?? [], [team?.members]);
  const assignableMembers = useMemo(
    () => memberOptions.filter((member: TeamMemberSummary) => !!member.volunteerProfileId),
    [memberOptions],
  );
  useEffect(() => {
    if (!selectedCampaignId && assignedCampaigns.length > 0) {
      setSelectedCampaignId(assignedCampaigns[0].campaignId);
    }
  }, [assignedCampaigns, selectedCampaignId]);

  useEffect(() => {
    if (routeCampaignId && routeCampaignId !== selectedCampaignId) {
      setSelectedCampaignId(routeCampaignId);
    }
  }, [routeCampaignId, selectedCampaignId]);

  useEffect(() => {
    if (!selectedMemberId && assignableMembers.length) {
      setSelectedMemberId(assignableMembers[0].volunteerProfileId ?? null);
    }
  }, [selectedMemberId, assignableMembers]);

  useEffect(() => {
    if (selectedMemberId && !assignableMembers.some((member) => member.volunteerProfileId === selectedMemberId)) {
      setSelectedMemberId(assignableMembers[0]?.volunteerProfileId ?? null);
    }
  }, [assignableMembers, selectedMemberId]);

  // ─── Handlers ───────────────────────────────────────────

  const handleCreateTask = async () => {
    if (!campaignId || !myCampaignTeam?.campaignTeamId) {
      showErrorToast('Thiếu chiến dịch', 'Không tìm thấy chiến dịch hiện tại của nhóm.');
      return;
    }
    if (!title.trim()) {
      showErrorToast('Thiếu tiêu đề', 'Vui lòng nhập tên nhiệm vụ.');
      return;
    }
    if (dueDate) {
      const hanDaChon = new Date(dueDate);
      if (ngayBatDauChienDich && hanDaChon < ngayBatDauChienDich) {
        showErrorToast('Hạn hoàn thành chưa hợp lệ', 'Hạn hoàn thành không được sớm hơn ngày bắt đầu chiến dịch.');
        return;
      }
      if (ngayKetThucChienDich && hanDaChon > ngayKetThucChienDich) {
        showErrorToast('Hạn hoàn thành chưa hợp lệ', 'Hạn hoàn thành không được muộn hơn ngày kết thúc chiến dịch.');
        return;
      }
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

      showSuccessToast('Đã tạo nhiệm vụ chính');
      if (createdTask?.campaignTaskId) {
        setSelectedTaskId(createdTask.campaignTaskId);
      }
      setTitle('');
      setDescription('');
      setDueDate(null);
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

  const handleAssignSingle = async () => {
    if (!selectedTaskId || !selectedMemberId || !subTaskTitle.trim()) {
      showErrorToast('Thiếu dữ liệu', 'Chọn thành viên và nhập tên nhiệm vụ con.');
      return;
    }
    setIsAssigning(true);
    try {
      await assignMemberTaskMutation.mutateAsync({
        campaignTaskId: selectedTaskId,
        request: {
          volunteerProfileId: selectedMemberId,
          subTaskTitle: subTaskTitle.trim(),
          taskNote: subTaskNote.trim() || undefined,
        },
      });
      showSuccessToast('Đã giao nhiệm vụ con');
      setSubTaskTitle('');
      setSubTaskNote('');
      await refetch();
    } catch (error: any) {
      showErrorToast('Không thể giao việc', error?.message);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleAssignBulk = async () => {
    if (!selectedTaskId || bulkSelectedMemberIds.length === 0 || !subTaskTitle.trim()) {
      showErrorToast('Thiếu dữ liệu', 'Chọn ít nhất 1 thành viên và nhập tên nhiệm vụ con.');
      return;
    }
    setIsAssigning(true);
    try {
      await bulkAssignMutation.mutateAsync({
        campaignTaskId: selectedTaskId,
        members: bulkSelectedMemberIds.map((vpId) => ({
          volunteerProfileId: vpId,
          subTaskTitle: subTaskTitle.trim(),
          taskNote: subTaskNote.trim() || undefined,
        })),
      });
      showSuccessToast(`Đã giao nhiệm vụ con cho ${bulkSelectedMemberIds.length} thành viên`);
      setSubTaskTitle('');
      setSubTaskNote('');
      setBulkSelectedMemberIds([]);
      await refetch();
    } catch (error: any) {
      showErrorToast('Không thể giao việc hàng loạt', error?.message);
    } finally {
      setIsAssigning(false);
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

  const toggleBulkMember = (volunteerProfileId: string) => {
    setBulkSelectedMemberIds((prev) =>
      prev.includes(volunteerProfileId)
        ? prev.filter((id) => id !== volunteerProfileId)
        : [...prev, volunteerProfileId],
    );
  };

  const allVolunteerIds = assignableMembers.map((m: TeamMemberSummary) => m.volunteerProfileId!);
  const currentStatusOption = STATUS_OPTIONS.find((status) => status.id === taskDetail?.status);
  const campaignName = campaignDetail?.name || activeCampaign?.campaignName || myCampaignTeam?.campaignName || team?.name || 'Chưa có chiến dịch';
  const campaignStartDate = campaignDetail?.startDate || activeCampaign?.startDate;
  const campaignEndDate = campaignDetail?.endDate || activeCampaign?.endDate;
  const ngayBatDauChienDich = layNgayBatDau(campaignStartDate);
  const ngayKetThucChienDich = layNgayKetThuc(campaignEndDate);
  const groupedMemberTasks = useMemo(() => {
    const groups = new Map<string, { title: string; members: MemberTaskResponse[]; notes: string[]; completedCount: number; totalCount: number }>();

    ((taskDetail as CampaignTaskDetailResponse | undefined)?.memberTasks || []).forEach((mt: MemberTaskResponse) => {
      const key = mt.subTaskTitle?.trim().toLowerCase() || mt.memberTaskId;
      const existing = groups.get(key);

      if (existing) {
        existing.members.push(mt);
        existing.totalCount += 1;
        if (mt.status === MemberTaskStatus.Completed) existing.completedCount += 1;
        if (mt.taskNote && !existing.notes.includes(mt.taskNote)) existing.notes.push(mt.taskNote);
        return;
      }

      groups.set(key, {
        title: mt.subTaskTitle,
        members: [mt],
        notes: mt.taskNote ? [mt.taskNote] : [],
        completedCount: mt.status === MemberTaskStatus.Completed ? 1 : 0,
        totalCount: 1,
      });
    });

    return Array.from(groups.values());
  }, [taskDetail]);

  // ─── Render ─────────────────────────────────────────────

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
              Đội cứu hộ dùng nhiệm vụ chung của đội và không giao nhiệm vụ con theo từng thành viên tại màn hình này.
            </Text>
          </View>
        ) : (
        <>

        {/* ─── Tổng quan chiến dịch ─── */}
        <View className="p-4 gap-4">
          <Text className="text-xl font-bold leading-tight" style={{ color: colors.text }}>Quản lý công việc</Text>
          <View className="rounded-xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>Chiến dịch đang thao tác</Text>
            <Text className="mt-2 text-base font-bold" style={{ color: colors.text }}>
              {campaignName}
            </Text>
            <View className="mt-3 rounded-lg border p-3" style={{ borderColor: colors.border, backgroundColor: `${colors.primary}08` }}>
              <View className="flex-row items-center gap-2">
                <Ionicons name="time-outline" size={16} color={colors.primary} />
                <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                  Thời gian hoạt động của chiến dịch
                </Text>
              </View>
              <Text className="mt-2 text-sm" style={{ color: colors.textSecondary }}>
                Từ {dinhDangNgay(campaignStartDate)} đến {dinhDangNgay(campaignEndDate)}
              </Text>
              <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
                GMT+7: {dinhDangNgayGio(campaignStartDate)} - {dinhDangNgayGio(campaignEndDate)}
              </Text>
              <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
                Hãy tạo nhiệm vụ có thời gian phù hợp với khoảng thời gian hoạt động của chiến dịch.
              </Text>
            </View>
          </View>
        </View>

        {/* ─── BƯỚC 1: Tạo nhiệm vụ chính ─── */}
        <View className="mx-4 mb-4 rounded-xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <View className="flex-row items-center gap-2 mb-3">
            <View className="h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: colors.primary }}>
              <Text className="text-xs font-bold text-white">1</Text>
            </View>
            <Text className="text-lg font-bold" style={{ color: colors.text }}>Tạo nhiệm vụ chính</Text>
          </View>
          <Text className="text-sm mb-3" style={{ color: colors.textSecondary }}>
            Tạo 1 nhiệm vụ chung cho chiến dịch. Sau đó phân chia thành nhiều nhiệm vụ con cho thành viên.
          </Text>
          <View className="mb-3 rounded-lg border p-3" style={{ borderColor: colors.primary, backgroundColor: `${colors.primary}08` }}>
            <View className="flex-row items-center gap-2">
              <Ionicons name="calendar-outline" size={16} color={colors.primary} />
              <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                Khung thời gian của chiến dịch
              </Text>
            </View>
            <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
              Từ {dinhDangNgay(campaignStartDate)} đến {dinhDangNgay(campaignEndDate)}
            </Text>
            <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
              Theo giờ Việt Nam (GMT+7): {dinhDangNgayGio(campaignStartDate)} - {dinhDangNgayGio(campaignEndDate)}
            </Text>
            <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
              Hạn hoàn thành nhiệm vụ phải nằm trong khoảng thời gian này.
            </Text>
          </View>
          <View className="gap-3">
            <TextInput value={title} onChangeText={setTitle} placeholder="Tên nhiệm vụ chính (VD: Phát hàng khu vực A)" placeholderTextColor={colors.textSecondary} className="rounded-lg border p-3" style={{ borderColor: colors.border, color: colors.text }} />
            <TextInput value={description} onChangeText={setDescription} placeholder="Mô tả chi tiết" placeholderTextColor={colors.textSecondary} className="rounded-lg border p-3" style={{ borderColor: colors.border, color: colors.text }} multiline />
            <TouchableOpacity onPress={() => setShowDatePicker(true)} className="flex-row items-center justify-between rounded-lg border p-3" style={{ borderColor: colors.border }}>
              <Text style={{ color: dueDate ? colors.text : colors.textSecondary }}>
                {dueDate ? `Hạn: ${dinhDangNgay(dueDate)} (GMT+7)` : 'Hạn hoàn thành (tuỳ chọn)'}
              </Text>
              <Ionicons name="calendar" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <Text className="-mt-1 text-xs" style={{ color: colors.textSecondary }}>
              Có thể chọn hạn từ {dinhDangNgay(campaignStartDate)} đến {dinhDangNgay(campaignEndDate)}.
            </Text>

            {showDatePicker && (
              <DateTimePicker
                value={dueDate ? new Date(dueDate) : dateObj}
                mode="date"
                display="default"
                minimumDate={ngayBatDauChienDich ?? new Date()}
                maximumDate={ngayKetThucChienDich ?? undefined}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (event.type === 'set' && selectedDate) {
                    setDateObj(selectedDate);
                    setDueDate(toUtcEndOfDayIso(selectedDate));
                  } else if (event.type === 'dismissed') {
                    setShowDatePicker(false);
                  }
                }}
              />
            )}

            <View className="flex-row gap-2 mt-1">
              {PRIORITY_OPTIONS.map((option) => (
                <TouchableOpacity key={option.id} onPress={() => setSelectedPriority(option.id)} className="flex-1 rounded-lg border p-2 items-center" style={{ backgroundColor: selectedPriority === option.id ? `${option.color}15` : 'transparent', borderColor: selectedPriority === option.id ? option.color : colors.border }}>
                  <Text style={{ color: selectedPriority === option.id ? option.color : colors.textSecondary, fontWeight: selectedPriority === option.id ? 'bold' : 'normal', fontSize: 12 }}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={handleCreateTask} disabled={isCreatingTask} className="rounded-lg py-3 items-center flex-row justify-center" style={{ backgroundColor: colors.primary, opacity: isCreatingTask ? 0.7 : 1 }}>
              {isCreatingTask ? <ActivityIndicator color="#fff" /> : null}
              <Text className="font-bold text-white" style={{ marginLeft: isCreatingTask ? 8 : 0 }}>
                {isCreatingTask ? 'Đang tạo...' : 'Tạo nhiệm vụ chính'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Danh sách nhiệm vụ ─── */}
        <View className="px-4 pb-4">
          <Text className="mb-3 text-lg font-bold" style={{ color: colors.text }}>Danh sách nhiệm vụ chính ({tasks.length})</Text>
          {isTeamLoading || isTasksLoading ? (
            <View className="items-center py-10"><ActivityIndicator size="large" color={colors.primary} /></View>
          ) : tasks.length === 0 ? (
            <View className="rounded-xl border border-dashed p-4" style={{ borderColor: colors.border }}>
              <Text style={{ color: colors.textSecondary }}>Chưa có nhiệm vụ nào. Tạo ở Bước 1 trước.</Text>
            </View>
          ) : (
            <View className="gap-3">
              {tasks.map((task: CampaignTaskResponse) => (
                <TaskCard
                  key={task.campaignTaskId}
                  task={toTaskItem(task)}
                  onPress={() => {
                    setSelectedTaskId(task.campaignTaskId);
                    setTimeout(() => {
                      scrollRef.current?.scrollTo({
                        y: Math.max(detailSectionYRef.current - 16, 0),
                        animated: true,
                      });
                    }, 100);
                  }}
                />
              ))}
            </View>
          )}
        </View>

        {/* ─── BƯỚC 2: Chi tiết + tạo nhiệm vụ con ─── */}
        <View
          onLayout={(e) => { detailSectionYRef.current = e.nativeEvent.layout.y; }}
          className="mx-4 mb-8 rounded-xl border p-4"
          style={{ backgroundColor: colors.card, borderColor: selectedTaskId ? colors.secondary : colors.border, borderWidth: selectedTaskId ? 1.5 : 1 }}
        >
          <View className="flex-row items-center gap-2 mb-3">
            <View className="h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: colors.secondary }}>
              <Text className="text-xs font-bold text-white">2</Text>
            </View>
            <Text className="text-lg font-bold" style={{ color: colors.text }}>Tạo nhiệm vụ con và giao thành viên</Text>
          </View>

          {isDetailLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : !taskDetail ? (
            <View className="rounded-xl border border-dashed p-4" style={{ borderColor: colors.border }}>
              <Ionicons name="arrow-up" size={20} color={colors.textSecondary} style={{ alignSelf: 'center', marginBottom: 8 }} />
              <Text className="text-center" style={{ color: colors.textSecondary }}>
                Chọn một nhiệm vụ chính ở trên để bắt đầu tạo nhiệm vụ con cho thành viên.
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {/* Tóm tắt nhiệm vụ */}
              <View className="rounded-lg p-3" style={{ backgroundColor: `${colors.secondary}08` }}>
                <Text className="text-base font-bold" style={{ color: colors.text }}>{taskDetail.title}</Text>
                <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>{taskDetail.description || 'Không có mô tả'}</Text>
                <View className="mt-2 flex-row items-center gap-2">
                  <View className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: `${colors.status.completed}18` }}>
                    <Text className="text-xs font-bold" style={{ color: colors.status.completed }}>
                      {taskDetail.completedMemberTaskCount}/{taskDetail.memberTaskCount} nhiệm vụ con hoàn thành
                    </Text>
                  </View>
                </View>
              </View>

              {/* Tiến độ nhiệm vụ chính */}
              <View className="rounded-xl border p-3" style={{ borderColor: colors.border }}>
                <Text className="text-sm font-semibold" style={{ color: colors.text }}>Trạng thái nhiệm vụ chính</Text>
                <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
                  Nhiệm vụ chính sẽ được hệ thống tự cập nhật theo tiến độ nhiệm vụ con của thành viên.
                </Text>

                <View className="mt-3 flex-row flex-wrap gap-2">
                  <View className="rounded-full px-3 py-1.5" style={{ backgroundColor: `${colors.primary}12` }}>
                    <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
                      Hiện tại: {currentStatusOption?.label || 'Chưa rõ'}
                    </Text>
                  </View>

                  {taskDetail.memberTaskCount === 0 ? (
                    <View className="rounded-full px-3 py-1.5" style={{ backgroundColor: `${colors.textSecondary}12` }}>
                      <Text className="text-xs font-semibold" style={{ color: colors.textSecondary }}>
                        Chưa phân công thành viên
                      </Text>
                    </View>
                  ) : null}
                </View>

                <TouchableOpacity onPress={handleDeleteTask} className="mt-3 self-start rounded-full border px-3 py-1.5" style={{ borderColor: '#ef4444' }}>
                  <Text style={{ color: '#ef4444' }}>Xóa nhiệm vụ</Text>
                </TouchableOpacity>
              </View>

              {/* Danh sách nhiệm vụ con đã giao */}
              <Text className="text-sm font-semibold mt-1" style={{ color: colors.text }}>
                Nhiệm vụ con đã giao ({(taskDetail as CampaignTaskDetailResponse).memberTasks?.length ?? 0})
              </Text>
              {((taskDetail as CampaignTaskDetailResponse).memberTasks || []).length > 0 ? (
                groupedMemberTasks.map((group, index) => (
                  <View key={`${group.title}-${index}`} className="rounded-lg border p-3" style={{ borderColor: colors.border }}>
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1">
                        <Text className="font-semibold" style={{ color: colors.text }}>{group.title}</Text>
                        <Text className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                          {group.completedCount}/{group.totalCount} thành viên hoàn thành
                        </Text>
                        {group.notes.length > 0 ? (
                          <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                            Ghi chú: {group.notes.join(' • ')}
                          </Text>
                        ) : null}
                      </View>
                      <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: `${colors.primary}18` }}>
                        <Text className="text-xs font-bold" style={{ color: colors.primary }}>
                          {group.totalCount} người
                        </Text>
                      </View>
                    </View>

                    <View className="mt-3 gap-2">
                      {group.members.map((mt) => {
                        const si = MEMBER_STATUS_INFO[mt.status] ?? MEMBER_STATUS_INFO[0];
                        return (
                          <View key={mt.memberTaskId} className="flex-row items-start justify-between rounded-lg p-3" style={{ backgroundColor: `${colors.primary}08` }}>
                            <View className="flex-1 pr-3">
                              <Text className="text-sm font-semibold" style={{ color: colors.text }}>{getVolunteerDisplayName(mt, assignableMembers)}</Text>
                              {mt.taskNote ? <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>{mt.taskNote}</Text> : null}
                            </View>
                            <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: `${si.color}18` }}>
                              <Text className="text-xs font-bold" style={{ color: si.color }}>{si.label}</Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ))
              ) : (
                <View className="rounded-lg border border-dashed p-3" style={{ borderColor: colors.border }}>
                  <Text className="text-sm" style={{ color: colors.textSecondary }}>Chưa có nhiệm vụ con. Tạo ở bên dưới.</Text>
                </View>
              )}

              {/* ─── Tạo nhiệm vụ con ─── */}
              <View className="mt-2 rounded-lg border p-3 gap-3" style={{ borderColor: colors.primary, backgroundColor: `${colors.primary}06` }}>
                <View className="flex-row items-center gap-2">
                  <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
                  <Text className="text-sm font-bold" style={{ color: colors.primary }}>
                    Tạo nhiệm vụ con mới
                  </Text>
                </View>

                <TextInput
                  value={subTaskTitle}
                  onChangeText={setSubTaskTitle}
                  placeholder="Tên nhiệm vụ con (VD: Phát hàng cho 10 hộ tổ 3)"
                  placeholderTextColor={colors.textSecondary}
                  className="rounded-lg border p-3"
                  style={{ borderColor: colors.border, color: colors.text, backgroundColor: colors.card }}
                />
                <TextInput
                  value={subTaskNote}
                  onChangeText={setSubTaskNote}
                  placeholder="Ghi chú cho nhiệm vụ con (tuỳ chọn)"
                  placeholderTextColor={colors.textSecondary}
                  className="rounded-lg border p-3"
                  style={{ borderColor: colors.border, color: colors.text, backgroundColor: colors.card }}
                />

                {/* Chọn chế độ giao việc */}
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => setAssignMode('single')}
                    className="flex-1 flex-row items-center justify-center gap-1 rounded-lg border py-2"
                    style={{
                      borderColor: assignMode === 'single' ? colors.secondary : colors.border,
                      backgroundColor: assignMode === 'single' ? `${colors.secondary}12` : 'transparent',
                    }}
                  >
                    <Ionicons name="person" size={14} color={assignMode === 'single' ? colors.secondary : colors.textSecondary} />
                    <Text className="text-xs font-bold" style={{ color: assignMode === 'single' ? colors.secondary : colors.textSecondary }}>1 thành viên</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setAssignMode('bulk')}
                    className="flex-1 flex-row items-center justify-center gap-1 rounded-lg border py-2"
                    style={{
                      borderColor: assignMode === 'bulk' ? colors.primary : colors.border,
                      backgroundColor: assignMode === 'bulk' ? `${colors.primary}12` : 'transparent',
                    }}
                  >
                    <Ionicons name="people" size={14} color={assignMode === 'bulk' ? colors.primary : colors.textSecondary} />
                    <Text className="text-xs font-bold" style={{ color: assignMode === 'bulk' ? colors.primary : colors.textSecondary }}>Nhiều thành viên</Text>
                  </TouchableOpacity>
                </View>

                {assignMode === 'single' ? (
                  <>
                    <Text className="text-xs font-semibold" style={{ color: colors.text }}>Chọn thành viên</Text>
                    {assignableMembers.length === 0 ? (
                      <View className="rounded-lg border border-dashed p-3" style={{ borderColor: colors.border }}>
                        <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                          Chưa có thành viên khả dụng để giao việc
                        </Text>
                        <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
                          API đội hiện chưa trả về volunteerProfileId hợp lệ cho thành viên nên chưa thể giao nhiệm vụ con.
                        </Text>
                      </View>
                    ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                      {assignableMembers.map((member: TeamMemberSummary) => {
                          const selected = selectedMemberId === member.volunteerProfileId;
                          return (
                            <TouchableOpacity key={member.userId} onPress={() => setSelectedMemberId(member.volunteerProfileId ?? null)} className="items-center" style={{ opacity: selected ? 1 : 0.65 }}>
                              <View className="h-12 w-12 items-center justify-center rounded-full border-2" style={{ borderColor: selected ? colors.secondary : 'transparent', backgroundColor: isDark ? '#374151' : '#e5e7eb' }}>
                                <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>{initialsOf(member.displayName)}</Text>
                              </View>
                              <Text className="mt-1 text-xs" style={{ color: selected ? colors.secondary : colors.textSecondary }}>{member.displayName}</Text>
                            </TouchableOpacity>
                          );
                        })}
                    </ScrollView>
                    )}
                    <TouchableOpacity onPress={handleAssignSingle} disabled={isAssigning || assignableMembers.length === 0} className="flex-row items-center justify-center rounded-lg py-3" style={{ backgroundColor: colors.secondary, opacity: isAssigning || assignableMembers.length === 0 ? 0.7 : 1 }}>
                      {isAssigning ? <ActivityIndicator color="#fff" /> : <Ionicons name="send" size={16} color="#fff" />}
                      <Text className="ml-2 font-bold text-white">{isAssigning ? 'Đang giao...' : 'Giao nhiệm vụ con'}</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text className="text-xs font-semibold" style={{ color: colors.text }}>Chọn thành viên ({bulkSelectedMemberIds.length} đã chọn)</Text>
                    {assignableMembers.length === 0 ? (
                      <View className="rounded-lg border border-dashed p-3" style={{ borderColor: colors.border }}>
                        <Text className="text-sm" style={{ color: colors.textSecondary }}>
                          Không có thành viên hợp lệ để giao hàng loạt.
                        </Text>
                      </View>
                    ) : (
                    <View className="flex-row flex-wrap gap-2">
                      {assignableMembers.map((member: TeamMemberSummary) => {
                          const selected = bulkSelectedMemberIds.includes(member.volunteerProfileId!);
                          return (
                            <TouchableOpacity
                              key={member.userId}
                              onPress={() => toggleBulkMember(member.volunteerProfileId!)}
                              className="flex-row items-center gap-2 rounded-lg border px-3 py-2"
                              style={{
                                borderColor: selected ? colors.primary : colors.border,
                                backgroundColor: selected ? `${colors.primary}12` : 'transparent',
                              }}
                            >
                              <View className="h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }}>
                                <Text style={{ color: colors.textSecondary, fontWeight: '700', fontSize: 11 }}>{initialsOf(member.displayName)}</Text>
                              </View>
                              <Text className="text-sm" style={{ color: selected ? colors.primary : colors.text, fontWeight: selected ? 'bold' : 'normal' }}>
                                {member.displayName}
                              </Text>
                              {selected && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
                            </TouchableOpacity>
                          );
                        })}
                    </View>
                    )}
                    <TouchableOpacity
                      onPress={() => setBulkSelectedMemberIds(bulkSelectedMemberIds.length === allVolunteerIds.length ? [] : allVolunteerIds)}
                      disabled={assignableMembers.length === 0}
                      className="self-start rounded-lg border px-3 py-1.5"
                      style={{ borderColor: colors.border, opacity: assignableMembers.length === 0 ? 0.5 : 1 }}
                    >
                      <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
                        {bulkSelectedMemberIds.length === allVolunteerIds.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleAssignBulk} disabled={isAssigning || bulkSelectedMemberIds.length === 0} className="flex-row items-center justify-center rounded-lg py-3" style={{ backgroundColor: colors.primary, opacity: isAssigning || bulkSelectedMemberIds.length === 0 ? 0.6 : 1 }}>
                      {isAssigning ? <ActivityIndicator color="#fff" /> : <Ionicons name="people" size={16} color="#fff" />}
                      <Text className="ml-2 font-bold text-white">
                        {isAssigning ? 'Đang giao...' : `Giao nhiệm vụ con cho ${bulkSelectedMemberIds.length} thành viên`}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>

              <View className="mt-1 flex-row items-start gap-2">
                <Ionicons name="bulb-outline" size={16} color={colors.textSecondary} style={{ marginTop: 1 }} />
                <Text className="flex-1 text-xs" style={{ color: colors.textSecondary }}>
                  Khi tất cả nhiệm vụ con hoàn thành, nhiệm vụ chính sẽ tự động chuyển sang "Hoàn thành".
                </Text>
              </View>
            </View>
          )}
        </View>
        </>
        )}
      </ScrollView>
    </View>
  );
}
