import '@/global.css';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import { useTheme } from '@/src/context/ThemeContext';
import { useUploadImage } from '@/src/hooks/useUploadImage';
import {
  useUpdateUserProfile,
  useUserProfile,
} from '@/src/hooks/useUserProfile';
import { useAuthStore } from '@/src/store/authStore';
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from '@/src/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
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

interface UpdateProfileCitizenScreenProps {
  onBack?: () => void;
  onCancel?: () => void;
  onSave?: () => void;
  hideBackButton?: boolean;
}

export default function UpdateProfileCitizenScreen({
  onBack,
  onCancel,
  onSave,
  hideBackButton = false,
}: UpdateProfileCitizenScreenProps) {
  const { bottom } = useSafeAreaInsets();
  const { colors } = useTheme();
  const authUser = useAuthStore((state) => state.user);
  const { data } = useUserProfile(true);
  const updateProfile = useUpdateUserProfile();
  const uploadImageMutation = useUploadImage();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [dateOfBirthValue, setDateOfBirthValue] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState<'Nam' | 'Nữ' | 'Khác'>('Khác');
  const [address, setAddress] = useState('');

  const formatBirthDateDisplay = (date: Date) => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const parseDateFromApi = (raw?: string | null): Date | null => {
    if (!raw) return null;
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
  };

  const mapGenderFromApi = (raw?: string | null): 'Nam' | 'Nữ' | 'Khác' => {
    const normalized = (raw ?? '').toLowerCase();
    if (normalized === 'male' || normalized === 'nam') return 'Nam';
    if (normalized === 'female' || normalized === 'nữ' || normalized === 'nu')
      return 'Nữ';
    return 'Khác';
  };

  const mapGenderToApi = (value: 'Nam' | 'Nữ' | 'Khác'): string => {
    if (value === 'Nam') return 'Male';
    if (value === 'Nữ') return 'Female';
    return 'Other';
  };

  useEffect(() => {
    const profile = data?.profile;
    if (!profile) {
      setEmail(authUser?.email ?? '');
      setFullName(authUser?.user_name ?? '');
      return;
    }

    setFullName(profile.displayName ?? authUser?.user_name ?? '');
    setEmail(profile.email ?? authUser?.email ?? '');
    setPhone(profile.phoneNumber ?? '');
    setAvatarUrl(profile.pictureUrl ?? null);
    const parsedDate = parseDateFromApi(profile.dateOfBirth);
    setDateOfBirthValue(parsedDate);
    setDateOfBirth(parsedDate ? formatBirthDateDisplay(parsedDate) : '');
    setGender(mapGenderFromApi(profile.gender));
    setAddress(profile.address ?? '');
  }, [authUser?.email, authUser?.user_name, data?.profile]);

  const handleChangeBirthDate = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (event.type === 'dismissed' || !selectedDate) return;

    setDateOfBirthValue(selectedDate);
    setDateOfBirth(formatBirthDateDisplay(selectedDate));
  };

  const handleSave = async () => {
    const picturePublicId = extractCloudinaryPublicId(avatarUrl);
    const result = await updateProfile.mutateAsync({
      displayName: fullName.trim() || undefined,
      phoneNumber: phone.trim() || undefined,
      dateOfBirth: formatDateForApi(dateOfBirthValue),
      gender: mapGenderToApi(gender),
      address: address.trim() || undefined,
      pictureUrl: avatarUrl || undefined,
      picturePublicId: picturePublicId || undefined,
    });

    console.log(
      `[UpdateProfileCitizen] update profile status: ${result?.status ?? 'unknown'}`,
    );

    const statusCode = Number(result?.status ?? 0);
    const isSuccessStatus =
      statusCode >= 200 && statusCode < 300 && Boolean(result?.success);

    if (!isSuccessStatus) {
      showErrorToast(
        'Không thể cập nhật avatar',
        `API cập nhật trả status ${statusCode || 'không xác định'}.`,
      );
      return;
    }

    if (result?.success) {
      showSuccessToast('Thành công', 'Đã cập nhật hồ sơ và ảnh đại diện.');
      onSave?.();
    }
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
        'Upload avatar thất bại',
        uploadResult.message || 'Không thể upload ảnh đại diện.',
      );
      return;
    }

    setAvatarUrl(uploadResult.url);
    showSuccessToast('Đã chọn ảnh', 'Nhấn Cập nhật để lưu avatar mới.');
  };

  const renderInput = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    opts?: {
      type?: string;
      multiline?: boolean;
      rows?: number;
      verified?: boolean;
      editable?: boolean;
    },
  ) => (
    <View className="gap-1.5">
      <Text
        className="ml-1 text-sm font-semibold"
        style={{ color: colors.textSecondary }}
      >
        {label}
      </Text>
      <View className="relative">
        {opts?.multiline ? (
          <TextInput
            value={value}
            onChangeText={onChange}
            editable={opts?.editable ?? true}
            multiline
            numberOfLines={opts?.rows ?? 3}
            textAlignVertical="top"
            className="w-full rounded-lg border p-4 text-base"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text,
              opacity: opts?.editable === false ? 0.75 : 1,
            }}
          />
        ) : (
          <TextInput
            value={value}
            onChangeText={onChange}
            editable={opts?.editable ?? true}
            keyboardType={
              opts?.type === 'email'
                ? 'email-address'
                : opts?.type === 'tel'
                  ? 'phone-pad'
                  : 'default'
            }
            className="h-12 w-full rounded-lg border px-4 text-base"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text,
              paddingRight: opts?.verified ? 40 : 16,
              opacity: opts?.editable === false ? 0.75 : 1,
            }}
          />
        )}
        {opts?.verified && (
          <View
            className="absolute right-3 top-1/2"
            style={{ transform: [{ translateY: -10 }] }}
          >
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={colors.status.completed}
            />
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenHeader
        title="Cập nhật hồ sơ"
        onBack={hideBackButton ? undefined : onBack}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottom + 24 }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center p-6">
          <View className="relative">
            <View
              className="h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 shadow-lg"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.card,
              }}
            >
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              ) : (
                <Ionicons
                  name="person"
                  size={56}
                  color={colors.textSecondary}
                />
              )}
            </View>
            <TouchableOpacity
              onPress={handlePickAvatar}
              disabled={uploadImageMutation.isPending}
              className="absolute bottom-1 right-1 rounded-full border-2 p-2 shadow-md"
              style={{
                backgroundColor: colors.primary,
                borderColor: colors.card,
              }}
            >
              {uploadImageMutation.isPending ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Ionicons name="camera" size={16} color={colors.white} />
              )}
            </TouchableOpacity>
          </View>
          <View className="mt-4 items-center">
            <Text className="text-xl font-bold" style={{ color: colors.text }}>
              {fullName}
            </Text>
          </View>
        </View>

        <View className="gap-5 px-6">
          {renderInput('Họ và tên', fullName, setFullName, { verified: true })}
          {renderInput('Email', email, setEmail, {
            type: 'email',
            verified: true,
            editable: false,
          })}
          {renderInput('Số điện thoại', phone, setPhone, { type: 'tel' })}

          <View className="gap-1.5">
            <Text
              className="ml-1 text-sm font-semibold"
              style={{ color: colors.textSecondary }}
            >
              Ngày sinh
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="h-12 w-full flex-row items-center justify-between rounded-lg border px-4"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
            >
              <Text
                className="text-base"
                style={{
                  color: dateOfBirth ? colors.text : colors.textSecondary,
                }}
              >
                {dateOfBirth || 'Chọn ngày sinh'}
              </Text>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirthValue ?? new Date(2000, 0, 1)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleChangeBirthDate}
              maximumDate={new Date()}
            />
          )}

          <View className="gap-1.5">
            <Text
              className="ml-1 text-sm font-semibold"
              style={{ color: colors.textSecondary }}
            >
              Giới tính
            </Text>
            <View className="flex-row gap-2">
              {(['Nam', 'Nữ', 'Khác'] as const).map((option) => {
                const selected = gender === option;
                return (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setGender(option)}
                    className="flex-1 items-center rounded-lg border py-3"
                    style={{
                      backgroundColor: selected
                        ? `${colors.primary}18`
                        : colors.card,
                      borderColor: selected ? colors.primary : colors.border,
                    }}
                  >
                    <Text
                      className="font-semibold"
                      style={{
                        color: selected ? colors.primary : colors.textSecondary,
                      }}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {renderInput('Địa chỉ', address, setAddress, {
            multiline: true,
            rows: 3,
          })}
        </View>

        <View className="gap-3 p-6">
          <TouchableOpacity
            onPress={handleSave}
            disabled={updateProfile.isPending}
            className="h-14 w-full items-center justify-center rounded-xl shadow-lg"
            style={{
              backgroundColor: updateProfile.isPending
                ? colors.textSecondary
                : colors.primary,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <Text className="text-base font-bold text-white">
              {updateProfile.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onCancel ?? onBack}
            className="h-12 w-full items-center justify-center rounded-xl"
            style={{ backgroundColor: colors.surface }}
          >
            <Text
              className="text-base font-semibold"
              style={{ color: colors.textSecondary }}
            >
              Hủy bỏ
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function extractCloudinaryPublicId(url?: string | null): string | null {
  if (!url) return null;
  const cleanedUrl = url.split('?')[0].split('#')[0];
  const uploadIndex = cleanedUrl.indexOf('/upload/');
  if (uploadIndex === -1) return null;

  let tail = cleanedUrl.slice(uploadIndex + '/upload/'.length);
  if (/^v\d+\//.test(tail)) {
    tail = tail.replace(/^v\d+\//, '');
  }

  const lastDot = tail.lastIndexOf('.');
  return lastDot > 0 ? tail.slice(0, lastDot) : tail || null;
}

function formatDateForApi(date: Date | null): string | undefined {
  if (!date) return undefined;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T00:00:00`;
}
