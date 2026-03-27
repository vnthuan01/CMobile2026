import '@/global.css';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import {
  CreateVolunteerCertificateRequest,
  CreateVolunteerRequest,
  SkillResponse,
  TeamRolePreference,
  volunteerService,
} from '@/src/services/volunteerService';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface RegisterVolunteerScreenProps {
  onBack?: () => void;
  onSuccess?: () => void;
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
  { label: 'Member', value: TeamRolePreference.Member },
  { label: 'Leader', value: TeamRolePreference.Leader },
  { label: 'Driver', value: TeamRolePreference.Driver },
];

export default function RegisterVolunteerScreen({
  onBack,
  onSuccess,
}: RegisterVolunteerScreenProps) {
  const { bottom } = useSafeAreaInsets();
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
      Alert.alert('Lỗi', 'Bạn cần cấp quyền thư viện ảnh để chọn chứng chỉ.');
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
        Alert.alert('Lỗi', uploadResult.message || 'Upload ảnh thất bại.');
        return;
      }

      updateCertificate(index, 'fileUrl', uploadResult.url);
      Alert.alert('Thành công', 'Đã upload ảnh chứng chỉ lên Cloudinary.');
    } finally {
      setUploadingCertificateIndex(null);
    }
  };

  const validate = () => {
    const isValidDateOnly = (value: string) =>
      /^\d{4}-\d{2}-\d{2}$/.test(value);

    if (!descriptions.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mô tả hồ sơ tình nguyện viên.');
      return false;
    }

    if (
      yearsOfExperience.trim() &&
      (Number.isNaN(Number(yearsOfExperience)) || Number(yearsOfExperience) < 0)
    ) {
      Alert.alert('Lỗi', 'Số năm kinh nghiệm phải là số >= 0.');
      return false;
    }

    if (!teamRolePreference) {
      Alert.alert('Lỗi', 'Vui lòng chọn vai trò mong muốn trong đội.');
      return false;
    }

    if (selectedSkillIds.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ít nhất 1 kỹ năng.');
      return false;
    }

    for (const cert of certificates) {
      if (
        !cert.name.trim() ||
        !cert.issuedBy.trim() ||
        !cert.issuedDate.trim() ||
        !cert.fileUrl.trim()
      ) {
        Alert.alert('Lỗi', 'Vui lòng điền đủ thông tin chứng chỉ bắt buộc.');
        return false;
      }

      if (!/^https?:\/\//i.test(cert.fileUrl.trim())) {
        Alert.alert(
          'Lỗi',
          'File URL của chứng chỉ phải là link hợp lệ (http/https).',
        );
        return false;
      }

      if (!isValidDateOnly(cert.issuedDate.trim())) {
        Alert.alert(
          'Lỗi',
          'Ngày cấp chứng chỉ phải đúng định dạng YYYY-MM-DD.',
        );
        return false;
      }

      if (cert.expiryDate?.trim() && !isValidDateOnly(cert.expiryDate.trim())) {
        Alert.alert(
          'Lỗi',
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

    const payload: CreateVolunteerRequest = {
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
      const result = await volunteerService.createVolunteerProfile(payload);
      if (!result.success) {
        Alert.alert('Lỗi', result.message || 'Không thể gửi hồ sơ.');
        return;
      }

      Alert.alert(
        'Thành công',
        'Đã gửi hồ sơ đăng ký tình nguyện viên. Vui lòng chờ xét duyệt.',
        [{ text: 'OK', onPress: () => onSuccess?.() }],
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background-light">
      <ScreenHeader title="Đăng ký tình nguyện viên" onBack={onBack} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
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
            className="rounded-xl border border-surface-dark bg-white px-4 py-3 text-base text-text-primary"
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
            className="h-12 rounded-xl border border-surface-dark bg-white px-4 text-base text-text-primary"
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
                  className={`rounded-full border px-4 py-2 ${
                    active
                      ? 'border-primary bg-primary'
                      : 'border-surface-dark bg-white'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      active ? 'text-white' : 'text-text-primary'
                    }`}
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
              <ActivityIndicator color="#DA251D" />
              <Text className="mt-2 text-xs text-text-secondary">
                Đang tải kỹ năng...
              </Text>
            </View>
          ) : skills.length === 0 ? (
            <Text className="text-sm text-red-600">
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
                    className={`rounded-full border px-3 py-2 ${
                      active
                        ? 'border-primary bg-primary'
                        : 'border-surface-dark bg-white'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        active ? 'text-white' : 'text-text-primary'
                      }`}
                    >
                      {skill.name}
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
              className="mb-3 rounded-xl border border-surface-dark bg-white p-3"
            >
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="font-semibold text-text-primary">
                  Chứng chỉ #{index + 1}
                </Text>
                {certificates.length > 1 && (
                  <TouchableOpacity onPress={() => removeCertificate(index)}>
                    <Ionicons name="trash-outline" size={18} color="#DC2626" />
                  </TouchableOpacity>
                )}
              </View>

              <TextInput
                value={cert.name}
                onChangeText={(v) => updateCertificate(index, 'name', v)}
                placeholder="Tên chứng chỉ"
                className="mb-2 h-11 rounded-lg border border-surface-dark px-3 text-text-primary"
              />
              <TextInput
                value={cert.issuedBy}
                onChangeText={(v) => updateCertificate(index, 'issuedBy', v)}
                placeholder="Đơn vị cấp"
                className="mb-2 h-11 rounded-lg border border-surface-dark px-3 text-text-primary"
              />
              <TouchableOpacity
                onPress={() => openDateTimePicker(index, 'issuedDate')}
                className="mb-2 h-11 flex-row items-center justify-center gap-2 rounded-lg border border-surface-dark bg-surface"
              >
                <Ionicons name="calendar-outline" size={16} color="#334155" />
                <Text className="text-sm font-medium text-text-primary">
                  {formatDisplayDate(cert.issuedDate)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => openDateTimePicker(index, 'expiryDate')}
                className="mb-2 h-11 flex-row items-center justify-center gap-2 rounded-lg border border-surface-dark bg-surface"
              >
                <Ionicons name="time-outline" size={16} color="#334155" />
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
                className="h-11 rounded-lg border border-surface-dark px-3 text-text-primary"
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
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="images-outline" size={18} color="#fff" />
                    <Text className="font-semibold text-white">
                      Chọn ảnh từ thư viện
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {!!cert.fileUrl?.trim() &&
                /^https?:\/\//i.test(cert.fileUrl.trim()) && (
                  <View className="mt-2 overflow-hidden rounded-lg border border-surface-dark">
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
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className={`h-12 items-center justify-center rounded-xl ${
              loading ? 'bg-primary/60' : 'bg-primary'
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-base font-bold text-white">
                Gửi hồ sơ tình nguyện viên
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
    </View>
  );
}
