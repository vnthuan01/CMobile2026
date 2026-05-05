import '@/global.css';
import { AppDialog, useDialog } from '@/src/components/common/AppDialog';
import Header from '@/src/components/header/header';
import { useTheme } from '@/src/context/ThemeContext';
import { useMyRescueRequests } from '@/src/hooks/useMyRescueRequests';
import { useCurrentRescueLocation } from '@/src/hooks/useRescueLocation';
import { usePriorityCriteria } from '@/src/hooks/useRescueMeta';
import { useSubmitRescueRequest } from '@/src/hooks/useSubmitRescueRequest';
import { useUploadImage } from '@/src/hooks/useUploadImage';
import { useUserProfile } from '@/src/hooks/useUserProfile';
import {
  DisasterType,
  RescueAttachment,
  RescueType,
} from '@/src/services/rescueService';
import { useAuthStore } from '@/src/store/authStore';
import type { PriorityCriteria } from '@/src/types/rescue';
import { getScreenScaleConfig, scaleSize } from '@/src/utils/responsive';
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from '@/src/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RequestRescueMiniMap from './RequestRescueMiniMap';

// ── Constants ─────────────────────────────────────────────────────────────────
const DISASTER_OPTIONS: {
  label: string;
  value: DisasterType;
  iconName: keyof typeof Ionicons.glyphMap;
}[] = [{ label: 'Bão lũ', value: 0, iconName: 'rainy-outline' }];

// ── Props ─────────────────────────────────────────────────────────────────────
interface RequestRescueScreenProps {
  onBack?: () => void;
}

type CriteriaCategory = 'HUMAN' | 'ENV' | 'SCALE';

const CRITERIA_CATEGORIES: {
  key: CriteriaCategory;
  label: string;
  subtitle: string;
}[] = [
  {
    key: 'HUMAN',
    label: 'Nhóm con người',
    subtitle: 'Chọn 1 tiêu chí',
  },
  {
    key: 'ENV',
    label: 'Nhóm môi trường',
    subtitle: 'Chọn 1 tiêu chí',
  },
  {
    key: 'SCALE',
    label: 'Nhóm quy mô',
    subtitle: 'Chọn 1 tiêu chí',
  },
];

const getCriteriaCategory = (code?: string): CriteriaCategory | null => {
  if (!code) return null;
  if (code.startsWith('HUMAN_')) return 'HUMAN';
  if (code.startsWith('ENV_')) return 'ENV';
  if (code.startsWith('SCALE_')) return 'SCALE';
  return null;
};

const isTerminalRescueRequestStatus = (status?: string | null) => {
  const normalized = String(status ?? '')
    .trim()
    .toLowerCase();
  return ['completed', 'cancelled', 'canceled', 'done', 'closed'].includes(
    normalized,
  );
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function RequestRescueScreen({
  onBack,
}: RequestRescueScreenProps) {
  const { bottom } = useSafeAreaInsets();
  const { width, height, fontScale } = useWindowDimensions();
  const screenScale = getScreenScaleConfig(width, height, fontScale);
  const addPhotoSize = Math.max(80, scaleSize(88, screenScale));
  const { colors } = useTheme();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authUser = useAuthStore((s) => s.user);
  const { dialogProps, showDialog } = useDialog();
  const uploadImageMutation = useUploadImage();
  const submitRescueRequestMutation = useSubmitRescueRequest();
  const userProfileQuery = useUserProfile(isAuthenticated);
  const myRescueRequestsQuery = useMyRescueRequests({
    pageSize: 20,
    enabled: isAuthenticated,
  });

  // ── Form state ───────────────────────────────────────────────────────────
  const [rescueType, setRescueType] = useState<RescueType>(
    isAuthenticated ? 0 : 1,
  );
  const [disasterType, setDisasterType] = useState<DisasterType>(0); // Bão lũ first
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [reporterFullName, setReporterFullName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [attachments, setAttachments] = useState<RescueAttachment[]>([]);
  const [selectedCriteriaByCategory, setSelectedCriteriaByCategory] = useState<
    Record<CriteriaCategory, string | null>
  >({
    HUMAN: null,
    ENV: null,
    SCALE: null,
  });

  // ── Location state ───────────────────────────────────────────────────────
  const {
    latitude,
    longitude,
    accuracy,
    address: detectedAddress,
    locationLabel,
    locating,
  } = useCurrentRescueLocation();

  // ── Remote data state ────────────────────────────────────────────────────
  const [uploadingImages, setUploadingImages] = useState(false);
  const priorityCriteriaQuery = usePriorityCriteria(
    disasterType,
    rescueType === 0,
  );
  const criteria: PriorityCriteria[] = priorityCriteriaQuery.data ?? [];
  const loadingCriteria = priorityCriteriaQuery.isLoading;
  const submitting = submitRescueRequestMutation.isPending;

  const userProfile = userProfileQuery.data?.profile;
  const profileContactLoading = isAuthenticated && userProfileQuery.isLoading;
  const existingRescueRequest = (myRescueRequestsQuery.data ?? []).find(
    (request) => !isTerminalRescueRequestStatus(request.rescueRequestStatus),
  );
  const resolvedReporterFullName =
    userProfile?.displayName?.trim() || authUser?.user_name?.trim() || '';
  const resolvedReporterPhone = userProfile?.phoneNumber?.trim() || '';
  const hasLockedFullName = Boolean(resolvedReporterFullName);
  const hasLockedPhone = Boolean(resolvedReporterPhone);
  const needsProfileCompletion =
    isAuthenticated && (!resolvedReporterFullName || !resolvedReporterPhone);
  const isCheckingExistingRequest =
    isAuthenticated && myRescueRequestsQuery.isLoading;
  const canSubmitNewRequest =
    !existingRescueRequest && !isCheckingExistingRequest;

  useEffect(() => {
    if (detectedAddress && !address) {
      setAddress(detectedAddress);
    }
  }, [address, detectedAddress]);

  useEffect(() => {
    if (!isAuthenticated) return;

    if (
      resolvedReporterFullName &&
      reporterFullName !== resolvedReporterFullName
    ) {
      setReporterFullName(resolvedReporterFullName);
    }

    if (resolvedReporterPhone && reporterPhone !== resolvedReporterPhone) {
      setReporterPhone(resolvedReporterPhone);
    }
  }, [
    isAuthenticated,
    reporterFullName,
    reporterPhone,
    resolvedReporterFullName,
    resolvedReporterPhone,
  ]);

  useEffect(() => {
    if (!isAuthenticated && rescueType === 0) {
      setRescueType(1);
    }
  }, [isAuthenticated, rescueType]);

  // ── Fetch priority criteria when disaster type changes ────────────────────
  useEffect(() => {
    setSelectedCriteriaByCategory({ HUMAN: null, ENV: null, SCALE: null });
  }, [disasterType, rescueType]);

  useEffect(() => {
    if (priorityCriteriaQuery.error) {
      showErrorToast(
        'Không thể tải dữ liệu',
        'Không thể tải danh sách tiêu chí ưu tiên.',
      );
    }
  }, [priorityCriteriaQuery.error]);

  // ── Image picker ──────────────────────────────────────────────────────────
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showWarningToast(
        'Cần quyền truy cập',
        'Cho phép truy cập thư viện ảnh để đính kèm hình ảnh.',
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setUploadingImages(true);
      try {
        const uploaded: RescueAttachment[] = [];

        for (const asset of result.assets.slice(0, 5 - attachments.length)) {
          const uploadResult = await uploadImageMutation.mutateAsync({
            localUri: asset.uri,
            fileName: asset.fileName || `rescue_${Date.now()}.jpg`,
            mimeType: asset.mimeType ?? 'image/jpeg',
          });

          if (!uploadResult.success || !uploadResult.url) {
            showErrorToast(
              'Upload ảnh thất bại',
              uploadResult.message || 'Không thể upload ảnh lên Cloudinary.',
            );
            continue;
          }

          uploaded.push({
            fileUrl: uploadResult.url,
            contentType: asset.mimeType ?? 'image/jpeg',
          });
        }

        if (uploaded.length > 0) {
          setAttachments((prev) => [...prev, ...uploaded]);
        }
      } finally {
        setUploadingImages(false);
      }
    }
  };

  const removeAttachment = (index: number) =>
    setAttachments((prev) => prev.filter((_, i) => i !== index));

  // ── Toggle criteria ───────────────────────────────────────────────────────
  const toggleCriteria = (category: CriteriaCategory, id: string) => {
    setSelectedCriteriaByCategory((prev) => ({
      ...prev,
      [category]: prev[category] === id ? null : id,
    }));
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    if (!reporterPhone.trim()) {
      showWarningToast(
        'Thiếu thông tin',
        'Vui lòng nhập số điện thoại liên hệ.',
      );
      return false;
    }
    if (latitude === null || longitude === null) {
      showWarningToast(
        'Chưa có vị trí',
        'Vui lòng chờ ứng dụng xác định vị trí của bạn.',
      );
      return false;
    }
    if (rescueType === 0) {
      if (!reporterFullName.trim()) {
        showWarningToast(
          'Thiếu thông tin',
          'Vui lòng nhập họ tên người báo cáo.',
        );
        return false;
      }
      if (!description.trim()) {
        showWarningToast('Thiếu thông tin', 'Vui lòng mô tả tình trạng.');
        return false;
      }
    }
    return true;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!canSubmitNewRequest) {
      showWarningToast(
        'Không thể gửi yêu cầu mới',
        existingRescueRequest
          ? 'Bạn đang có một yêu cầu cứu hộ chưa được xử lý. Chỉ có thể gửi lại khi yêu cầu đó đã bị huỷ hoặc hoàn thành.'
          : 'Đang kiểm tra trạng thái yêu cầu hiện tại. Vui lòng thử lại sau vài giây.',
      );
      return;
    }

    if (!validate()) return;
    try {
      const base = {
        disasterType,
        latitude: latitude!,
        longitude: longitude!,
        accuracy: accuracy ?? 0,
        address: address.trim(),
        reporterPhone: reporterPhone.trim(),
        reporterFullName: reporterFullName.trim(),
        attachments,
      };

      if (rescueType === 0) {
        const selectedPriorityCriteriaIds = Object.values(
          selectedCriteriaByCategory,
        ).filter((x): x is string => !!x);

        await submitRescueRequestMutation.mutateAsync({
          ...base,
          rescueType: 0,
          description: description.trim(),
          selectedPriorityCriteriaIds,
        });
      } else {
        await submitRescueRequestMutation.mutateAsync({
          ...base,
          rescueType: 1,
          description: '',
          selectedPriorityCriteriaIds: [],
        });
      }

      showSuccessToast('Gửi yêu cầu thành công', 'Yêu cầu cứu hộ đã được gửi!');
      showDialog({
        title: 'Thành công',
        message: 'Yêu cầu cứu hộ đã được gửi!',
        type: 'success',
        cancelLabel: 'Ở lại',
        confirmLabel: 'Quay lại',
        onConfirm: () => onBack?.(),
      });
    } catch {
      showErrorToast(
        'Không thể gửi yêu cầu',
        'Không thể gửi yêu cầu. Vui lòng thử lại.',
      );
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Header title="Gửi yêu cầu cứu hộ" center onBack={onBack} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Rescue Type ─────────────────────────────────────────── */}
        <Section>
          <SectionTitle
            title="Loại yêu cầu"
            subtitle="Chọn mức độ xử lý"
            colors={colors}
          />
          <View
            className="flex-row rounded-xl border-2 p-1"
            style={{ borderColor: colors.border, backgroundColor: colors.card }}
          >
            {(isAuthenticated
              ? [
                  { label: 'Thông thường', value: 0 as RescueType },
                  { label: 'Khẩn cấp', value: 1 as RescueType },
                ]
              : [{ label: 'Khẩn cấp', value: 1 as RescueType }]
            ).map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setRescueType(opt.value)}
                className="flex-1 items-center justify-center rounded-lg py-3"
                style={
                  rescueType === opt.value
                    ? {
                        backgroundColor:
                          opt.value === 1
                            ? colors.status.error
                            : colors.primary,
                      }
                    : {}
                }
              >
                {opt.value === 1 && (
                  <Ionicons
                    name="warning-outline"
                    size={14}
                    color={
                      rescueType === opt.value
                        ? colors.white
                        : colors.status.error
                    }
                  />
                )}
                <Text
                  className="font-semibold"
                  style={{
                    color:
                      rescueType === opt.value
                        ? colors.white
                        : colors.textSecondary,
                  }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Emergency notice */}
          {rescueType === 1 && (
            <View
              className="mt-3 flex-row items-start gap-2 rounded-xl border p-3"
              style={{
                backgroundColor: `${colors.status.error}12`,
                borderColor: `${colors.status.error}55`,
              }}
            >
              <Ionicons name="warning" size={16} color={colors.status.error} />
              <Text
                className="flex-1 text-xs"
                style={{ color: colors.status.error }}
              >
                Chế độ khẩn cấp: chỉ cần cung cấp số điện thoại và vị trí. Đội
                cứu hộ sẽ liên hệ ngay lập tức.
              </Text>
            </View>
          )}
        </Section>

        <Divider colors={colors} />

        {/* ── Disaster Type ────────────────────────────────────────── */}
        <Section>
          <SectionTitle
            title="Loại thiên tai"
            subtitle="Bão lũ được chọn mặc định"
            colors={colors}
          />
          <View className="flex-row gap-2">
            {DISASTER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setDisasterType(opt.value)}
                className="flex-1 items-center justify-center rounded-xl border-2 py-3"
                style={{
                  borderColor:
                    disasterType === opt.value ? colors.primary : colors.border,
                  backgroundColor:
                    disasterType === opt.value
                      ? colors.primary + '18'
                      : colors.card,
                }}
              >
                <Ionicons
                  name={opt.iconName}
                  size={20}
                  color={
                    disasterType === opt.value
                      ? colors.primary
                      : colors.textSecondary
                  }
                />
                <Text
                  className="mt-1 text-xs font-semibold"
                  style={{
                    color:
                      disasterType === opt.value
                        ? colors.primary
                        : colors.textSecondary,
                  }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        <Divider colors={colors} />

        {/* ── Reporter Info ─────────────────────────────────────────── */}
        <Section>
          <SectionTitle title="Thông tin liên hệ" colors={colors} />

          {needsProfileCompletion ? (
            <View
              className="rounded-xl border p-3"
              style={{
                backgroundColor: `${colors.status.pending}12`,
                borderColor: `${colors.status.pending}55`,
              }}
            >
              <View className="flex-row items-start gap-2">
                <Ionicons
                  name="person-circle-outline"
                  size={18}
                  color={colors.status.pending}
                />
                <View className="flex-1">
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: colors.text }}
                  >
                    Thông tin tài khoản chưa đầy đủ
                  </Text>
                  <Text
                    className="mt-1 text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    Hãy cập nhật họ tên và số điện thoại trong hồ sơ để form tự
                    đồng bộ chính xác.
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push('/profile/edit' as any)}
                    className="mt-3 self-start rounded-full px-3 py-2"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <View className="flex-row items-center gap-2">
                      <Ionicons
                        name="create-outline"
                        size={14}
                        color={colors.white}
                      />
                      <Text style={{ color: colors.white, fontWeight: '600' }}>
                        Cập nhật thông tin cá nhân
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : null}

          {/* Name — optional for emergency */}
          {rescueType === 0 ? (
            <LabeledInput
              label="Họ và tên *"
              placeholder="Nguyễn Văn A"
              value={reporterFullName}
              onChangeText={setReporterFullName}
              editable={!hasLockedFullName}
              loading={profileContactLoading}
              helperText={
                hasLockedFullName
                  ? 'Đã đồng bộ từ tài khoản của bạn'
                  : isAuthenticated
                    ? 'Chưa có trong tài khoản - bạn có thể cập nhật ở hồ sơ'
                    : undefined
              }
              helperIcon={
                hasLockedFullName
                  ? 'shield-checkmark-outline'
                  : isAuthenticated
                    ? 'alert-circle-outline'
                    : undefined
              }
              colors={colors}
            />
          ) : (
            <LabeledInput
              label="Họ và tên"
              placeholder="Nguyễn Văn A"
              value={reporterFullName}
              onChangeText={setReporterFullName}
              editable={!hasLockedFullName}
              loading={profileContactLoading}
              helperText={
                hasLockedFullName
                  ? 'Đã đồng bộ từ tài khoản của bạn'
                  : isAuthenticated
                    ? 'Chưa có trong tài khoản - bạn có thể cập nhật ở hồ sơ'
                    : undefined
              }
              helperIcon={
                hasLockedFullName
                  ? 'shield-checkmark-outline'
                  : isAuthenticated
                    ? 'alert-circle-outline'
                    : undefined
              }
              colors={colors}
            />
          )}

          <LabeledInput
            label="Số điện thoại *"
            placeholder="090xxxxxxxx"
            value={reporterPhone}
            onChangeText={setReporterPhone}
            keyboardType="phone-pad"
            editable={!hasLockedPhone}
            loading={profileContactLoading}
            helperText={
              hasLockedPhone
                ? 'Đã đồng bộ từ tài khoản của bạn'
                : isAuthenticated
                  ? 'Chưa có trong tài khoản - bạn có thể cập nhật ở hồ sơ'
                  : undefined
            }
            helperIcon={
              hasLockedPhone
                ? 'shield-checkmark-outline'
                : isAuthenticated
                  ? 'alert-circle-outline'
                  : undefined
            }
            colors={colors}
          />
        </Section>

        <Divider colors={colors} />

        {/* ── Location ────────────────────────────────────────────── */}
        <Section>
          <View className="flex-row items-center justify-between">
            <SectionTitle title="Vị trí hiện tại" colors={colors} noMargin />
            <View
              className="flex-row items-center gap-1 rounded-full px-2 py-1"
              style={{
                backgroundColor: `${colors.status.completed}18`,
                minWidth: Math.max(74, scaleSize(82, screenScale)),
              }}
            >
              <Ionicons
                name="location"
                size={12}
                color={colors.status.completed}
              />
              <Text
                className="text-xs font-medium"
                style={{ color: colors.status.completed, textAlign: 'center' }}
              >
                Tự động
              </Text>
            </View>
          </View>

          <View
            className="flex-row items-start gap-2 rounded-xl border p-3"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            {locating ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="navigate" size={18} color={colors.primary} />
            )}
            <Text className="flex-1 text-sm" style={{ color: colors.text }}>
              {locationLabel}
            </Text>
          </View>

          <View
            className="mt-3 h-44 overflow-hidden rounded-xl border"
            style={{ borderColor: colors.border, backgroundColor: colors.card }}
          >
            {latitude != null && longitude != null ? (
              <RequestRescueMiniMap coordinate={[longitude, latitude]} />
            ) : (
              <View
                className="flex-1 items-center justify-center"
                style={{ backgroundColor: colors.surface }}
              >
                <Ionicons
                  name="map-outline"
                  size={32}
                  color={colors.textSecondary}
                />
                <Text
                  className="mt-2 text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Bản đồ vị trí hiện tại sẽ hiển thị tại đây
                </Text>
              </View>
            )}
          </View>

          <LabeledInput
            label="Địa chỉ chi tiết"
            placeholder="Thôn, xã, huyện…"
            value={address}
            onChangeText={setAddress}
            colors={colors}
          />
        </Section>

        <Divider colors={colors} />

        {/* ── Description — only for Normal rescue ───────────── */}
        {rescueType === 0 && (
          <>
            <Section>
              <SectionTitle title="Mô tả tình trạng" colors={colors} />

              <View>
                <Text
                  className="mb-1 text-sm font-medium"
                  style={{ color: colors.textSecondary }}
                >
                  Mô tả *
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Nhà bị ngập sâu, có người già cần hỗ trợ sơ tán…"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  style={{
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.text,
                    borderWidth: 1,
                    borderRadius: 12,
                    padding: 12,
                    minHeight: 96,
                    fontSize: 14,
                  }}
                />
              </View>
            </Section>

            <Divider colors={colors} />

            {/* ── Priority Criteria ──────────────────────────────── */}
            <Section>
              {/* <SectionTitle
                title="Tiêu chí ưu tiên"
                subtitle="Mỗi nhóm HUMAN / ENV / SCALE chỉ chọn 1 tiêu chí"
                colors={colors}
              /> */}

              {loadingCriteria ? (
                <View className="items-center py-6">
                  <ActivityIndicator color={colors.primary} />
                  <Text
                    className="mt-2 text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    Đang tải tiêu chí…
                  </Text>
                </View>
              ) : criteria.length === 0 ? (
                <Text
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Không có tiêu chí nào.
                </Text>
              ) : (
                <View className="flex-col gap-4">
                  {CRITERIA_CATEGORIES.map((group) => {
                    const groupItems = criteria.filter(
                      (c) => getCriteriaCategory(c.code) === group.key,
                    );

                    return (
                      <View
                        key={group.key}
                        className="rounded-xl border p-3"
                        style={{
                          borderColor: colors.border,
                          backgroundColor: colors.card,
                        }}
                      >
                        <View className="mb-2">
                          <Text
                            className="text-sm font-bold"
                            style={{ color: colors.text }}
                          >
                            {group.label}
                          </Text>
                          <Text
                            className="text-xs"
                            style={{ color: colors.textSecondary }}
                          >
                            {group.subtitle}
                          </Text>
                        </View>

                        {groupItems.length === 0 ? (
                          <Text
                            className="text-xs"
                            style={{ color: colors.textSecondary }}
                          >
                            Không có tiêu chí trong nhóm này.
                          </Text>
                        ) : (
                          <View className="flex-col gap-2">
                            {groupItems.map((c) => {
                              const selected =
                                selectedCriteriaByCategory[group.key] ===
                                c.priorityCriteriaId;

                              return (
                                <TouchableOpacity
                                  key={c.priorityCriteriaId}
                                  onPress={() =>
                                    toggleCriteria(
                                      group.key,
                                      c.priorityCriteriaId,
                                    )
                                  }
                                  className="flex-row items-center gap-3 rounded-xl border-2 p-3"
                                  style={{
                                    backgroundColor: selected
                                      ? colors.card
                                      : 'transparent',
                                    borderColor: selected
                                      ? colors.primary
                                      : colors.border,
                                  }}
                                >
                                  <View
                                    className="h-6 w-6 items-center justify-center rounded-full border-2"
                                    style={{
                                      borderColor: selected
                                        ? colors.primary
                                        : colors.border,
                                      backgroundColor: selected
                                        ? colors.primary
                                        : 'transparent',
                                    }}
                                  >
                                    {selected && (
                                      <Ionicons
                                        name="checkmark"
                                        size={14}
                                        color={colors.white}
                                      />
                                    )}
                                  </View>
                                  <View className="flex-1">
                                    <Text
                                      className="text-sm font-semibold"
                                      style={{ color: colors.text }}
                                    >
                                      {c.name}
                                    </Text>
                                    <Text
                                      className="mt-0.5 text-xs"
                                      style={{ color: colors.textSecondary }}
                                    >
                                      {c.description}
                                    </Text>
                                  </View>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </Section>

            <Divider colors={colors} />
          </>
        )}

        {/* ── Attachments (both modes) ──────────────────────────────── */}
        <Section>
          <SectionTitle
            title="Hình ảnh đính kèm"
            subtitle="Tuỳ chọn — tối đa 5 ảnh"
            colors={colors}
          />

          <View className="flex-row flex-wrap gap-2">
            {attachments.map((att, idx) => (
              <View key={idx} className="relative">
                <Image
                  source={{ uri: att.fileUrl }}
                  className="h-20 w-20 rounded-xl"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => removeAttachment(idx)}
                  className="absolute right-1 top-1 h-5 w-5 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.status.error }}
                >
                  <Ionicons name="close" size={12} color={colors.white} />
                </TouchableOpacity>
              </View>
            ))}

            {attachments.length < 5 && (
              <TouchableOpacity
                onPress={pickImage}
                disabled={uploadingImages}
                className="items-center justify-center rounded-xl border-2 border-dashed"
                style={{
                  width: addPhotoSize,
                  height: addPhotoSize,
                  borderColor: colors.border,
                }}
              >
                {uploadingImages ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <>
                    <Ionicons
                      name="camera"
                      size={24}
                      color={colors.textSecondary}
                    />
                    <Text
                      className="mt-1 text-xs"
                      style={{
                        color: colors.textSecondary,
                        textAlign: 'center',
                      }}
                    >
                      Thêm ảnh
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </Section>
      </ScrollView>

      {/* ── Sticky Footer ───────────────────────────────────────────────── */}
      <View
        style={{
          paddingBottom: bottom - 12,
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        }}
        className="absolute bottom-0 left-0 right-0 border-t p-4 shadow-lg"
      >
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting || !canSubmitNewRequest}
          className="h-12 w-full flex-row items-center justify-center gap-2 rounded-xl shadow-lg"
          style={[
            {
              backgroundColor:
                rescueType === 1 ? colors.status.error : colors.primary,
              opacity: submitting || !canSubmitNewRequest ? 0.7 : 1,
            },
          ]}
        >
          {submitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Text
                className="text-base font-bold leading-normal"
                style={{ color: colors.white }}
              >
                {rescueType === 1
                  ? 'GỬI NGAY — KHẨN CẤP'
                  : 'GỬI YÊU CẦU CỨU HỘ'}
              </Text>
              <Ionicons
                name={rescueType === 1 ? 'warning' : 'send'}
                size={18}
                color={colors.white}
              />
            </>
          )}
        </TouchableOpacity>

        {rescueType === 0 && (
          <View className="mt-1 flex-row items-center justify-center gap-1">
            <Ionicons name="sparkles" size={13} color={colors.textSecondary} />
            <Text
              className="text-center text-xs"
              style={{ color: colors.textSecondary }}
            >
              Hệ thống sẽ ghi nhận yêu cầu của bạn
            </Text>
          </View>
        )}
        {rescueType === 1 && (
          <View className="mt-1 flex-row items-center justify-center gap-1">
            <Ionicons name="sparkles" size={13} color={colors.textSecondary} />
            <Text
              className="text-center text-xs"
              style={{ color: colors.textSecondary }}
            >
              Điều phối viên sẽ ghi nhận yêu cầu khẩn cấp của bạn
            </Text>
          </View>
        )}
        {existingRescueRequest ? (
          <View className="mt-2 flex-row items-center justify-center gap-1">
            <Ionicons
              name="alert-circle-outline"
              size={13}
              color={colors.status.pending}
            />
            <Text
              className="text-center text-xs font-medium"
              style={{ color: colors.status.pending }}
            >
              Bạn đang có yêu cầu đang xử lý. Chỉ gửi mới sau khi yêu cầu đó đã
              bị huỷ hoặc hoàn thành.
            </Text>
          </View>
        ) : null}
      </View>
      <AppDialog {...dialogProps} />
    </View>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Section({ children }: { children: React.ReactNode }) {
  return <View className="flex-col gap-4 px-4 py-4">{children}</View>;
}

function Divider({ colors }: { colors: any }) {
  return (
    <View
      className="my-2 h-2"
      style={{
        backgroundColor: colors.card,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.border,
      }}
    />
  );
}

function SectionTitle({
  title,
  subtitle,
  colors,
  noMargin,
}: {
  title: string;
  subtitle?: string;
  colors: any;
  noMargin?: boolean;
}) {
  return (
    <View className={noMargin ? '' : ''}>
      <Text className="text-lg font-bold" style={{ color: colors.text }}>
        {title}
      </Text>
      {subtitle && (
        <Text
          className="mt-0.5 text-sm"
          style={{ color: colors.textSecondary }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}

function LabeledInput({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  editable = true,
  loading = false,
  helperText,
  helperIcon,
  colors,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: any;
  editable?: boolean;
  loading?: boolean;
  helperText?: string;
  helperIcon?: keyof typeof Ionicons.glyphMap;
  colors: any;
}) {
  return (
    <View>
      <Text
        className="mb-1 text-sm font-medium"
        style={{ color: colors.textSecondary }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        editable={editable && !loading}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        keyboardType={keyboardType}
        style={{
          backgroundColor: loading ? colors.surface : colors.card,
          borderColor: colors.border,
          color: colors.text,
          borderWidth: 1,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 10,
          fontSize: 14,
          opacity: editable && !loading ? 1 : 0.7,
        }}
      />
      {loading ? (
        <View
          pointerEvents="none"
          className="absolute bottom-0 left-0 right-0 top-0 justify-center rounded-xl px-4"
          style={{ backgroundColor: `${colors.surface}CC` }}
        >
          <View
            className="h-4 rounded-full"
            style={{ backgroundColor: colors.border, width: '58%' }}
          />
        </View>
      ) : null}
      {helperText ? (
        <View className="mt-2 flex-row items-center gap-1.5">
          {helperIcon ? (
            <Ionicons name={helperIcon} size={14} color={colors.primary} />
          ) : null}
          <Text className="text-xs" style={{ color: colors.textSecondary }}>
            {helperText}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
