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
import { useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Image,
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

  useEffect(() => {
    const resolvedName =
      userProfile?.displayName || volunteerProfile?.fullName || '';
    const resolvedPhone =
      userProfile?.phoneNumber || volunteerProfile?.phoneNumber || '';
    const resolvedAvatar = userProfile?.pictureUrl || null;

    setFullName(resolvedName);
    setPhone(resolvedPhone);
    setAvatarUrl(resolvedAvatar);
  }, [
    userProfile?.displayName,
    userProfile?.phoneNumber,
    userProfile?.pictureUrl,
    volunteerProfile?.fullName,
    volunteerProfile?.phoneNumber,
  ]);

  const loading =
    volunteerProfileQuery.isLoading ||
    allSkillsQuery.isLoading ||
    userProfileQuery.isLoading;

  const resolvedSkills = useMemo(() => {
    if (!volunteerProfile?.skills?.length) return [] as string[];

    return volunteerProfile.skills
      .map((skillEntry: VolunteerProfileResponse['skills'][number]) => {
        const skillId = getProfileSkillId(skillEntry);
        const matched = allSkills.find(
          (skill: SkillResponse) => skill.skillId === skillId,
        );
        return getLocalizedSkillName(matched?.name || skillId, matched?.code);
      })
      .filter(Boolean);
  }, [allSkills, volunteerProfile?.skills]);

  const resolvedCertificates = useMemo(
    () => volunteerProfile?.certificates ?? [],
    [volunteerProfile?.certificates],
  );

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
    const picturePublicId = extractCloudinaryPublicId(avatarUrl);
    const userResult = await updateProfileMutation.mutateAsync({
      displayName: fullName.trim() || undefined,
      phoneNumber: phone.trim() || undefined,
      pictureUrl: avatarUrl || undefined,
      picturePublicId: picturePublicId || undefined,
    });

    console.log(
      `[UpdateProfileVolunteer] update profile status: ${userResult?.status ?? 'unknown'}`,
    );

    const statusCode = Number(userResult?.status ?? 0);
    const isSuccessStatus =
      statusCode >= 200 && statusCode < 300 && Boolean(userResult?.success);

    if (!isSuccessStatus) {
      showErrorToast(
        'Không thể cập nhật avatar',
        `API cập nhật trả status ${statusCode || 'không xác định'}.`,
      );
      return;
    }

    await queryClient.invalidateQueries({ queryKey: volunteerProfileKeys.all });
    await queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    await queryClient.invalidateQueries({ queryKey: ['citizenProfile'] });
    showSuccessToast('Thành công', 'Đã lưu cập nhật hồ sơ và avatar mới.');
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
                {resolvedSkills.map((skill: string, index: number) => (
                  <View
                    key={`${skill}-${index}`}
                    className="rounded-full border px-4 py-2"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    }}
                  >
                    <Text
                      className="text-sm font-medium"
                      style={{ color: colors.text }}
                    >
                      {skill}
                    </Text>
                  </View>
                ))}
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
              {resolvedCertificates.length ? (
                resolvedCertificates.map(
                  (
                    certificate: CreateVolunteerCertificateRequest,
                    index: number,
                  ) => (
                    <View
                      key={`${certificate.name}-${index}`}
                      className="rounded-xl border p-3"
                      style={{
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      }}
                    >
                      <Text
                        className="text-sm font-bold"
                        style={{ color: colors.text }}
                      >
                        Chứng chỉ #{index + 1}
                      </Text>

                      <View
                        className="mt-2 rounded-lg border px-3 py-2.5"
                        style={{ borderColor: colors.border }}
                      >
                        <Text
                          className="text-xs"
                          style={{ color: colors.textSecondary }}
                        >
                          Tên chứng chỉ
                        </Text>
                        <Text style={{ color: colors.text }}>
                          {certificate.name || '--'}
                        </Text>
                      </View>
                      <View
                        className="mt-2 rounded-lg border px-3 py-2.5"
                        style={{ borderColor: colors.border }}
                      >
                        <Text
                          className="text-xs"
                          style={{ color: colors.textSecondary }}
                        >
                          Đơn vị cấp
                        </Text>
                        <Text style={{ color: colors.text }}>
                          {certificate.issuedBy || '--'}
                        </Text>
                      </View>
                      <View
                        className="mt-2 rounded-lg border px-3 py-2.5"
                        style={{ borderColor: colors.border }}
                      >
                        <Text
                          className="text-xs"
                          style={{ color: colors.textSecondary }}
                        >
                          Ngày cấp
                        </Text>
                        <Text style={{ color: colors.text }}>
                          {formatDate(certificate.issuedDate)}
                        </Text>
                      </View>
                      <View
                        className="mt-2 rounded-lg border px-3 py-2.5"
                        style={{ borderColor: colors.border }}
                      >
                        <Text
                          className="text-xs"
                          style={{ color: colors.textSecondary }}
                        >
                          Ngày hết hạn
                        </Text>
                        <Text style={{ color: colors.text }}>
                          {formatDate(certificate.expiryDate)}
                        </Text>
                      </View>
                      {certificate.fileUrl ? (
                        <View
                          className="mt-2 rounded-lg border px-3 py-2.5"
                          style={{ borderColor: colors.border }}
                        >
                          <Text
                            className="text-xs"
                            style={{ color: colors.textSecondary }}
                          >
                            Ảnh chứng chỉ
                          </Text>
                          <Text style={{ color: colors.status.completed }}>
                            Đã nộp ảnh chứng chỉ
                          </Text>
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
        title={updateProfileMutation.isPending ? 'Đang lưu...' : 'Lưu cập nhật'}
        icon="save"
        onPress={updateProfileMutation.isPending ? undefined : handleSave}
        backgroundColor={colors.primary}
      />
    </View>
  );
}

function formatDate(value?: string | null) {
  if (!value) return '--';
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
