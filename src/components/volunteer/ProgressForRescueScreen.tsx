import '@/global.css';
import ImageUploader from '@/src/components/common/ImageUploader';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import StatusRadioOption from '@/src/components/common/StatusRadioOption';
import StickyFooterButton from '@/src/components/common/StickyFooterButton';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type RescueStatusType = 'moving' | 'in_progress' | 'success' | 'failed';

interface ProgressForRescueScreenProps {
    onBack?: () => void;
    onMarkSOS?: () => void;
}

const getStatuses = (colors: ReturnType<typeof useTheme>['colors']): {
    id: RescueStatusType;
    icon: string;
    title: string;
    subtitle: string;
    color: string;
}[] => [
        {
            id: 'moving',
            icon: 'boat',
            title: 'Đang di chuyển',
            subtitle: 'Đang tiếp cận vị trí người cần cứu',
            color: colors.status.incoming,
        },
        {
            id: 'in_progress',
            icon: 'play-circle',
            title: 'Đang tiến hành',
            subtitle: 'Đã tiếp cận và đang thực hiện cứu hộ',
            color: colors.secondary,
        },
        {
            id: 'success',
            icon: 'shield-checkmark',
            title: 'Đã cứu hộ thành công',
            subtitle: 'Đã đưa người đến nơi an toàn',
            color: colors.status.completed,
        },
        {
            id: 'failed',
            icon: 'alert-circle',
            title: 'Bị gián đoạn/Thất bại',
            subtitle: 'Dòng chảy xiết, không thể tiếp cận, cần hỗ trợ thêm...',
            color: colors.status.error,
        },
    ];

export default function ProgressForRescueScreen({
    onBack,
    onMarkSOS,
}: ProgressForRescueScreenProps) {
    const { bottom } = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const STATUSES = getStatuses(colors);
    const [selectedStatus, setSelectedStatus] = useState<RescueStatusType>('in_progress');
    const [notes, setNotes] = useState('');
    const [images, setImages] = useState<string[]>([]);

    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            {/* Header */}
            <ScreenHeader
                title="Cập nhật tiến độ"
                onBack={onBack}
                backgroundColor={isDark ? colors.card : colors.primary}
                titleColor={isDark ? colors.text : colors.white}
                iconColor={isDark ? colors.text : colors.white}
            />

            <ScrollView
                contentContainerStyle={{ paddingBottom: bottom + 120 }}
                className="flex-1"
                showsVerticalScrollIndicator={false}
            >
                {/* Task Summary Card */}
                <View className="p-4">
                    <View
                        className="flex-row items-stretch justify-between gap-4 rounded-xl border p-4 shadow-sm"
                        style={{ backgroundColor: colors.card, borderColor: colors.border }}
                    >
                        <View className="flex-[2] flex-col justify-center gap-1">
                            <View className="mb-1 flex-row items-center gap-2">
                                <View className="rounded px-2 py-0.5" style={{ backgroundColor: `${colors.status.incoming}18` }}>
                                    <Text className="text-xs font-bold" style={{ color: colors.status.incoming }}>
                                        CỨU HỘ KHẨN CẤP
                                    </Text>
                                </View>
                            </View>
                            <Text className="text-base font-bold leading-tight" style={{ color: colors.text }}>
                                #RESCUE-882
                            </Text>
                            <Text className="text-sm font-normal" style={{ color: colors.textSecondary }}>
                                Trần Văn B - Vùng ngập sâu
                            </Text>
                            <View className="mt-1 flex-row items-center gap-1">
                                <Ionicons name="location" size={14} color={colors.secondary} />
                                <Text className="text-xs font-medium" style={{ color: colors.secondary }}>
                                    Cách đây 1.2km
                                </Text>
                            </View>
                        </View>
                        <View
                            className="h-24 w-24 flex-none items-center justify-center rounded-lg border"
                            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                        >
                            <Ionicons name="map" size={40} color={colors.textSecondary} />
                        </View>
                    </View>
                </View>

                {/* Tab Selector */}
                <View className="px-4">
                    <View className="flex-row gap-1 rounded-lg p-1" style={{ backgroundColor: colors.surface }}>
                        <View className="flex-1 items-center rounded-md py-2 px-3" style={{ backgroundColor: colors.background }}>
                            <Text className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                                Cứu trợ (Relief)
                            </Text>
                        </View>
                        <View className="flex-1 items-center rounded-md py-2 px-3 border shadow-sm" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                            <Text className="text-sm font-bold" style={{ color: colors.secondary }}>
                                Cứu hộ (Rescue)
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Status Selection */}
                <View>
                    <Text
                        className="px-4 pb-3 pt-6 text-left text-lg font-bold leading-tight tracking-tight"
                        style={{ color: colors.text }}
                    >
                        Trạng thái hiện tại
                    </Text>
                    <View className="flex-col gap-3 px-4">
                        {STATUSES.map((option) => (
                            <StatusRadioOption
                                key={option.id}
                                selected={selectedStatus === option.id}
                                onSelect={() => setSelectedStatus(option.id)}
                                icon={option.icon}
                                title={option.title}
                                subtitle={option.subtitle}
                                accentColor={option.color}
                            />
                        ))}
                    </View>
                </View>

                {/* SOS Alert Section */}
                <View className="px-4 pt-6">
                    <Text className="text-lg font-bold leading-tight mb-3" style={{ color: colors.text }}>
                        Trường hợp phát sinh
                    </Text>
                    <View
                        className="rounded-xl border p-4 shadow-sm"
                        style={{
                            backgroundColor: `${colors.status.error}12`,
                            borderColor: `${colors.status.error}33`,
                        }}
                    >
                        <View className="flex-row items-start gap-3">
                            <View className="mt-1 shrink-0">
                                <View
                                    className="h-10 w-10 items-center justify-center rounded-full border shadow-sm"
                                    style={{
                                        backgroundColor: `${colors.status.error}18`,
                                        borderColor: `${colors.status.error}33`,
                                    }}
                                >
                                    <Ionicons name="location" size={22} color={colors.primary} />
                                </View>
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm font-bold mb-1" style={{ color: colors.text }}>
                                    Phát hiện thêm người bị mắc kẹt?
                                </Text>
                                <Text className="text-xs mb-3 leading-relaxed" style={{ color: colors.textSecondary }}>
                                    Nếu bạn phát hiện thêm các trường hợp cần ứng cứu khẩn cấp tại khu vực này, hãy đánh dấu vị trí ngay lập tức để
                                    điều phối đội cứu hộ khác.
                                </Text>
                                <TouchableOpacity
                                    onPress={onMarkSOS}
                                    className="flex-row items-center justify-center gap-2 rounded-lg px-4 py-2.5 shadow-md"
                                    style={{ backgroundColor: colors.primary }}
                                >
                                    <Ionicons name="warning" size={18} color={colors.white} />
                                    <Text className="text-sm font-bold uppercase tracking-wide text-white">
                                        Đánh dấu SOS mới
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Image Upload Section */}
                <View>
                    <Text
                        className="px-4 pb-3 pt-6 text-left text-lg font-bold leading-tight tracking-tight"
                        style={{ color: colors.text }}
                    >
                        Hình ảnh hiện trường
                    </Text>
                    <View className="px-4">
                        <ImageUploader
                            images={images}
                            onAddImage={() => setImages([...images, ''])}
                            onRemoveImage={(i) => setImages(images.filter((_, idx) => idx !== i))}
                        />
                    </View>
                </View>

                {/* Notes Section */}
                <View className="mb-4">
                    <Text
                        className="px-4 pb-3 pt-4 text-left text-lg font-bold leading-tight tracking-tight"
                        style={{ color: colors.text }}
                    >
                        Ghi chú cứu hộ
                    </Text>
                    <View className="px-4">
                        <TextInput
                            value={notes}
                            onChangeText={setNotes}
                            placeholder="Nhập tình trạng nạn nhân, số lượng người, hoặc các khó khăn gặp phải (tùy chọn)..."
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

                <View className="h-8" />
            </ScrollView>

            {/* Sticky Footer */}
            <StickyFooterButton
                title="Cập nhật trạng thái"
                icon="send"
                backgroundColor={colors.secondary}
            />
        </View>
    );
}
