import '@/global.css';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import { useTheme } from '@/src/context/ThemeContext';
import {
    useUpdateUserProfile,
    useUserProfile,
} from '@/src/hooks/useUserProfile';
import { useAuthStore } from '@/src/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
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

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');

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
    setDateOfBirth(profile.dateOfBirth ?? '');
    setGender(profile.gender ?? '');
    setAddress(profile.address ?? '');
  }, [authUser?.email, authUser?.user_name, data?.profile]);

  const handleSave = async () => {
    const result = await updateProfile.mutateAsync({
      displayName: fullName.trim() || undefined,
      phoneNumber: phone.trim() || undefined,
      dateOfBirth: dateOfBirth.trim() || undefined,
      gender: gender.trim() || undefined,
      address: address.trim() || undefined,
    });

    if (result?.success) {
      onSave?.();
    }
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
              <Ionicons name="person" size={56} color={colors.textSecondary} />
            </View>
            <TouchableOpacity
              className="absolute bottom-1 right-1 rounded-full border-2 p-2 shadow-md"
              style={{
                backgroundColor: colors.primary,
                borderColor: colors.card,
              }}
            >
              <Ionicons name="camera" size={16} color={colors.white} />
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
          {renderInput('Ngày sinh', dateOfBirth, setDateOfBirth)}
          {renderInput('Giới tính', gender, setGender)}
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
