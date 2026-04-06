import '@/global.css';
import Header from '@/src/components/header/header';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ViewTasksScreenProps {
    onBack?: () => void;
}

export default function ViewTasksScreen({
    onBack,
}: ViewTasksScreenProps = {}) {
    const { bottom } = useSafeAreaInsets();
    const { colors, isDark } = useTheme();

    // Theme Styles
    const mapPlaceholderBg = colors.surface;
    const iconWrapperBg = isDark ? colors.surface : `${colors.primary}18`;

    return (
        <View
            className="flex-1"
            style={{ backgroundColor: colors.background }}
        >
            <Header
                title="Chi tiết nhiệm vụ"
                onBack={onBack}
                center
            />

            <ScrollView
                contentContainerStyle={{ paddingBottom: bottom + 120 }}
                className="flex-1"
                showsVerticalScrollIndicator={false}
            >
                {/* Citizen Info Card */}
                <View className="p-4">
                    <View
                        className="flex-col gap-4 rounded-xl p-5 shadow-sm"
                        style={{ backgroundColor: colors.card }}
                    >
                        {/* Header with Priority Badge */}
                        <View className="flex-row items-start justify-between">
                            <View className="flex-col gap-1">
                                <View className="mb-1 flex-row items-center gap-2">
                                    <View className="flex-row items-center rounded-full px-2.5 py-0.5" style={{ backgroundColor: `${colors.status.pending}18` }}>
                                        <Ionicons
                                            name="alert-circle"
                                            size={14}
                                            color={colors.status.pending}
                                            style={{ marginRight: 4 }}
                                        />
                                        <Text className="text-xs font-bold" style={{ color: colors.status.pending }}>
                                            Ưu tiên cao
                                        </Text>
                                    </View>
                                    <View className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: `${colors.status.incoming}18` }}>
                                        <Text className="text-xs font-medium" style={{ color: colors.status.incoming }}>
                                            Mới
                                        </Text>
                                    </View>
                                </View>
                                <Text className="text-xl font-bold leading-tight" style={{ color: colors.text }}>
                                    Nguyễn Văn A
                                </Text>
                            </View>
                            <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: iconWrapperBg }}>
                                <Ionicons name="call" size={20} color={colors.primary} />
                            </TouchableOpacity>
                        </View>

                        {/* Address */}
                        <View className="flex-row items-start gap-3 text-sm">
                            <Ionicons
                                name="location"
                                size={20}
                                color={colors.textSecondary}
                                style={{ marginTop: 2 }}
                            />
                            <Text className="flex-1 font-normal leading-normal" style={{ color: colors.text }}>
                                123 Đường Trần Phú, Quận Hải Châu, Đà Nẵng
                            </Text>
                        </View>

                        {/* Separator */}
                        <View className="h-px w-full" style={{ backgroundColor: colors.border }} />

                        {/* Request Details */}
                        <View className="grid grid-cols-1 gap-4">
                            <View className="flex-col gap-1">
                                <Text className="text-xs font-medium uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                                    Loại hỗ trợ
                                </Text>
                                <View className="flex-row flex-wrap gap-2">
                                    <View className="flex-row items-center gap-1 rounded px-2 py-1" style={{ backgroundColor: `${colors.status.error}14` }}>
                                        <Ionicons name="medical" size={16} color={colors.status.error} />
                                        <Text className="text-sm font-medium" style={{ color: colors.status.error }}>
                                            Y tế
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center gap-1 rounded px-2 py-1" style={{ backgroundColor: `${colors.status.completed}14` }}>
                                        <Ionicons name="restaurant" size={16} color={colors.status.completed} />
                                        <Text className="text-sm font-medium" style={{ color: colors.status.completed }}>
                                            Lương thực
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <View className="flex-col gap-1">
                                <Text className="text-xs font-medium uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                                    Ghi chú
                                </Text>
                                <View
                                    className="rounded-lg border p-3"
                                    style={{
                                        borderColor: colors.border,
                                        backgroundColor: colors.surface
                                    }}
                                >
                                    <Text className="text-sm font-normal leading-relaxed" style={{ color: colors.text }}>
                                        "Gia đình có người già và trẻ nhỏ, nước đang dâng cao khoảng
                                        0.5m trước cửa nhà."
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Map & Route Section */}
                <View className="px-4 pb-4">
                    <View className="flex-col gap-3">
                        <Text className="px-1 text-base font-bold" style={{ color: colors.text }}>Lộ trình di chuyển</Text>
                        <View
                            className="group relative h-64 w-full overflow-hidden rounded-xl border shadow-sm"
                            style={{ borderColor: colors.border }}
                        >
                            {/* AI Route Badge */}
                            <View className="absolute left-3 top-3 z-10 flex-row items-center gap-2 rounded-lg border px-3 py-1.5 shadow-sm backdrop-blur-sm" style={{ borderColor: `${colors.status.incoming}22`, backgroundColor: colors.card }}>
                                <Ionicons name="sparkles" size={18} color={colors.primary} />
                                <Text className="text-xs font-bold text-primary">AI Gợi ý</Text>
                            </View>

                            {/* Map Placeholder */}
                            <View className="h-full w-full items-center justify-center" style={{ backgroundColor: mapPlaceholderBg }}>
                                <Ionicons name="map" size={60} color={colors.textSecondary} />
                            </View>

                            {/* Location Button */}
                            <View
                                className="absolute bottom-3 right-3 z-10 rounded-lg p-2 shadow-md"
                                style={{ backgroundColor: colors.card }}
                            >
                                <Ionicons name="locate" size={20} color={colors.textSecondary} />
                            </View>
                        </View>

                        {/* Stats */}
                        <View className="grid grid-cols-2 gap-3">
                            <View
                                className="items-center rounded-xl border p-3 text-center"
                                style={{ borderColor: `${colors.status.incoming}22`, backgroundColor: `${colors.status.incoming}12` }}
                            >
                                <Text className="text-2xl font-bold leading-tight text-primary">
                                    1.2 km
                                </Text>
                                <View className="flex-row items-center gap-1">
                                    <Ionicons name="resize" size={16} color={colors.textSecondary} />
                                    <Text className="text-xs font-medium uppercase">
                                        Khoảng cách
                                    </Text>
                                </View>
                            </View>
                            <View
                                className="items-center rounded-xl border p-3 text-center"
                                style={{ borderColor: `${colors.status.incoming}22`, backgroundColor: `${colors.status.incoming}12` }}
                            >
                                <Text className="text-2xl font-bold leading-tight text-primary">
                                    5 phút
                                </Text>
                                <View className="flex-row items-center gap-1">
                                    <Ionicons name="time" size={16} color={colors.textSecondary} />
                                    <Text className="text-xs font-medium uppercase">Dự kiến</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Sticky Bottom Actions */}
            <View
                style={{
                    paddingBottom: bottom + 16,
                    backgroundColor: colors.card,
                    borderTopColor: colors.border
                }}
                className="absolute bottom-0 left-0 w-full border-t p-4 pb-6 shadow-lg"
            >
                <View className="flex-row gap-3">
                    <TouchableOpacity
                        className="flex-1 flex-row items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-amber-500 px-4 py-3"
                        style={{ backgroundColor: colors.background }}
                    >
                        <Ionicons name="warning" size={20} color={colors.status.pending} />
                        <Text className="font-bold" style={{ color: colors.status.pending }}>Báo sự cố</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-[2] flex-row items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary px-4 py-3 shadow-lg shadow-primary/30">
                        <Ionicons name="navigate" size={20} color={colors.white} />
                        <Text className="font-bold text-white">Bắt đầu điều hướng</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
