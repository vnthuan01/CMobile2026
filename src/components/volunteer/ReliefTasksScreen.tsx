import '@/global.css';
import CustomDropdown from '@/src/components/CustomDropdown';
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
  useMyMemberTasks,
} from '@/src/hooks/useLeaderTasks';
import { useMyTeam } from '@/src/hooks/useMyTeam';
import {
  useCampaignHouseholds,
  useCampaignPlanSummary,
  useDistributionPoints,
  useTeamWorklist,
} from '@/src/hooks/useReliefDistribution';
import { useSelectedCampaign } from '@/src/hooks/useSelectedCampaign';
import { useAuthStore } from '@/src/store/authStore';
import {
  CampaignTaskStatus,
  CampaignTaskStatusLabels,
  MemberTaskStatus,
  TaskPriority,
  type CampaignTaskDetailResponse,
  type CampaignTaskResponse,
  type CampaignTeamResponse,
  type MemberTaskResponse,
} from '@/src/types/leaderTask';
import type { AssignedCampaignSummary } from '@/src/types/team';
import {
  DeliveryMode,
  DistributionPointResponse,
  type ReliefCampaignPlanSummary,
} from '@/src/types/reliefDistribution';
import { showErrorToast, showSuccessToast } from '@/src/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import InventorySection from './InventorySection';
import MyVehicleScreen from './MyVehicleScreen';
import ReliefPlanSection from './ReliefPlanSection';

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

const isCampaignCompleted = (campaign?: AssignedCampaignSummary | null) => {
  const status = campaign?.campaignStatus ?? campaign?.status;
  if (typeof status === 'number') return status === 3;
  const normalizedStatus = String(status ?? '').trim().toLowerCase();
  return normalizedStatus === '3' || normalizedStatus === 'completed';
};

const isLeaderRoleValue = (value: unknown) => {
  if (typeof value === 'number') return value === 1;

  const normalizedValue = String(value ?? '').trim().toLowerCase();
  return normalizedValue === '1' || normalizedValue === 'leader';
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
  const { colors } = useTheme();
  const router = useRouter();
  const [showMyVehicleScreen, setShowMyVehicleScreen] = useState(false);
  const summaryScrollRef = useRef<ScrollView | null>(null);
  const user = useAuthStore((s) => s.user);
  const { data: myTeamData, isLoading: isTeamLoading } = useMyTeam();
  const team = myTeamData?.team;
  const { data: fallbackAssignedCampaigns, isLoading: isCampaignsLoading } =
    useAssignedCampaigns(team?.teamId ?? '', !!team?.teamId);
  const teamMode = myTeamData?.teamMode ?? 'rescue';
  const roleCheckCampaignId =
    team?.assignedCampaigns?.[0]?.campaignId || fallbackAssignedCampaigns[0]?.campaignId;
  const { data: roleCheckCampaignTeams = [] } = useCampaignTeams(
    teamMode === 'relief' ? roleCheckCampaignId || null : null,
  );

  const isLeader = useMemo(() => {
    if (!user?.id) return false;

    if (String(user.role ?? '').trim().toLowerCase() === 'leader') {
      return true;
    }

    if (team?.leader?.userId && user.id === team.leader.userId) {
      return true;
    }

    const myMember = team?.members?.find((member) => member.userId === user.id);
    if (isLeaderRoleValue((myMember as any)?.role)) return true;
    if (isLeaderRoleValue((myMember as any)?.roleTeam)) return true;

    const hasLeaderAssignedCampaignRole = [
      ...(team?.assignedCampaigns || []),
      ...fallbackAssignedCampaigns,
    ].some((campaign) => isLeaderRoleValue(campaign?.role));
    if (hasLeaderAssignedCampaignRole) return true;

    const myCampaignTeamRole = roleCheckCampaignTeams.find(
      (campaignTeam: CampaignTeamResponse) => campaignTeam.teamId === team?.teamId,
    )?.teamRole;
    if (isLeaderRoleValue(myCampaignTeamRole)) return true;

    return false;
  }, [fallbackAssignedCampaigns, roleCheckCampaignTeams, team?.assignedCampaigns, team?.leader?.userId, team?.members, team?.teamId, user?.id, user?.role]);

  const canManageTasks = isLeader;
  const visibleFallbackCampaigns = useMemo(
    () =>
      canManageTasks
        ? fallbackAssignedCampaigns || []
        : (fallbackAssignedCampaigns || []).filter(
            (campaign) => !isCampaignCompleted(campaign),
          ),
    [canManageTasks, fallbackAssignedCampaigns],
  );
  const visibleTeam = useMemo(
    () => ({
      ...team,
      assignedCampaigns: canManageTasks
        ? team?.assignedCampaigns || []
        : (team?.assignedCampaigns || []).filter(
            (campaign: AssignedCampaignSummary) => !isCampaignCompleted(campaign),
          ),
    }),
    [canManageTasks, team],
  );
  const allVisibleCampaigns = useMemo(() => {
    const campaigns = [...(visibleTeam.assignedCampaigns || []), ...visibleFallbackCampaigns];
    return campaigns
      .filter((campaign) => String(campaign?.campaignId || '').length > 0)
      .reduce<AssignedCampaignSummary[]>((acc, campaign) => {
        if (!acc.some((item) => item.campaignId === campaign.campaignId)) {
          acc.push(campaign);
        }
        return acc;
      }, []);
  }, [visibleTeam.assignedCampaigns, visibleFallbackCampaigns]);

  const { selectedCampaignId, setSelectedCampaignId } = useSelectedCampaign(
    visibleTeam,
    allVisibleCampaigns,
  );
  const { activeCampaign, campaignId, assignedCampaigns } =
    useActiveAssignedCampaign(
      visibleTeam,
      selectedCampaignId,
      visibleFallbackCampaigns,
    );
  const { data: campaignDetail } = useCampaignDetail(
    campaignId || undefined,
    !!campaignId,
  );
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
  const { data: myMemberTaskData } = useMyMemberTasks(
    teamMode === 'relief' ? campaignId : null,
    {
      pageIndex: 1,
      pageSize: 100,
      campaignTeamId: myCampaignTeam?.campaignTeamId,
    },
  );

  // Relief distribution data
  const { data: distributionPointsData } = useDistributionPoints(
    teamMode === 'relief' ? campaignId : null,
    { campaignTeamId: myCampaignTeam?.campaignTeamId, pageSize: 50 },
  );
  const distributionPoints = useMemo(
    () => distributionPointsData?.items ?? [],
    [distributionPointsData?.items],
  );
  const { data: teamWorklistData } = useTeamWorklist(
    teamMode === 'relief' ? campaignId : null,
    {
      pageIndex: 1,
      pageSize: 100,
      campaignTeamId: myCampaignTeam?.campaignTeamId,
    },
  );

  const { data: householdsData } = useCampaignHouseholds(
    teamMode === 'relief' ? campaignId : null,
    {
      campaignTeamId: myCampaignTeam?.campaignTeamId,
      deliveryMode: 1,
      pageSize: 50,
    },
  );
  const { data: apiPlanSummary, isLoading: isPlanSummaryLoading } =
    useCampaignPlanSummary(teamMode === 'relief' ? campaignId : null);
  const households = (householdsData?.items ?? []).filter(
    (household) =>
      (!myCampaignTeam?.campaignTeamId ||
        household.campaignTeamId === myCampaignTeam.campaignTeamId) &&
      household.deliveryMode === 1,
  );
  const pendingHouseholds = households.filter((h) => h.fulfillmentStatus === 0);
  const isolatedPendingHouseholds = pendingHouseholds.filter(
    (household) => household.isIsolated,
  );
  const teamWorklist = useMemo(
    () => teamWorklistData?.items ?? [],
    [teamWorklistData?.items],
  );
  const pickupDeliveries = useMemo(
    () =>
      teamWorklist.filter(
        (item) => item.deliveryMode === DeliveryMode.PickupAtPoint,
      ),
    [teamWorklist],
  );
  const isolatedDeliveries = useMemo(
    () =>
      teamWorklist.filter(
        (item) =>
          item.deliveryMode === DeliveryMode.DoorToDoor && item.isIsolated,
      ),
    [teamWorklist],
  );
  const mobileDeliveries = useMemo(
    () =>
      teamWorklist.filter(
        (item) => item.deliveryMode === DeliveryMode.DoorToDoor,
      ),
    [teamWorklist],
  );

  const allTasks = useMemo(() => taskData?.items ?? [], [taskData?.items]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const { data: taskDetail, isLoading: isDetailLoading } =
    useCampaignTaskDetail(selectedTaskId);
  const [activeTab, setActiveTab] = useState<
    'tasks' | 'points' | 'inventory' | 'plan'
  >('tasks');

  const myVolunteerProfileId = useMemo(
    () =>
      team?.members?.find((member) => member.userId === user?.id)
        ?.volunteerProfileId,
    [team?.members, user?.id],
  );

  const myAssignedMemberTasks = useMemo(
    () => myMemberTaskData?.items ?? [],
    [myMemberTaskData?.items],
  );

  const myMemberTasksByCampaign = useMemo(
    () => myAssignedMemberTasks,
    [myAssignedMemberTasks],
  );

  const myTaskByCampaignTaskId = useMemo(() => {
    const map = new Map<string, (typeof myAssignedMemberTasks)[number]>();
    myAssignedMemberTasks.forEach((task) => {
      if (!map.has(task.campaignTaskId)) {
        map.set(task.campaignTaskId, task);
      }
    });
    return map;
  }, [myAssignedMemberTasks]);

  const tasks = useMemo(
    () =>
      canManageTasks
        ? allTasks
        : allTasks.filter((task: CampaignTaskResponse) =>
            myTaskByCampaignTaskId.has(task.campaignTaskId),
          ),
    [allTasks, canManageTasks, myTaskByCampaignTaskId],
  );

  const myTaskByDistributionPointId = useMemo(() => {
    const map = new Map<string, (typeof myAssignedMemberTasks)[number]>();
    myAssignedMemberTasks.forEach((task) => {
      task.deliveries?.forEach((delivery) => {
        const distributionPointId = (delivery as any).distributionPointId as
          | string
          | undefined;
        if (distributionPointId && !map.has(distributionPointId)) {
          map.set(distributionPointId, task);
        }
      });
    });
    return map;
  }, [myAssignedMemberTasks]);

  // Identify current user's subtasks inside selected task detail
  const myMemberTasks = useMemo(() => {
    if (!taskDetail || !myVolunteerProfileId) return [];
    const detail = taskDetail as CampaignTaskDetailResponse;
    return (detail.memberTasks || []).filter(
      (memberTask: MemberTaskResponse) =>
        memberTask.volunteerProfileId === myVolunteerProfileId,
    );
  }, [taskDetail, myVolunteerProfileId]);

  const changeMemberStatusMutation = useChangeMemberTaskStatus();
  const [pendingFailedMemberTaskId, setPendingFailedMemberTaskId] = useState<
    string | null
  >(null);
  const [failureReasonInput, setFailureReasonInput] = useState('');

  useEffect(() => {
    if (!selectedTaskId && tasks.length > 0) {
      setSelectedTaskId(tasks[0].campaignTaskId);
    }
  }, [selectedTaskId, tasks]);

  useEffect(() => {
    if (!selectedTaskId) {
      setSelectedTaskId(tasks[0]?.campaignTaskId ?? null);
      return;
    }

    if (!tasks.some((task) => task.campaignTaskId === selectedTaskId)) {
      setSelectedTaskId(tasks[0]?.campaignTaskId ?? null);
    }
  }, [campaignId, selectedTaskId, tasks]);

  const completed = tasks.filter(
    (task: CampaignTaskResponse) =>
      task.status === CampaignTaskStatus.Completed,
  ).length;
  const inProgress = tasks.filter(
    (task: CampaignTaskResponse) =>
      task.status === CampaignTaskStatus.InProgress,
  ).length;
  const completedSubtasks = myMemberTasksByCampaign.filter(
    (task) => task.status === MemberTaskStatus.Completed,
  ).length;
  const failedSubtasks = myMemberTasksByCampaign.filter(
    (task) => task.status === MemberTaskStatus.Failed,
  ).length;
  const summaryItems = [
    { label: 'Tổng việc', value: String(tasks.length) },
    { label: 'Đang làm', value: String(inProgress) },
    { label: 'Hoàn thành', value: String(completed) },
    { label: 'Nhiệm vụ nhánh xong', value: String(completedSubtasks) },
    { label: 'Nhiệm vụ nhánh lỗi', value: String(failedSubtasks) },
    { label: 'Điểm phát của đội', value: String(distributionPoints.length) },
    { label: 'Hộ chờ phát', value: String(pendingHouseholds.length) },
    ...(isolatedPendingHouseholds.length > 0
      ? [
          {
            label: 'Hộ cô lập chờ phát',
            value: String(isolatedPendingHouseholds.length),
          },
        ]
      : []),
  ];
  const marqueeSummaryItems = useMemo(
    () => [...summaryItems, ...summaryItems],
    [summaryItems],
  );
  const campaignOptions = useMemo(
    () =>
      assignedCampaigns.map((campaign) => ({
        label: campaign.campaignName || campaign.campaignId,
        value: campaign.campaignId,
      })),
    [assignedCampaigns],
  );

  useEffect(() => {
    console.log('[ReliefTasksScreen] campaign selection debug', {
      userRole: user?.role,
      canManageTasks,
      selectedCampaignId,
      campaignId,
      assignedCampaigns: assignedCampaigns.map((campaign) => ({
        name: campaign.campaignName,
        role: campaign.role,
        status: campaign.status,
        campaignStatus: campaign.campaignStatus,
      })),
    });
  }, [assignedCampaigns, campaignId, canManageTasks, selectedCampaignId, user?.role]);

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

  useEffect(() => {
    if (summaryItems.length <= 1) return;

    let offset = 0;
    const itemWidth = 152;
    const resetThreshold = summaryItems.length * itemWidth;

    const timer = setInterval(() => {
      offset += 1;
      if (offset >= resetThreshold) {
        offset = 0;
      }

      summaryScrollRef.current?.scrollTo({ x: offset, animated: false });
    }, 18);

    return () => clearInterval(timer);
  }, [summaryItems.length]);

  const shouldShowPersonalTaskPanels = false;

  const fallbackPlanSummary = useMemo<ReliefCampaignPlanSummary>(() => {
    const areaMap = new Map<
      string,
      {
        areaName: string;
        locationId?: string | null;
        latitude?: number | null;
        longitude?: number | null;
        householdCount: number;
        isolatedHouseholdCount: number;
        population: number;
        pendingHouseholds: number;
      }
    >();

    households.forEach((household) => {
      const areaName = household.address?.trim() || 'Chưa phân khu vực';
      const key = `${household.locationId || 'na'}-${areaName}`;
      const existing = areaMap.get(key) || {
        areaName,
        locationId: household.locationId || null,
        latitude: household.latitude ?? null,
        longitude: household.longitude ?? null,
        householdCount: 0,
        isolatedHouseholdCount: 0,
        population: 0,
        pendingHouseholds: 0,
      };
      if (
        typeof existing.latitude !== 'number' &&
        typeof household.latitude === 'number'
      ) {
        existing.latitude = household.latitude;
      }
      if (
        typeof existing.longitude !== 'number' &&
        typeof household.longitude === 'number'
      ) {
        existing.longitude = household.longitude;
      }
      existing.householdCount += 1;
      existing.population += household.householdSize;
      existing.pendingHouseholds += household.fulfillmentStatus === 0 ? 1 : 0;
      if (household.isIsolated) existing.isolatedHouseholdCount += 1;
      areaMap.set(key, existing);
    });

    const isolatedCount = households.filter((item) => item.isIsolated).length;
    const totalPopulation = households.reduce(
      (sum, item) => sum + item.householdSize,
      0,
    );
    const suggestedTeamCount =
      households.length > 0
        ? Math.ceil(households.length / 50) + (isolatedCount > 6 ? 1 : 0)
        : 0;
    const estimatedReliefPersonnel = Math.max(
      suggestedTeamCount * 4,
      Math.ceil(totalPopulation / 25),
    );
    const estimatedLocalVolunteers =
      isolatedCount > 0 ? Math.max(1, Math.ceil(isolatedCount / 10)) : 0;
    const estimatedBoatCount =
      isolatedCount > 0 ? Math.ceil(isolatedCount / 6) : 0;
    const estimatedLifeJacketCount =
      estimatedReliefPersonnel +
      estimatedLocalVolunteers +
      estimatedBoatCount * 2;

    return {
      campaignId: campaignId || '',
      totalHouseholds: households.length,
      isolatedHouseholds: isolatedCount,
      totalPopulation,
      averagePopulationDensity: 0,
      highDensityAreaCount: 0,
      mobileTeamPriorityAreaCount: 0,
      pickupPriorityAreaCount: 0,
      distributionPointCount: distributionPoints.length,
      pendingHouseholds: pendingHouseholds.length,
      suggestedTeamCount,
      estimatedReliefPersonnel,
      estimatedLocalVolunteers,
      estimatedBoatCount,
      estimatedLifeJacketCount,
      areas: Array.from(areaMap.values()).map((item) => ({
        areaName: item.areaName,
        locationId: item.locationId,
        latitude: item.latitude ?? null,
        longitude: item.longitude ?? null,
        populationDensity: 0,
        householdCount: item.householdCount,
        isolatedHouseholdCount: item.isolatedHouseholdCount,
        population: item.population,
        averageHouseholdSize:
          item.householdCount > 0
            ? Number((item.population / item.householdCount).toFixed(2))
            : 0,
        pendingHouseholds: item.pendingHouseholds,
        estimatedCoverageRadiusKm: 0,
        travelComplexityLabel:
          item.isolatedHouseholdCount > 0 ? 'Phức tạp vừa' : 'Phức tạp thấp',
        recommendedOperationalMode:
          item.isolatedHouseholdCount > 0
            ? 'Ưu tiên đội cơ động'
            : 'Kết hợp điểm phát và đội cơ động',
        recommendedDeliveryStrategy:
          item.isolatedHouseholdCount > 0
            ? 'Đội cơ động gõ từng cụm, giao tận nơi cho hộ cô lập'
            : 'Kết hợp phát tại điểm và tiếp cận hộ xa',
        suggestedDistributionPointCount: 0,
        suggestedMobileTeamCount:
          item.isolatedHouseholdCount > 0
            ? Math.max(1, Math.ceil(item.isolatedHouseholdCount / 4))
            : 0,
        suggestedTeamCount:
          item.householdCount > 0 ? Math.ceil(item.householdCount / 50) : 0,
        estimatedPackages: item.pendingHouseholds,
        estimatedBoatCount:
          item.isolatedHouseholdCount > 0
            ? Math.ceil(item.isolatedHouseholdCount / 6)
            : 0,
        estimatedLifeJacketCount:
          Math.max(0, Math.ceil(item.population / 25)) +
          (item.isolatedHouseholdCount > 0
            ? Math.ceil(item.isolatedHouseholdCount / 6) * 2
            : 0),
      })),
      isolatedHouseholdItems: households
        .filter((item) => item.isIsolated)
        .map((item) => ({
          campaignHouseholdId: item.campaignHouseholdId,
          householdCode: item.householdCode,
          headOfHouseholdName: item.headOfHouseholdName,
          address: item.address || null,
          locationId: item.locationId || null,
          householdSize: item.householdSize,
          floodSeverityLevel: 0,
          isolationSeverityLevel: 0,
          requiresBoat: false,
          requiresLocalGuide: false,
          priorityLabel:
            item.householdSize >= 5
              ? 'Khẩn cấp'
              : item.householdSize >= 3
                ? 'Ưu tiên cao'
                : 'Ưu tiên',
          suggestedSupportMode:
            item.deliveryMode === 0 ? 'Giao tận nơi' : 'Ưu tiên giao tận nơi',
          estimatedReliefPersonnel: Math.max(
            2,
            Math.ceil(item.householdSize / 2),
          ),
          estimatedBoatCount: item.householdSize >= 4 ? 1 : 0,
          estimatedLifeJacketCount: Math.max(2, item.householdSize),
          campaignTeamName: item.campaignTeamName || null,
        })),
      distributionPoints: distributionPoints.map((item) => ({
        distributionPointId: item.distributionPointId,
        name: item.name,
        address: item.address || null,
        assignedHouseholdCount: item.assignedHouseholdCount,
        pendingDeliveryCount: item.pendingDeliveryCount,
        suggestedPersonnelCount: Math.max(
          2,
          Math.ceil(item.assignedHouseholdCount / 25),
        ),
        suggestedLocalVolunteerCount: 0,
      })),
      resourceRequirements: [
        {
          resourceType: 'Nhân lực',
          resourceName: 'Đội cứu trợ',
          estimatedQuantity: suggestedTeamCount,
          notes: 'Tính nhanh theo số hộ cần hỗ trợ.',
        },
        {
          resourceType: 'Nhân lực',
          resourceName: 'Nhân sự cứu trợ',
          estimatedQuantity: estimatedReliefPersonnel,
          notes: 'Ước tính từ số dân và số đội.',
        },
        {
          resourceType: 'Thiết bị',
          resourceName: 'Xuồng / ghe tiếp cận',
          estimatedQuantity: estimatedBoatCount,
          notes: 'Ước tính từ số hộ cô lập.',
        },
        {
          resourceType: 'Thiết bị',
          resourceName: 'Áo phao',
          estimatedQuantity: estimatedLifeJacketCount,
          notes: 'Ước tính cho tổ tiếp cận và TNV địa phương.',
        },
      ],
    };
  }, [campaignId, distributionPoints, households, pendingHouseholds.length]);

  const planSummary = apiPlanSummary ?? fallbackPlanSummary;

  const shouldUseInlineMyVehicleScreen = false;

  if (showMyVehicleScreen && shouldUseInlineMyVehicleScreen) {
    return <MyVehicleScreen onBack={() => setShowMyVehicleScreen(false)} />;
  }

  const handleChangeMemberStatus = async (
    memberTaskId: string,
    newStatus: MemberTaskStatus,
  ) => {
    const statusInfo = MEMBER_STATUS_MAP[newStatus];
    if (newStatus === MemberTaskStatus.Failed) {
      setPendingFailedMemberTaskId(memberTaskId);
      setFailureReasonInput('');
      return;
    }
    const selectedMemberTask = myMemberTasks.find(
      (item) => item.memberTaskId === memberTaskId,
    );
    const failureReason =
      newStatus === MemberTaskStatus.Failed
        ? selectedMemberTask?.taskNote?.trim() ||
          'Không thể hoàn thành theo điều kiện thực tế.'
        : undefined;
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
                request: { status: newStatus, failureReason },
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

  const handleConfirmFailedStatus = async () => {
    if (!pendingFailedMemberTaskId) return;
    if (!failureReasonInput.trim()) {
      showErrorToast(
        'Thiếu lý do thất bại',
        'Vui lòng nhập lý do thất bại trước khi xác nhận.',
      );
      return;
    }

    try {
      await changeMemberStatusMutation.mutateAsync({
        memberTaskId: pendingFailedMemberTaskId,
        request: {
          status: MemberTaskStatus.Failed,
          failureReason: failureReasonInput.trim(),
        },
      });
      showSuccessToast('Đã cập nhật: Thất bại');
      setPendingFailedMemberTaskId(null);
      setFailureReasonInput('');
    } catch (error: any) {
      showErrorToast('Cập nhật thất bại', error?.message);
    }
  };

  const openTaskProgress = (campaignTaskId: string) => {
    const myTask = myTaskByCampaignTaskId.get(campaignTaskId);
    const hasIsolatedDelivery = myTask?.deliveries?.some(
      (delivery: any) => !delivery.distributionPointId,
    );
    const defaultDistributionPointId =
      myTask?.deliveries?.find(
        (delivery: any) => !!delivery.distributionPointId,
      )?.distributionPointId ||
      distributionPoints.find(
        (point) => point.campaignTeamId === myCampaignTeam?.campaignTeamId,
      )?.distributionPointId;

    if (hasIsolatedDelivery) {
      router.push({
        pathname: '/profile/progress-for-relief' as any,
        params: {
          campaignId: campaignId || undefined,
          campaignTeamId: myCampaignTeam?.campaignTeamId,
          campaignTeamName: myCampaignTeam?.teamName,
          campaignTaskId,
          memberTaskId: myTask?.memberTaskId,
          initialTab: myTask ? 'subtask' : 'delivery',
          flowMode: 'isolated',
        },
      });
      return;
    }

    if (!defaultDistributionPointId) {
      setActiveTab('points');
      setSelectedTaskId(campaignTaskId);
      showSuccessToast(
        'Chọn điểm phát để tiếp tục',
        'Đây là các điểm phát mà đội bạn đang được phân công. Hãy chọn một điểm phát để tiếp tục cập nhật tiến độ phát hàng tại điểm.',
      );
      return;
    }

    router.push({
      pathname: '/profile/progress-for-relief' as any,
      params: {
        campaignId: campaignId || undefined,
        campaignTeamId: myCampaignTeam?.campaignTeamId,
        campaignTeamName: myCampaignTeam?.teamName,
        campaignTaskId,
        distributionPointId: defaultDistributionPointId,
        memberTaskId: myTask?.memberTaskId,
        initialTab: 'subtask',
      },
    });
  };

  const openDistributionPointDeliveries = (distributionPointId: string) => {
    const myTask = myTaskByDistributionPointId.get(distributionPointId);

    router.push({
      pathname: '/profile/progress-for-relief' as any,
      params: {
        campaignId: campaignId || undefined,
        campaignTeamId: myCampaignTeam?.campaignTeamId,
        campaignTeamName: myCampaignTeam?.teamName,
        distributionPointId,
        campaignTaskId: myTask?.campaignTaskId || selectedTaskId || undefined,
        memberTaskId: myTask?.memberTaskId,
        initialTab: 'subtask',
      },
    });
  };

  const openPlanAllocateTask = (
    areaName?: string,
    distributionPointId?: string,
    distributionPointName?: string,
  ) => {
    router.push({
      pathname: '/profile/allocate-task' as any,
      params: {
        campaignId: campaignId || undefined,
        areaName: areaName || undefined,
        distributionPointId: distributionPointId || undefined,
        distributionPointName: distributionPointName || undefined,
        source: 'relief-plan',
      },
    });
  };

  const openIsolatedProgress = () => {
    const myTask =
      myAssignedMemberTasks.find((task) =>
        task.deliveries?.some((delivery: any) => !delivery.distributionPointId),
      ) || myAssignedMemberTasks[0];

    router.push({
      pathname: '/profile/progress-for-relief' as any,
      params: {
        campaignId: campaignId || undefined,
        campaignTeamId: myCampaignTeam?.campaignTeamId,
        campaignTeamName: myCampaignTeam?.teamName,
        campaignTaskId: myTask?.campaignTaskId,
        memberTaskId: myTask?.memberTaskId,
        initialTab: myTask ? 'subtask' : 'delivery',
        flowMode: 'isolated',
      },
    });
  };

  const openAllIsolatedHouseholds = () => {
    openIsolatedProgress();
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
      <Modal
        visible={!!pendingFailedMemberTaskId}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setPendingFailedMemberTaskId(null);
          setFailureReasonInput('');
        }}
      >
        <View className="flex-1 items-center justify-center bg-black/40 px-4">
          <View
            className="w-full max-w-[420px] rounded-2xl border p-4"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              Lý do thất bại
            </Text>
            <Text
              className="mt-1 text-sm"
              style={{ color: colors.textSecondary }}
            >
              Hãy mô tả ngắn gọn vì sao phần việc này không thể hoàn thành.
            </Text>
            <TextInput
              value={failureReasonInput}
              onChangeText={setFailureReasonInput}
              placeholder="Ví dụ: Không tiếp cận được khu vực do ngập sâu, thiếu xuồng hỗ trợ..."
              placeholderTextColor={colors.textSecondary}
              multiline
              textAlignVertical="top"
              className="mt-4 min-h-[120px] rounded-xl border p-3"
              style={{
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.background,
              }}
            />
            <View className="mt-4 flex-row justify-end gap-2">
              <TouchableOpacity
                onPress={() => {
                  setPendingFailedMemberTaskId(null);
                  setFailureReasonInput('');
                }}
                className="rounded-lg border px-4 py-2"
                style={{ borderColor: colors.border }}
              >
                <Text style={{ color: colors.textSecondary }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmFailedStatus}
                className="rounded-lg px-4 py-2"
                style={{ backgroundColor: colors.status.error }}
              >
                <Text className="font-bold text-white">Xác nhận thất bại</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScreenHeader title="Trung tâm công việc" onBack={onBack} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {isTeamLoading || isCampaignsLoading || isTasksLoading ? (
          <View className="gap-4">
            <View
              className="rounded-3xl p-5"
              style={{ backgroundColor: colors.secondary }}
            >
              <View className="h-3 w-28 rounded-full bg-white/25" />
              <View className="mt-4 h-10 rounded-2xl bg-white/15" />
              <View className="mt-4 h-7 w-3/4 rounded-full bg-white/20" />
              <View className="mt-3 h-4 w-full rounded-full bg-white/15" />
              <View className="mt-4 flex-row gap-3">
                <View className="bg-white/12 h-14 flex-1 rounded-2xl" />
                <View className="bg-white/12 h-14 flex-1 rounded-2xl" />
                <View className="bg-white/12 h-14 flex-1 rounded-2xl" />
              </View>
            </View>
            <View className="flex-row gap-2">
              <View
                className="h-12 flex-1 rounded-xl"
                style={{
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              />
              <View
                className="h-12 flex-1 rounded-xl"
                style={{
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              />
              <View
                className="h-12 flex-1 rounded-xl"
                style={{
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              />
            </View>
            <View
              className="rounded-2xl border p-4"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.card,
              }}
            >
              <View
                className="h-5 w-40 rounded-full"
                style={{ backgroundColor: `${colors.primary}12` }}
              />
              <View
                className="mt-3 h-24 rounded-2xl"
                style={{ backgroundColor: `${colors.primary}08` }}
              />
              <View
                className="mt-3 h-24 rounded-2xl"
                style={{ backgroundColor: `${colors.primary}08` }}
              />
            </View>
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
              {assignedCampaigns.length > 1 ? (
                <View className="mt-3">
                  <CustomDropdown
                    items={campaignOptions}
                    selectedValue={selectedCampaignId || ''}
                    onValueChange={setSelectedCampaignId}
                    placeholder="Chọn chiến dịch"
                    title="Chọn chiến dịch"
                  />
                </View>
              ) : (
                <View className="bg-white/18 mt-3 self-start rounded-full px-3 py-1.5">
                  <Text className="text-xs font-semibold text-white">
                    Chiến dịch hiện tại đã tự đồng bộ
                  </Text>
                </View>
              )}
              {isTasksLoading && campaignId ? (
                <View className="bg-white/16 mt-3 self-start rounded-full px-3 py-1.5">
                  <Text className="text-xs font-semibold text-white/90">
                    Đang đồng bộ chiến dịch...
                  </Text>
                </View>
              ) : null}
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

              <ScrollView
                ref={summaryScrollRef}
                horizontal
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                className="mt-4 rounded-full border border-white"
                style={{
                  borderColor: 'rgba(255,255,255,0.25)',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }}
                contentContainerStyle={{ paddingRight: 12 }}
              >
                {marqueeSummaryItems.map((item, index) => (
                  <View
                    key={`${item.label}-${index}`}
                    style={{
                      width: 140,
                      marginRight: 12,
                      height: 48,
                      marginBottom: 12,
                    }}
                  >
                    <SummaryChip label={item.label} value={item.value} />
                  </View>
                ))}
              </ScrollView>

              {canManageTasks ? (
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: '/profile/allocate-task' as any,
                      params: {
                        campaignId: campaignId || undefined,
                      },
                    })
                  }
                  className="mt-4 flex-row items-center justify-center rounded-xl bg-white/20 py-3"
                >
                  <Ionicons name="construct-outline" size={18} color="#fff" />
                  <Text className="ml-2 font-bold text-white">
                    Quản lý & phân phối nhiệm vụ
                  </Text>
                </TouchableOpacity>
              ) : (
                <View
                  className="mt-4 rounded-xl border px-4 py-3"
                  style={{ borderColor: 'rgba(255,255,255,0.25)' }}
                >
                  <Text className="text-sm font-semibold text-white">
                    Theo dõi phần việc và cập nhật tiến độ ngay từ tab Công
                    việc.
                  </Text>
                  <Text className="mt-1 text-xs text-white/75">
                    Khi cần phân công thêm, trưởng nhóm sẽ mở tính năng quản lý
                    nhiệm vụ từ cùng chiến dịch này.
                  </Text>
                </View>
              )}

              <TouchableOpacity
                onPress={() => {
                  if (shouldUseInlineMyVehicleScreen) {
                    setShowMyVehicleScreen(true);
                    return;
                  }

                  router.push('/profile/my-vehicle' as any);
                }}
                className="mt-4 rounded-2xl border px-4 py-4"
                style={{
                  borderColor: 'rgba(255,255,255,0.25)',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-3">
                    <Text className="text-sm font-bold text-white">
                      Phương tiện của tôi
                    </Text>
                    <Text className="mt-1 text-xs text-white/80">
                      Xem xe đang được giao, trả phương tiện về đội hoặc bàn
                      giao cho thành viên khác.
                    </Text>
                  </View>
                  <Ionicons name="car-sport-outline" size={20} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Tab selector */}
            <Text className="text-xs" style={{ color: colors.textSecondary }}>
              Kéo ngang để xem thêm mục
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingRight: 4 }}
            >
              <TouchableOpacity
                onPress={() => setActiveTab('tasks')}
                className="items-center rounded-xl px-4 py-3"
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
              {canManageTasks ? (
                <TouchableOpacity
                  onPress={() => setActiveTab('plan')}
                  className="items-center rounded-xl px-4 py-3"
                  style={{
                    backgroundColor:
                      activeTab === 'plan' ? colors.primary : colors.card,
                    borderWidth: 1,
                    borderColor:
                      activeTab === 'plan' ? colors.primary : colors.border,
                  }}
                >
                  <Text
                    className="text-sm font-bold"
                    style={{
                      color:
                        activeTab === 'plan' ? '#fff' : colors.textSecondary,
                    }}
                  >
                    Kế hoạch
                  </Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                onPress={() => setActiveTab('points')}
                className="items-center rounded-xl px-4 py-3"
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
              <TouchableOpacity
                onPress={() => setActiveTab('inventory')}
                className="items-center rounded-xl px-4 py-3"
                style={{
                  backgroundColor:
                    activeTab === 'inventory' ? colors.primary : colors.card,
                  borderWidth: 1,
                  borderColor:
                    activeTab === 'inventory' ? colors.primary : colors.border,
                }}
              >
                <Text
                  className="text-sm font-bold"
                  style={{
                    color:
                      activeTab === 'inventory' ? '#fff' : colors.textSecondary,
                  }}
                >
                  Kho & yêu cầu
                </Text>
              </TouchableOpacity>
            </ScrollView>

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

                  {myMemberTasksByCampaign.length > 0 ? (
                    <Text
                      className="mt-2 text-xs font-semibold"
                      style={{ color: colors.secondary }}
                    >
                      Bạn đang có {myMemberTasksByCampaign.length} công việc
                      được giao trong chiến dịch này.
                    </Text>
                  ) : null}

                  <View className="mt-4 gap-3">
                    {tasks.length > 0 ? (
                      tasks.map((task: CampaignTaskResponse) => (
                        <View key={task.campaignTaskId} className="gap-2">
                          <TaskCard
                            task={toTaskItem(task)}
                            onPress={() =>
                              setSelectedTaskId(task.campaignTaskId)
                            }
                          />
                          <TouchableOpacity
                            onPress={() =>
                              openTaskProgress(task.campaignTaskId)
                            }
                            className="flex-row items-center justify-center rounded-xl py-3"
                            style={{
                              backgroundColor: `${colors.primary}12`,
                              borderWidth: 1,
                              borderColor: `${colors.primary}33`,
                            }}
                          >
                            <Ionicons
                              name="create-outline"
                              size={16}
                              color={colors.primary}
                            />
                            <Text
                              className="ml-2 text-sm font-bold"
                              style={{ color: colors.primary }}
                            >
                              Cập nhật tiến độ nhiệm vụ này
                            </Text>
                          </TouchableOpacity>
                          {selectedTaskId === task.campaignTaskId &&
                          myMemberTasks.length > 0 ? (
                            <View
                              className="rounded-xl border p-3"
                              style={{
                                borderColor: `${colors.secondary}30`,
                                backgroundColor: `${colors.secondary}08`,
                              }}
                            >
                              <Text
                                className="text-sm font-semibold"
                                style={{ color: colors.secondary }}
                              >
                                Phần việc của tôi trong công việc này
                              </Text>
                              <View className="mt-2 gap-2">
                                {myMemberTasks.map((memberTask) => (
                                  <View
                                    key={memberTask.memberTaskId}
                                    className="rounded-lg px-3 py-2"
                                    style={{
                                      backgroundColor: `${MEMBER_STATUS_MAP[memberTask.status]?.color || colors.textSecondary}10`,
                                      borderWidth: 1,
                                      borderColor: `${MEMBER_STATUS_MAP[memberTask.status]?.color || colors.border}35`,
                                    }}
                                  >
                                    <Text
                                      className="text-sm font-semibold"
                                      style={{ color: colors.text }}
                                    >
                                      {memberTask.subTaskTitle}
                                    </Text>
                                    <View
                                      className="mt-2 self-start rounded-full px-2.5 py-1"
                                      style={{
                                        backgroundColor: `${MEMBER_STATUS_MAP[memberTask.status]?.color || colors.textSecondary}18`,
                                      }}
                                    >
                                      <Text
                                        className="text-xs font-bold"
                                        style={{
                                          color:
                                            MEMBER_STATUS_MAP[memberTask.status]
                                              ?.color || colors.textSecondary,
                                        }}
                                      >
                                        {MEMBER_STATUS_MAP[memberTask.status]
                                          ?.label || 'Đã giao'}
                                      </Text>
                                    </View>
                                    {memberTask.failureReason ? (
                                      <Text
                                        className="mt-2 text-xs font-semibold"
                                        style={{ color: colors.status.error }}
                                      >
                                        Lý do thất bại:{' '}
                                        {memberTask.failureReason}
                                      </Text>
                                    ) : null}
                                  </View>
                                ))}
                              </View>
                            </View>
                          ) : null}
                        </View>
                      ))
                    ) : (
                      <View
                        className="rounded-xl border border-dashed p-4"
                        style={{ borderColor: colors.border }}
                      >
                        <Text style={{ color: colors.textSecondary }}>
                          {canManageTasks
                            ? 'Nhóm trưởng chưa tạo công việc nào cho đội này.'
                            : 'Bạn chưa có nhiệm vụ nào có phần việc được giao trong chiến dịch này.'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Chi tiết công việc và cập nhật trạng thái phần việc */}
                {shouldShowPersonalTaskPanels ? (
                  <View
                    className="rounded-2xl border p-4"
                    style={{
                      borderColor: `${colors.secondary}30`,
                      backgroundColor: `${colors.secondary}08`,
                    }}
                  >
                    <Text
                      className="text-lg font-bold"
                      style={{ color: colors.secondary }}
                    >
                      Phần việc được giao cho tôi
                    </Text>
                    <Text
                      className="mt-1 text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      Chọn một công việc ở trên để xem phần việc của bạn và mở
                      màn cập nhật tiến độ.
                    </Text>
                    <View className="mt-3 gap-2">
                      {myMemberTasks.map((memberTask) => (
                        <View
                          key={memberTask.memberTaskId}
                          className="rounded-xl border p-3"
                          style={{
                            borderColor: colors.border,
                            backgroundColor: colors.card,
                          }}
                        >
                          <Text
                            className="text-sm font-semibold"
                            style={{ color: colors.text }}
                          >
                            {memberTask.subTaskTitle}
                          </Text>
                          <Text
                            className="mt-1 text-xs"
                            style={{ color: colors.textSecondary }}
                          >
                            {MEMBER_STATUS_MAP[memberTask.status]?.label ||
                              'Đã giao'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : (
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
                            label={`Trạng thái: ${taskDetail.status === CampaignTaskStatus.Blocked ? 'Bị chặn do nhiệm vụ con thất bại' : CampaignTaskStatusLabels[taskDetail.status] || 'Chưa rõ'}`}
                            color={
                              taskDetail.status === CampaignTaskStatus.Blocked
                                ? colors.status.error
                                : colors.primary
                            }
                          />
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
                        {taskDetail.status === CampaignTaskStatus.Blocked ? (
                          <View
                            className="rounded-xl border p-3"
                            style={{
                              borderColor: `${colors.status.error}35`,
                              backgroundColor: `${colors.status.error}10`,
                            }}
                          >
                            <Text
                              className="text-sm font-semibold"
                              style={{ color: colors.status.error }}
                            >
                              Nhiệm vụ chính đang bị chặn do có nhiệm vụ con
                              thất bại
                            </Text>
                            <Text
                              className="mt-1 text-xs"
                              style={{ color: colors.textSecondary }}
                            >
                              Hướng xử lý: giao lại cho người khác, mở lại xử lý
                              với người hiện tại, hoặc hủy nhiệm vụ con nếu
                              không còn cần thiết.
                            </Text>
                          </View>
                        ) : null}
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
                                    MEMBER_STATUS_MAP[
                                      MemberTaskStatus.Assigned
                                    ];
                                  const nextStatuses = getNextStatusOptions(
                                    memberTask.status,
                                  );
                                  const isMyTask =
                                    memberTask.volunteerProfileId ===
                                    myVolunteerProfileId;
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
                                            const nsInfo =
                                              MEMBER_STATUS_MAP[ns];
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
                                                  style={{
                                                    color: nsInfo.color,
                                                  }}
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
                )}
              </>
            ) : activeTab === 'plan' ? (
              <ReliefPlanSection
                summary={planSummary}
                isLoading={isPlanSummaryLoading}
                onOpenAllocateTask={
                  canManageTasks
                    ? () => openPlanAllocateTask(planSummary.areas[0]?.areaName)
                    : undefined
                }
                onOpenProgress={openDistributionPointDeliveries}
                onOpenIsolatedFlow={openIsolatedProgress}
                onOpenAllIsolatedHouseholds={openAllIsolatedHouseholds}
              />
            ) : activeTab === 'points' ? (
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
                  Các điểm phân phối hàng cứu trợ cho nhóm hộ không cô lập, nhận
                  hàng tại điểm phát.
                </Text>
                <View
                  className="mt-3 rounded-xl border p-3"
                  style={{
                    borderColor: `${colors.primary}24`,
                    backgroundColor: `${colors.primary}08`,
                  }}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: colors.primary }}
                  >
                    Cách tổ chức 1: Điểm phát cho hộ không cô lập
                  </Text>
                  <Text
                    className="mt-1 text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    Dùng tính năng này khi đội phụ trách các lượt phát tại điểm:
                    trực điểm phát, kiểm soát hàng chờ phát và xử lý theo ca.
                  </Text>
                </View>
                <View className="mt-4 gap-3">
                  {distributionPoints.length > 0 ? (
                    distributionPoints.map((dp: DistributionPointResponse) => (
                      <TouchableOpacity
                        key={dp.distributionPointId}
                        onPress={() =>
                          openDistributionPointDeliveries(
                            dp.distributionPointId,
                          )
                        }
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

                        <View className="mt-3 flex-row flex-wrap gap-2">
                          {myTaskByDistributionPointId.has(
                            dp.distributionPointId,
                          ) ? (
                            <View
                              className="rounded-full px-3 py-1"
                              style={{
                                backgroundColor: `${colors.secondary}18`,
                              }}
                            >
                              <Text
                                className="text-xs font-bold"
                                style={{ color: colors.secondary }}
                              >
                                Phần việc của tôi
                              </Text>
                            </View>
                          ) : null}
                          {pickupDeliveries.length > 0 ? (
                            <View
                              className="rounded-full px-3 py-1"
                              style={{ backgroundColor: `${colors.primary}12` }}
                            >
                              <Text
                                className="text-xs font-bold"
                                style={{ color: colors.primary }}
                              >
                                Có hộ chờ phát tại điểm
                              </Text>
                            </View>
                          ) : null}
                          {isolatedDeliveries.length > 0 ? (
                            <View
                              className="rounded-full px-3 py-1"
                              style={{
                                backgroundColor: `${colors.status.pending}12`,
                              }}
                            >
                              <Text
                                className="text-xs font-bold"
                                style={{ color: colors.status.pending }}
                              >
                                Có hộ cô lập
                              </Text>
                            </View>
                          ) : null}
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
                        <View
                          className="mt-3 flex-row items-center justify-between rounded-lg px-3 py-2"
                          style={{ backgroundColor: `${colors.primary}10` }}
                        >
                          <Text
                            className="text-sm font-semibold"
                            style={{ color: colors.primary }}
                          >
                            Xem hộ dân đang chờ phát
                          </Text>
                          <Ionicons
                            name="arrow-forward"
                            size={16}
                            color={colors.primary}
                          />
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
                <TouchableOpacity
                  onPress={openIsolatedProgress}
                  className="mt-4 rounded-xl border p-4"
                  style={{
                    borderColor: `${colors.status.pending}24`,
                    backgroundColor: `${colors.status.pending}08`,
                  }}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: colors.status.pending }}
                  >
                    Cách tổ chức 2: Cơ động cho hộ cô lập
                  </Text>
                  <Text
                    className="mt-1 text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    {isolatedDeliveries.length > 0
                      ? `Đội hiện có ${isolatedDeliveries.length} lượt phát cho hộ cô lập cần xử lý theo tuyến tận nơi, không gắn với điểm phát.`
                      : 'Hiện chưa có lượt phát nào cho hộ cô lập trong danh sách của đội.'}
                  </Text>

                  <Text
                    className="mt-2 text-xs font-bold"
                    style={{ color: colors.status.pending }}
                  >
                    Mở tiến độ hộ cô lập
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <InventorySection
                campaignId={teamMode === 'relief' ? campaignId || null : null}
                campaignTeamId={myCampaignTeam?.campaignTeamId}
                userId={user?.id}
                distributionPoints={distributionPoints}
                defaultDistributionPointId={
                  distributionPoints[0]?.distributionPointId
                }
              />
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <View
      className="bg-white/12 rounded-2xl px-3 py-3"
      style={{ minHeight: 72 }}
    >
      <Text className="text-xs text-white/70" numberOfLines={2}>
        {label}
      </Text>
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
