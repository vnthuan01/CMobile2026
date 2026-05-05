import '@/global.css';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import StatusRadioOption from '@/src/components/common/StatusRadioOption';
import StickyFooterButton from '@/src/components/common/StickyFooterButton';
import { useTheme } from '@/src/context/ThemeContext';
import { useActiveAssignedCampaign } from '@/src/hooks/useActiveAssignedCampaign';
import { useAssignedCampaigns } from '@/src/hooks/useAssignedCampaigns';
import {
  useCampaignTaskDetail,
  useCampaignTeams,
  useChangeMemberTaskStatus,
  useMyMemberTasks,
} from '@/src/hooks/useLeaderTasks';
import { useMyTeam } from '@/src/hooks/useMyTeam';
import {
  useCampaignPackages,
  useCompleteDelivery,
  useCompleteDeliveryBatch,
  useCompleteMemberTaskDeliveryWithDelivery,
  useDeliveryDetail,
  useMyMemberTaskDeliveries,
  useReliefChecklist,
  useTeamWorklist,
  useUpdateHouseholdStatus,
} from '@/src/hooks/useReliefDistribution';
import { useSelectedCampaign } from '@/src/hooks/useSelectedCampaign';
import { uploadService } from '@/src/services/uploadService';
import {
  CampaignTaskStatus,
  MemberTaskStatus,
  type CampaignTeamResponse,
  type MyMemberTaskResponse,
} from '@/src/types/leaderTask';
import {
  DeliveryModeLabels,
  HouseholdFulfillmentStatus,
  HouseholdFulfillmentStatusLabels,
  type CampaignHouseholdResponse,
  type HouseholdChecklistItemResponse,
} from '@/src/types/reliefDistribution';
import { getVolunteerTaskCategoryLabel } from '@/src/utils/taskClassification';
import { showErrorToast, showSuccessToast } from '@/src/utils/toast';
import { validateVolunteerTaskCompletion } from '@/src/utils/volunteerTaskValidation';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  LayoutAnimation,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ProgressTab = 'subtask' | 'delivery';

interface ProgressForReliefScreenProps {
  onBack?: () => void;
  onMarkSOS?: () => void;
  viewMode?: 'personal';
}

interface ProofAsset {
  uri: string;
  mimeType?: string;
  fileName?: string;
  uploadedUrl?: string;
}

type ProofAssetMap = Record<string, ProofAsset[]>;
type SelectedPackageMap = Record<string, string[]>;

const MEMBER_STATUS_OPTIONS = (colors: any) => [
  {
    id: MemberTaskStatus.InProgress,
    icon: 'time',
    title: 'Đang tiến hành',
    subtitle: 'Bắt đầu thực hiện nhiệm vụ',
    color: colors.secondary,
  },
  {
    id: MemberTaskStatus.Completed,
    icon: 'checkmark-circle',
    title: 'Hoàn thành',
    subtitle: 'Đã hoàn thành nhiệm vụ',
    color: colors.status.completed,
  },
  {
    id: MemberTaskStatus.Failed,
    icon: 'close-circle',
    title: 'Thất bại',
    subtitle: 'Không thể hoàn thành nhiệm vụ',
    color: colors.status.error,
  },
];

const HOUSEHOLD_STATUS_LABELS: Record<HouseholdFulfillmentStatus, string> = {
  [HouseholdFulfillmentStatus.Pending]: 'Chờ phát',
  [HouseholdFulfillmentStatus.PartiallyDelivered]: 'Phát một phần',
  [HouseholdFulfillmentStatus.Delivered]: 'Đã phát',
  [HouseholdFulfillmentStatus.Skipped]: 'Bỏ qua',
};

export default function ProgressForReliefScreen({
  onBack,
  onMarkSOS,
  viewMode = 'personal',
}: ProgressForReliefScreenProps) {
  const { bottom } = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const scrollRef = useRef<ScrollView | null>(null);
  const deliveryListRef = useRef<FlatList | null>(null);
  const params = useLocalSearchParams<{
    campaignId?: string;
    campaignTeamId?: string;
    campaignTeamName?: string;
    campaignTaskId?: string;
    memberTaskId?: string;
    distributionPointId?: string;
    initialTab?: string;
    flowMode?: string;
  }>();

  // Data hooks
  const { data: myTeamData } = useMyTeam();
  const team = myTeamData?.team;
  const teamMode = myTeamData?.teamMode ?? 'rescue';
  const { data: fallbackAssignedCampaigns = [] } = useAssignedCampaigns(
    team?.teamId ?? '',
    !!team?.teamId,
  );
  const { selectedCampaignId } = useSelectedCampaign(
    team,
    fallbackAssignedCampaigns,
    typeof params.campaignId === 'string' ? params.campaignId : null,
  );
  const { campaignId: activeCampaignId } = useActiveAssignedCampaign(
    team,
    selectedCampaignId,
    fallbackAssignedCampaigns,
  );
  const campaignId = params.campaignId || activeCampaignId;

  const { data: campaignTeams = [] } = useCampaignTeams(
    teamMode === 'relief' ? campaignId : null,
  );
  const selectedCampaignTeamId =
    typeof params.campaignTeamId === 'string'
      ? params.campaignTeamId
      : undefined;
  const myCampaignTeam =
    (selectedCampaignTeamId
      ? campaignTeams.find(
          (item: CampaignTeamResponse) =>
            item.campaignTeamId === selectedCampaignTeamId,
        )
      : undefined) ??
    campaignTeams.find(
      (item: CampaignTeamResponse) => item.teamId === team?.teamId,
    ) ??
    campaignTeams[0];

  const { data: myMemberTaskData, isLoading: isMyMemberTasksLoading } =
    useMyMemberTasks(teamMode === 'relief' ? campaignId : null, {
      pageIndex: 1,
      pageSize: 50,
      campaignTeamId: myCampaignTeam?.campaignTeamId,
    });
  const myCampaignTasks = useMemo(() => {
    const rawItems = myMemberTaskData?.items ?? [];
    const seen = new Set<string>();

    return rawItems.filter((item) => {
      const key = `${item.memberTaskId}-${item.campaignTaskId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [myMemberTaskData?.items]);
  const flowMode =
    params.flowMode === 'isolated' ? 'isolated' : 'distribution-point';
  const isPersonalView = viewMode === 'personal';
  const shouldShowSubtaskTab = isPersonalView;
  const deliveryGuideLines = shouldShowSubtaskTab
    ? [
        '1) Giao hàng cho các hộ được gán',
        '2) Quay lại màn Nhiệm vụ con để bấm Hoàn thành',
      ]
    : [
        '1) Kiểm tra đúng danh sách hộ theo flow đang chọn',
        '2) Hoàn tất phát hàng và bổ sung ảnh minh chứng cho từng hộ',
        '3) Theo dõi tiến độ ngay trên danh sách để điều phối tiếp',
      ];
  const shouldLoadMyMemberTaskDeliveries =
    isPersonalView &&
    teamMode === 'relief' &&
    !!campaignId &&
    (typeof params.campaignTaskId === 'string' ||
      typeof params.distributionPointId === 'string');
  const { data: myMemberTaskDeliveriesData } = useMyMemberTaskDeliveries(
    shouldLoadMyMemberTaskDeliveries ? campaignId : null,
    {
      pageIndex: 1,
      pageSize: 100,
      campaignTeamId: myCampaignTeam?.campaignTeamId,
      campaignTaskId:
        typeof params.campaignTaskId === 'string'
          ? params.campaignTaskId
          : undefined,
      distributionPointId:
        flowMode === 'distribution-point' &&
        typeof params.distributionPointId === 'string'
          ? params.distributionPointId
          : undefined,
    },
  );
  const { data: teamWorklistData } = useTeamWorklist(
    teamMode === 'relief' ? campaignId : null,
    {
      pageIndex: 1,
      pageSize: 100,
      campaignTeamId: myCampaignTeam?.campaignTeamId,
      deliveryMode: flowMode === 'isolated' ? 0 : 1,
      distributionPointId:
        flowMode === 'distribution-point' &&
        typeof params.distributionPointId === 'string'
          ? params.distributionPointId
          : undefined,
    },
  );
  const { data: campaignPackagesData } = useCampaignPackages(
    teamMode === 'relief' ? campaignId : null,
    { pageIndex: 1, pageSize: 100 },
  );

  const [deliveryPageIndex, setDeliveryPageIndex] = useState(1);
  const [deliveryPageSize, setDeliveryPageSize] = useState<50 | 100>(50);

  // Households for delivery
  const { data: checklistData, isLoading: isChecklistLoading } =
    useReliefChecklist(teamMode === 'relief' ? campaignId : null, {
      campaignTeamId: myCampaignTeam?.campaignTeamId,
      distributionPointId: params.distributionPointId,
      deliveryMode: flowMode === 'isolated' ? 0 : 1,
      pageIndex: deliveryPageIndex || 1,
      pageSize: deliveryPageSize || 50,
    });

  // State
  const [activeTab, setActiveTab] = useState<ProgressTab>('subtask');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedMemberTaskId, setSelectedMemberTaskId] = useState<
    string | null
  >(null);
  const [selectedMemberTaskStatus, setSelectedMemberTaskStatus] =
    useState<MemberTaskStatus | null>(null);
  const [failureReasonInput, setFailureReasonInput] = useState('');
  const [showFailureReasonModal, setShowFailureReasonModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [proofAssetsByDeliveryId, setProofAssetsByDeliveryId] =
    useState<ProofAssetMap>({});
  const [selectedHouseholdKeys, setSelectedHouseholdKeys] = useState<string[]>(
    [],
  );
  const [selectedPackageIdsByHousehold, setSelectedPackageIdsByHousehold] =
    useState<SelectedPackageMap>({});
  const [deliverySearch, setDeliverySearch] = useState('');
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState<
    'all' | HouseholdFulfillmentStatus
  >('all');
  const [jumpToPageInput, setJumpToPageInput] = useState('1');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);
  const [expandedDeliveryId, setExpandedDeliveryId] = useState<string | null>(
    null,
  );
  const [proofModalDeliveryId, setProofModalDeliveryId] = useState<
    string | null
  >(null);
  const [submittingDeliveryId, setSubmittingDeliveryId] = useState<
    string | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allChecklistItems = useMemo(
    () => checklistData?.items ?? [],
    [checklistData?.items],
  );
  const checklistTotalCount = checklistData?.totalCount ?? 0;
  const checklistCurrentPage = checklistData?.currentPage ?? deliveryPageIndex;
  const checklistTotalPages = checklistData?.totalPages ?? 1;
  const checklistPageSize = checklistData?.pageSize ?? deliveryPageSize;
  const selectedDistributionPointId =
    typeof params.distributionPointId === 'string'
      ? params.distributionPointId
      : undefined;
  const shouldUseChecklistAsPrimarySource =
    isPersonalView &&
    flowMode === 'distribution-point' &&
    !!selectedDistributionPointId;
  const checklistDebugReasons = useMemo(() => {
    const reasons: string[] = [];
    if (teamMode !== 'relief') {
      reasons.push('Team hiện tại không ở chế độ relief.');
    }
    if (!campaignId) {
      reasons.push('Không xác định được campaignId để fetch checklist.');
    }
    if (flowMode === 'distribution-point' && !selectedDistributionPointId) {
      reasons.push('Không có distributionPointId được truyền vào màn hình.');
    }
    if (!myCampaignTeam?.campaignTeamId) {
      reasons.push('Không xác định được campaignTeamId của team hiện tại.');
    }
    if (
      !!selectedCampaignTeamId &&
      !!myCampaignTeam?.campaignTeamId &&
      selectedCampaignTeamId !== myCampaignTeam.campaignTeamId
    ) {
      reasons.push(
        `campaignTeamId từ route (${selectedCampaignTeamId}) không khớp campaignTeamId resolve được (${myCampaignTeam.campaignTeamId}).`,
      );
    }
    if (
      checklistData &&
      checklistTotalCount === 0 &&
      flowMode === 'distribution-point' &&
      selectedDistributionPointId &&
      myCampaignTeam?.campaignTeamId
    ) {
      reasons.push(
        'Hiện chưa có hộ phù hợp với bộ lọc điểm phát và đội đang chọn.',
      );
    }
    return reasons;
  }, [
    campaignId,
    checklistData,
    checklistTotalCount,
    flowMode,
    myCampaignTeam?.campaignTeamId,
    selectedCampaignTeamId,
    selectedDistributionPointId,
    teamMode,
  ]);
  const deliveryItems = useMemo(() => {
    const assignedItems = myMemberTaskDeliveriesData?.items ?? [];
    const teamWorklistItems = teamWorklistData?.items ?? [];
    const checklistFiltered = allChecklistItems
      .filter((item) =>
        flowMode === 'isolated'
          ? item.deliveryMode === 0
          : item.deliveryMode === 1,
      )
      .map((item) => ({
        ...item,
        reliefPackageDefinitionName:
          item.reliefPackageDefinitionName || 'Gói cứu trợ',
      }));
    const checklistByDeliveryId = new Map(
      checklistFiltered.map((item) => [item.householdDeliveryId, item]),
    );

    if (shouldUseChecklistAsPrimarySource) {
      return checklistFiltered;
    }

    if (assignedItems.length > 0) {
      return assignedItems
        .filter((item) =>
          flowMode === 'isolated'
            ? item.deliveryMode === 0 || item.isIsolated
            : item.deliveryMode === 1,
        )
        .map((item) => {
          const matchedChecklist = checklistByDeliveryId.get(
            item.householdDeliveryId,
          );
          const resolvedDeliveryStatus =
            (item as any).deliveryStatus ??
            (item as any).DeliveryStatus ??
            matchedChecklist?.status ??
            item.status;

          return {
            householdDeliveryId: item.householdDeliveryId,
            campaignId: item.campaignId,
            campaignHouseholdId:
              item.campaignHouseholdId ||
              matchedChecklist?.campaignHouseholdId ||
              '',
            householdCode:
              item.householdCode || matchedChecklist?.householdCode || '',
            headOfHouseholdName:
              item.headOfHouseholdName ||
              matchedChecklist?.headOfHouseholdName ||
              'Chưa rõ hộ dân',
            campaignTeamId:
              item.campaignTeamId || matchedChecklist?.campaignTeamId,
            campaignTeamName:
              item.campaignTeamName || matchedChecklist?.campaignTeamName,
            distributionPointId:
              item.distributionPointId || matchedChecklist?.distributionPointId,
            distributionPointName:
              item.distributionPointName ||
              matchedChecklist?.distributionPointName,
            reliefPackageDefinitionId:
              item.reliefPackageDefinitionId ||
              matchedChecklist?.reliefPackageDefinitionId ||
              '',
            reliefPackageDefinitionName:
              item.reliefPackageDefinitionName ||
              matchedChecklist?.reliefPackageDefinitionName ||
              'Gói cứu trợ',
            deliveryMode: item.deliveryMode,
            status: resolvedDeliveryStatus,
            scheduledAt:
              item.scheduledAt || matchedChecklist?.scheduledAt || '',
            deliveredAt: item.deliveredAt || matchedChecklist?.deliveredAt,
            notes: item.notes || matchedChecklist?.notes,
            proofCount: matchedChecklist?.proofCount ?? item.proofCount ?? 0,
          };
        });
    }

    if (teamWorklistItems.length > 0) {
      return teamWorklistItems
        .filter((item) =>
          flowMode === 'isolated'
            ? item.deliveryMode === 0 || item.isIsolated
            : item.deliveryMode === 1,
        )
        .map((item) => {
          const matchedChecklist = checklistByDeliveryId.get(
            item.householdDeliveryId,
          );

          return {
            householdDeliveryId: item.householdDeliveryId,
            campaignId: item.campaignId,
            campaignHouseholdId: item.campaignHouseholdId,
            householdCode: item.householdCode,
            headOfHouseholdName: item.headOfHouseholdName,
            campaignTeamId: item.campaignTeamId,
            campaignTeamName: item.campaignTeamName,
            distributionPointId: item.distributionPointId,
            distributionPointName: item.distributionPointName,
            reliefPackageDefinitionId:
              item.reliefPackageDefinitionId ||
              matchedChecklist?.reliefPackageDefinitionId ||
              '',
            reliefPackageDefinitionName:
              item.reliefPackageDefinitionName ||
              matchedChecklist?.reliefPackageDefinitionName ||
              'Gói cứu trợ',
            deliveryMode: item.deliveryMode,
            status: matchedChecklist?.status ?? item.status,
            scheduledAt: item.scheduledAt || '',
            deliveredAt: item.deliveredAt,
            notes: item.notes || matchedChecklist?.notes,
            proofCount: matchedChecklist?.proofCount ?? item.proofCount ?? 0,
          };
        });
    }

    return checklistFiltered;
  }, [
    allChecklistItems,
    flowMode,
    myMemberTaskDeliveriesData?.items,
    shouldUseChecklistAsPrimarySource,
    teamWorklistData?.items,
  ]);
  const resolvedDeliveryTotalCount = shouldUseChecklistAsPrimarySource
    ? checklistTotalCount
    : (myMemberTaskDeliveriesData?.items?.length ??
      teamWorklistData?.totalCount ??
      checklistTotalCount);
  const resolvedDeliveryCurrentPage = shouldUseChecklistAsPrimarySource
    ? checklistCurrentPage
    : (teamWorklistData?.currentPage ?? checklistCurrentPage);
  const resolvedDeliveryTotalPages = shouldUseChecklistAsPrimarySource
    ? checklistTotalPages
    : (teamWorklistData?.totalPages ?? checklistTotalPages);
  const resolvedDeliveryPageSize = shouldUseChecklistAsPrimarySource
    ? checklistPageSize
    : (teamWorklistData?.pageSize ?? checklistPageSize);
  const isResolvedDeliveryLoading = shouldUseChecklistAsPrimarySource
    ? isChecklistLoading
    : isChecklistLoading &&
      !myMemberTaskDeliveriesData?.items?.length &&
      !teamWorklistData?.items?.length;
  const filteredDeliveryItems = useMemo(() => {
    const keyword = (deliverySearch ?? '').trim().toLowerCase();

    return deliveryItems.filter((item) => {
      const matchKeyword =
        !keyword ||
        (item.headOfHouseholdName || '').toLowerCase().includes(keyword) ||
        (item.householdCode || '').toLowerCase().includes(keyword) ||
        (item.distributionPointName || '').toLowerCase().includes(keyword) ||
        (item.reliefPackageDefinitionName || '')
          .toLowerCase()
          .includes(keyword);

      const matchStatus =
        deliveryStatusFilter === 'all' || item.status === deliveryStatusFilter;
      return matchKeyword && matchStatus;
    });
  }, [deliveryItems, deliverySearch, deliveryStatusFilter]);
  const packageCashSupportMap = useMemo(() => {
    const map = new Map<string, number>();
    (campaignPackagesData?.items ?? []).forEach((pkg) => {
      map.set(pkg.reliefPackageDefinitionId, pkg.cashSupportAmount || 0);
    });
    return map;
  }, [campaignPackagesData?.items]);
  const packageNameMap = useMemo(() => {
    const map = new Map<string, string>();
    (campaignPackagesData?.items ?? []).forEach((pkg) => {
      if (pkg.reliefPackageDefinitionId && pkg.name) {
        map.set(pkg.reliefPackageDefinitionId, pkg.name);
      }
    });
    return map;
  }, [campaignPackagesData?.items]);
  const groupedDeliveryItems = useMemo(() => {
    const groups = new Map<
      string,
      {
        key: string;
        status: HouseholdChecklistItemResponse['status'];
        proofCount: number;
        cashSupportAmount: number;
        household: HouseholdChecklistItemResponse;
        items: HouseholdChecklistItemResponse[];
        packageGroups: {
          name: string;
          status: HouseholdFulfillmentStatus;
          count: number;
        }[];
      }
    >();

    filteredDeliveryItems.forEach((item) => {
      const key =
        item.campaignHouseholdId ||
        item.householdCode ||
        item.householdDeliveryId;
      const existing = groups.get(key);

      if (existing) {
        existing.items.push(item);
        existing.proofCount += item.proofCount || 0;
        const statuses = [
          ...existing.items.map((current) => current.status),
          item.status,
        ];
        const allDelivered = statuses.every(
          (status) => status === HouseholdFulfillmentStatus.Delivered,
        );
        const anyDelivered = statuses.some(
          (status) => status === HouseholdFulfillmentStatus.Delivered,
        );
        const anyPending = statuses.some(
          (status) =>
            status === HouseholdFulfillmentStatus.Pending ||
            status === HouseholdFulfillmentStatus.PartiallyDelivered,
        );
        existing.status = allDelivered
          ? HouseholdFulfillmentStatus.Delivered
          : anyDelivered && anyPending
            ? HouseholdFulfillmentStatus.PartiallyDelivered
            : item.status;
        existing.cashSupportAmount +=
          packageCashSupportMap.get(item.reliefPackageDefinitionId) || 0;
        existing.packageGroups = Array.from(
          existing.items
            .reduce((map, current) => {
              const resolvedPackageName =
                packageNameMap.get(current.reliefPackageDefinitionId) ||
                current.reliefPackageDefinitionName ||
                'Gói cứu trợ';
              const packageKey =
                current.reliefPackageDefinitionId ||
                resolvedPackageName ||
                current.householdDeliveryId;
              const currentGroup = map.get(packageKey);
              if (currentGroup) {
                currentGroup.count += 1;
                if (current.status < currentGroup.status) {
                  currentGroup.status = current.status;
                }
              } else {
                map.set(packageKey, {
                  name: resolvedPackageName,
                  status: current.status,
                  count: 1,
                });
              }
              return map;
            }, new Map<string, { name: string; status: HouseholdFulfillmentStatus; count: number }>())
            .values(),
        );
        return;
      }

      groups.set(key, {
        key,
        status: item.status,
        proofCount: item.proofCount || 0,
        cashSupportAmount:
          packageCashSupportMap.get(item.reliefPackageDefinitionId) || 0,
        household: item,
        items: [item],
        packageGroups: [
          {
            name:
              packageNameMap.get(item.reliefPackageDefinitionId) ||
              item.reliefPackageDefinitionName ||
              'Gói cứu trợ',
            status: item.status,
            count: 1,
          },
        ],
      });
    });

    return Array.from(groups.values());
  }, [filteredDeliveryItems, packageCashSupportMap, packageNameMap]);
  const activeProofAssets = useMemo(
    () =>
      expandedDeliveryId
        ? (proofAssetsByDeliveryId[expandedDeliveryId] ?? [])
        : [],
    [expandedDeliveryId, proofAssetsByDeliveryId],
  );
  const images = useMemo(
    () => activeProofAssets.map((asset) => asset.uri),
    [activeProofAssets],
  );
  const pendingGroupedDeliveryItems = useMemo(
    () =>
      groupedDeliveryItems.filter(
        (group) =>
          group.status === HouseholdFulfillmentStatus.Pending ||
          group.status === HouseholdFulfillmentStatus.PartiallyDelivered,
      ),
    [groupedDeliveryItems],
  );
  const allFilteredSelected =
    pendingGroupedDeliveryItems.length > 0 &&
    pendingGroupedDeliveryItems.every((group) =>
      selectedHouseholdKeys.includes(group.key),
    );

  useEffect(() => {
    setDeliveryPageIndex(1);
  }, [params.distributionPointId, myCampaignTeam?.campaignTeamId]);

  useEffect(() => {
    setJumpToPageInput(String(checklistCurrentPage));
  }, [checklistCurrentPage]);

  useCampaignTaskDetail(selectedTaskId);
  const { data: selectedDeliveryDetail, isLoading: isDeliveryDetailLoading } =
    useDeliveryDetail(campaignId, proofModalDeliveryId);

  useEffect(() => {
    if (params.initialTab === 'delivery' || params.initialTab === 'subtask') {
      const nextTab =
        params.initialTab === 'subtask' && !shouldShowSubtaskTab
          ? 'delivery'
          : params.initialTab;
      setActiveTab(nextTab);
    }
  }, [params.initialTab, shouldShowSubtaskTab]);

  useEffect(() => {
    if (!shouldShowSubtaskTab && activeTab === 'subtask') {
      setActiveTab('delivery');
    }
  }, [activeTab, shouldShowSubtaskTab]);

  useEffect(() => {
    const matchedMemberTask =
      typeof params.memberTaskId === 'string'
        ? myCampaignTasks.find(
            (task) => task.memberTaskId === params.memberTaskId,
          )
        : undefined;

    if (matchedMemberTask) {
      setSelectedMemberTaskId(matchedMemberTask.memberTaskId);
      setSelectedTaskId(matchedMemberTask.campaignTaskId);
      return;
    }

    if (
      isPersonalView &&
      flowMode === 'isolated' &&
      myCampaignTasks.length > 0 &&
      !selectedMemberTaskId
    ) {
      setSelectedMemberTaskId(myCampaignTasks[0].memberTaskId);
      setSelectedTaskId(myCampaignTasks[0].campaignTaskId);
      return;
    }

    if (
      params.campaignTaskId &&
      myCampaignTasks.some(
        (task) => task.campaignTaskId === params.campaignTaskId,
      )
    ) {
      setSelectedTaskId(params.campaignTaskId);
      return;
    }

    if (
      typeof params.campaignTaskId === 'string' &&
      params.campaignTaskId !== selectedTaskId
    ) {
      setSelectedTaskId(params.campaignTaskId);
      return;
    }

    if (
      selectedMemberTaskId &&
      !myCampaignTasks.some(
        (task) => task.memberTaskId === selectedMemberTaskId,
      )
    ) {
      setSelectedMemberTaskId(myCampaignTasks[0]?.memberTaskId ?? null);
      setSelectedTaskId(myCampaignTasks[0]?.campaignTaskId ?? null);
      return;
    }

    if (!selectedTaskId && myCampaignTasks.length > 0) {
      setSelectedTaskId(myCampaignTasks[0].campaignTaskId);
      setSelectedMemberTaskId(myCampaignTasks[0].memberTaskId);
    }
  }, [
    flowMode,
    isPersonalView,
    myCampaignTasks,
    params.campaignTaskId,
    params.memberTaskId,
    selectedMemberTaskId,
    selectedTaskId,
  ]);

  const sortedMyMemberTasks = useMemo(() => {
    const statusRank = (status: MemberTaskStatus) => {
      switch (status) {
        case MemberTaskStatus.InProgress:
          return 0;
        case MemberTaskStatus.Assigned:
          return 1;
        case MemberTaskStatus.Failed:
          return 2;
        case MemberTaskStatus.Completed:
          return 3;
        case MemberTaskStatus.Cancelled:
          return 4;
        default:
          return 5;
      }
    };

    return [...myCampaignTasks].sort((a, b) => {
      const rankDiff = statusRank(a.status) - statusRank(b.status);
      if (rankDiff !== 0) return rankDiff;
      return (
        new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime()
      );
    });
  }, [myCampaignTasks]);
  const activeMemberTask = useMemo<MyMemberTaskResponse | null>(() => {
    if (selectedMemberTaskId) {
      const selectedMemberTask = sortedMyMemberTasks.find(
        (task) => task.memberTaskId === selectedMemberTaskId,
      );
      if (selectedMemberTask) return selectedMemberTask;
    }
    return sortedMyMemberTasks[0] ?? null;
  }, [selectedMemberTaskId, sortedMyMemberTasks]);
  const selectedTaskValidation = useMemo(
    () =>
      validateVolunteerTaskCompletion({
        task: activeMemberTask,
        targetStatus: selectedMemberTaskStatus,
        households: deliveryItems.map((item) => ({
          campaignHouseholdId: item.campaignHouseholdId,
          campaignId: item.campaignId,
          distributionPointId: item.distributionPointId,
          campaignTeamId: item.campaignTeamId,
          householdCode: item.householdCode,
          headOfHouseholdName: item.headOfHouseholdName,
          householdSize: 1,
          isIsolated: false,
          deliveryMode: item.deliveryMode,
          fulfillmentStatus: item.status,
          createdAt: item.scheduledAt,
        })) as CampaignHouseholdResponse[],
        hasHouseholdDeliveryIds: deliveryItems.every(
          (item) => !!item.householdDeliveryId,
        ),
      }),
    [activeMemberTask, deliveryItems, selectedMemberTaskStatus],
  );

  // Mutations
  const changeMemberStatusMutation = useChangeMemberTaskStatus();
  const updateHouseholdStatusMutation = useUpdateHouseholdStatus();
  const completeDeliveryMutation = useCompleteDelivery();
  const completeDeliveryBatchMutation = useCompleteDeliveryBatch();
  const completeMemberTaskDeliveryMutation =
    useCompleteMemberTaskDeliveryWithDelivery();

  const appendProofAssets = (deliveryId: string, assets: ProofAsset[]) => {
    setProofAssetsByDeliveryId((prev) => ({
      ...prev,
      [deliveryId]: [...(prev[deliveryId] ?? []), ...assets],
    }));
  };

  const openProofPicker = (deliveryId: string) => {
    Alert.alert('Thêm bằng chứng', 'Chọn cách tải bằng chứng lên Cloudinary', [
      {
        text: 'Chụp ảnh / quay video',
        onPress: async () => {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (permission.status !== 'granted') {
            showErrorToast(
              'Thiếu quyền camera',
              'Bạn cần cấp quyền camera để chụp bằng chứng.',
            );
            return;
          }

          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            quality: 0.8,
            allowsEditing: false,
          });

          if (!result.canceled && result.assets?.[0]) {
            const asset = result.assets[0];
            appendProofAssets(deliveryId, [
              {
                uri: asset.uri,
                mimeType: asset.mimeType,
                fileName: asset.fileName,
              },
            ]);
          }
        },
      },
      {
        text: 'Chọn từ thư viện',
        onPress: async () => {
          const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (permission.status !== 'granted') {
            showErrorToast(
              'Thiếu quyền thư viện',
              'Bạn cần cấp quyền thư viện để chọn bằng chứng.',
            );
            return;
          }

          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            quality: 0.8,
            allowsMultipleSelection: true,
          });

          if (!result.canceled && result.assets?.length) {
            appendProofAssets(
              deliveryId,
              result.assets.map((asset) => ({
                uri: asset.uri,
                mimeType: asset.mimeType,
                fileName: asset.fileName,
              })),
            );
          }
        },
      },
      { text: 'Hủy', style: 'cancel' },
    ]);
  };

  const ensureUploadedProofs = async (deliveryId: string) => {
    const deliveryProofAssets = proofAssetsByDeliveryId[deliveryId] ?? [];

    if (deliveryProofAssets.length === 0) {
      openProofPicker(deliveryId);
      throw new Error('Bạn cần chọn ảnh/video bằng chứng trước khi duyệt.');
    }

    const uploaded = await Promise.all(
      deliveryProofAssets.map(async (asset) => {
        if (asset.uploadedUrl) return asset;

        const result = await uploadService.uploadFileToCloudinary(
          asset.uri,
          asset.fileName,
          asset.mimeType,
        );
        if (!result.success || !result.url) {
          throw new Error(result.message || 'Upload bằng chứng thất bại.');
        }

        return {
          ...asset,
          uploadedUrl: result.url,
        };
      }),
    );

    setProofAssetsByDeliveryId((prev) => ({
      ...prev,
      [deliveryId]: uploaded,
    }));
    return uploaded;
  };

  const toggleSelectHousehold = (householdKey: string) => {
    setSelectedHouseholdKeys((prev) =>
      prev.includes(householdKey)
        ? prev.filter((id) => id !== householdKey)
        : [...prev, householdKey],
    );
  };

  const toggleSelectPackage = (
    householdKey: string,
    householdDeliveryId: string,
  ) => {
    setSelectedPackageIdsByHousehold((prev) => {
      const selected = prev[householdKey] ?? [];
      return {
        ...prev,
        [householdKey]: selected.includes(householdDeliveryId)
          ? selected.filter((id) => id !== householdDeliveryId)
          : [...selected, householdDeliveryId],
      };
    });
  };

  const selectAllPackagesForHousehold = (
    householdKey: string,
    items: HouseholdChecklistItemResponse[],
  ) => {
    setSelectedPackageIdsByHousehold((prev) => ({
      ...prev,
      [householdKey]: items.map((item) => item.householdDeliveryId),
    }));
  };

  const clearSelectedPackagesForHousehold = (householdKey: string) => {
    setSelectedPackageIdsByHousehold((prev) => ({
      ...prev,
      [householdKey]: [],
    }));
  };

  const getHouseholdGroupKey = (household: HouseholdChecklistItemResponse) =>
    household.campaignHouseholdId ||
    household.householdCode ||
    household.householdDeliveryId;

  const handlePressDeliveryCard = (
    household: HouseholdChecklistItemResponse,
    isPending: boolean,
    householdKey?: string,
  ) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (isPending) {
      toggleSelectHousehold(householdKey || household.householdDeliveryId);
    }
    setExpandedDeliveryId((prev) =>
      prev === household.householdDeliveryId
        ? null
        : household.householdDeliveryId,
    );
  };

  const openProofLink = async (url: string) => {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      showErrorToast(
        'Không mở được bằng chứng',
        'Liên kết bằng chứng không hợp lệ.',
      );
      return;
    }
    await Linking.openURL(url);
  };

  const getProofTypeLabel = (fileType?: string | null) => {
    if (!fileType) return 'Tệp minh chứng';
    if (fileType.startsWith('video/')) return 'Video minh chứng';
    if (fileType.startsWith('image/')) return 'Ảnh minh chứng';
    return 'Tệp minh chứng';
  };

  const openProofGallery = (householdDeliveryId: string) => {
    setProofModalDeliveryId(householdDeliveryId);
  };

  const getPackageIcon = (packageName?: string | null) => {
    const normalized = String(packageName ?? '').toLowerCase();
    if (
      normalized.includes('gạo') ||
      normalized.includes('lương') ||
      normalized.includes('thực phẩm') ||
      normalized.includes('nhu yếu phẩm') ||
      normalized.includes('lương thực cơ bản')
    ) {
      return 'restaurant';
    }
    if (normalized.includes('nước')) {
      return 'water';
    }
    if (normalized.includes('y tế') || normalized.includes('thuốc')) {
      return 'medical';
    }
    if (normalized.includes('tiền') || normalized.includes('cash')) {
      return 'cash';
    }
    return 'cube';
  };

  const getDeliveryModeDescription = (mode: number) => {
    return mode === 0
      ? 'Đội cơ động sẽ giao tận nơi cho hộ dân ở khu vực khó tiếp cận.'
      : 'Hộ dân nhận hàng trực tiếp tại điểm phát theo lịch đã sắp xếp.';
  };

  const getStatusTone = (status: HouseholdFulfillmentStatus) => {
    switch (status) {
      case HouseholdFulfillmentStatus.Delivered:
        return {
          bg: `${colors.status.completed}14`,
          text: colors.status.completed,
        };
      case HouseholdFulfillmentStatus.PartiallyDelivered:
        return {
          bg: `${colors.status.inProgress}14`,
          text: colors.status.inProgress,
        };
      case HouseholdFulfillmentStatus.Skipped:
        return {
          bg: `${colors.status.pending}14`,
          text: colors.status.pending,
        };
      default:
        return { bg: `${colors.primary}12`, text: colors.primary };
    }
  };

  const handleToggleSelectAllFiltered = () => {
    const pendingKeys = pendingGroupedDeliveryItems.map((group) => group.key);
    if (pendingKeys.length === 0) return;

    setSelectedHouseholdKeys((prev) => {
      if (pendingKeys.every((key) => prev.includes(key))) {
        return prev.filter((key) => !pendingKeys.includes(key));
      }
      return Array.from(new Set([...prev, ...pendingKeys]));
    });
  };

  const handleJumpToPage = () => {
    const parsed = Number.parseInt(jumpToPageInput.trim(), 10);
    if (Number.isNaN(parsed)) {
      setJumpToPageInput(String(checklistCurrentPage));
      return;
    }
    const safePage = Math.min(
      Math.max(parsed, 1),
      Math.max(checklistTotalPages, 1),
    );
    setDeliveryPageIndex(safePage);
    setJumpToPageInput(String(safePage));
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollToTopButton(offsetY > 520);
  };

  const handleScrollToTop = () => {
    if (activeTab === 'delivery') {
      deliveryListRef.current?.scrollToOffset({ offset: 0, animated: true });
    } else {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleCompleteBatch = async () => {
    if (!campaignId) return;
    if (selectedHouseholdKeys.length === 0) {
      showErrorToast(
        'Chưa chọn hộ dân',
        'Hãy chọn ít nhất 1 hộ để duyệt phát hàng hàng loạt.',
      );
      return;
    }
    const selectedGroups = groupedDeliveryItems.filter((group) =>
      selectedHouseholdKeys.includes(group.key),
    );
    const selectedItems = selectedGroups.flatMap((group) => group.items);

    const itemsWithoutProof = selectedItems.filter(
      (item) =>
        (proofAssetsByDeliveryId[item.householdDeliveryId] ?? []).length === 0,
    );

    if (itemsWithoutProof.length > 0) {
      const firstMissing = itemsWithoutProof[0];
      setExpandedDeliveryId(firstMissing.householdDeliveryId);
      openProofPicker(firstMissing.householdDeliveryId);
      showErrorToast(
        'Thiếu bằng chứng theo từng hộ',
        `Hộ ${firstMissing.headOfHouseholdName} chưa có bằng chứng riêng. Mỗi hộ cần ít nhất 1 ảnh/video.`,
      );
      return;
    }

    try {
      await completeDeliveryBatchMutation.mutateAsync({
        campaignId,
        request: {
          items: await Promise.all(
            selectedItems.map(async (item) => {
              const uploadedProofs = await ensureUploadedProofs(
                item.householdDeliveryId,
              );
              return {
                householdDeliveryId: item.householdDeliveryId,
                campaignTeamId: myCampaignTeam?.campaignTeamId,
                notes: notes || undefined,
                proofs: uploadedProofs.map((asset) => ({
                  fileUrl: asset.uploadedUrl!,
                  fileType: asset.mimeType || 'image/jpeg',
                  note: notes || undefined,
                })),
              };
            }),
          ),
        },
      });
      showSuccessToast(`Đã duyệt phát hàng cho ${selectedGroups.length} hộ`);
      setSelectedHouseholdKeys([]);
      setProofAssetsByDeliveryId({});
    } catch (error: any) {
      showErrorToast('Duyệt hàng loạt thất bại', error?.message);
    }
  };

  const handleSubmitSubtaskStatus = async () => {
    if (!activeMemberTask || selectedMemberTaskStatus === null) {
      showErrorToast('Chọn trạng thái', 'Vui lòng chọn trạng thái cập nhật.');
      return;
    }

    if (selectedMemberTaskStatus === activeMemberTask.status) {
      showErrorToast(
        'Trạng thái không đổi',
        'Nhiệm vụ hiện đã ở đúng trạng thái này, không cần cập nhật lại.',
      );
      return;
    }

    const allowedNextStatuses = statusOptions
      .filter((option) => {
        if (activeMemberTask.status === MemberTaskStatus.Assigned) {
          return option.id === MemberTaskStatus.InProgress;
        }
        if (activeMemberTask.status === MemberTaskStatus.InProgress) {
          return (
            option.id === MemberTaskStatus.Completed ||
            option.id === MemberTaskStatus.Failed
          );
        }
        if (activeMemberTask.status === MemberTaskStatus.Failed) {
          return option.id === MemberTaskStatus.InProgress;
        }
        return false;
      })
      .map((option) => option.id);

    if (!allowedNextStatuses.includes(selectedMemberTaskStatus)) {
      showErrorToast(
        'Chuyển trạng thái không hợp lệ',
        'Trạng thái bạn chọn không phù hợp với tiến độ hiện tại của nhiệm vụ.',
      );
      return;
    }

    if (
      selectedMemberTaskStatus === MemberTaskStatus.Failed &&
      !failureReasonInput.trim()
    ) {
      setShowFailureReasonModal(true);
      return;
    }

    if (!selectedTaskValidation.isValid) {
      showErrorToast(
        'Chưa thể hoàn thành nhiệm vụ',
        selectedTaskValidation.errors[0] ||
          'Nhiệm vụ này còn thiếu điều kiện để hoàn thành.',
      );
      if (selectedTaskValidation.category === 'delivery') {
        setActiveTab('delivery');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await changeMemberStatusMutation.mutateAsync({
        memberTaskId: activeMemberTask.memberTaskId,
        request: {
          status: selectedMemberTaskStatus,
          failureReason:
            selectedMemberTaskStatus === MemberTaskStatus.Failed
              ? failureReasonInput.trim()
              : undefined,
        },
      });
      showSuccessToast('Đã cập nhật trạng thái nhiệm vụ');
      setSelectedMemberTaskStatus(null);
      setFailureReasonInput('');
      setShowFailureReasonModal(false);
      setNotes('');
    } catch (error: any) {
      showErrorToast('Cập nhật thất bại', error?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkHouseholdDelivered = async (
    household: HouseholdChecklistItemResponse,
    groupedItems?: HouseholdChecklistItemResponse[],
    selectedPackageIds?: string[],
  ) => {
    if (!campaignId) return;
    const householdDeliveryId = household.householdDeliveryId;

    if (!householdDeliveryId) {
      showErrorToast(
        'Thiếu thông tin giao hàng',
        'Không tìm thấy thông tin lượt phát hàng cho hộ này. Vui lòng tải lại màn hình và thử lại.',
      );
      return;
    }

    const currentProofAssets =
      proofAssetsByDeliveryId[household.householdDeliveryId] ?? [];
    if (currentProofAssets.length === 0) {
      setExpandedDeliveryId(household.householdDeliveryId);
      openProofPicker(household.householdDeliveryId);
      return;
    }

    Alert.alert(
      'Xác nhận phát hàng',
      `Đánh dấu hộ "${household.headOfHouseholdName}" đã nhận hàng?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              setSubmittingDeliveryId(household.householdDeliveryId);
              const uploadedProofs = await ensureUploadedProofs(
                household.householdDeliveryId,
              );
              const deliveryItemsToComplete =
                groupedItems?.length && groupedItems.length > 0
                  ? selectedPackageIds?.length
                    ? groupedItems.filter((item) =>
                        selectedPackageIds.includes(item.householdDeliveryId),
                      )
                    : groupedItems
                  : [household];

              if (deliveryItemsToComplete.length === 0) {
                showErrorToast(
                  'Chưa chọn gói phát',
                  'Hãy chọn ít nhất 1 gói cần phát cho hộ dân này.',
                );
                return;
              }

              const primaryDeliveryItem = deliveryItemsToComplete[0];

              if (deliveryItemsToComplete.length > 1) {
                await completeDeliveryBatchMutation.mutateAsync({
                  campaignId,
                  request: {
                    items: deliveryItemsToComplete.map((item) => ({
                      householdDeliveryId: item.householdDeliveryId,
                      reliefPackageDefinitionId:
                        item.reliefPackageDefinitionId || undefined,
                      campaignTeamId: myCampaignTeam?.campaignTeamId,
                      notes: notes || undefined,
                      proofs: uploadedProofs.map((asset) => ({
                        fileUrl: asset.uploadedUrl!,
                        fileType: asset.mimeType || 'image/jpeg',
                        note: notes || undefined,
                      })),
                    })),
                  },
                });
              } else if (myMemberTaskDeliveriesData?.items?.length) {
                const matchedAssignment = myMemberTaskDeliveriesData.items.find(
                  (item) =>
                    item.householdDeliveryId ===
                    primaryDeliveryItem.householdDeliveryId,
                );
                if (matchedAssignment?.memberTaskDeliveryId) {
                  await completeMemberTaskDeliveryMutation.mutateAsync({
                    memberTaskDeliveryId:
                      matchedAssignment.memberTaskDeliveryId,
                    request: {
                      campaignId,
                      notes: notes || undefined,
                      proofNote: notes || undefined,
                      proofFileUrl: uploadedProofs[0].uploadedUrl!,
                      proofContentType:
                        uploadedProofs[0].mimeType || 'image/jpeg',
                    },
                  });
                } else {
                  await completeDeliveryMutation.mutateAsync({
                    campaignId,
                    householdDeliveryId:
                      primaryDeliveryItem.householdDeliveryId,
                    request: {
                      reliefPackageDefinitionId:
                        primaryDeliveryItem.reliefPackageDefinitionId ||
                        undefined,
                      campaignTeamId: myCampaignTeam?.campaignTeamId,
                      notes: notes || undefined,
                      proofNote: notes || undefined,
                      proofFileUrl: uploadedProofs[0].uploadedUrl!,
                      proofContentType:
                        uploadedProofs[0].mimeType || 'image/jpeg',
                    },
                  });
                }
              } else {
                await completeDeliveryMutation.mutateAsync({
                  campaignId,
                  householdDeliveryId: primaryDeliveryItem.householdDeliveryId,
                  request: {
                    reliefPackageDefinitionId:
                      primaryDeliveryItem.reliefPackageDefinitionId ||
                      undefined,
                    campaignTeamId: myCampaignTeam?.campaignTeamId,
                    notes: notes || undefined,
                    proofNote: notes || undefined,
                    proofFileUrl: uploadedProofs[0].uploadedUrl!,
                    proofContentType:
                      uploadedProofs[0].mimeType || 'image/jpeg',
                  },
                });
              }
              showSuccessToast(
                deliveryItemsToComplete.length > 1
                  ? `Đã phát ${deliveryItemsToComplete.length} gói cho hộ ${household.headOfHouseholdName}`
                  : `Đã phát cho hộ ${household.headOfHouseholdName}`,
              );
              setProofAssetsByDeliveryId((prev) => {
                const next = { ...prev };
                deliveryItemsToComplete.forEach((item) => {
                  next[item.householdDeliveryId] = [];
                });
                return next;
              });
              clearSelectedPackagesForHousehold(
                getHouseholdGroupKey(household),
              );
            } catch (error: any) {
              showErrorToast('Cập nhật thất bại', error?.message);
            } finally {
              setSubmittingDeliveryId(null);
            }
          },
        },
      ],
    );
  };

  const handleSkipHousehold = async (
    household: HouseholdChecklistItemResponse,
  ) => {
    if (!campaignId) return;
    try {
      await updateHouseholdStatusMutation.mutateAsync({
        campaignId,
        campaignHouseholdId: household.campaignHouseholdId,
        request: {
          status: HouseholdFulfillmentStatus.Skipped,
          notes: 'Bỏ qua',
        },
      });
      showSuccessToast(`Đã bỏ qua hộ ${household.headOfHouseholdName}`);
    } catch (error: any) {
      showErrorToast('Cập nhật thất bại', error?.message);
    }
  };

  const statusOptions = MEMBER_STATUS_OPTIONS(colors);
  const statusConfig = {
    [MemberTaskStatus.Completed]: {
      label: 'Đã hoàn thành',
      color: '#22C55E',
    },
    [MemberTaskStatus.InProgress]: {
      label: 'Đang làm',
      color: '#3B82F6',
    },
    [MemberTaskStatus.Assigned]: {
      label: 'Đã giao',
      color: '#F59E0B',
    },
    [MemberTaskStatus.Failed]: {
      label: 'Thất bại',
      color: '#EF4444',
    },
    [MemberTaskStatus.Cancelled]: {
      label: 'Đã hủy',
      color: '#6B7280',
    },
  };
  const deliveryListHeader = (
    <>
      {isPersonalView && isMyMemberTasksLoading && !activeMemberTask ? (
        <View className="items-center py-8">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : null}

      {shouldShowSubtaskTab && activeMemberTask ? (
        <View className="p-4">
          <View
            className="rounded-xl border p-4 shadow-sm"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
          >
            <View className="mb-1 flex-row items-center gap-2">
              <View
                className="rounded px-2 py-0.5"
                style={{ backgroundColor: `${colors.secondary}18` }}
              >
                <Text
                  className="text-xs font-bold"
                  style={{ color: colors.secondary }}
                >
                  NHIỆM VỤ ĐANG LÀM
                </Text>
              </View>
            </View>
            <Text
              className="text-base font-bold leading-tight"
              style={{ color: colors.text }}
            >
              {activeMemberTask.subTaskTitle}
            </Text>
            <View
              className="mt-2 self-start rounded-full px-2.5 py-1"
              style={{ backgroundColor: `${colors.secondary}18` }}
            >
              <Text
                className="text-xs font-bold"
                style={{ color: colors.secondary }}
              >
                Loại:{' '}
                {getVolunteerTaskCategoryLabel(selectedTaskValidation.category)}
              </Text>
            </View>
            <Text
              className="mt-1 text-sm"
              style={{ color: colors.textSecondary }}
            >
              {activeMemberTask.taskNote || 'Chưa có ghi chú'}
            </Text>
            <View className="mt-2 flex-row items-center gap-1">
              <Ionicons
                name="time-outline"
                size={14}
                color={colors.textSecondary}
              />
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                Giao lúc: {formatDate(activeMemberTask.assignedAt)}
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      <View className="bg-transparent px-4 pb-2 pt-1">
        <View
          className="rounded-xl border p-1"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <View className="flex-row gap-2">
            {shouldShowSubtaskTab ? (
              <TouchableOpacity
                onPress={() => setActiveTab('subtask')}
                className="flex-1 items-center rounded-lg px-4 py-2"
                style={{
                  backgroundColor:
                    activeTab === 'subtask' ? colors.card : 'transparent',
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text
                  className="text-sm font-bold"
                  style={{
                    color:
                      activeTab === 'subtask'
                        ? colors.secondary
                        : colors.textSecondary,
                  }}
                >
                  Nhiệm vụ con
                </Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              onPress={() => setActiveTab('delivery')}
              className="flex-1 items-center rounded-lg px-4 py-2"
              style={{
                backgroundColor:
                  activeTab === 'delivery' ? colors.card : 'transparent',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                className="text-sm font-bold"
                style={{
                  color:
                    activeTab === 'delivery'
                      ? colors.secondary
                      : colors.textSecondary,
                }}
              >
                Phát hàng (
                {
                  deliveryItems.filter((h) => h.status === 0 || h.status === 1)
                    .length
                }
                )
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {shouldShowSubtaskTab && sortedMyMemberTasks.length > 0 ? (
        <View className="px-4 pt-4">
          <Text
            className="mb-2 text-sm font-semibold"
            style={{ color: colors.text }}
          >
            Tất cả nhiệm vụ con của tôi
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 2 }}
          >
            {sortedMyMemberTasks.map((memberTask, index) => {
              const selected =
                activeMemberTask?.memberTaskId === memberTask.memberTaskId;
              const campaignTaskTitle =
                memberTask.campaignTaskTitle || 'Chưa rõ';
              return (
                <TouchableOpacity
                  key={`${memberTask.memberTaskId}-${memberTask.campaignTaskId}-${index}`}
                  onPress={() => {
                    setSelectedTaskId(memberTask.campaignTaskId);
                    setSelectedMemberTaskId(memberTask.memberTaskId);
                  }}
                  className="rounded-lg border px-3 py-2"
                  style={{
                    borderColor: selected ? colors.secondary : colors.border,
                    backgroundColor: selected
                      ? `${colors.secondary}12`
                      : colors.card,
                    minWidth: 156,
                  }}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: selected ? colors.secondary : colors.text }}
                  >
                    {memberTask.subTaskTitle}
                  </Text>
                  <Text
                    className="mt-1 text-[11px]"
                    style={{ color: colors.textSecondary }}
                  >
                    Nhiệm vụ chung: {campaignTaskTitle}
                  </Text>
                  <Text
                    className="mt-1 text-[11px]"
                    style={{ color: colors.textSecondary }}
                  >
                    {memberTask.failureReason?.trim()
                      ? `Lý do lỗi: ${memberTask.failureReason}`
                      : 'Chạm để xem và cập nhật tiến độ'}
                  </Text>
                  <View
                    className="mt-2 self-start rounded-full px-2.5 py-1"
                    style={{
                      backgroundColor: `${
                        memberTask.status === MemberTaskStatus.Completed
                          ? colors.status.completed
                          : memberTask.status === MemberTaskStatus.InProgress
                            ? colors.secondary
                            : memberTask.status === MemberTaskStatus.Assigned
                              ? colors.textSecondary
                              : memberTask.status === MemberTaskStatus.Failed
                                ? colors.status.error
                                : colors.textSecondary
                      }18`,
                    }}
                  >
                    <Text
                      className="text-[11px] font-bold"
                      style={{
                        color:
                          memberTask.status === MemberTaskStatus.Completed
                            ? colors.status.completed
                            : memberTask.status === MemberTaskStatus.InProgress
                              ? colors.secondary
                              : memberTask.status === MemberTaskStatus.Assigned
                                ? colors.textSecondary
                                : memberTask.status === MemberTaskStatus.Failed
                                  ? colors.status.error
                                  : colors.textSecondary,
                      }}
                    >
                      {memberTask.status === MemberTaskStatus.Completed
                        ? 'Đã hoàn thành'
                        : memberTask.status === MemberTaskStatus.InProgress
                          ? 'Đang làm'
                          : memberTask.status === MemberTaskStatus.Assigned
                            ? 'Đã giao'
                            : memberTask.status === MemberTaskStatus.Failed
                              ? 'Thất bại'
                              : 'Đã hủy'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </>
  );
  const deliveryListFooter = (
    <>
      {resolvedDeliveryTotalPages > 1 ? (
        <View
          className="rounded-xl border p-3"
          style={{
            borderColor: colors.border,
            backgroundColor: colors.card,
            marginHorizontal: 16,
            marginTop: 12,
          }}
        >
          <View className="gap-3">
            <View className="items-center">
              <Text
                className="text-sm font-semibold"
                style={{ color: colors.text }}
              >
                Trang {resolvedDeliveryCurrentPage}/{resolvedDeliveryTotalPages}
              </Text>
              <Text
                className="mt-1 text-xs"
                style={{ color: colors.textSecondary }}
              >
                Tổng {resolvedDeliveryTotalCount} hộ • tối đa{' '}
                {resolvedDeliveryPageSize} hộ/trang
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() =>
                  setDeliveryPageIndex((prev) => Math.max(prev - 1, 1))
                }
                disabled={resolvedDeliveryCurrentPage <= 1}
                className="flex-1 rounded-lg border px-3 py-2"
                style={{
                  borderColor: colors.border,
                  opacity: resolvedDeliveryCurrentPage <= 1 ? 0.5 : 1,
                }}
              >
                <Text className="text-center" style={{ color: colors.text }}>
                  Trang trước
                </Text>
              </TouchableOpacity>

              <TextInput
                value={jumpToPageInput}
                onChangeText={setJumpToPageInput}
                keyboardType="number-pad"
                placeholder="Trang"
                placeholderTextColor={colors.textSecondary}
                className="min-w-[72px] rounded-lg border px-3 py-2 text-center"
                style={{
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.background,
                }}
              />

              <TouchableOpacity
                onPress={handleJumpToPage}
                className="rounded-lg px-3 py-2"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="font-semibold text-white">Đi tới</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  setDeliveryPageIndex((prev) =>
                    Math.min(prev + 1, resolvedDeliveryTotalPages),
                  )
                }
                disabled={
                  resolvedDeliveryCurrentPage >= resolvedDeliveryTotalPages
                }
                className="flex-1 rounded-lg border px-3 py-2"
                style={{
                  borderColor: colors.border,
                  opacity:
                    resolvedDeliveryCurrentPage >= resolvedDeliveryTotalPages
                      ? 0.5
                      : 1,
                }}
              >
                <Text className="text-center" style={{ color: colors.text }}>
                  Trang sau
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}
      <View style={{ height: bottom + 100 }} />
    </>
  );
  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Modal
        visible={showFailureReasonModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFailureReasonModal(false)}
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
              Vui lòng nhập lý do trước khi đánh dấu subtask là thất bại.
            </Text>
            <TextInput
              value={failureReasonInput}
              onChangeText={setFailureReasonInput}
              placeholder="Ví dụ: Không tiếp cận được khu vực, thiếu vật lực hoặc điều kiện thời tiết không cho phép..."
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
                onPress={() => setShowFailureReasonModal(false)}
                className="rounded-lg border px-4 py-2"
                style={{ borderColor: colors.border }}
              >
                <Text style={{ color: colors.textSecondary }}>Để sau</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmitSubtaskStatus}
                className="rounded-lg px-4 py-2"
                style={{ backgroundColor: colors.status.error }}
              >
                <Text className="font-bold text-white">Xác nhận thất bại</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScreenHeader
        title="Cập nhật tiến độ"
        onBack={onBack ?? (() => router.back())}
        backgroundColor={isDark ? colors.card : colors.primary}
        titleColor={isDark ? colors.text : colors.white}
      />

      {shouldShowSubtaskTab && activeTab === 'subtask' ? (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ paddingBottom: bottom + 120 }}
          className="flex-1"
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          {deliveryListHeader}
          {/* Status Selection */}
          {activeMemberTask ? (
            <View>
              {activeMemberTask.campaignTaskStatus ===
              CampaignTaskStatus.Blocked ? (
                <View
                  className="mx-4 mt-4 rounded-xl border p-4"
                  style={{
                    backgroundColor: `${colors.status.error}10`,
                    borderColor: `${colors.status.error}35`,
                  }}
                >
                  <Text
                    className="text-sm font-bold"
                    style={{ color: colors.status.error }}
                  >
                    Nhiệm vụ chính đang bị chặn
                  </Text>
                  <Text
                    className="mt-1 text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    Có nhiệm vụ con đang thất bại. Bạn có thể mở lại xử lý bằng
                    cách chuyển trạng thái về "Đang tiến hành", hoặc liên hệ
                    trưởng nhóm để giao lại hay hủy nhiệm vụ con.
                  </Text>
                </View>
              ) : null}

              <View
                className="mx-4 mt-4 rounded-xl border p-4"
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }}
              >
                <Text
                  className="text-base font-bold"
                  style={{ color: colors.text }}
                >
                  Điều kiện để hoàn thành nhiệm vụ
                </Text>
                <Text
                  className="mt-1 text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Xem nhanh các điều kiện bắt buộc trước khi bấm Hoàn thành.
                </Text>

                {selectedTaskValidation.items.length > 0 ? (
                  <View className="mt-3 gap-2">
                    {selectedTaskValidation.items.map((item) => (
                      <View
                        key={item.key}
                        className="flex-row items-start gap-2 rounded-lg p-3"
                        style={{
                          backgroundColor: item.passed
                            ? `${colors.status.completed}12`
                            : `${colors.status.pending}12`,
                        }}
                      >
                        <Ionicons
                          name={
                            item.passed ? 'checkmark-circle' : 'alert-circle'
                          }
                          size={18}
                          color={
                            item.passed
                              ? colors.status.completed
                              : colors.status.pending
                          }
                          style={{ marginTop: 1 }}
                        />
                        <View className="flex-1">
                          <Text
                            className="text-sm font-semibold"
                            style={{ color: colors.text }}
                          >
                            {item.label}
                          </Text>
                          {item.detail ? (
                            <Text
                              className="mt-0.5 text-xs"
                              style={{ color: colors.textSecondary }}
                            >
                              {item.detail}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View
                    className="mt-3 rounded-lg p-3"
                    style={{ backgroundColor: `${colors.primary}10` }}
                  >
                    <Text
                      className="text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      Nhiệm vụ này không có điều kiện bổ sung. Bạn có thể cập
                      nhật trạng thái theo tiến độ thực tế.
                    </Text>
                  </View>
                )}
              </View>

              <Text
                className="px-4 pb-3 pt-6 text-left text-lg font-bold leading-tight tracking-tight"
                style={{ color: colors.text }}
              >
                Cập nhật trạng thái
              </Text>
              <View className="flex-col gap-3 px-4">
                {statusOptions
                  .filter((option) => {
                    if (activeMemberTask.status === MemberTaskStatus.Assigned) {
                      return option.id === MemberTaskStatus.InProgress;
                    }
                    if (
                      activeMemberTask.status === MemberTaskStatus.InProgress
                    ) {
                      return (
                        option.id === MemberTaskStatus.Completed ||
                        option.id === MemberTaskStatus.Failed
                      );
                    }
                    if (activeMemberTask.status === MemberTaskStatus.Failed) {
                      return option.id === MemberTaskStatus.InProgress;
                    }
                    return false;
                  })
                  .map((option) => (
                    <StatusRadioOption
                      key={option.id}
                      selected={selectedMemberTaskStatus === option.id}
                      onSelect={() => setSelectedMemberTaskStatus(option.id)}
                      icon={option.icon}
                      title={option.title}
                      subtitle={option.subtitle}
                      accentColor={option.color}
                    />
                  ))}
              </View>
            </View>
          ) : (
            <View className="px-4 pt-6">
              <View
                className="rounded-xl border border-dashed p-4"
                style={{ borderColor: colors.border }}
              >
                <Text style={{ color: colors.textSecondary }}>
                  {sortedMyMemberTasks.length === 0
                    ? 'Bạn chưa được giao nhiệm vụ con nào trong task này.'
                    : 'Tất cả nhiệm vụ con của bạn trong task này đã hoàn thành hoặc bị hủy. Bạn vẫn có thể xem lại chi tiết ở phía trên.'}
                </Text>
              </View>
            </View>
          )}

          {/* SOS Alert */}
          <View className="px-4 pt-6">
            <Text
              className="mb-3 text-lg font-bold leading-tight"
              style={{ color: colors.text }}
            >
              Trường hợp phát sinh
            </Text>
            <View
              className="rounded-xl border p-4"
              style={{
                backgroundColor: `${colors.status.error}12`,
                borderColor: `${colors.status.error}33`,
              }}
            >
              <View className="flex-row items-start gap-3">
                <Ionicons
                  name="location"
                  size={22}
                  color={colors.primary}
                  style={{ marginTop: 2 }}
                />
                <View className="flex-1">
                  <Text
                    className="mb-1 text-sm font-bold"
                    style={{ color: colors.text }}
                  >
                    Phát hiện người cần cứu hộ?
                  </Text>
                  <Text
                    className="mb-3 text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    Nếu bạn phát hiện thêm người bị mắc kẹt hoặc cần trợ giúp
                    khẩn cấp tại vị trí này, hãy đánh dấu ngay.
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      onMarkSOS
                        ? onMarkSOS()
                        : router.push({
                            pathname: '/profile/new-sos' as any,
                            params: { emergency: '1', type: 'medical' },
                          })
                    }
                    className="flex-row items-center justify-center gap-2 rounded-lg px-4 py-2.5 shadow-sm"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Ionicons name="warning" size={16} color={colors.white} />
                    <Text className="text-sm font-bold text-white">
                      Đánh dấu SOS mới
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          <View className="h-8" />
        </ScrollView>
      ) : (
        <FlatList
          ref={deliveryListRef}
          data={isResolvedDeliveryLoading ? [] : groupedDeliveryItems}
          keyExtractor={(group) => group.key}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ListHeaderComponent={
            <>
              {deliveryListHeader}
              <View className="gap-3 px-4 pt-4">
                <Text
                  className="text-lg font-bold"
                  style={{ color: colors.text }}
                >
                  Danh sách hộ cần phát hàng
                </Text>
                <View
                  className="rounded-xl border px-3 py-2"
                  style={{
                    borderColor: `${colors.secondary}40`,
                    backgroundColor: `${colors.secondary}10`,
                  }}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: colors.secondary }}
                  >
                    Đang lấy {resolvedDeliveryPageSize} hộ/trang
                  </Text>
                </View>
                <Text
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Đánh dấu từng hộ sau khi phát hàng. Với nhiều hộ bạn có thể
                  hoàn thành lần lượt.
                </Text>
                {flowMode === 'distribution-point' &&
                params.distributionPointId ? (
                  <View
                    className="rounded-xl border p-3"
                    style={{
                      borderColor: `${colors.primary}40`,
                      backgroundColor: `${colors.primary}10`,
                    }}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: colors.text }}
                    >
                      Đang xem theo điểm phát đã chọn
                    </Text>
                    <Text
                      className="mt-1 text-xs"
                      style={{ color: colors.textSecondary }}
                    >
                      Danh sách bên dưới chỉ hiển thị các hộ dân thuộc điểm phát
                      này, đúng đội của bạn.
                    </Text>
                  </View>
                ) : null}
                {deliveryItems.length > 0 ? (
                  <View
                    className="mb-3 rounded-xl border p-3"
                    style={{
                      borderColor: colors.secondary,
                      backgroundColor: colors.card,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => setShowAdvancedFilters((prev) => !prev)}
                      className="flex-row items-center justify-between gap-3"
                    >
                      <View className="flex-1">
                        <Text
                          className="text-sm font-semibold"
                          style={{ color: colors.text }}
                        >
                          Bộ lọc nâng cao & duyệt hàng loạt
                        </Text>
                        <Text
                          className="mt-1 text-xs"
                          style={{ color: colors.textSecondary }}
                        >
                          Tìm kiếm hộ, lọc trạng thái, chọn tất cả và duyệt hàng
                          loạt ngay tại đây.
                        </Text>
                      </View>
                      <Ionicons
                        name={
                          showAdvancedFilters ? 'chevron-up' : 'chevron-down'
                        }
                        size={18}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>

                    {showAdvancedFilters ? (
                      <View className="mt-3 gap-3">
                        <View className="flex-row flex-wrap gap-2">
                          {[50, 100].map((size) => {
                            const selected = deliveryPageSize === size;
                            return (
                              <TouchableOpacity
                                key={`page-size-${size}`}
                                onPress={() => {
                                  setDeliveryPageSize(size as 50 | 100);
                                  setDeliveryPageIndex(1);
                                }}
                                className="rounded-full border px-3 py-2"
                                style={{
                                  borderColor: selected
                                    ? colors.primary
                                    : colors.border,
                                  backgroundColor: selected
                                    ? `${colors.primary}12`
                                    : colors.card,
                                }}
                              >
                                <Text
                                  className="text-xs font-semibold"
                                  style={{
                                    color: selected
                                      ? colors.primary
                                      : colors.textSecondary,
                                  }}
                                >
                                  Hiện {size} hộ
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>

                        <TextInput
                          value={deliverySearch}
                          onChangeText={setDeliverySearch}
                          placeholder="Tìm theo tên chủ hộ, mã hộ, điểm phát, tên gói"
                          placeholderTextColor={colors.textSecondary}
                          className="rounded-lg border p-3"
                          style={{
                            borderColor: colors.border,
                            color: colors.text,
                            backgroundColor: colors.background,
                          }}
                        />

                        <View className="flex-row flex-wrap gap-2">
                          {(
                            [
                              { label: 'Tất cả', value: 'all' },
                              {
                                label:
                                  HouseholdFulfillmentStatusLabels[
                                    HouseholdFulfillmentStatus.Pending
                                  ],
                                value: HouseholdFulfillmentStatus.Pending,
                              },
                              {
                                label:
                                  HouseholdFulfillmentStatusLabels[
                                    HouseholdFulfillmentStatus
                                      .PartiallyDelivered
                                  ],
                                value:
                                  HouseholdFulfillmentStatus.PartiallyDelivered,
                              },
                              {
                                label:
                                  HouseholdFulfillmentStatusLabels[
                                    HouseholdFulfillmentStatus.Delivered
                                  ],
                                value: HouseholdFulfillmentStatus.Delivered,
                              },
                              {
                                label:
                                  HouseholdFulfillmentStatusLabels[
                                    HouseholdFulfillmentStatus.Skipped
                                  ],
                                value: HouseholdFulfillmentStatus.Skipped,
                              },
                            ] as const
                          ).map((option) => {
                            const selected =
                              deliveryStatusFilter === option.value;
                            return (
                              <TouchableOpacity
                                key={`${String(option.value)}-${option.label}`}
                                onPress={() =>
                                  setDeliveryStatusFilter(option.value)
                                }
                                className="rounded-full border px-3 py-2"
                                style={{
                                  borderColor: selected
                                    ? colors.primary
                                    : colors.border,
                                  backgroundColor: selected
                                    ? `${colors.primary}12`
                                    : colors.card,
                                }}
                              >
                                <Text
                                  className="text-xs font-semibold"
                                  style={{
                                    color: selected
                                      ? colors.primary
                                      : colors.textSecondary,
                                  }}
                                >
                                  {option.label}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>

                        <View className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <Text
                            className="flex-1 text-sm"
                            style={{ color: colors.textSecondary }}
                          >
                            {selectedHouseholdKeys.length} hộ đã chọn •{' '}
                            {pendingGroupedDeliveryItems.length} hộ đang
                            chờ/phát một phần
                          </Text>
                          <TouchableOpacity
                            onPress={handleToggleSelectAllFiltered}
                            className="self-start"
                          >
                            <Text
                              className="text-sm font-semibold"
                              style={{ color: colors.primary }}
                            >
                              {allFilteredSelected
                                ? 'Bỏ chọn tất cả'
                                : 'Chọn tất cả'}
                            </Text>
                          </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                          onPress={handleCompleteBatch}
                          disabled={
                            completeDeliveryBatchMutation.isPending ||
                            selectedHouseholdKeys.length === 0
                          }
                          className="flex-row items-center justify-center rounded-xl py-3"
                          style={{
                            backgroundColor: colors.primary,
                            opacity:
                              completeDeliveryBatchMutation.isPending ||
                              selectedHouseholdKeys.length === 0
                                ? 0.6
                                : 1,
                          }}
                        >
                          <Ionicons
                            name="checkmark-done-circle"
                            size={18}
                            color="#fff"
                          />
                          <Text className="ml-2 text-sm font-bold text-white">
                            {completeDeliveryBatchMutation.isPending
                              ? 'Đang duyệt hàng loạt...'
                              : `Duyệt ${selectedHouseholdKeys.length} hộ đã chọn`}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : null}
                  </View>
                ) : null}
                {isResolvedDeliveryLoading ? (
                  <View className="items-center py-8">
                    <ActivityIndicator color={colors.primary} />
                  </View>
                ) : null}
                {!isResolvedDeliveryLoading &&
                groupedDeliveryItems.length === 0 ? (
                  <View
                    className="rounded-xl border border-dashed p-4"
                    style={{ borderColor: colors.border }}
                  >
                    <Text style={{ color: colors.textSecondary }}>
                      {resolvedDeliveryTotalCount === 0
                        ? flowMode === 'isolated'
                          ? 'Hiện chưa có danh sách hộ cô lập để hiển thị. Vui lòng kiểm tra lại phân công hoặc thử tải lại.'
                          : 'Hiện chưa có hộ cần phát phù hợp với bộ lọc đang chọn.'
                        : 'Không có hộ dân nào phù hợp với bộ lọc hiện tại trên trang đang xem.'}
                    </Text>
                  </View>
                ) : null}
              </View>
            </>
          }
          ListFooterComponent={deliveryListFooter}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item: group }) => {
            const household = group.household;
            const statusLabel =
              HOUSEHOLD_STATUS_LABELS[group.status] ?? 'Chờ phát';
            const isDone =
              group.status === HouseholdFulfillmentStatus.Delivered;
            const isSkipped =
              group.status === HouseholdFulfillmentStatus.Skipped;
            const isPending =
              group.status === HouseholdFulfillmentStatus.Pending ||
              group.status === HouseholdFulfillmentStatus.PartiallyDelivered;
            const hasLocalProof = group.items.some(
              (item) =>
                (proofAssetsByDeliveryId[item.householdDeliveryId]?.length ??
                  0) > 0,
            );
            const isExpanded =
              expandedDeliveryId === household.householdDeliveryId;
            const selectedPackageIdsForHousehold =
              selectedPackageIdsByHousehold[group.key] ?? [];
            const pendingPackageItems = group.items.filter(
              (item) => item.status !== HouseholdFulfillmentStatus.Delivered,
            );
            const selectedPendingPackageCount =
              selectedPackageIdsForHousehold.filter((id) =>
                pendingPackageItems.some(
                  (item) => item.householdDeliveryId === id,
                ),
              ).length;
            const hasProofForHousehold =
              (proofAssetsByDeliveryId[household.householdDeliveryId]?.length ??
                0) > 0;
            return (
              <View
                key={group.key}
                className="rounded-xl border p-4"
                style={{
                  borderColor: isDone
                    ? colors.status.completed
                    : isSkipped
                      ? colors.status.pending
                      : isExpanded
                        ? colors.primary
                        : colors.border,
                  opacity: isSkipped ? 0.6 : 1,
                  backgroundColor: isExpanded
                    ? `${colors.primary}06`
                    : colors.card,
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() =>
                    handlePressDeliveryCard(household, false, group.key)
                  }
                >
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <View className="flex-row flex-wrap items-center gap-2">
                        {isPending ? (
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => toggleSelectHousehold(group.key)}
                          >
                            <Ionicons
                              name={
                                selectedHouseholdKeys.includes(group.key)
                                  ? 'checkbox'
                                  : 'square-outline'
                              }
                              size={20}
                              color={
                                selectedHouseholdKeys.includes(group.key)
                                  ? colors.primary
                                  : colors.textSecondary
                              }
                            />
                          </TouchableOpacity>
                        ) : null}
                        <Text
                          className="font-bold"
                          style={{ color: colors.text }}
                        >
                          {household.headOfHouseholdName}
                        </Text>
                        <View
                          className="rounded-full px-2 py-0.5"
                          style={{
                            backgroundColor: isDone
                              ? `${colors.status.completed}18`
                              : `${colors.status.pending}18`,
                          }}
                        >
                          <Text
                            className="text-xs font-bold"
                            style={{
                              color: isDone
                                ? colors.status.completed
                                : colors.status.pending,
                            }}
                          >
                            {statusLabel}
                          </Text>
                        </View>
                        {pendingPackageItems.length > 0 ? (
                          <View
                            className="rounded-full px-2 py-0.5"
                            style={{ backgroundColor: `${colors.primary}12` }}
                          >
                            <Text
                              className="text-xs font-bold"
                              style={{ color: colors.primary }}
                            >
                              Đã chọn {selectedPendingPackageCount}/
                              {pendingPackageItems.length} gói
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      <View
                        className="mt-3 rounded-xl border px-3 py-2"
                        style={{
                          borderColor: `${colors.primary}18`,
                          backgroundColor: `${colors.primary}06`,
                        }}
                      >
                        <View className="flex-row items-center justify-between gap-2">
                          <Text
                            className="flex-1 text-sm font-bold"
                            style={{ color: colors.text }}
                          >
                            {household.headOfHouseholdName}
                          </Text>
                          <Text
                            className="text-xs font-semibold"
                            style={{ color: colors.textSecondary }}
                          >
                            {household.householdCode || 'Chưa rõ mã hộ'}
                          </Text>
                        </View>
                        <Text
                          className="mt-1 text-xs"
                          style={{ color: colors.textSecondary }}
                        >
                          {group.items.length} gói •{' '}
                          {selectedPendingPackageCount}/
                          {pendingPackageItems.length} gói đang chọn
                        </Text>
                      </View>
                      <HouseholdPackageSummaryCard
                        colors={colors}
                        householdCode={household.householdCode}
                        itemCount={group.items.length}
                        packageGroups={group.packageGroups}
                        getStatusTone={getStatusTone}
                        getPackageIcon={getPackageIcon}
                      />
                      <HouseholdDeliveryPlanCard
                        colors={colors}
                        deliveredCount={
                          group.items.filter(
                            (item) =>
                              item.status ===
                              HouseholdFulfillmentStatus.Delivered,
                          ).length
                        }
                        totalCount={group.items.length}
                        distributionPointName={
                          household.distributionPointName || 'Chưa rõ'
                        }
                        deliveryMode={household.deliveryMode}
                        deliveryModeDescription={getDeliveryModeDescription(
                          household.deliveryMode,
                        )}
                        scheduledAt={household.scheduledAt}
                      />
                      <HouseholdProofStatusCard
                        colors={colors}
                        proofCount={group.proofCount}
                        cashSupportAmount={group.cashSupportAmount}
                        helperText={
                          isPending
                            ? selectedHouseholdKeys.includes(group.key)
                              ? 'Đã chọn. Bấm lại để bỏ chọn, kéo xuống để xem chi tiết.'
                              : 'Bấm vào thẻ để chọn và xem chi tiết.'
                            : isExpanded
                              ? 'Đang hiển thị chi tiết hộ dân.'
                              : 'Bấm vào thẻ để xem chi tiết hộ dân.'
                        }
                      />
                    </View>
                  </View>
                </TouchableOpacity>

                {isExpanded ? (
                  <View
                    className="mt-3 rounded-lg p-3"
                    style={{ backgroundColor: `${colors.primary}08` }}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: colors.text }}
                    >
                      Chi tiết hộ dân
                    </Text>
                    <Text
                      className="mt-1 text-xs"
                      style={{ color: colors.textSecondary }}
                    >
                      Trạng thái: {statusLabel}
                    </Text>
                    {household.notes ? (
                      <Text
                        className="mt-1 text-xs"
                        style={{ color: colors.textSecondary }}
                      >
                        Ghi chú: {household.notes}
                      </Text>
                    ) : null}
                    {household.deliveredAt ? (
                      <Text
                        className="mt-1 text-xs"
                        style={{ color: colors.textSecondary }}
                      >
                        Đã phát lúc:{' '}
                        {new Date(household.deliveredAt).toLocaleString(
                          'vi-VN',
                        )}
                      </Text>
                    ) : null}

                    <View
                      className="mt-3 rounded-xl border p-3"
                      style={{
                        borderColor: colors.border,
                        backgroundColor: colors.card,
                      }}
                    >
                      <View className="flex-row items-center justify-between">
                        <Text
                          className="text-sm font-semibold"
                          style={{ color: colors.text }}
                        >
                          Chọn gói cần phát
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            selectedPendingPackageCount ===
                            pendingPackageItems.length
                              ? clearSelectedPackagesForHousehold(group.key)
                              : selectAllPackagesForHousehold(
                                  group.key,
                                  pendingPackageItems,
                                )
                          }
                          disabled={pendingPackageItems.length === 0}
                        >
                          <Text
                            className="text-xs font-bold"
                            style={{
                              color:
                                pendingPackageItems.length === 0
                                  ? colors.textSecondary
                                  : colors.primary,
                            }}
                          >
                            {selectedPendingPackageCount ===
                            pendingPackageItems.length
                              ? 'Bỏ chọn hết'
                              : 'Phát tất cả gói'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View className="mt-3 gap-2">
                        {group.items.map((deliveryItem) => {
                          const packageName =
                            packageNameMap.get(
                              deliveryItem.reliefPackageDefinitionId,
                            ) ||
                            deliveryItem.reliefPackageDefinitionName ||
                            'Gói cứu trợ';
                          const packageIconName = getPackageIcon(packageName);
                          const checked =
                            selectedPackageIdsForHousehold.includes(
                              deliveryItem.householdDeliveryId,
                            );
                          const isDeliveredPackage =
                            deliveryItem.status ===
                            HouseholdFulfillmentStatus.Delivered;
                          return (
                            <TouchableOpacity
                              key={deliveryItem.householdDeliveryId}
                              onPress={() =>
                                !isDeliveredPackage &&
                                toggleSelectPackage(
                                  group.key,
                                  deliveryItem.householdDeliveryId,
                                )
                              }
                              disabled={isDeliveredPackage}
                              className="flex-row items-center gap-3 rounded-xl border p-3"
                              style={{
                                borderColor: isDeliveredPackage
                                  ? `${colors.status.completed}30`
                                  : checked
                                    ? colors.primary
                                    : colors.border,
                                backgroundColor: isDeliveredPackage
                                  ? `${colors.status.completed}08`
                                  : checked
                                    ? `${colors.primary}10`
                                    : colors.background,
                                opacity: isDeliveredPackage ? 0.65 : 1,
                              }}
                            >
                              <Ionicons
                                name={
                                  isDeliveredPackage
                                    ? 'checkmark-circle'
                                    : checked
                                      ? 'checkbox'
                                      : 'square-outline'
                                }
                                size={20}
                                color={
                                  isDeliveredPackage
                                    ? colors.status.completed
                                    : checked
                                      ? colors.primary
                                      : colors.textSecondary
                                }
                              />
                              <View
                                className="h-9 w-9 items-center justify-center rounded-lg"
                                style={{
                                  backgroundColor: `${colors.primary}12`,
                                }}
                              >
                                <Ionicons
                                  name={packageIconName as any}
                                  size={16}
                                  color={colors.primary}
                                />
                              </View>
                              <View className="flex-1">
                                <Text
                                  className="text-sm font-semibold"
                                  style={{
                                    color: isDeliveredPackage
                                      ? colors.textSecondary
                                      : colors.text,
                                  }}
                                >
                                  {packageName}
                                </Text>
                                <Text
                                  className="mt-0.5 text-xs"
                                  style={{ color: colors.textSecondary }}
                                >
                                  Trạng thái:{' '}
                                  {HOUSEHOLD_STATUS_LABELS[deliveryItem.status]}
                                </Text>
                                {isDeliveredPackage ? (
                                  <Text
                                    className="mt-0.5 text-xs font-semibold"
                                    style={{ color: colors.status.completed }}
                                  >
                                    Gói này đã phát, không thể chọn lại
                                  </Text>
                                ) : null}
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>

                    {(proofAssetsByDeliveryId[household.householdDeliveryId]
                      ?.length ?? 0) > 0 && isPending ? (
                      <View className="mt-3">
                        <Text
                          className="text-xs font-semibold"
                          style={{ color: colors.text }}
                        >
                          Bằng chứng bạn vừa thêm
                        </Text>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={{
                            gap: 8,
                            paddingTop: 8,
                          }}
                        >
                          {(
                            proofAssetsByDeliveryId[
                              household.householdDeliveryId
                            ] ?? []
                          ).map((asset, index) => {
                            const isVideo =
                              asset.mimeType?.startsWith('video/');
                            return (
                              <View
                                key={`${asset.uri}-${index}`}
                                className="h-24 w-24 overflow-hidden rounded-lg"
                                style={{
                                  backgroundColor: colors.background,
                                }}
                              >
                                {isVideo ? (
                                  <View className="h-full w-full items-center justify-center">
                                    <Ionicons
                                      name="videocam"
                                      size={28}
                                      color={colors.primary}
                                    />
                                  </View>
                                ) : (
                                  <Image
                                    source={{ uri: asset.uri }}
                                    className="h-full w-full"
                                    resizeMode="cover"
                                  />
                                )}
                              </View>
                            );
                          })}
                        </ScrollView>
                      </View>
                    ) : null}

                    {isDone ? (
                      <View className="mt-3 gap-2">
                        <Text
                          className="text-xs font-semibold"
                          style={{ color: colors.text }}
                        >
                          Bằng chứng đã lưu
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            openProofGallery(household.householdDeliveryId)
                          }
                          className="rounded-lg border p-3"
                          style={{
                            borderColor: colors.border,
                            backgroundColor: colors.card,
                          }}
                        >
                          <View className="flex-row items-center gap-3">
                            <View
                              className="h-12 w-12 items-center justify-center rounded-lg"
                              style={{
                                backgroundColor: colors.background,
                              }}
                            >
                              <Ionicons
                                name="images"
                                size={22}
                                color={colors.primary}
                              />
                            </View>
                            <View className="flex-1">
                              <Text
                                className="text-sm font-semibold"
                                style={{ color: colors.text }}
                              >
                                Xem gallery bằng chứng
                              </Text>
                              <Text
                                className="mt-0.5 text-xs"
                                style={{ color: colors.textSecondary }}
                              >
                                {group.proofCount > 0
                                  ? `${group.proofCount} tệp minh chứng đã lưu. Bấm để xem chi tiết.`
                                  : 'Bấm để tải chi tiết delivery và kiểm tra proof đã lưu.'}
                              </Text>
                            </View>
                            <Ionicons
                              name="chevron-forward"
                              size={18}
                              color={colors.textSecondary}
                            />
                          </View>
                        </TouchableOpacity>
                      </View>
                    ) : null}
                  </View>
                ) : null}

                {isPending && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8, paddingRight: 4 }}
                    className="mt-3"
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setExpandedDeliveryId(household.householdDeliveryId);
                        openProofPicker(household.householdDeliveryId);
                      }}
                      disabled={
                        submittingDeliveryId === household.householdDeliveryId
                      }
                      className="flex-row items-center justify-center gap-1 rounded-lg border px-4 py-2.5"
                      style={{
                        borderColor: colors.primary,
                        backgroundColor: `${colors.primary}10`,
                        opacity:
                          submittingDeliveryId === household.householdDeliveryId
                            ? 0.6
                            : 1,
                      }}
                    >
                      <Ionicons
                        name={hasProofForHousehold ? 'images' : 'cloud-upload'}
                        size={16}
                        color={colors.primary}
                      />
                      <Text
                        className="text-sm font-bold"
                        style={{ color: colors.primary }}
                      >
                        {hasProofForHousehold
                          ? 'Cập nhật bằng chứng'
                          : 'Thêm bằng chứng'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        handleMarkHouseholdDelivered(
                          household,
                          group.items,
                          selectedPackageIdsForHousehold,
                        )
                      }
                      disabled={
                        !hasProofForHousehold ||
                        selectedPendingPackageCount === 0 ||
                        completeDeliveryMutation.isPending ||
                        completeDeliveryBatchMutation.isPending ||
                        submittingDeliveryId === household.householdDeliveryId
                      }
                      className="flex-row items-center justify-center gap-1 rounded-lg px-4 py-2.5"
                      style={{
                        backgroundColor: colors.status.completed,
                        opacity:
                          !hasProofForHousehold ||
                          selectedPendingPackageCount === 0 ||
                          completeDeliveryMutation.isPending ||
                          completeDeliveryBatchMutation.isPending ||
                          submittingDeliveryId === household.householdDeliveryId
                            ? 0.6
                            : 1,
                      }}
                    >
                      {submittingDeliveryId ===
                      household.householdDeliveryId ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Ionicons
                          name="checkmark-done-circle"
                          size={16}
                          color="#fff"
                        />
                      )}
                      <Text className="text-sm font-bold text-white">
                        {submittingDeliveryId === household.householdDeliveryId
                          ? 'Đang xác nhận...'
                          : `Phát ${selectedPendingPackageCount} gói đã chọn`}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        handleMarkHouseholdDelivered(
                          household,
                          group.items,
                          pendingPackageItems.map(
                            (item) => item.householdDeliveryId,
                          ),
                        )
                      }
                      disabled={
                        !hasProofForHousehold ||
                        pendingPackageItems.length === 0 ||
                        completeDeliveryMutation.isPending ||
                        completeDeliveryBatchMutation.isPending ||
                        submittingDeliveryId === household.householdDeliveryId
                      }
                      className="flex-row items-center justify-center gap-1 rounded-lg px-4 py-2.5"
                      style={{
                        backgroundColor: colors.primary,
                        opacity:
                          !hasProofForHousehold ||
                          pendingPackageItems.length === 0 ||
                          completeDeliveryMutation.isPending ||
                          completeDeliveryBatchMutation.isPending ||
                          submittingDeliveryId === household.householdDeliveryId
                            ? 0.6
                            : 1,
                      }}
                    >
                      <Ionicons name="layers" size={16} color="#fff" />
                      <Text className="text-sm font-bold text-white">
                        Phát toàn bộ
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleSkipHousehold(household)}
                      disabled={updateHouseholdStatusMutation.isPending}
                      className="flex-row items-center justify-center gap-1 rounded-lg border px-4 py-2.5"
                      style={{ borderColor: colors.status.pending }}
                    >
                      <Ionicons
                        name="close"
                        size={16}
                        color={colors.status.pending}
                      />
                      <Text
                        className="text-sm font-bold"
                        style={{ color: colors.status.pending }}
                      >
                        Bỏ qua
                      </Text>
                    </TouchableOpacity>
                  </ScrollView>
                )}

                {isPending &&
                (!hasProofForHousehold || selectedPendingPackageCount === 0) ? (
                  <View className="mt-2 gap-1">
                    {!hasProofForHousehold ? (
                      <Text
                        className="text-xs"
                        style={{ color: colors.textSecondary }}
                      >
                        Bạn cần thêm ít nhất 1 ảnh/video minh chứng trước khi
                        phát.
                      </Text>
                    ) : null}
                    {selectedPendingPackageCount === 0 ? (
                      <Text
                        className="text-xs"
                        style={{ color: colors.textSecondary }}
                      >
                        Hãy chọn ít nhất 1 gói chưa phát để dùng nút Phát gói đã
                        chọn.
                      </Text>
                    ) : null}
                  </View>
                ) : null}
              </View>
            );
          }}
          contentContainerStyle={{ paddingBottom: bottom + 120 }}
          className="flex-1"
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Sticky Footer - only for subtask tab */}
      {isPersonalView &&
        activeTab === 'subtask' &&
        activeMemberTask &&
        selectedMemberTaskStatus !== null && (
          <StickyFooterButton
            title={isSubmitting ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
            icon="send"
            backgroundColor={colors.secondary}
            onPress={handleSubmitSubtaskStatus}
            disabled={isSubmitting}
          />
        )}

      {showScrollToTopButton ? (
        <TouchableOpacity
          onPress={handleScrollToTop}
          activeOpacity={0.9}
          className="absolute right-4 h-12 w-12 items-center justify-center rounded-full shadow-lg"
          style={{
            bottom:
              isPersonalView &&
              activeTab === 'subtask' &&
              activeMemberTask &&
              selectedMemberTaskStatus !== null
                ? bottom + 30
                : bottom - 16,
            right: 20,

            backgroundColor: colors.primary,
          }}
        >
          <Ionicons name="arrow-up" size={20} color={colors.white} />
        </TouchableOpacity>
      ) : null}

      <Modal
        visible={!!proofModalDeliveryId}
        transparent
        animationType="slide"
        onRequestClose={() => setProofModalDeliveryId(null)}
        onDismiss={() => setProofModalDeliveryId(null)}
      >
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          onPress={() => setProofModalDeliveryId(null)}
        >
          <Pressable
            className="rounded-t-3xl px-4 pb-8 pt-5"
            style={{
              backgroundColor: colors.card,
              maxHeight: '80%',
              height: 450,
            }}
            onPress={(event) => event.stopPropagation()}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text
                  className="py-3 text-lg font-bold "
                  style={{ color: colors.text }}
                >
                  Bằng chứng phát hàng
                </Text>
                <Text
                  className="mt-1 text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Ảnh và video minh chứng đã lưu cho hộ dân này.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setProofModalDeliveryId(null)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {isDeliveryDetailLoading ? (
              <View className="items-center py-8">
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : (selectedDeliveryDetail?.proofs?.length ?? 0) === 0 ? (
              <View
                className="mt-4 rounded-xl border border-dashed p-4"
                style={{ borderColor: colors.border }}
              >
                <Text style={{ color: colors.textSecondary }}>
                  Chưa có bằng chứng nào được lưu cho delivery này.
                </Text>
              </View>
            ) : (
              <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
                <View className="gap-3">
                  {selectedDeliveryDetail?.proofs.map((proof) => {
                    const isVideo = proof.fileType?.startsWith('video/');
                    return (
                      <TouchableOpacity
                        key={proof.householdDeliveryProofId}
                        onPress={() => openProofLink(proof.fileUrl)}
                        className="rounded-xl border p-3"
                        style={{
                          borderColor: colors.border,
                          backgroundColor: colors.background,
                        }}
                      >
                        <View className="flex-row gap-3">
                          <View
                            className="h-24 w-24 items-center justify-center overflow-hidden rounded-lg"
                            style={{ backgroundColor: colors.card }}
                          >
                            {isVideo ? (
                              <Ionicons
                                name="videocam"
                                size={28}
                                color={colors.primary}
                              />
                            ) : (
                              <Image
                                source={{ uri: proof.fileUrl }}
                                className="h-full w-full"
                                resizeMode="cover"
                              />
                            )}
                          </View>
                          <View className="flex-1 justify-center">
                            <Text
                              className="text-sm font-semibold"
                              style={{ color: colors.text }}
                            >
                              {getProofTypeLabel(proof.fileType)}
                            </Text>
                            {proof.note ? (
                              <Text
                                className="mt-1 text-xs"
                                style={{ color: colors.textSecondary }}
                              >
                                {proof.note}
                              </Text>
                            ) : null}
                            <Text
                              className="mt-1 text-xs"
                              style={{ color: colors.textSecondary }}
                            >
                              Tạo lúc:{' '}
                              {new Date(proof.capturedAt).toLocaleString(
                                'vi-VN',
                              )}
                            </Text>
                            <Text
                              className="mt-2 text-xs font-semibold"
                              style={{ color: colors.primary }}
                            >
                              Mở tệp Cloudinary
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function formatDate(value?: string | null) {
  if (!value) return 'Chưa đặt';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN');
}

function InfoPanel({
  colors,
  title,
  body,
  tone = 'default',
}: {
  colors: any;
  title: string;
  body: string[];
  tone?: 'default' | 'warning';
}) {
  const panelStyle =
    tone === 'warning'
      ? {
          borderColor: `${colors.status.pending}55`,
          backgroundColor: `${colors.status.pending}10`,
        }
      : {
          borderColor: colors.border,
          backgroundColor: colors.card,
        };

  return (
    <View className="rounded-xl border p-3" style={panelStyle}>
      <Text className="text-sm font-semibold" style={{ color: colors.text }}>
        {title}
      </Text>
      <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
        {body.join('\n')}
      </Text>
    </View>
  );
}

function HouseholdPackageSummaryCard({
  colors,
  householdCode,
  itemCount,
  packageGroups,
  getStatusTone,
  getPackageIcon,
}: {
  colors: any;
  householdCode?: string;
  itemCount: number;
  packageGroups: {
    name: string;
    status: HouseholdFulfillmentStatus;
    count: number;
  }[];
  getStatusTone: (status: HouseholdFulfillmentStatus) => {
    bg: string;
    text: string;
  };
  getPackageIcon: (packageName?: string | null) => string;
}) {
  return (
    <View
      className="mt-2 rounded-xl border p-3"
      style={{
        borderColor: `${colors.primary}18`,
        backgroundColor: `${colors.primary}06`,
      }}
    >
      <Text
        className="text-xs font-semibold"
        style={{ color: colors.textSecondary }}
      >
        Hộ dân và gói cần phát
      </Text>
      <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
        Mã hộ: {householdCode || 'Chưa rõ'} • {itemCount} gói cần phát
      </Text>
      <View className="mt-2 gap-2">
        {packageGroups.map((pkg, index) => {
          const tone = getStatusTone(pkg.status);
          const packageIconName = getPackageIcon(pkg.name);
          return (
            <View
              key={`${pkg.name}-${index}`}
              className="rounded-xl border p-3"
              style={{
                backgroundColor: tone.bg,
                borderColor: `${tone.text}24`,
              }}
            >
              <View className="flex-row items-start gap-2">
                <View
                  className="mt-0.5 h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${tone.text}12` }}
                >
                  <Ionicons
                    name={packageIconName as any}
                    size={16}
                    color={tone.text}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: tone.text }}
                  >
                    {pkg.name}
                    {pkg.count > 1 ? ` x${pkg.count}` : ''}
                  </Text>
                  <Text
                    className="mt-1 text-[11px]"
                    style={{ color: colors.textSecondary }}
                  >
                    {packageIconName === 'restaurant'
                      ? 'Nhóm lương thực / thực phẩm'
                      : packageIconName === 'water'
                        ? 'Nhóm nước uống / nước sạch'
                        : packageIconName === 'medical'
                          ? 'Nhóm y tế / thuốc men'
                          : packageIconName === 'cash'
                            ? 'Nhóm hỗ trợ tiền mặt'
                            : 'Nhóm cứu trợ khác'}
                  </Text>
                  <Text
                    className="mt-1 text-[11px]"
                    style={{ color: colors.textSecondary }}
                  >
                    Trạng thái: {HOUSEHOLD_STATUS_LABELS[pkg.status]}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function HouseholdDeliveryPlanCard({
  colors,
  deliveredCount,
  totalCount,
  distributionPointName,
  deliveryMode,
  deliveryModeDescription,
  scheduledAt,
}: {
  colors: any;
  deliveredCount: number;
  totalCount: number;
  distributionPointName: string;
  deliveryMode: number;
  deliveryModeDescription: string;
  scheduledAt?: string;
}) {
  const progress = Math.max(
    8,
    (deliveredCount / Math.max(totalCount, 1)) * 100,
  );

  return (
    <View
      className="mt-3 rounded-xl border p-3"
      style={{
        borderColor: colors.border,
        backgroundColor: colors.background,
      }}
    >
      <View className="mb-3">
        <View className="mb-1 flex-row items-center justify-between">
          <Text
            className="text-xs font-semibold"
            style={{ color: colors.textSecondary }}
          >
            Tiến độ theo hộ
          </Text>
          <Text
            className="text-xs font-semibold"
            style={{ color: colors.textSecondary }}
          >
            {deliveredCount}/{totalCount} gói
          </Text>
        </View>
        <View
          className="h-2 overflow-hidden rounded-full"
          style={{ backgroundColor: `${colors.primary}10` }}
        >
          <View
            className="h-full rounded-full"
            style={{ width: `${progress}%`, backgroundColor: colors.primary }}
          />
        </View>
      </View>
      <Text
        className="text-xs font-semibold"
        style={{ color: colors.textSecondary }}
      >
        Kế hoạch phát hàng
      </Text>
      <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
        Điểm phát: {distributionPointName}
      </Text>
      <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
        Hình thức: {DeliveryModeLabels[deliveryMode as 0 | 1]}
      </Text>
      <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
        {deliveryModeDescription}
      </Text>
      <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
        Lịch phát: {new Date(scheduledAt || '').toLocaleString('vi-VN')}
      </Text>
    </View>
  );
}

function HouseholdProofStatusCard({
  colors,
  proofCount,
  cashSupportAmount,
  helperText,
}: {
  colors: any;
  proofCount: number;
  cashSupportAmount: number;
  helperText: string;
}) {
  return (
    <View
      className="mt-3 rounded-xl border p-3"
      style={{
        borderColor: colors.border,
        backgroundColor: colors.background,
      }}
    >
      <Text
        className="text-xs font-semibold"
        style={{ color: colors.textSecondary }}
      >
        Tình trạng và bằng chứng
      </Text>
      <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
        Bằng chứng hiện có: {proofCount}
      </Text>
      {cashSupportAmount > 0 ? (
        <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
          Tổng tiền hỗ trợ: {cashSupportAmount.toLocaleString('vi-VN')} đ
        </Text>
      ) : null}
      <Text
        className="mt-2 text-xs font-semibold"
        style={{ color: colors.primary }}
      >
        {helperText}
      </Text>
    </View>
  );
}
