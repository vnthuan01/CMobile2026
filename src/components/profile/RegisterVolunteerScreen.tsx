import '@/global.css';
import AppDialog, { useDialog } from '@/src/components/common/AppDialog';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import { useTheme } from '@/src/context/ThemeContext';
import { useBottomContentInset } from '@/src/hooks/useBottomContentInset';
import {
  useCampaignDetail,
  useVolunteerRegistrationCampaigns,
} from '@/src/hooks/useDonation';
import { useUploadImage } from '@/src/hooks/useUploadImage';
import {
  useCreateVolunteerProfile,
  useResubmitVolunteerProfile,
  useVolunteerSkills,
} from '@/src/hooks/useVolunteerActions';
import type { CampaignListItem } from '@/src/services/donationService';
import {
  CampaignResourceType,
  getCampaignDetail,
} from '@/src/services/donationService';
import {
  CreateVolunteerCertificateRequest,
  CreateVolunteerRequest,
  ResubmitVolunteerProfileRequest,
  SkillResponse,
  TeamRolePreference,
  VolunteerProfileResponse,
} from '@/src/services/volunteerService';
import { useProfileFlowStore } from '@/src/store/profileFlowStore';
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from '@/src/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useQueries } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface RegisterVolunteerScreenProps {
  onBack?: () => void;
  onSuccess?: () => void;
  mode?: 'create' | 'resubmit';
  initialProfile?: VolunteerProfileResponse | null;
}

const EMPTY_CERT: CreateVolunteerCertificateRequest = {
  name: '',
  issuedBy: '',
  issuedDate: '',
  expiryDate: '',
  fileUrl: '',
};

type PickingField = 'issuedDate' | 'expiryDate';

const TEAM_ROLE_OPTIONS: { label: string; value: TeamRolePreference }[] = [
  { label: 'Thành viên', value: TeamRolePreference.Member },
  { label: 'Đội trưởng', value: TeamRolePreference.Leader },
  { label: 'Tài xế', value: TeamRolePreference.Driver },
];

const getLocalizedSkillName = (name?: string | null, code?: string | null) => {
  const source = `${code || ''} ${name || ''}`.toLowerCase().trim();

  if (!source) return 'Kỹ năng';
  if (
    source.includes('first') ||
    source.includes('aid') ||
    source.includes('sơ cứu')
  ) {
    return 'Sơ cứu';
  }
  if (source.includes('medical') || source.includes('y tế')) {
    return 'Hỗ trợ y tế';
  }
  if (source.includes('swim') || source.includes('bơi')) {
    return 'Bơi cứu hộ';
  }
  if (
    source.includes('drive') ||
    source.includes('driver') ||
    source.includes('lái xe')
  ) {
    return 'Lái xe cứu trợ';
  }
  if (source.includes('logistic') || source.includes('hậu cần')) {
    return 'Hậu cần';
  }
  if (source.includes('communicat') || source.includes('liên lạc')) {
    return 'Liên lạc điều phối';
  }
  if (source.includes('rescue') || source.includes('cứu hộ')) {
    return 'Cứu hộ';
  }
  if (source.includes('search') || source.includes('tìm kiếm')) {
    return 'Tìm kiếm cứu nạn';
  }

  return name || code || 'Kỹ năng';
};

const getCampaignStatusMeta = (status: number, colors: any) => {
  switch (Number(status)) {
    case 0:
      return {
        label: 'Nháp',
        bg: colors.surface,
        text: colors.textSecondary,
      };
    case 1:
      return {
        label: 'Đang hoạt động',
        bg: `${colors.status.completed}18`,
        text: colors.status.completed,
      };
    case 2:
      return {
        label: 'Tạm dừng',
        bg: `${colors.status.incoming}18`,
        text: colors.status.incoming,
      };
    case 3:
      return {
        label: 'Hoàn thành',
        bg: `${colors.status.completed}18`,
        text: colors.status.completed,
      };
    case 4:
      return {
        label: 'Đã hủy',
        bg: `${colors.status.error}18`,
        text: colors.status.error,
      };
    case 5:
      return {
        label: 'Đã đủ mục tiêu',
        bg: `${colors.status.incoming}18`,
        text: colors.status.incoming,
      };
    case 6:
      return {
        label: 'Sẵn sàng triển khai',
        bg: `${colors.status.pending}18`,
        text: colors.status.pending,
      };
    case 7:
      return {
        label: 'Đang triển khai',
        bg: `${colors.status.inProgress}18`,
        text: colors.status.inProgress,
      };
    case 8:
      return {
        label: 'Đang đóng',
        bg: `${colors.status.cancelled}18`,
        text: colors.status.cancelled,
      };
    default:
      return {
        label: 'Khả dụng',
        bg: `${colors.status.pending}18`,
        text: colors.status.pending,
      };
  }
};

const getVolunteerPriorityMeta = (
  remainingPeople: number,
  status: number,
  colors: any,
) => {
  if (![1, 6, 7].includes(Number(status))) {
    return { label: 'Ưu tiên thấp', color: colors.textSecondary };
  }
  if (remainingPeople >= 15) {
    return { label: 'Ưu tiên tuyển TNV cao', color: colors.status.error };
  }
  if (remainingPeople >= 6) {
    return {
      label: 'Ưu tiên tuyển TNV trung bình',
      color: colors.status.pending,
    };
  }
  return { label: 'Ưu tiên tuyển TNV thấp', color: colors.status.completed };
};

const getProgressColor = (progressPercent: number, colors: any) => {
  if (progressPercent >= 80) return colors.status.completed;
  if (progressPercent >= 40) return colors.status.pending;
  return colors.status.error;
};

export default function RegisterVolunteerScreen({
  onBack,
  onSuccess,
  mode = 'create',
  initialProfile,
}: RegisterVolunteerScreenProps) {
  const bottomInset = useBottomContentInset(24);
  const router = useRouter();
  const { colors } = useTheme();
  const { dialogProps, showDialog } = useDialog();
  const skillsQuery = useVolunteerSkills();
  const campaignsQuery = useVolunteerRegistrationCampaigns(mode === 'create');
  const uploadImageMutation = useUploadImage();
  const createVolunteerProfileMutation = useCreateVolunteerProfile();
  const resubmitVolunteerProfileMutation = useResubmitVolunteerProfile();
  const [descriptions, setDescriptions] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [teamRolePreference, setTeamRolePreference] =
    useState<TeamRolePreference | null>(null);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [skills, setSkills] = useState<SkillResponse[]>([]);
  const [certificates, setCertificates] = useState<
    CreateVolunteerCertificateRequest[]
  >([{ ...EMPTY_CERT }]);
  const [draftSaved, setDraftSaved] = useState(false);
  const [uploadingCertificateIndex, setUploadingCertificateIndex] = useState<
    number | null
  >(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());
  const [pickingTarget, setPickingTarget] = useState<{
    index: number;
    field: PickingField;
  } | null>(null);
  const skillsLoading = skillsQuery.isLoading;
  const campaigns = campaignsQuery.data?.items ?? [];
  const campaignsLoading = campaignsQuery.isLoading;
  const campaignSummaryQueries = useQueries({
    queries: campaigns.map((campaign: CampaignListItem) => ({
      queryKey: ['donation', 'campaign-detail', campaign.campaignId],
      queryFn: () => getCampaignDetail(campaign.campaignId),
      staleTime: 0,
    })),
  });
  const selectedCampaignDetailQuery = useCampaignDetail(
    selectedCampaignId || undefined,
    !!selectedCampaignId,
  );
  const selectedVolunteerCampaign = useProfileFlowStore(
    (state) => state.selectedVolunteerCampaign,
  );
  const setSelectedVolunteerCampaign = useProfileFlowStore(
    (state) => state.setSelectedVolunteerCampaign,
  );
  const loading =
    createVolunteerProfileMutation.isPending ||
    resubmitVolunteerProfileMutation.isPending;

  const campaignSummaryMap = useMemo(() => {
    const summaryMap: Record<string, any> = {};
    campaigns.forEach((campaign: CampaignListItem, index: number) => {
      summaryMap[campaign.campaignId] =
        campaignSummaryQueries[index]?.data ?? null;
    });
    return summaryMap;
  }, [campaignSummaryQueries, campaigns]);

  const sortedCampaigns = useMemo(() => {
    const getPriority = (status: number) => {
      switch (Number(status)) {
        case 1:
          return 0;
        case 7:
          return 1;
        case 6:
          return 2;
        case 2:
          return 3;
        case 5:
          return 4;
        case 8:
          return 5;
        case 3:
          return 6;
        case 4:
          return 7;
        case 0:
          return 8;
        default:
          return 9;
      }
    };

    return [...campaigns].sort((a, b) => {
      const priorityDiff = getPriority(a.status) - getPriority(b.status);
      if (priorityDiff !== 0) return priorityDiff;

      const aSummary = campaignSummaryMap[a.campaignId];
      const bSummary = campaignSummaryMap[b.campaignId];
      const aPeopleGoal = (aSummary?.goals || []).find(
        (goal: any) => goal.resourceType === CampaignResourceType.People,
      );
      const bPeopleGoal = (bSummary?.goals || []).find(
        (goal: any) => goal.resourceType === CampaignResourceType.People,
      );
      const aRemaining = Math.max(
        (aPeopleGoal?.targetAmount ?? 0) - (aPeopleGoal?.receivedAmount ?? 0),
        0,
      );
      const bRemaining = Math.max(
        (bPeopleGoal?.targetAmount ?? 0) - (bPeopleGoal?.receivedAmount ?? 0),
        0,
      );

      if (bRemaining !== aRemaining) return bRemaining - aRemaining;
      return a.name.localeCompare(b.name, 'vi');
    });
  }, [campaignSummaryMap, campaigns]);

  const toDateOnlyString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (iso?: string | null) => {
    if (!iso) return 'Chọn ngày cấp';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('vi-VN');
  };

  useEffect(() => {
    setSkills(
      Array.isArray(skillsQuery.data?.skills) ? skillsQuery.data.skills : [],
    );
    if (skillsQuery.data?.errorMessage) {
      showErrorToast('Không thể tải kỹ năng', skillsQuery.data.errorMessage);
    }
  }, [skillsQuery.data?.errorMessage, skillsQuery.data?.skills]);

  useEffect(() => {
    if (!initialProfile) return;

    setSelectedCampaignId(initialProfile.campaignId || '');
    setDescriptions(initialProfile.descriptions || '');
    setYearsOfExperience(
      initialProfile.yearsOfExperience != null
        ? String(initialProfile.yearsOfExperience)
        : '',
    );
    setTeamRolePreference(
      (initialProfile.preferredTeamRole as TeamRolePreference | null) ||
        TeamRolePreference.Member,
    );
    setSelectedSkillIds(
      (initialProfile.skills || [])
        .map((skill) => {
          if (typeof skill === 'string') return skill;
          return skill?.skillId || skill?.code || skill?.name || '';
        })
        .filter(Boolean),
    );
    setCertificates(
      initialProfile.certificates?.length
        ? initialProfile.certificates.map((cert) => ({
            name: cert.name || '',
            issuedBy: cert.issuedBy || '',
            issuedDate: cert.issuedDate || '',
            expiryDate: cert.expiryDate || '',
            fileUrl: cert.fileUrl || '',
          }))
        : [{ ...EMPTY_CERT }],
    );
  }, [initialProfile]);

  useEffect(() => {
    if (mode !== 'create') return;
    if (selectedVolunteerCampaign?.campaignId) {
      setSelectedCampaignId(selectedVolunteerCampaign.campaignId);
    }
  }, [mode, selectedVolunteerCampaign?.campaignId]);

  useFocusEffect(
    useCallback(() => {
      if (
        mode === 'create' &&
        selectedCampaignId &&
        campaigns.length > 0 &&
        !selectedVolunteerCampaign
      ) {
        const matched = campaigns.find(
          (campaign: CampaignListItem) =>
            campaign.campaignId === selectedCampaignId,
        );
        if (matched) setSelectedVolunteerCampaign(matched);
      }
    }, [
      mode,
      selectedCampaignId,
      campaigns,
      selectedVolunteerCampaign,
      setSelectedVolunteerCampaign,
    ]),
  );

  const toggleSkill = (skillId: string) => {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId)
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId],
    );
  };

  const handleYearsOfExperienceChange = (value: string) => {
    const normalized = value.replace(/[^0-9]/g, '');
    setYearsOfExperience(normalized);
  };

  const updateCertificate = (
    index: number,
    key: keyof CreateVolunteerCertificateRequest,
    value: string,
  ) => {
    const next = [...certificates];
    next[index] = { ...next[index], [key]: value };
    setCertificates(next);
  };

  const addCertificate = () => {
    setCertificates((prev) => [...prev, { ...EMPTY_CERT }]);
  };

  const removeCertificate = (index: number) => {
    if (certificates.length === 1) return;
    setCertificates((prev) => prev.filter((_, i) => i !== index));
  };

  const toDateOnly = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const getTodayDateOnly = () => toDateOnly(new Date());

  const getTomorrowDateOnly = () => {
    const today = getTodayDateOnly();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow;
  };

  const getDatePickerBounds = (field: PickingField) => {
    if (field === 'issuedDate') {
      return {
        minimumDate: undefined as Date | undefined,
        maximumDate: getTodayDateOnly(),
      };
    }

    return {
      minimumDate: getTomorrowDateOnly(),
      maximumDate: undefined as Date | undefined,
    };
  };

  const openDateTimePicker = (index: number, field: PickingField) => {
    const current = certificates[index]?.[field];
    const parsed = current ? new Date(current) : new Date();
    const baseDate = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    const { minimumDate, maximumDate } = getDatePickerBounds(field);
    let initialDate = toDateOnly(baseDate);

    if (minimumDate && initialDate < minimumDate) {
      initialDate = minimumDate;
    }

    if (maximumDate && initialDate > maximumDate) {
      initialDate = maximumDate;
    }

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: initialDate,
        mode: 'date',
        is24Hour: true,
        minimumDate,
        maximumDate,
        onChange: (dateEvent, selectedDate) => {
          if (dateEvent.type === 'dismissed' || !selectedDate) return;
          updateCertificate(index, field, toDateOnlyString(selectedDate));
        },
      });
      return;
    }

    setPickerDate(initialDate);
    setPickingTarget({ index, field });
    setPickerVisible(true);
  };

  const onDateTimeChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type === 'dismissed') {
      setPickerVisible(false);
      setPickingTarget(null);
      return;
    }

    if (!selected || !pickingTarget) return;

    const dateOnly = toDateOnlyString(selected);
    updateCertificate(pickingTarget.index, pickingTarget.field, dateOnly);
    setPickerDate(selected);
    setPickerVisible(false);
    setPickingTarget(null);
  };

  const pickAndUploadCertificateImage = async (index: number) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showWarningToast(
        'Cần quyền truy cập',
        'Bạn cần cấp quyền thư viện ảnh để chọn chứng chỉ.',
      );
      return;
    }

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.9,
    });

    if (picked.canceled || !picked.assets?.[0]) return;

    const asset = picked.assets[0];
    setUploadingCertificateIndex(index);
    try {
      const uploadResult = await uploadImageMutation.mutateAsync({
        localUri: asset.uri,
        fileName: asset.fileName || `certificate_${Date.now()}.jpg`,
        mimeType: asset.mimeType || 'image/jpeg',
      });

      if (!uploadResult.success || !uploadResult.url) {
        showErrorToast(
          'Upload ảnh thất bại',
          uploadResult.message || 'Upload ảnh thất bại.',
        );
        return;
      }

      updateCertificate(index, 'fileUrl', uploadResult.url);
      showSuccessToast(
        'Upload thành công',
        'Đã upload ảnh chứng chỉ thành công.',
      );
    } finally {
      setUploadingCertificateIndex(null);
    }
  };

  const validate = () => {
    const isValidDateOnly = (value: string) =>
      /^\d{4}-\d{2}-\d{2}$/.test(value);

    if (mode === 'create' && !selectedCampaignId) {
      showWarningToast(
        'Thiếu thông tin',
        'Vui lòng chọn chiến dịch để tham gia tình nguyện.',
      );
      return false;
    }

    if (!descriptions.trim()) {
      showWarningToast(
        'Thiếu thông tin',
        'Vui lòng nhập mô tả hồ sơ tình nguyện viên.',
      );
      return false;
    }

    if (
      yearsOfExperience.trim() &&
      (Number.isNaN(Number(yearsOfExperience)) || Number(yearsOfExperience) < 0)
    ) {
      showWarningToast(
        'Dữ liệu chưa hợp lệ',
        'Số năm kinh nghiệm phải là số >= 0.',
      );
      return false;
    }

    if (!teamRolePreference) {
      showWarningToast(
        'Thiếu thông tin',
        'Vui lòng chọn vai trò mong muốn trong đội.',
      );
      return false;
    }

    if (selectedSkillIds.length === 0) {
      showWarningToast('Thiếu thông tin', 'Vui lòng chọn ít nhất 1 kỹ năng.');
      return false;
    }

    for (const cert of certificates) {
      if (
        !cert.name.trim() ||
        !cert.issuedBy.trim() ||
        !cert.issuedDate.trim() ||
        !cert.fileUrl.trim()
      ) {
        showWarningToast(
          'Thiếu thông tin',
          'Vui lòng điền đủ thông tin chứng chỉ bắt buộc.',
        );
        return false;
      }

      if (!/^https?:\/\//i.test(cert.fileUrl.trim())) {
        showWarningToast(
          'Dữ liệu chưa hợp lệ',
          'File URL của chứng chỉ phải là link hợp lệ (http/https).',
        );
        return false;
      }

      if (!isValidDateOnly(cert.issuedDate.trim())) {
        showWarningToast(
          'Dữ liệu chưa hợp lệ',
          'Ngày cấp chứng chỉ phải đúng định dạng YYYY-MM-DD.',
        );
        return false;
      }

      if (cert.expiryDate?.trim() && !isValidDateOnly(cert.expiryDate.trim())) {
        showWarningToast(
          'Dữ liệu chưa hợp lệ',
          'Ngày hết hạn chứng chỉ phải đúng định dạng YYYY-MM-DD.',
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!teamRolePreference) return;

    const createPayload: CreateVolunteerRequest = {
      campaignId: selectedCampaignId,
      descriptions: descriptions.trim(),
      skillIds: selectedSkillIds,
      teamRolePreference,
      yearsOfExperience: yearsOfExperience.trim()
        ? Number(yearsOfExperience)
        : null,
      certificates: certificates.map((c) => ({
        name: c.name.trim(),
        issuedBy: c.issuedBy.trim(),
        issuedDate: c.issuedDate.trim(),
        expiryDate: c.expiryDate?.trim() || null,
        fileUrl: c.fileUrl.trim(),
      })),
    };

    try {
      const result =
        mode === 'resubmit'
          ? await resubmitVolunteerProfileMutation.mutateAsync({
              descriptions: createPayload.descriptions,
              skillIds: createPayload.skillIds,
              preferredTeamRole: teamRolePreference,
              yearsOfExperience: createPayload.yearsOfExperience,
              certificates: createPayload.certificates,
            } as ResubmitVolunteerProfileRequest)
          : await createVolunteerProfileMutation.mutateAsync(createPayload);

      if (!result.success) {
        showErrorToast(
          'Không thể gửi hồ sơ',
          result.message || 'Không thể gửi hồ sơ.',
        );
        return;
      }

      const successMessage =
        mode === 'resubmit'
          ? 'Đã gửi lại hồ sơ tình nguyện viên. Vui lòng chờ xét duyệt lại.'
          : 'Đã gửi hồ sơ đăng ký tình nguyện viên. Vui lòng chờ xét duyệt.';
      showSuccessToast('Gửi hồ sơ thành công', successMessage);
      showDialog({
        title: 'Thành công',
        message: successMessage,
        type: 'success',
        cancelLabel: 'Ở lại',
        confirmLabel: 'Hoàn tất',
        onConfirm: () => onSuccess?.(),
      });
    } catch {
      // toast handled by mutation onError or result.success branch
    }
  };

  const handleSaveDraft = () => {
    setDraftSaved(true);
    showSuccessToast(
      'Đã lưu nháp',
      'Thông tin chỉnh sửa đã được giữ lại trên màn hình hiện tại.',
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenHeader
        title={
          mode === 'resubmit'
            ? 'Chỉnh sửa và gửi lại hồ sơ'
            : 'Đăng ký tình nguyện viên'
        }
        onBack={onBack}
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: bottomInset }}
        showsVerticalScrollIndicator={false}
      >
        {mode === 'resubmit' && initialProfile?.reason ? (
          <View
            className="mx-4 mt-4 rounded-2xl border p-4"
            style={{
              borderColor: `${colors.status.error}33`,
              backgroundColor: `${colors.status.error}12`,
            }}
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
                  style={{ color: colors.status.error }}
                >
                  Hồ sơ đã bị từ chối
                </Text>
                <Text
                  className="mt-2 text-sm leading-6"
                  style={{ color: colors.status.error }}
                >
                  {initialProfile.reason}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {mode === 'resubmit' && draftSaved ? (
          <View
            className="mx-4 mt-4 rounded-2xl border p-4"
            style={{
              borderColor: `${colors.status.completed}33`,
              backgroundColor: `${colors.status.completed}12`,
            }}
          >
            <Text
              className="text-sm font-medium"
              style={{ color: colors.status.completed }}
            >
              Bản nháp đã được lưu trong phiên làm việc hiện tại.
            </Text>
          </View>
        ) : null}

        {mode === 'create' ? (
          <View className="px-4 pt-4">
            <Text className="mb-2 text-sm font-semibold text-text-secondary">
              Chọn chiến dịch tham gia
            </Text>
            {campaignsLoading ? (
              <View className="h-16 items-center justify-center">
                <ActivityIndicator color={colors.primary} />
                <Text className="mt-2 text-xs text-text-secondary">
                  Đang tải danh sách chiến dịch...
                </Text>
              </View>
            ) : campaigns.length === 0 ? (
              <Text className="text-sm" style={{ color: colors.status.error }}>
                Không có chiến dịch nào đang mở cho đăng ký tình nguyện viên.
              </Text>
            ) : (
              <>
                <View className="mb-3 flex-row items-center justify-between">
                  <Text
                    className="text-xs font-medium"
                    style={{ color: colors.textSecondary }}
                  >
                    {campaigns.length} chiến dịch khả dụng
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      router.push('/profile/select-volunteer-campaign' as any)
                    }
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: colors.primary }}
                    >
                      Xem tất cả
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    router.push('/profile/select-volunteer-campaign' as any)
                  }
                  className="rounded-2xl border p-4"
                  style={{
                    borderColor: selectedCampaignId
                      ? colors.primary
                      : colors.border,
                    backgroundColor: colors.card,
                  }}
                >
                  <View className="flex-row items-center justify-between gap-3">
                    <View className="flex-1">
                      <Text
                        className="text-xs font-semibold uppercase"
                        style={{ color: colors.textSecondary }}
                      >
                        Chiến dịch đã chọn
                      </Text>

                      <Text
                        className="mt-1 text-base font-bold"
                        style={{ color: colors.text }}
                      >
                        {selectedVolunteerCampaign?.name ||
                          'Chưa chọn chiến dịch'}
                      </Text>
                      <Text
                        className="mt-1 text-sm"
                        style={{ color: colors.textSecondary }}
                        numberOfLines={2}
                      >
                        {selectedVolunteerCampaign?.description
                          ? selectedVolunteerCampaign.description
                          : 'Bấm để mở danh sách chiến dịch, xem chi tiết rồi chọn chiến dịch tham gia.'}
                      </Text>
                      {selectedVolunteerCampaign
                        ? (() => {
                            const detail =
                              selectedCampaignDetailQuery.data ||
                              campaignSummaryMap[
                                selectedVolunteerCampaign.campaignId
                              ];
                            const peopleGoal = (detail?.goals || []).find(
                              (goal: any) =>
                                goal.resourceType ===
                                CampaignResourceType.People,
                            );
                            const peopleTarget = peopleGoal?.targetAmount ?? 0;
                            const peopleReached =
                              peopleGoal?.receivedAmount ?? 0;
                            const remainingPeople = Math.max(
                              peopleTarget - peopleReached,
                              0,
                            );
                            const progressPercent =
                              peopleTarget > 0
                                ? Math.min(
                                    (peopleReached / peopleTarget) * 100,
                                    100,
                                  )
                                : typeof selectedVolunteerCampaign.overallProgressPercent ===
                                    'number'
                                  ? selectedVolunteerCampaign.overallProgressPercent
                                  : 0;

                            return (
                              <>
                                <View className="mt-3">
                                  <Text
                                    className="mt-2 text-xs"
                                    style={{ color: colors.textSecondary }}
                                    numberOfLines={2}
                                  >
                                    Tiến độ:
                                  </Text>
                                  <View
                                    className="h-2 overflow-hidden rounded-full"
                                    style={{ backgroundColor: colors.border }}
                                  >
                                    <View
                                      className="h-full rounded-full"
                                      style={{
                                        width: `${Math.max(progressPercent, 4)}%`,
                                        backgroundColor:
                                          progressPercent >= 80
                                            ? colors.status.completed
                                            : progressPercent >= 40
                                              ? colors.status.pending
                                              : colors.status.error,
                                      }}
                                    />
                                  </View>
                                  <Text
                                    className="mt-2 text-xs"
                                    style={{ color: colors.textSecondary }}
                                    numberOfLines={2}
                                  >
                                    {peopleTarget > 0
                                      ? `Đã đạt ${peopleReached}/${peopleTarget} người • Còn thiếu ${remainingPeople} người.`
                                      : typeof selectedVolunteerCampaign.overallProgressPercent ===
                                          'number'
                                        ? `Tiến độ tổng quan ${Math.round(selectedVolunteerCampaign.overallProgressPercent)}%.`
                                        : 'Chưa có dữ liệu số lượng mục tiêu.'}
                                  </Text>
                                  <Text
                                    className="mt-2 text-xs"
                                    style={{ color: colors.textSecondary }}
                                    numberOfLines={2}
                                  >
                                    Địa chỉ:{' '}
                                    {selectedCampaignDetailQuery.data
                                      ?.addressDetail || 'Chưa có'}
                                  </Text>
                                </View>
                              </>
                            );
                          })()
                        : null}
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={22}
                      color={colors.textSecondary}
                    />
                  </View>
                </TouchableOpacity>

                {selectedVolunteerCampaign ? (
                  <Text
                    className="mt-2 text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    {new Date(
                      selectedVolunteerCampaign.startDate,
                    ).toLocaleDateString('vi-VN')}{' '}
                    -{' '}
                    {new Date(
                      selectedVolunteerCampaign.endDate,
                    ).toLocaleDateString('vi-VN')}
                  </Text>
                ) : null}
              </>
            )}
          </View>
        ) : null}

        <View className="px-4 pt-4">
          <Text className="mb-2 text-sm font-semibold text-text-secondary">
            Mô tả bản thân
          </Text>
          <TextInput
            value={descriptions}
            onChangeText={setDescriptions}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholder="Ví dụ: Có kinh nghiệm tham gia cứu trợ lũ, sơ cứu cơ bản..."
            className="rounded-xl border px-4 py-3 text-base"
            placeholderTextColor={colors.textSecondary}
            style={{
              borderColor: colors.border,
              backgroundColor: colors.card,
              color: colors.text,
            }}
          />
        </View>

        <View className="px-4 pt-4">
          <Text className="mb-2 text-sm font-semibold text-text-secondary">
            Số năm kinh nghiệm (không bắt buộc)
          </Text>
          <TextInput
            value={yearsOfExperience}
            onChangeText={handleYearsOfExperienceChange}
            keyboardType="number-pad"
            inputMode="numeric"
            placeholder="Ví dụ: 2"
            className="h-12 rounded-xl border px-4 text-base"
            placeholderTextColor={colors.textSecondary}
            style={{
              borderColor: colors.border,
              backgroundColor: colors.card,
              color: colors.text,
            }}
          />
        </View>

        <View className="px-4 pt-4">
          <Text className="mb-2 text-sm font-semibold text-text-secondary">
            Vai trò mong muốn trong đội
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {TEAM_ROLE_OPTIONS.map((role) => {
              const active = teamRolePreference === role.value;
              return (
                <TouchableOpacity
                  key={role.value}
                  onPress={() => setTeamRolePreference(role.value)}
                  className="rounded-full border px-4 py-2"
                  style={{
                    borderColor: active ? colors.primary : colors.border,
                    backgroundColor: active ? colors.primary : colors.card,
                  }}
                >
                  <Text
                    className="text-sm font-medium"
                    style={{ color: active ? colors.white : colors.text }}
                  >
                    {role.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View className="px-4 pt-4">
          <Text className="mb-2 text-sm font-semibold text-text-secondary">
            Kỹ năng
          </Text>
          {skillsLoading ? (
            <View className="h-16 items-center justify-center">
              <ActivityIndicator color={colors.primary} />
              <Text className="mt-2 text-xs text-text-secondary">
                Đang tải kỹ năng...
              </Text>
            </View>
          ) : skills.length === 0 ? (
            <Text className="text-sm" style={{ color: colors.status.error }}>
              Không tải được danh sách kỹ năng. Vui lòng kiểm tra endpoint
              Skill.
            </Text>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {(Array.isArray(skills) ? skills : []).map((skill) => {
                const active = selectedSkillIds.includes(skill.skillId);
                return (
                  <TouchableOpacity
                    key={skill.skillId}
                    onPress={() => toggleSkill(skill.skillId)}
                    className="rounded-full border px-3 py-2"
                    style={{
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active ? colors.primary : colors.card,
                    }}
                  >
                    <Text
                      className="text-sm font-medium"
                      style={{ color: active ? colors.white : colors.text }}
                    >
                      {getLocalizedSkillName(skill.name, skill.code)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View className="px-4 pt-4">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-text-secondary">
              Chứng chỉ
            </Text>
            <TouchableOpacity onPress={addCertificate}>
              <Text className="font-semibold text-primary">
                + Thêm chứng chỉ
              </Text>
            </TouchableOpacity>
          </View>

          {certificates.map((cert, index) => (
            <View
              key={index}
              className="mb-3 rounded-xl border p-3"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.card,
              }}
            >
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="font-semibold text-text-primary">
                  Chứng chỉ #{index + 1}
                </Text>
                {certificates.length > 1 && (
                  <TouchableOpacity onPress={() => removeCertificate(index)}>
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color={colors.status.error}
                    />
                  </TouchableOpacity>
                )}
              </View>

              <TextInput
                value={cert.name}
                onChangeText={(v) => updateCertificate(index, 'name', v)}
                placeholder="Tên chứng chỉ"
                className="mb-2 h-11 rounded-lg border px-3"
                placeholderTextColor={colors.textSecondary}
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                  color: colors.text,
                }}
              />
              <TextInput
                value={cert.issuedBy}
                onChangeText={(v) => updateCertificate(index, 'issuedBy', v)}
                placeholder="Đơn vị cấp"
                className="mb-2 h-11 rounded-lg border px-3"
                placeholderTextColor={colors.textSecondary}
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                  color: colors.text,
                }}
              />
              <TouchableOpacity
                onPress={() => openDateTimePicker(index, 'issuedDate')}
                className="mb-2 h-11 flex-row items-center justify-center gap-2 rounded-lg border"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                }}
              >
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text className="text-sm font-medium text-text-primary">
                  {formatDisplayDate(cert.issuedDate)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => openDateTimePicker(index, 'expiryDate')}
                className="mb-2 h-11 flex-row items-center justify-center gap-2 rounded-lg border"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                }}
              >
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text className="text-sm font-medium text-text-primary">
                  {cert.expiryDate
                    ? formatDisplayDate(cert.expiryDate)
                    : 'Chọn ngày hết hạn'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => pickAndUploadCertificateImage(index)}
                disabled={uploadingCertificateIndex === index}
                className={`mt-2 h-11 flex-row items-center justify-center gap-2 rounded-lg ${
                  uploadingCertificateIndex === index
                    ? 'bg-secondary/60'
                    : 'bg-secondary/80'
                }`}
              >
                {uploadingCertificateIndex === index ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <Ionicons
                      name="images-outline"
                      size={18}
                      color={colors.white}
                    />
                    <Text className="font-semibold text-white">
                      Chọn ảnh từ thư viện
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {!!cert.fileUrl?.trim() &&
                /^https?:\/\//i.test(cert.fileUrl.trim()) && (
                  <View
                    className="mt-2 overflow-hidden rounded-lg border"
                    style={{ borderColor: colors.border }}
                  >
                    <Image
                      source={{ uri: cert.fileUrl.trim() }}
                      className="h-40 w-full"
                      resizeMode="cover"
                    />
                  </View>
                )}
            </View>
          ))}
        </View>

        <View className="px-4 pt-2">
          {mode === 'resubmit' ? (
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={onBack}
                className="h-12 flex-1 items-center justify-center rounded-xl border"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                }}
              >
                <Text
                  className="text-base font-bold"
                  style={{ color: colors.text }}
                >
                  Hủy chỉnh sửa
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveDraft}
                className="h-12 flex-1 items-center justify-center rounded-xl border border-primary bg-primary/10"
              >
                <Text className="text-base font-bold text-primary">
                  Lưu nháp
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className={`mt-3 h-12 items-center justify-center rounded-xl ${
              loading ? 'bg-primary/60' : 'bg-primary'
            }`}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text className="text-base font-bold text-white">
                {mode === 'resubmit'
                  ? 'Gửi lại hồ sơ'
                  : 'Gửi hồ sơ tình nguyện viên'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {Platform.OS === 'ios' && pickerVisible && pickingTarget ? (
        <DateTimePicker
          value={pickerDate}
          mode="date"
          display="default"
          minimumDate={getDatePickerBounds(pickingTarget.field).minimumDate}
          maximumDate={getDatePickerBounds(pickingTarget.field).maximumDate}
          onChange={onDateTimeChange}
        />
      ) : null}
      <AppDialog {...dialogProps} />
    </View>
  );
}
