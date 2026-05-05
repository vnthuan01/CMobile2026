import '@/global.css';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import StickyFooterButton from '@/src/components/common/StickyFooterButton';
import { useTheme } from '@/src/context/ThemeContext';
import {
  useAllSkills,
  useMyVolunteerProfile,
  volunteerProfileKeys,
} from '@/src/hooks/useMyVolunteerProfile';
import { useUploadImage } from '@/src/hooks/useUploadImage';
import { useUpdateVolunteerProfile } from '@/src/hooks/useVolunteerActions';
import {
    useUpdateUserProfile,
    useUserProfile,
} from '@/src/hooks/useUserProfile';
import type {
    CreateVolunteerCertificateRequest,
    SkillResponse,
    VolunteerProfileResponse,
} from '@/src/types/volunteer';
import {
    showErrorToast,
    showSuccessToast,
    showWarningToast,
} from '@/src/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface UpdateProfileVolunteerScreenProps {
  onBack?: () => void;
}

const EMPTY_CERTIFICATE: CreateVolunteerCertificateRequest = {
  name: '',
  issuedBy: '',
  issuedDate: '',
  expiryDate: '',
  fileUrl: '',
};

type PickingField = 'issuedDate' | 'expiryDate';

export default function UpdateProfileVolunteerScreen({
  onBack,
}: UpdateProfileVolunteerScreenProps) {
  const { bottom } = useSafeAreaInsets();
  const { colors } = useTheme();
  const queryClient = useQueryClient();

  const volunteerProfileQuery = useMyVolunteerProfile();
  const allSkillsQuery = useAllSkills();
  const userProfileQuery = useUserProfile();
  const updateProfileMutation = useUpdateUserProfile();
  const updateVolunteerProfileMutation = useUpdateVolunteerProfile();
  const uploadImageMutation = useUploadImage();

  const volunteerProfile = volunteerProfileQuery.data?.profile ?? null;
  const userProfile = userProfileQuery.data?.profile ?? null;
  const allSkills = useMemo(
    () => (allSkillsQuery.data ?? []) as SkillResponse[],
    [allSkillsQuery.data],
  );

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [hasNoCertificates, setHasNoCertificates] = useState(false);
  const [certificates, setCertificates] = useState<
    CreateVolunteerCertificateRequest[]
  >([{ ...EMPTY_CERTIFICATE }]);
  const [uploadingCertificateIndex, setUploadingCertificateIndex] = useState<
    number | null
  >(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());
  const [pickingTarget, setPickingTarget] = useState<{
    index: number;
    field: PickingField;
  } | null>(null);

  useEffect(() => {
    const resolvedName =
      userProfile?.displayName || volunteerProfile?.fullName || '';
    const resolvedPhone =
      userProfile?.phoneNumber || volunteerProfile?.phoneNumber || '';
    const resolvedAvatar = userProfile?.pictureUrl || null;

    setFullName(resolvedName);
    setPhone(resolvedPhone);
    setAvatarUrl(resolvedAvatar);
    setSelectedSkillIds(
      (volunteerProfile?.skills || [])
        .map((skillEntry: VolunteerProfileResponse['skills'][number]) =>
          getProfileSkillId(skillEntry),
        )
        .filter(Boolean),
    );
    setCertificates(
      volunteerProfile?.certificates?.length
        ? volunteerProfile.certificates.map(
            (certificate: CreateVolunteerCertificateRequest) => ({
              name: certificate.name || '',
              issuedBy: certificate.issuedBy || '',
              issuedDate: certificate.issuedDate || '',
              expiryDate: certificate.expiryDate || '',
              fileUrl: certificate.fileUrl || '',
            }),
          )
        : [{ ...EMPTY_CERTIFICATE }],
    );
    setHasNoCertificates(!volunteerProfile?.certificates?.length);
  }, [
    userProfile?.displayName,
    userProfile?.phoneNumber,
    userProfile?.pictureUrl,
    volunteerProfile?.certificates,
    volunteerProfile?.fullName,
    volunteerProfile?.phoneNumber,
    volunteerProfile?.skills,
  ]);

  const loading =
    volunteerProfileQuery.isLoading ||
    allSkillsQuery.isLoading ||
    userProfileQuery.isLoading;

  const resolvedCertificates = useMemo(() => {
    if (hasNoCertificates) return [] as CreateVolunteerCertificateRequest[];
    return certificates;
  }, [certificates, hasNoCertificates]);

  const loadingAnyMutation =
    updateProfileMutation.isPending ||
    updateVolunteerProfileMutation.isPending ||
    uploadImageMutation.isPending;

  const toggleSkill = (skillId: string) => {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId)
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId],
    );
  };

  const updateCertificate = (
    index: number,
    key: keyof CreateVolunteerCertificateRequest,
    value: string,
  ) => {
    setCertificates((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const addCertificate = () => {
    setCertificates((prev) => [...prev, { ...EMPTY_CERTIFICATE }]);
  };

  const removeCertificate = (index: number) => {
    setCertificates((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, currentIndex) => currentIndex !== index);
    });
  };

  const toDateOnly = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const toDateOnlyString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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
        onChange: (event, selectedDate) => {
          if (event.type === 'dismissed' || !selectedDate) return;
          updateCertificate(index, field, toDateOnlyString(selectedDate));
        },
      });
      return;
    }

    setPickerDate(initialDate);
    setPickingTarget({ index, field });
    setPickerVisible(true);
  };

  const onDateTimeChange = (
    event: DateTimePickerEvent,
    selected?: Date,
  ) => {
    if (event.type === 'dismissed') {
      setPickerVisible(false);
      setPickingTarget(null);
      return;
    }

    if (!selected || !pickingTarget) return;

    updateCertificate(
      pickingTarget.index,
      pickingTarget.field,
      toDateOnlyString(selected),
    );
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

  const validateVolunteerSection = () => {
    const isValidDateOnly = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

    if (selectedSkillIds.length === 0) {
      showWarningToast('Thiếu thông tin', 'Vui lòng chọn ít nhất 1 kỹ năng.');
      return false;
    }

    if (!hasNoCertificates) {
      for (const certificate of certificates) {
        if (
          !certificate.name.trim() ||
          !certificate.issuedBy.trim() ||
          !certificate.issuedDate.trim() ||
          !certificate.fileUrl.trim()
        ) {
          showWarningToast(
            'Thiếu thông tin',
            'Vui lòng điền đủ thông tin chứng chỉ bắt buộc hoặc chọn không có chứng chỉ.',
          );
          return false;
        }

        if (!/^https?:\/\//i.test(certificate.fileUrl.trim())) {
          showWarningToast(
            'Dữ liệu chưa hợp lệ',
            'File URL của chứng chỉ phải là link hợp lệ (http/https).',
          );
          return false;
        }

        if (!isValidDateOnly(certificate.issuedDate.trim())) {
          showWarningToast(
            'Dữ liệu chưa hợp lệ',
            'Ngày cấp chứng chỉ phải đúng định dạng YYYY-MM-DD.',
          );
          return false;
        }

        if (
          certificate.expiryDate?.trim() &&
          !isValidDateOnly(certificate.expiryDate.trim())
        ) {
          showWarningToast(
            'Dữ liệu chưa hợp lệ',
            'Ngày hết hạn chứng chỉ phải đúng định dạng YYYY-MM-DD.',
          );
          return false;
        }
      }
    }

    return true;
  };

  const handlePickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showWarningToast(
        'Cần quyền truy cập',
        'Bạn cần cấp quyền thư viện ảnh để cập nhật avatar.',
      );
      return;
    }

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (picked.canceled || !picked.assets?.[0]) return;

    const asset = picked.assets[0];
    const uploadResult = await uploadImageMutation.mutateAsync({
      localUri: asset.uri,
      fileName: asset.fileName || `avatar_${Date.now()}.jpg`,
      mimeType: asset.mimeType || 'image/jpeg',
    });

    if (!uploadResult.success || !uploadResult.url) {
      showErrorToast(
        'Cập nhật avatar thất bại',
        uploadResult.message || 'Không thể upload avatar.',
      );
      return;
    }

    setAvatarUrl(uploadResult.url);
    showSuccessToast('Đã chọn ảnh', 'Ảnh đã được upload thành công.');
  };

  const handleSave = async () => {
    if (!validateVolunteerSection()) return;

    const picturePublicId = extractCloudinaryPublicId(avatarUrl);
    const volunteerPayload = {
      descriptions: volunteerProfile?.descriptions?.trim() || '',
      yearsOfExperience: volunteerProfile?.yearsOfExperience ?? null,
      preferredTeamRole:
        Number(volunteerProfile?.preferredTeamRole) || 1,
      skillIds: selectedSkillIds,
      certificates: hasNoCertificates
        ? []
        : certificates.map((certificate) => ({
            name: certificate.name.trim(),
            issuedBy: certificate.issuedBy.trim(),
            issuedDate: certificate.issuedDate.trim(),
            expiryDate: certificate.expiryDate?.trim() || null,
            fileUrl: certificate.fileUrl.trim(),
          })),
    };

    const [userResult, volunteerResult] = await Promise.all([
      updateProfileMutation.mutateAsync({
        displayName: fullName.trim() || undefined,
        phoneNumber: phone.trim() || undefined,
        pictureUrl: avatarUrl || undefined,
        picturePublicId: picturePublicId || undefined,
      }),
      updateVolunteerProfileMutation.mutateAsync(volunteerPayload),
    ]);

    console.log(
      `[UpdateProfileVolunteer] update profile status: ${userResult?.status ?? 'unknown'}`,
    );

    const statusCode = Number(userResult?.status ?? 0);
    const isSuccessStatus =
      statusCode >= 200 && statusCode < 300 && Boolean(userResult?.success);

    if (!isSuccessStatus) {
      showErrorToast(
        'Không thể cập nhật hồ sơ',
        `API cập nhật trả status ${statusCode || 'không xác định'}.`,
      );
      return;
    }

    if (!volunteerResult?.success) {
      showErrorToast(
        'Không thể cập nhật kỹ năng',
        volunteerResult?.message || 'Không thể cập nhật kỹ năng và chứng chỉ.',
      );
      return;
    }

    await queryClient.invalidateQueries({ queryKey: volunteerProfileKeys.all });
    await queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    await queryClient.invalidateQueries({ queryKey: ['citizenProfile'] });
    showSuccessToast(
      'Thành công',
      'Đã lưu cập nhật hồ sơ, kỹ năng, chứng chỉ và avatar mới.',
    );
    onBack?.();
  };

  if (loading) {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <ScreenHeader title="Cập nhật hồ sơ" onBack={onBack} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="mt-3" style={{ color: colors.textSecondary }}>
            Đang tải hồ sơ tình nguyện viên...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenHeader title="Cập nhật hồ sơ" onBack={onBack} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottom + 100 }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center p-6">
          <View className="relative">
            <View
              className="h-28 w-28 items-center justify-center rounded-full border-4 shadow-md"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.card,
              }}
            >
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  className="h-full w-full rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <Ionicons
                  name="person"
                  size={48}
                  color={colors.textSecondary}
                />
              )}
            </View>
            <TouchableOpacity
              onPress={handlePickAvatar}
              disabled={uploadImageMutation.isPending}
              className="absolute bottom-0 right-0 rounded-full border-2 p-2 shadow-lg"
              style={{
                backgroundColor: colors.primary,
                borderColor: colors.card,
              }}
            >
              {uploadImageMutation.isPending ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Ionicons name="camera" size={14} color={colors.white} />
              )}
            </TouchableOpacity>
          </View>
          <View className="mt-3 items-center">
            <Text
              className="text-xl font-bold tracking-tight"
              style={{ color: colors.text }}
            >
              {fullName || 'Tình nguyện viên'}
            </Text>
            <Text
              className="text-sm font-medium"
              style={{ color: colors.textSecondary }}
            >
              Cập nhật ảnh đại diện và thông tin liên hệ
            </Text>
          </View>
        </View>

        <View className="gap-6 px-4 pb-6">
          <View>
            <View className="mb-4 flex-row items-center gap-2">
              <Ionicons name="person" size={20} color={colors.primary} />
              <Text
                className="text-base font-bold"
                style={{ color: colors.text }}
              >
                Thông tin cơ bản
              </Text>
            </View>
            <View className="gap-4">
              <View>
                <Text
                  className="mb-1.5 text-sm font-medium"
                  style={{ color: colors.textSecondary }}
                >
                  Họ và tên
                </Text>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Nhập họ và tên"
                  placeholderTextColor={colors.textSecondary}
                  className="h-12 w-full rounded-lg border px-4 text-base"
                  style={{
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.text,
                  }}
                />
              </View>
              <View>
                <Text
                  className="mb-1.5 text-sm font-medium"
                  style={{ color: colors.textSecondary }}
                >
                  Số điện thoại
                </Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="phone-pad"
                  className="h-12 w-full rounded-lg border px-4 text-base"
                  style={{
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.text,
                  }}
                />
              </View>
              <View>
                <Text
                  className="mb-1.5 text-sm font-medium"
                  style={{ color: colors.textSecondary }}
                >
                  Email
                </Text>
                <View
                  className="h-12 w-full justify-center rounded-lg border px-4"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ color: colors.text }}>
                    {userProfile?.email || volunteerProfile?.email || '--'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View>
            <View className="mb-4 flex-row items-center gap-2">
              <Ionicons name="star" size={20} color={colors.primary} />
              <Text
                className="text-base font-bold"
                style={{ color: colors.text }}
              >
                Kỹ năng chuyên môn
              </Text>
            </View>
            {allSkills.length > 0 ? (
              <View className="flex-row flex-wrap gap-2">
                {allSkills.map((skill: SkillResponse) => {
                  const active = selectedSkillIds.includes(skill.skillId);
                  return (
                    <TouchableOpacity
                      key={skill.skillId}
                      onPress={() => toggleSkill(skill.skillId)}
                      className="rounded-full border px-4 py-2"
                      style={{
                        backgroundColor: active ? colors.primary : colors.surface,
                        borderColor: active ? colors.primary : colors.border,
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
            ) : (
              <Text style={{ color: colors.textSecondary }}>
                Chưa có kỹ năng chuyên môn.
              </Text>
            )}
          </View>

          <View>
            <View className="mb-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name="shield-checkmark"
                  size={20}
                  color={colors.primary}
                />
                <Text
                  className="text-base font-bold"
                  style={{ color: colors.text }}
                >
                  Chứng chỉ chuyên môn
                </Text>
              </View>
            </View>
            <View className="gap-3">
              <TouchableOpacity
                onPress={() => {
                  setHasNoCertificates((prev) => {
                    const next = !prev;
                    if (!next && certificates.length === 0) {
                      setCertificates([{ ...EMPTY_CERTIFICATE }]);
                    }
                    return next;
                  });
                }}
                className="flex-row items-center gap-3 rounded-xl border px-4 py-3"
                style={{
                  borderColor: hasNoCertificates ? colors.primary : colors.border,
                  backgroundColor: colors.card,
                }}
              >
                <View
                  className="h-5 w-5 items-center justify-center rounded border"
                  style={{
                    borderColor: hasNoCertificates ? colors.primary : colors.border,
                    backgroundColor: hasNoCertificates ? colors.primary : 'transparent',
                  }}
                >
                  {hasNoCertificates ? (
                    <Ionicons name="checkmark" size={14} color={colors.white} />
                  ) : null}
                </View>
                <Text
                  className="flex-1 text-sm font-medium"
                  style={{ color: colors.text }}
                >
                  Tôi không có chứng chỉ
                </Text>
              </TouchableOpacity>

              {!hasNoCertificates ? (
                <TouchableOpacity onPress={addCertificate}>
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: colors.primary }}
                  >
                    + Thêm chứng chỉ
                  </Text>
                </TouchableOpacity>
              ) : null}

              {resolvedCertificates.length ? (
                resolvedCertificates.map(
                  (
                    certificate: CreateVolunteerCertificateRequest,
                    index: number,
                  ) => (
                    <View
                      key={`certificate-${index}`}
                      className="rounded-xl border p-3"
                      style={{
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      }}
                    >
                      <View className="flex-row items-center justify-between">
                        <Text
                          className="text-sm font-bold"
                          style={{ color: colors.text }}
                        >
                          Chứng chỉ #{index + 1}
                        </Text>
                        {resolvedCertificates.length > 1 ? (
                          <TouchableOpacity onPress={() => removeCertificate(index)}>
                            <Ionicons
                              name="trash-outline"
                              size={18}
                              color={colors.status?.error || colors.primary}
                            />
                          </TouchableOpacity>
                        ) : null}
                      </View>

                      <TextInput
                        value={certificate.name}
                        onChangeText={(value) => updateCertificate(index, 'name', value)}
                        placeholder="Tên chứng chỉ"
                        placeholderTextColor={colors.textSecondary}
                        className="mt-3 h-12 rounded-lg border px-3"
                        style={{
                          borderColor: colors.border,
                          backgroundColor: colors.card,
                          color: colors.text,
                        }}
                      />
                      <TextInput
                        value={certificate.issuedBy}
                        onChangeText={(value) =>
                          updateCertificate(index, 'issuedBy', value)
                        }
                        placeholder="Đơn vị cấp"
                        placeholderTextColor={colors.textSecondary}
                        className="mt-2 h-12 rounded-lg border px-3"
                        style={{
                          borderColor: colors.border,
                          backgroundColor: colors.card,
                          color: colors.text,
                        }}
                      />
                      <TouchableOpacity
                        onPress={() => openDateTimePicker(index, 'issuedDate')}
                        className="mt-2 h-12 flex-row items-center justify-center gap-2 rounded-lg border"
                        style={{
                          borderColor: colors.border,
                          backgroundColor: colors.card,
                        }}
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={16}
                          color={colors.textSecondary}
                        />
                        <Text style={{ color: colors.text }}>
                          {formatDate(certificate.issuedDate, 'Chọn ngày cấp')}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => openDateTimePicker(index, 'expiryDate')}
                        className="mt-2 h-12 flex-row items-center justify-center gap-2 rounded-lg border"
                        style={{
                          borderColor: colors.border,
                          backgroundColor: colors.card,
                        }}
                      >
                        <Ionicons
                          name="time-outline"
                          size={16}
                          color={colors.textSecondary}
                        />
                        <Text style={{ color: colors.text }}>
                          {formatDate(certificate.expiryDate, 'Chọn ngày hết hạn')}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => pickAndUploadCertificateImage(index)}
                        disabled={uploadingCertificateIndex === index}
                        className="mt-2 h-12 flex-row items-center justify-center gap-2 rounded-lg"
                        style={{ backgroundColor: colors.primary }}
                      >
                        {uploadingCertificateIndex === index ? (
                          <ActivityIndicator size="small" color={colors.white} />
                        ) : (
                          <>
                            <Ionicons
                              name="images-outline"
                              size={18}
                              color={colors.white}
                            />
                            <Text style={{ color: colors.white, fontWeight: '600' }}>
                              Chọn ảnh từ thư viện
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                      {!!certificate.fileUrl?.trim() &&
                      /^https?:\/\//i.test(certificate.fileUrl.trim()) ? (
                        <View
                          className="mt-2 overflow-hidden rounded-lg border"
                          style={{ borderColor: colors.border }}
                        >
                          <Image
                            source={{ uri: certificate.fileUrl.trim() }}
                            className="h-40 w-full"
                            resizeMode="cover"
                          />
                        </View>
                      ) : null}
                    </View>
                  ),
                )
              ) : (
                <Text style={{ color: colors.textSecondary }}>
                  Chưa có chứng chỉ chuyên môn.
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <StickyFooterButton
        title={loadingAnyMutation ? 'Đang lưu...' : 'Lưu cập nhật'}
        icon="save"
        onPress={loadingAnyMutation ? undefined : handleSave}
        backgroundColor={colors.primary}
      />

      {pickerVisible && pickingTarget ? (
        <DateTimePicker
          value={pickerDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateTimeChange}
          maximumDate={getDatePickerBounds(pickingTarget.field).maximumDate}
          minimumDate={getDatePickerBounds(pickingTarget.field).minimumDate}
        />
      ) : null}
    </View>
  );
}

function formatDate(value?: string | null, fallback = '--') {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN');
}

function getLocalizedSkillName(name?: string | null, code?: string | null) {
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
}

function getProfileSkillId(
  skillEntry: VolunteerProfileResponse['skills'][number],
) {
  if (typeof skillEntry === 'string') return skillEntry;
  return skillEntry?.skillId || skillEntry?.code || skillEntry?.name || '';
}

function extractCloudinaryPublicId(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(
    /\/upload\/(?:v\d+\/)?(.+)\.(jpg|jpeg|png|webp|gif)$/i,
  );
  return match?.[1] ?? null;
}
