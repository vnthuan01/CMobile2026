import '@/global.css';
import AppDialog, { useDialog } from '@/src/components/common/AppDialog';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import {
  CreateVolunteerCertificateRequest,
  CreateVolunteerRequest,
  ResubmitVolunteerProfileRequest,
  SkillResponse,
  TeamRolePreference,
  VolunteerProfileResponse,
  volunteerService,
} from '@/src/services/volunteerService';
import { showErrorToast, showSuccessToast, showWarningToast } from '@/src/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
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
import { useTheme } from '@/src/context/ThemeContext';

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

const TEAM_ROLE_OPTIONS: Array<{ label: string; value: TeamRolePreference }> = [
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

export default function RegisterVolunteerScreen({
  onBack,
  onSuccess,
  mode = 'create',
  initialProfile,
}: RegisterVolunteerScreenProps) {
  const { bottom } = useSafeAreaInsets();
  const { colors } = useTheme();
  const { dialogProps, showDialog } = useDialog();
  const [descriptions, setDescriptions] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [teamRolePreference, setTeamRolePreference] =
    useState<TeamRolePreference | null>(null);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [skills, setSkills] = useState<SkillResponse[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [certificates, setCertificates] = useState<
    CreateVolunteerCertificateRequest[]
  >([{ ...EMPTY_CERT }]);
  const [loading, setLoading] = useState(false);
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

  const toDateOnlyString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (iso?: string | null) => {
    if (!iso) return 'Chọn ngày';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('vi-VN');
  };

  useEffect(() => {
    const loadSkills = async () => {
      const result = await volunteerService.getAllSkills();
      if (result.success) {
        setSkills(Array.isArray(result.data) ? result.data : []);
      }
      setSkillsLoading(false);
    };

    loadSkills();
  }, []);

  useEffect(() => {
    if (!initialProfile) return;

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

  const openDateTimePicker = (index: number, field: PickingField) => {
    const current = certificates[index]?.[field];
    const parsed = current ? new Date(current) : new Date();
    const initialDate = Number.isNaN(parsed.getTime()) ? new Date() : parsed;

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: initialDate,
        mode: 'date',
        is24Hour: true,
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
      showWarningToast('Cần quyền truy cập', 'Bạn cần cấp quyền thư viện ảnh để chọn chứng chỉ.');
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
      const uploadResult = await volunteerService.uploadImageToCloudinary(
        asset.uri,
        asset.fileName || `certificate_${Date.now()}.jpg`,
        asset.mimeType || 'image/jpeg',
      );

      if (!uploadResult.success || !uploadResult.url) {
        showErrorToast('Upload ảnh thất bại', uploadResult.message || 'Upload ảnh thất bại.');
        return;
      }

      updateCertificate(index, 'fileUrl', uploadResult.url);
      showSuccessToast('Upload thành công', 'Đã upload ảnh chứng chỉ lên Cloudinary.');
    } finally {
      setUploadingCertificateIndex(null);
    }
  };

  const validate = () => {
    const isValidDateOnly = (value: string) =>
      /^\d{4}-\d{2}-\d{2}$/.test(value);

    if (!descriptions.trim()) {
      showWarningToast('Thiếu thông tin', 'Vui lòng nhập mô tả hồ sơ tình nguyện viên.');
      return false;
    }

    if (
      yearsOfExperience.trim() &&
      (Number.isNaN(Number(yearsOfExperience)) || Number(yearsOfExperience) < 0)
    ) {
      showWarningToast('Dữ liệu chưa hợp lệ', 'Số năm kinh nghiệm phải là số >= 0.');
      return false;
    }

    if (!teamRolePreference) {
      showWarningToast('Thiếu thông tin', 'Vui lòng chọn vai trò mong muốn trong đội.');
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
        showWarningToast('Thiếu thông tin', 'Vui lòng điền đủ thông tin chứng chỉ bắt buộc.');
        return false;
      }

      if (!/^https?:\/\//i.test(cert.fileUrl.trim())) {
        showWarningToast('Dữ liệu chưa hợp lệ', 'File URL của chứng chỉ phải là link hợp lệ (http/https).');
        return false;
      }

      if (!isValidDateOnly(cert.issuedDate.trim())) {
        showWarningToast('Dữ liệu chưa hợp lệ', 'Ngày cấp chứng chỉ phải đúng định dạng YYYY-MM-DD.');
        return false;
      }

      if (cert.expiryDate?.trim() && !isValidDateOnly(cert.expiryDate.trim())) {
        showWarningToast('Dữ liệu chưa hợp lệ', 'Ngày hết hạn chứng chỉ phải đúng định dạng YYYY-MM-DD.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!teamRolePreference) return;

    const createPayload: CreateVolunteerRequest = {
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

    setLoading(true);
    try {
      const result =
        mode === 'resubmit'
          ? await volunteerService.resubmitVolunteerProfile({
              descriptions: createPayload.descriptions,
              skillIds: createPayload.skillIds,
              preferredTeamRole: teamRolePreference,
              yearsOfExperience: createPayload.yearsOfExperience,
              certificates: createPayload.certificates,
            } as ResubmitVolunteerProfileRequest)
          : await volunteerService.createVolunteerProfile(createPayload);

      if (!result.success) {
        showErrorToast('Không thể gửi hồ sơ', result.message || 'Không thể gửi hồ sơ.');
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
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    setDraftSaved(true);
    showSuccessToast('Đã lưu nháp', 'Thông tin chỉnh sửa đã được giữ lại trên màn hình hiện tại.');
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
        contentContainerStyle={{ paddingBottom: bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {mode === 'resubmit' && initialProfile?.reason ? (
          <View className="mx-4 mt-4 rounded-2xl border p-4" style={{ borderColor: `${colors.status.error}33`, backgroundColor: `${colors.status.error}12` }}>
            <View className="flex-row items-start gap-3">
              <Ionicons name="alert-circle" size={22} color={colors.status.error} />
              <View className="flex-1">
                <Text className="text-base font-bold" style={{ color: colors.status.error }}>
                  Hồ sơ đã bị từ chối
                </Text>
                <Text className="mt-2 text-sm leading-6" style={{ color: colors.status.error }}>
                  {initialProfile.reason}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {mode === 'resubmit' && draftSaved ? (
          <View className="mx-4 mt-4 rounded-2xl border p-4" style={{ borderColor: `${colors.status.completed}33`, backgroundColor: `${colors.status.completed}12` }}>
            <Text className="text-sm font-medium" style={{ color: colors.status.completed }}>
              Bản nháp đã được lưu trong phiên làm việc hiện tại.
            </Text>
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
            style={{ borderColor: colors.border, backgroundColor: colors.card, color: colors.text }}
          />
        </View>

        <View className="px-4 pt-4">
          <Text className="mb-2 text-sm font-semibold text-text-secondary">
            Số năm kinh nghiệm (không bắt buộc)
          </Text>
          <TextInput
            value={yearsOfExperience}
            onChangeText={setYearsOfExperience}
            keyboardType="number-pad"
            placeholder="Ví dụ: 2"
            className="h-12 rounded-xl border px-4 text-base"
            placeholderTextColor={colors.textSecondary}
            style={{ borderColor: colors.border, backgroundColor: colors.card, color: colors.text }}
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
                    style={{ borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primary : colors.card }}
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
                    style={{ borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primary : colors.card }}
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
              style={{ borderColor: colors.border, backgroundColor: colors.card }}
            >
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="font-semibold text-text-primary">
                  Chứng chỉ #{index + 1}
                </Text>
                {certificates.length > 1 && (
                  <TouchableOpacity onPress={() => removeCertificate(index)}>
                    <Ionicons name="trash-outline" size={18} color={colors.status.error} />
                  </TouchableOpacity>
                )}
              </View>

              <TextInput
                value={cert.name}
                onChangeText={(v) => updateCertificate(index, 'name', v)}
                placeholder="Tên chứng chỉ"
                className="mb-2 h-11 rounded-lg border px-3"
                placeholderTextColor={colors.textSecondary}
                style={{ borderColor: colors.border, backgroundColor: colors.card, color: colors.text }}
              />
              <TextInput
                value={cert.issuedBy}
                onChangeText={(v) => updateCertificate(index, 'issuedBy', v)}
                placeholder="Đơn vị cấp"
                className="mb-2 h-11 rounded-lg border px-3"
                placeholderTextColor={colors.textSecondary}
                style={{ borderColor: colors.border, backgroundColor: colors.card, color: colors.text }}
              />
              <TouchableOpacity
                onPress={() => openDateTimePicker(index, 'issuedDate')}
                className="mb-2 h-11 flex-row items-center justify-center gap-2 rounded-lg border"
                style={{ borderColor: colors.border, backgroundColor: colors.surface }}
              >
                <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                <Text className="text-sm font-medium text-text-primary">
                  {formatDisplayDate(cert.issuedDate)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => openDateTimePicker(index, 'expiryDate')}
                className="mb-2 h-11 flex-row items-center justify-center gap-2 rounded-lg border"
                style={{ borderColor: colors.border, backgroundColor: colors.surface }}
              >
                <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                <Text className="text-sm font-medium text-text-primary">
                  {cert.expiryDate
                    ? formatDisplayDate(cert.expiryDate)
                    : 'Chọn ngày hết hạn (optional)'}
                </Text>
              </TouchableOpacity>
              <TextInput
                value={cert.fileUrl}
                onChangeText={(v) => updateCertificate(index, 'fileUrl', v)}
                placeholder="Cloudinary URL (https://...)"
                className="h-11 rounded-lg border px-3"
                placeholderTextColor={colors.textSecondary}
                style={{ borderColor: colors.border, backgroundColor: colors.card, color: colors.text }}
              />

              <TouchableOpacity
                onPress={() => pickAndUploadCertificateImage(index)}
                disabled={uploadingCertificateIndex === index}
                className={`mt-2 h-11 flex-row items-center justify-center gap-2 rounded-lg ${
                  uploadingCertificateIndex === index
                    ? 'bg-primary/60'
                    : 'bg-primary'
                }`}
              >
                {uploadingCertificateIndex === index ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <Ionicons name="images-outline" size={18} color={colors.white} />
                    <Text className="font-semibold text-white">
                      Chọn ảnh từ thư viện
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {!!cert.fileUrl?.trim() &&
                /^https?:\/\//i.test(cert.fileUrl.trim()) && (
                  <View className="mt-2 overflow-hidden rounded-lg border" style={{ borderColor: colors.border }}>
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
                style={{ borderColor: colors.border, backgroundColor: colors.card }}
              >
                <Text className="text-base font-bold" style={{ color: colors.text }}>
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
          onChange={onDateTimeChange}
        />
      ) : null}
      <AppDialog {...dialogProps} />
    </View>
  );
}
