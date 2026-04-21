import '@/global.css';
import ImageUploader from '@/src/components/common/ImageUploader';
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
  useCompleteDelivery,
  useCompleteDeliveryBatch,
  useDeliveryDetail,
  useReliefChecklist,
  useUpdateHouseholdStatus,
} from '@/src/hooks/useReliefDistribution';
import { uploadService } from '@/src/services/uploadService';
import { useAuthStore } from '@/src/store/authStore';
import {
  CampaignTaskStatusLabels,
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
import {
  getVolunteerTaskCategoryLabel,
  isDeliveryTask,
} from '@/src/utils/taskClassification';
import { showErrorToast, showSuccessToast } from '@/src/utils/toast';
import { validateVolunteerTaskCompletion } from '@/src/utils/volunteerTaskValidation';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
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
}

interface ProofAsset {
  uri: string;
  mimeType?: string;
  fileName?: string;
  uploadedUrl?: string;
}

type ProofAssetMap = Record<string, ProofAsset[]>;

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
}: ProgressForReliefScreenProps) {
  const { bottom } = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const params = useLocalSearchParams<{
    campaignTaskId?: string;
    distributionPointId?: string;
    initialTab?: string;
  }>();

  // Data hooks
  const { data: myTeamData } = useMyTeam();
  const team = myTeamData?.team;
  const teamMode = myTeamData?.teamMode ?? 'rescue';
  const { data: fallbackAssignedCampaigns = [] } = useAssignedCampaigns(
    team?.teamId ?? '',
    !!team?.teamId,
  );
  const { campaignId } = useActiveAssignedCampaign(
    team,
    null,
    fallbackAssignedCampaigns,
  );

  const { data: campaignTeams = [] } = useCampaignTeams(
    teamMode === 'relief' ? campaignId : null,
  );
  const myCampaignTeam =
    campaignTeams.find(
      (item: CampaignTeamResponse) => item.teamId === team?.teamId,
    ) ?? campaignTeams[0];

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

  // Households for delivery
  const { data: checklistData, isLoading: isChecklistLoading } =
    useReliefChecklist(teamMode === 'relief' ? campaignId : null, {
      campaignTeamId: myCampaignTeam?.campaignTeamId,
      distributionPointId: params.distributionPointId,
      deliveryMode: 1,
      pageSize: 50,
    });

  // State
  const [activeTab, setActiveTab] = useState<ProgressTab>('subtask');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedMemberTaskId, setSelectedMemberTaskId] = useState<
    string | null
  >(null);
  const [selectedMemberTaskStatus, setSelectedMemberTaskStatus] =
    useState<MemberTaskStatus | null>(null);
  const [notes, setNotes] = useState('');
  const [proofAssetsByDeliveryId, setProofAssetsByDeliveryId] =
    useState<ProofAssetMap>({});
  const [selectedDeliveryIds, setSelectedDeliveryIds] = useState<string[]>([]);
  const [deliverySearch, setDeliverySearch] = useState('');
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState<
    'all' | HouseholdFulfillmentStatus
  >('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
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

  const allChecklistItems = checklistData?.items ?? [];
  const deliveryItems = useMemo(() => {
    const teamFiltered = allChecklistItems.filter(
      (item) => item.deliveryMode === 1,
    );

    return teamFiltered;
  }, [allChecklistItems]);
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
  const pendingFilteredDeliveryItems = useMemo(
    () =>
      filteredDeliveryItems.filter(
        (item) =>
          item.status === HouseholdFulfillmentStatus.Pending ||
          item.status === HouseholdFulfillmentStatus.PartiallyDelivered,
      ),
    [filteredDeliveryItems],
  );
  const allFilteredSelected =
    pendingFilteredDeliveryItems.length > 0 &&
    pendingFilteredDeliveryItems.every((item) =>
      selectedDeliveryIds.includes(item.householdDeliveryId),
    );

  const { data: taskDetail, isLoading: isDetailLoading } =
    useCampaignTaskDetail(selectedTaskId);
  const { data: selectedDeliveryDetail, isLoading: isDeliveryDetailLoading } =
    useDeliveryDetail(campaignId, proofModalDeliveryId);

  useEffect(() => {
    if (params.initialTab === 'delivery' || params.initialTab === 'subtask') {
      setActiveTab(params.initialTab);
    }
  }, [params.initialTab]);

  useEffect(() => {
    if (
      params.campaignTaskId &&
      myCampaignTasks.some(
        (task) => task.campaignTaskId === params.campaignTaskId,
      )
    ) {
      setSelectedTaskId(params.campaignTaskId);
      return;
    }

    if (!selectedTaskId && myCampaignTasks.length > 0) {
      setSelectedTaskId(myCampaignTasks[0].campaignTaskId);
      setSelectedMemberTaskId(myCampaignTasks[0].memberTaskId);
    }
  }, [myCampaignTasks, params.campaignTaskId, selectedTaskId]);

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
  const uniqueCampaignTasks = useMemo(() => {
    const seen = new Set<string>();

    return myCampaignTasks.filter((task) => {
      if (seen.has(task.campaignTaskId)) return false;
      seen.add(task.campaignTaskId);
      return true;
    });
  }, [myCampaignTasks]);

  const activeMemberTask = useMemo<MyMemberTaskResponse | null>(() => {
    if (selectedMemberTaskId) {
      const selectedMemberTask = sortedMyMemberTasks.find(
        (task) => task.memberTaskId === selectedMemberTaskId,
      );
      if (selectedMemberTask) return selectedMemberTask;
    }
    if (selectedTaskId) {
      const selectedTaskMember = sortedMyMemberTasks.find(
        (task) => task.campaignTaskId === selectedTaskId,
      );
      if (selectedTaskMember) return selectedTaskMember;
    }
    return sortedMyMemberTasks[0] ?? null;
  }, [selectedMemberTaskId, selectedTaskId, sortedMyMemberTasks]);
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
        proofImageUrls: images,
        hasHouseholdDeliveryIds: deliveryItems.every(
          (item) => !!item.householdDeliveryId,
        ),
      }),
    [activeMemberTask, deliveryItems, images, selectedMemberTaskStatus],
  );

  // Mutations
  const changeMemberStatusMutation = useChangeMemberTaskStatus();
  const updateHouseholdStatusMutation = useUpdateHouseholdStatus();
  const completeDeliveryMutation = useCompleteDelivery();
  const completeDeliveryBatchMutation = useCompleteDeliveryBatch();

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

  const toggleSelectDelivery = (householdDeliveryId: string) => {
    setSelectedDeliveryIds((prev) =>
      prev.includes(householdDeliveryId)
        ? prev.filter((id) => id !== householdDeliveryId)
        : [...prev, householdDeliveryId],
    );
  };

  const toggleExpandDelivery = (householdDeliveryId: string) => {
    setExpandedDeliveryId((prev) =>
      prev === householdDeliveryId ? null : householdDeliveryId,
    );
  };

  const handlePressDeliveryCard = (
    household: HouseholdChecklistItemResponse,
    isPending: boolean,
  ) => {
    if (isPending) {
      toggleSelectDelivery(household.householdDeliveryId);
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

  const handleToggleSelectAllFiltered = () => {
    const pendingIds = pendingFilteredDeliveryItems.map(
      (item) => item.householdDeliveryId,
    );
    if (pendingIds.length === 0) return;

    setSelectedDeliveryIds((prev) => {
      if (pendingIds.every((id) => prev.includes(id))) {
        return prev.filter((id) => !pendingIds.includes(id));
      }
      return Array.from(new Set([...prev, ...pendingIds]));
    });
  };

  const handleCompleteBatch = async () => {
    if (!campaignId) return;
    if (selectedDeliveryIds.length === 0) {
      showErrorToast(
        'Chưa chọn hộ dân',
        'Hãy chọn ít nhất 1 hộ để duyệt phát hàng hàng loạt.',
      );
      return;
    }
    const selectedItems = filteredDeliveryItems.filter((item) =>
      selectedDeliveryIds.includes(item.householdDeliveryId),
    );

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
      showSuccessToast(`Đã duyệt phát hàng cho ${selectedItems.length} hộ`);
      setSelectedDeliveryIds([]);
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
        request: { status: selectedMemberTaskStatus },
      });
      showSuccessToast('Đã cập nhật trạng thái nhiệm vụ');
      setSelectedMemberTaskStatus(null);
      setNotes('');
    } catch (error: any) {
      showErrorToast('Cập nhật thất bại', error?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkHouseholdDelivered = async (
    household: HouseholdChecklistItemResponse,
  ) => {
    if (!campaignId) return;
    const householdDeliveryId = household.householdDeliveryId;

    if (!householdDeliveryId) {
      showErrorToast(
        'Thiếu thông tin giao hàng',
        'Không tìm thấy householdDeliveryId để hoàn tất giao hàng. Cần BE trả kèm delivery id trong checklist hộ dân.',
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
              await completeDeliveryMutation.mutateAsync({
                campaignId,
                householdDeliveryId,
                request: {
                  campaignTeamId: myCampaignTeam?.campaignTeamId,
                  notes: notes || undefined,
                  proofNote: notes || undefined,
                  proofFileUrl: uploadedProofs[0].uploadedUrl!,
                  proofContentType: uploadedProofs[0].mimeType || 'image/jpeg',
                },
              });
              showSuccessToast(
                `Đã phát cho hộ ${household.headOfHouseholdName}`,
              );
              setProofAssetsByDeliveryId((prev) => ({
                ...prev,
                [household.householdDeliveryId]: [],
              }));
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

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenHeader
        title="Cập nhật tiến độ"
        onBack={onBack ?? (() => router.back())}
        backgroundColor={isDark ? colors.card : colors.primary}
        titleColor={isDark ? colors.text : colors.white}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottom + 120 }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {isMyMemberTasksLoading && !activeMemberTask ? (
          <View className="items-center py-8">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : null}

        {/* Active subtask summary */}
        {activeMemberTask && (
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
                  {getVolunteerTaskCategoryLabel(
                    selectedTaskValidation.category,
                  )}
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
                <Text
                  className="text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  Giao lúc: {formatDate(activeMemberTask.assignedAt)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Tab Selector */}
        <View className="px-4">
          <View
            className="flex-row gap-1 rounded-lg p-1"
            style={{ backgroundColor: colors.surface }}
          >
            <TouchableOpacity
              onPress={() => setActiveTab('subtask')}
              className="flex-1 items-center rounded-md px-3 py-2"
              style={{
                backgroundColor:
                  activeTab === 'subtask' ? colors.card : 'transparent',
                borderWidth: activeTab === 'subtask' ? 1 : 0,
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
            <TouchableOpacity
              onPress={() => setActiveTab('delivery')}
              className="flex-1 items-center rounded-md px-3 py-2"
              style={{
                backgroundColor:
                  activeTab === 'delivery' ? colors.card : 'transparent',
                borderWidth: activeTab === 'delivery' ? 1 : 0,
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

        {sortedMyMemberTasks.length > 0 ? (
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
              contentContainerStyle={{ gap: 8 }}
            >
              {sortedMyMemberTasks.map((memberTask, index) => {
                const selected =
                  activeMemberTask?.memberTaskId === memberTask.memberTaskId;
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
                    }}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{
                        color: selected ? colors.secondary : colors.text,
                      }}
                    >
                      {memberTask.subTaskTitle}
                    </Text>
                    <Text
                      className="mt-1 text-[11px]"
                      style={{ color: colors.textSecondary }}
                    >
                      Nhiệm vụ chung:{' '}
                      {(memberTask as any).campaignTaskTitle || 'Chưa rõ'}
                    </Text>
                    <Text
                      className="mt-1 text-xs"
                      style={{ color: colors.textSecondary }}
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
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        {activeTab === 'subtask' ? (
          <>
            {/* Campaign task summary */}
            <View className="px-4 pt-4">
              <Text
                className="mb-2 text-sm font-semibold"
                style={{ color: colors.text }}
              >
                Nhiệm vụ chung của chiến dịch
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {uniqueCampaignTasks.map((task, index) => (
                  <TouchableOpacity
                    key={`${task.campaignTaskId}-${index}`}
                    onPress={() => setSelectedTaskId(task.campaignTaskId)}
                    className="rounded-lg border px-3 py-2"
                    style={{
                      borderColor:
                        selectedTaskId === task.campaignTaskId
                          ? colors.secondary
                          : colors.border,
                      backgroundColor:
                        selectedTaskId === task.campaignTaskId
                          ? `${colors.secondary}12`
                          : colors.card,
                    }}
                  >
                    <Text
                      className="text-sm"
                      numberOfLines={1}
                      style={{
                        color:
                          selectedTaskId === task.campaignTaskId
                            ? colors.secondary
                            : colors.text,
                        fontWeight:
                          selectedTaskId === task.campaignTaskId
                            ? 'bold'
                            : 'normal',
                      }}
                    >
                      {task.campaignTaskTitle}
                    </Text>
                    <Text
                      className="mt-1 text-[11px]"
                      style={{ color: colors.textSecondary }}
                    >
                      {CampaignTaskStatusLabels[task.campaignTaskStatus]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Status Selection */}
            {activeMemberTask ? (
              <View>
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
                      // Show only valid next statuses
                      if (
                        activeMemberTask.status === MemberTaskStatus.Assigned
                      ) {
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

            {/* Notes */}
            <View className="mb-4">
              <Text
                className="px-4 pb-3 pt-4 text-left text-lg font-bold leading-tight tracking-tight"
                style={{ color: colors.text }}
              >
                Ghi chú
              </Text>
              <View className="px-4">
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Nhập tình trạng đường đi, lý do thất bại hoặc ghi chú thêm (tùy chọn)..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  className="min-h-[120px] w-full rounded-xl border p-4 text-sm"
                  style={{
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.text,
                  }}
                />
              </View>
            </View>

            {/* Proof images for delivery-related subtasks */}
            {activeMemberTask && isDeliveryTask(activeMemberTask) ? (
              <View className="mb-4 px-4">
                <Text
                  className="pb-3 text-left text-lg font-bold leading-tight tracking-tight"
                  style={{ color: colors.text }}
                >
                  Ảnh minh chứng phát hàng
                </Text>
                <Text
                  className="mb-3 text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Với subtask liên quan tới phát hàng, bạn phải giao đủ hộ được
                  gán và tải ảnh minh chứng trước khi bấm hoàn thành.
                </Text>
                <ImageUploader
                  images={images}
                  onAddImage={() =>
                    expandedDeliveryId
                      ? openProofPicker(expandedDeliveryId)
                      : showErrorToast(
                          'Chọn hộ dân trước',
                          'Hãy mở chi tiết một hộ dân để thêm bằng chứng đúng cho hộ đó.',
                        )
                  }
                  onRemoveImage={(index) =>
                    expandedDeliveryId
                      ? setProofAssetsByDeliveryId((prev) => ({
                          ...prev,
                          [expandedDeliveryId]: (
                            prev[expandedDeliveryId] ?? []
                          ).filter((_, idx) => idx !== index),
                        }))
                      : undefined
                  }
                />
              </View>
            ) : null}

            <View className="h-8" />
          </>
        ) : (
          /* Delivery tab - household checklist */
          <View className="gap-3 px-4 pt-4">
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              Danh sách hộ cần phát hàng
            </Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              Đánh dấu từng hộ sau khi phát hàng. Với nhiều hộ bạn có thể hoàn
              thành lần lượt.
            </Text>
            {params.distributionPointId ? (
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
            <View
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
                Bộ lọc hộ dân hiện tại
              </Text>
              <Text
                className="mt-1 text-xs"
                style={{ color: colors.textSecondary }}
              >
                Team: {myCampaignTeam?.teamName || 'Chưa rõ'}
                {`\n`}
                Hình thức phát: {DeliveryModeLabels[1]}
                {`\n`}
                Tổng danh sách sau lọc: {filteredDeliveryItems.length}
              </Text>
            </View>
            {activeMemberTask && isDeliveryTask(activeMemberTask) ? (
              <View
                className="rounded-xl border p-3"
                style={{
                  borderColor: `${colors.status.pending}55`,
                  backgroundColor: `${colors.status.pending}10`,
                }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: colors.text }}
                >
                  Flow hoàn thành subtask phát hàng
                </Text>
                <Text
                  className="mt-1 text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  1) Giao hàng cho các hộ được gán{`\n`}2) Tải ảnh minh chứng
                  {`\n`}3) Quay lại tab Nhiệm vụ con để bấm Hoàn thành
                </Text>
              </View>
            ) : null}

            {deliveryItems.length > 0 ? (
              <View
                className="rounded-xl border p-3"
                style={{
                  borderColor: colors.secondary,
                  backgroundColor: colors.card,
                }}
              >
                <TouchableOpacity
                  onPress={() => setShowAdvancedFilters((prev) => !prev)}
                  className="flex-row items-center justify-between gap-3 "
                >
                  <View className="flex-1 ">
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
                    name={showAdvancedFilters ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>

                {showAdvancedFilters ? (
                  <View className="mt-3 gap-3">
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
                                HouseholdFulfillmentStatus.PartiallyDelivered
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
                        const selected = deliveryStatusFilter === option.value;
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
                        {selectedDeliveryIds.length} hộ đã chọn •{' '}
                        {pendingFilteredDeliveryItems.length} hộ đang chờ/phát
                        một phần
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
                        selectedDeliveryIds.length === 0
                      }
                      className="flex-row items-center justify-center rounded-xl py-3"
                      style={{
                        backgroundColor: colors.primary,
                        opacity:
                          completeDeliveryBatchMutation.isPending ||
                          selectedDeliveryIds.length === 0
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
                          : `Duyệt ${selectedDeliveryIds.length} hộ đã chọn`}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            ) : null}

            {isChecklistLoading ? (
              <View className="items-center py-8">
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : filteredDeliveryItems.length === 0 ? (
              <View
                className="rounded-xl border border-dashed p-4"
                style={{ borderColor: colors.border }}
              >
                <Text style={{ color: colors.textSecondary }}>
                  Không có hộ dân nào phù hợp với bộ lọc hiện tại.
                </Text>
              </View>
            ) : (
              filteredDeliveryItems.map(
                (household: HouseholdChecklistItemResponse) => {
                  const statusLabel =
                    HOUSEHOLD_STATUS_LABELS[household.status] ?? 'Chờ phát';
                  const isDone =
                    household.status === HouseholdFulfillmentStatus.Delivered;
                  const isSkipped =
                    household.status === HouseholdFulfillmentStatus.Skipped;
                  const isPending =
                    household.status === HouseholdFulfillmentStatus.Pending ||
                    household.status ===
                      HouseholdFulfillmentStatus.PartiallyDelivered;
                  const hasLocalProof =
                    (proofAssetsByDeliveryId[household.householdDeliveryId]
                      ?.length ?? 0) > 0;
                  const isExpanded =
                    expandedDeliveryId === household.householdDeliveryId;
                  const deliveryProofs = (household as any).proofs ?? [];
                  return (
                    <TouchableOpacity
                      key={household.householdDeliveryId}
                      activeOpacity={0.88}
                      onPress={() =>
                        handlePressDeliveryCard(household, isPending)
                      }
                      className="rounded-xl border p-4"
                      style={{
                        borderColor: isDone
                          ? colors.status.completed
                          : isSkipped
                            ? colors.status.pending
                            : colors.border,
                        opacity: isSkipped ? 0.6 : 1,
                        backgroundColor: colors.card,
                      }}
                    >
                      <View className="flex-row items-start justify-between">
                        <View className="flex-1">
                          <View className="flex-row items-center gap-2">
                            {isPending ? (
                              <View>
                                <Ionicons
                                  name={
                                    selectedDeliveryIds.includes(
                                      household.householdDeliveryId,
                                    )
                                      ? 'checkbox'
                                      : 'square-outline'
                                  }
                                  size={20}
                                  color={
                                    selectedDeliveryIds.includes(
                                      household.householdDeliveryId,
                                    )
                                      ? colors.primary
                                      : colors.textSecondary
                                  }
                                />
                              </View>
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
                          </View>
                          <Text
                            className="mt-1 text-sm"
                            style={{ color: colors.textSecondary }}
                          >
                            Mã: {household.householdCode} • Gói:{' '}
                            {household.reliefPackageDefinitionName}
                          </Text>
                          <Text
                            className="mt-1 text-xs"
                            style={{ color: colors.textSecondary }}
                          >
                            Điểm phát:{' '}
                            {household.distributionPointName || 'Chưa rõ'}
                          </Text>
                          <Text
                            className="mt-1 text-xs"
                            style={{ color: colors.textSecondary }}
                          >
                            Hình thức:{' '}
                            {DeliveryModeLabels[household.deliveryMode]}
                          </Text>
                          <Text
                            className="mt-1 text-xs"
                            style={{ color: colors.textSecondary }}
                          >
                            Lịch phát:{' '}
                            {new Date(household.scheduledAt).toLocaleString(
                              'vi-VN',
                            )}
                          </Text>
                          <Text
                            className="mt-1 text-xs"
                            style={{ color: colors.textSecondary }}
                          >
                            Proof hiện có: {household.proofCount}
                          </Text>
                          <Text
                            className="mt-2 text-xs font-semibold"
                            style={{ color: colors.primary }}
                          >
                            {isPending
                              ? selectedDeliveryIds.includes(
                                  household.householdDeliveryId,
                                )
                                ? 'Đã chọn. Bấm lại để bỏ chọn, kéo xuống để xem chi tiết.'
                                : 'Bấm vào thẻ để chọn và xem chi tiết.'
                              : isExpanded
                                ? 'Đang hiển thị chi tiết hộ dân.'
                                : 'Bấm vào thẻ để xem chi tiết hộ dân.'}
                          </Text>
                        </View>
                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={18}
                          color={colors.textSecondary}
                        />
                      </View>

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

                          {(proofAssetsByDeliveryId[
                            household.householdDeliveryId
                          ]?.length ?? 0) > 0 && isPending ? (
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
                                  openProofGallery(
                                    household.householdDeliveryId,
                                  )
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
                                      {household.proofCount > 0
                                        ? `${household.proofCount} tệp minh chứng đã lưu. Bấm để xem chi tiết.`
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
                        <View className="mt-3 flex-row gap-2">
                          <TouchableOpacity
                            onPress={() =>
                              hasLocalProof
                                ? handleMarkHouseholdDelivered(household)
                                : (() => {
                                    setExpandedDeliveryId(
                                      household.householdDeliveryId,
                                    );
                                    openProofPicker(
                                      household.householdDeliveryId,
                                    );
                                  })()
                            }
                            disabled={
                              completeDeliveryMutation.isPending ||
                              submittingDeliveryId ===
                                household.householdDeliveryId
                            }
                            className="flex-1 flex-row items-center justify-center gap-1 rounded-lg py-2.5"
                            style={{
                              backgroundColor: colors.status.completed,
                              opacity:
                                completeDeliveryMutation.isPending ||
                                submittingDeliveryId ===
                                  household.householdDeliveryId
                                  ? 0.6
                                  : 1,
                            }}
                          >
                            {submittingDeliveryId ===
                            household.householdDeliveryId ? (
                              <ActivityIndicator size="small" color="#fff" />
                            ) : (
                              <Ionicons
                                name={
                                  hasLocalProof
                                    ? 'checkmark-circle'
                                    : 'cloud-upload'
                                }
                                size={16}
                                color="#fff"
                              />
                            )}
                            <Text className="text-sm font-bold text-white">
                              {submittingDeliveryId ===
                              household.householdDeliveryId
                                ? 'Đang xác nhận...'
                                : hasLocalProof
                                  ? 'Đã phát'
                                  : 'Thêm bằng chứng'}
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
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                },
              )
            )}
            <View className="h-16" />
          </View>
        )}
      </ScrollView>

      {/* Sticky Footer - only for subtask tab */}
      {activeTab === 'subtask' &&
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
              height: 400,
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
