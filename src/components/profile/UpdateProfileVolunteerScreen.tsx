import '@/global.css';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import StickyFooterButton from '@/src/components/common/StickyFooterButton';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type AvailabilityStatus = 'ready' | 'busy' | 'rest';

interface UpdateProfileVolunteerScreenProps {
    onBack?: () => void;
}

const SKILLS = ['Y tế', 'Cứu hộ', 'Lái xe', 'Hậu cần', 'Giao tiếp'];

const getAvailabilityOptions = (colors: ReturnType<typeof useTheme>['colors']): { id: AvailabilityStatus; label: string; color: string }[] => [
    { id: 'ready', label: 'Sẵn sàng', color: colors.status.completed },
    { id: 'busy', label: 'Đang bận', color: colors.status.pending },
    { id: 'rest', label: 'Nghỉ ngơi', color: colors.textSecondary },
];

export default function UpdateProfileVolunteerScreen({
    onBack,
}: UpdateProfileVolunteerScreenProps) {
    const { bottom } = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const AVAILABILITY_OPTIONS = getAvailabilityOptions(colors);

    const [fullName, setFullName] = useState('Trần Thế Vinh');
    const [phone, setPhone] = useState('0908 123 456');
    const [availability, setAvailability] = useState<AvailabilityStatus>('ready');
    const [selectedSkills, setSelectedSkills] = useState<string[]>(['Y tế', 'Cứu hộ']);

    const toggleSkill = (skill: string) => {
        setSelectedSkills(prev =>
            prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill],
        );
    };

    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            <ScreenHeader title="Cập nhật hồ sơ" onBack={onBack} />

            <ScrollView
                contentContainerStyle={{ paddingBottom: bottom + 100 }}
                className="flex-1"
                showsVerticalScrollIndicator={false}
            >
                {/* Avatar */}
                <View className="items-center p-6">
                    <View className="relative">
                        <View
                            className="h-28 w-28 rounded-full items-center justify-center border-4 shadow-md"
                            style={{
                                backgroundColor: colors.surface,
                                borderColor: colors.card,
                            }}
                        >
                            <Ionicons name="person" size={48} color={colors.textSecondary} />
                        </View>
                        <TouchableOpacity
                            className="absolute bottom-0 right-0 p-2 rounded-full shadow-lg border-2"
                            style={{
                                backgroundColor: colors.primary,
                                borderColor: colors.card,
                            }}
                        >
                            <Ionicons name="create" size={14} color={colors.white} />
                        </TouchableOpacity>
                    </View>
                    <View className="items-center mt-3">
                        <Text className="text-xl font-bold tracking-tight" style={{ color: colors.text }}>
                            {fullName}
                        </Text>
                        <Text className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                            Tình nguyện viên cứu hộ
                        </Text>
                    </View>
                </View>

                {/* Form Content */}
                <View className="gap-6 px-4 pb-6">
                    {/* Basic Info */}
                    <View>
                        <View className="flex-row items-center gap-2 mb-4">
                            <Ionicons name="person" size={20} color={colors.primary} />
                            <Text className="text-base font-bold" style={{ color: colors.text }}>
                                Thông tin cơ bản
                            </Text>
                        </View>
                        <View className="gap-4">
                            <View>
                                <Text className="text-sm font-medium mb-1.5" style={{ color: colors.textSecondary }}>
                                    Họ và tên
                                </Text>
                                <TextInput
                                    value={fullName}
                                    onChangeText={setFullName}
                                    placeholder="Nhập họ và tên"
                                    placeholderTextColor={colors.textSecondary}
                                    className="w-full rounded-lg border h-12 px-4 text-base"
                                    style={{
                                        backgroundColor: colors.card,
                                        borderColor: colors.border,
                                        color: colors.text,
                                    }}
                                />
                            </View>
                            <View>
                                <Text className="text-sm font-medium mb-1.5" style={{ color: colors.textSecondary }}>
                                    Số điện thoại
                                </Text>
                                <TextInput
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholder="Nhập số điện thoại"
                                    placeholderTextColor={colors.textSecondary}
                                    keyboardType="phone-pad"
                                    className="w-full rounded-lg border h-12 px-4 text-base"
                                    style={{
                                        backgroundColor: colors.card,
                                        borderColor: colors.border,
                                        color: colors.text,
                                    }}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Availability */}
                    <View>
                        <View className="flex-row items-center gap-2 mb-4">
                            <Ionicons name="calendar" size={20} color={colors.primary} />
                            <Text className="text-base font-bold" style={{ color: colors.text }}>
                                Trạng thái sẵn sàng
                            </Text>
                        </View>
                        <View
                            className="flex-row gap-2 rounded-xl p-1"
                            style={{ backgroundColor: colors.surface }}
                        >
                            {AVAILABILITY_OPTIONS.map((opt) => (
                                <TouchableOpacity
                                    key={opt.id}
                                    onPress={() => setAvailability(opt.id)}
                                    className="flex-1 flex-row items-center justify-center gap-1.5 py-2 px-1 rounded-lg"
                                    style={{
                                        backgroundColor: availability === opt.id
                                            ? colors.card
                                            : 'transparent',
                                        ...(availability === opt.id ? {
                                            shadowColor: colors.black,
                                            shadowOffset: { width: 0, height: 1 },
                                            shadowOpacity: 0.1,
                                            shadowRadius: 2,
                                            elevation: 2,
                                            borderWidth: 1,
                                            borderColor: colors.border,
                                        } : {}),
                                    }}
                                >
                                    <View
                                        className="h-2 w-2 rounded-full"
                                        style={{ backgroundColor: opt.color }}
                                    />
                                    <Text
                                        className="text-xs"
                                        style={{
                                            color: availability === opt.id ? colors.text : colors.textSecondary,
                                            fontWeight: availability === opt.id ? '600' : '500',
                                        }}
                                    >
                                        {opt.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Skills */}
                    <View>
                        <View className="flex-row items-center gap-2 mb-4">
                            <Ionicons name="star" size={20} color={colors.primary} />
                            <Text className="text-base font-bold" style={{ color: colors.text }}>
                                Kỹ năng chuyên môn
                            </Text>
                        </View>
                        <View className="flex-row flex-wrap gap-2">
                            {SKILLS.map((skill) => {
                                const isSelected = selectedSkills.includes(skill);
                                return (
                                    <TouchableOpacity
                                        key={skill}
                                        onPress={() => toggleSkill(skill)}
                                        className="rounded-full px-4 py-2 shadow-sm"
                                        style={{
                                            backgroundColor: isSelected ? colors.primary : colors.surface,
                                            borderWidth: isSelected ? 0 : 1,
                                            borderColor: colors.border,
                                        }}
                                    >
                                        <Text
                                            className="text-sm font-medium"
                                            style={{
                                                color: isSelected ? colors.white : colors.textSecondary,
                                            }}
                                        >
                                            {skill}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                            <TouchableOpacity
                                className="h-9 w-9 items-center justify-center rounded-full border-2 border-dashed"
                                style={{ borderColor: colors.border }}
                            >
                                <Ionicons name="add" size={18} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Certifications */}
                    <View>
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center gap-2">
                                <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
                                <Text className="text-base font-bold" style={{ color: colors.text }}>
                                    Chứng chỉ chuyên môn
                                </Text>
                            </View>
                        </View>
                        <View className="gap-3">
                            {/* Uploaded file */}
                            <View
                                className="flex-row items-center justify-between p-3 rounded-xl border"
                                style={{
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border,
                                }}
                            >
                                <View className="flex-row items-center gap-3">
                                    <View
                                        className="h-10 w-10 items-center justify-center rounded-lg"
                                        style={{ backgroundColor: `${colors.status.error}15` }}
                                    >
                                        <Ionicons name="document-text" size={22} color={colors.primary} />
                                    </View>
                                    <View>
                                        <Text className="text-sm font-bold" style={{ color: colors.text }}>
                                            Chung_chi_Y_te.pdf
                                        </Text>
                                        <Text className="text-xs" style={{ color: colors.textSecondary }}>
                                            1.2 MB • Đã tải lên
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity>
                                    <Ionicons name="trash-outline" size={22} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            {/* Upload Placeholder */}
                            <TouchableOpacity
                                className="flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed"
                                style={{
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border,
                                }}
                            >
                                <Ionicons name="cloud-upload-outline" size={32} color={colors.textSecondary} />
                                <Text className="text-sm font-semibold mt-2" style={{ color: colors.text }}>
                                    Tải lên chứng chỉ
                                </Text>
                                <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                                    Hỗ trợ PDF, JPG, PNG (Tối đa 5MB)
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Sticky Footer */}
            <StickyFooterButton
                title="Lưu cập nhật"
                icon="save"
                backgroundColor={colors.primary}
            />
        </View>
    );
}
