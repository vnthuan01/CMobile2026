import '@/global.css';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import StickyFooterButton from '@/src/components/common/StickyFooterButton';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ReportProgressTeamLeaderScreenProps {
    onBack?: () => void;
}

interface MemberReport {
    id: string;
    name: string;
    team: string;
    time: string;
    status: 'done' | 'in_progress';
    statusLabel: string;
    content: string;
    imageCount: number;
    initials: string;
}

const MOCK_REPORTS: MemberReport[] = [
    {
        id: '1',
        name: 'Nguyễn Văn A',
        team: 'Đội cứu hộ số 1',
        time: '10:30 AM',
        status: 'done',
        statusLabel: 'Đã xong',
        content: 'Đã kiểm tra khu vực phía Bắc. Đường đi bị chặn bởi đất đá, cần máy xúc hỗ trợ mở đường.',
        imageCount: 5,
        initials: 'NA',
    },
    {
        id: '2',
        name: 'Trần Thị B',
        team: 'Y tế',
        time: '10:15 AM',
        status: 'in_progress',
        statusLabel: 'Đang xử lý',
        content: 'Đang sơ cứu cho 2 người dân bị thương nhẹ. Cần thêm bông băng và thuốc sát trùng.',
        imageCount: 0,
        initials: 'TB',
    },
];

export default function ReportProgressTeamLeaderScreen({
    onBack,
}: ReportProgressTeamLeaderScreenProps) {
    const { bottom } = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const [summaryNote, setSummaryNote] = useState('');

    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            {/* Header */}
            <ScreenHeader
                title="Báo cáo Tổng hợp Nhóm"
                onBack={onBack}
            />

            <ScrollView
                contentContainerStyle={{ paddingBottom: bottom + 120 }}
                className="flex-1"
                showsVerticalScrollIndicator={false}
            >
                <View className="gap-6 w-full p-4">
                    {/* Hero Image Card */}
                    <View
                        className="relative overflow-hidden rounded-xl shadow-sm h-48"
                        style={{ backgroundColor: isDark ? '#1a2632' : colors.card }}
                    >
                        {/* Gradient overlay */}
                        <View
                            className="absolute inset-0 z-10"
                            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                        />

                        {/* Placeholder bg */}
                        <View
                            className="h-full items-center justify-center"
                            style={{ backgroundColor: isDark ? '#374151' : '#d1d5db' }}
                        >
                            <Ionicons name="image-outline" size={48} color="#6b7280" />
                        </View>

                        {/* Content overlay */}
                        <View className="absolute bottom-0 left-0 right-0 p-4 z-20">
                            <View className="flex-row items-center gap-2 mb-1">
                                <View className="rounded px-2 py-0.5" style={{ backgroundColor: colors.primary }}>
                                    <Text className="text-xs font-bold text-white">Khẩn cấp</Text>
                                </View>
                                <View className="flex-row items-center gap-1">
                                    <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
                                    <Text className="text-xs font-medium" style={{ color: colors.textSecondary }}>Cập nhật 5p trước</Text>
                                </View>
                            </View>
                            <Text className="text-white text-xl font-bold leading-tight mb-1">
                                Khu vực sạt lở X
                            </Text>
                            <Text className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                                Lào Cai, Việt Nam
                            </Text>
                            <View className="mt-3">
                                <View className="flex-row justify-between mb-1">
                                    <Text className="text-xs text-white">Tiến độ báo cáo</Text>
                                    <Text className="text-xs text-white">3/5 thành viên</Text>
                                </View>
                                <View className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>
                                    <View className="h-full rounded-full" style={{ width: '60%', backgroundColor: colors.primary }} />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Stats Grid */}
                    <View className="flex-row gap-3">
                        {[
                            { icon: 'people', count: '3/5', label: 'Thành viên', color: colors.primary, bgColor: `${colors.status.error}12` },
                            { icon: 'images', count: '12', label: 'Hình ảnh', color: colors.secondary, bgColor: `${colors.secondary}12` },
                            { icon: 'document-text', count: '5', label: 'Ghi chú', color: colors.status.pending, bgColor: `${colors.status.pending}12` },
                        ].map((stat, i) => (
                            <View
                                key={i}
                                className="flex-1 rounded-lg border p-3 items-center justify-center gap-1 shadow-sm"
                                style={{ backgroundColor: colors.card, borderColor: colors.border }}
                            >
                                <View className="rounded-full p-2" style={{ backgroundColor: stat.bgColor }}>
                                    <Ionicons name={stat.icon as any} size={18} color={stat.color} />
                                </View>
                                <Text className="text-2xl font-bold leading-none" style={{ color: colors.text }}>
                                    {stat.count}
                                </Text>
                                <Text className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                                    {stat.label}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Member Reports */}
                    <View>
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-lg font-bold" style={{ color: colors.text }}>
                                Báo cáo thành viên
                            </Text>
                            <Text className="text-sm font-semibold" style={{ color: colors.secondary }}>
                                Xem tất cả
                            </Text>
                        </View>

                        <View className="gap-3">
                            {MOCK_REPORTS.map((report) => (
                                <View
                                    key={report.id}
                                    className="rounded-lg border p-4 shadow-sm"
                                    style={{ backgroundColor: colors.card, borderColor: colors.border }}
                                >
                                    <View className="flex-row items-start gap-3">
                                        {/* Avatar */}
                                        <View
                                            className="h-10 w-10 items-center justify-center rounded-full shrink-0"
                                            style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }}
                                        >
                                            <Text className="text-sm font-bold" style={{ color: colors.textSecondary }}>
                                                {report.initials}
                                            </Text>
                                        </View>

                                        <View className="flex-1">
                                            <View className="flex-row justify-between items-start">
                                                <View>
                                                    <Text className="font-bold text-sm" style={{ color: colors.text }}>
                                                        {report.name}
                                                    </Text>
                                                    <Text className="text-xs" style={{ color: colors.textSecondary }}>
                                                        {report.team} • {report.time}
                                                    </Text>
                                                </View>
                                                <View
                                                    className="rounded px-2 py-0.5"
                                                    style={{
                                                        backgroundColor: report.status === 'done'
                                                            ? (isDark ? 'rgba(22,163,74,0.2)' : '#f0fdf4')
                                                            : (isDark ? 'rgba(234,179,8,0.2)' : '#fefce8'),
                                                    }}
                                                >
                                                    <Text
                                                        className="text-[10px] font-bold"
                                                        style={{
                                                        color: report.status === 'done' ? colors.status.completed : colors.status.pending,
                                                        }}
                                                    >
                                                        {report.statusLabel}
                                                    </Text>
                                                </View>
                                            </View>

                                            <Text
                                                className="text-sm mt-2 leading-snug"
                                                style={{ color: colors.textSecondary }}
                                            >
                                                {report.content}
                                            </Text>

                                            {/* Image grid placeholder */}
                                            {report.imageCount > 0 && (
                                                <View className="flex-row gap-2 mt-3">
                                                    {[...Array(Math.min(3, report.imageCount))].map((_, i) => (
                                                        <View
                                                            key={i}
                                                            className="flex-1 aspect-square rounded items-center justify-center overflow-hidden"
                                                            style={{
                                                                backgroundColor: isDark ? '#374151' : '#f3f4f6',
                                                                opacity: i === 2 && report.imageCount > 3 ? 0.6 : 1,
                                                            }}
                                                        >
                                <Ionicons name="image" size={24} color={colors.textSecondary} />
                                                            {i === 2 && report.imageCount > 3 && (
                                                                <View className="absolute inset-0 items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
                                                                    <Text className="text-sm font-bold text-white">
                                                                        +{report.imageCount - 3}
                                                                    </Text>
                                                                </View>
                                                            )}
                                                        </View>
                                                    ))}
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Summary Note */}
                    <View>
                        <Text className="text-lg font-bold mb-2" style={{ color: colors.text }}>
                            Ghi chú tổng hợp
                        </Text>
                        <TextInput
                            value={summaryNote}
                            onChangeText={setSummaryNote}
                            placeholder="Nhập tóm tắt tình hình hoặc chỉ đạo tiếp theo..."
                            placeholderTextColor={colors.textSecondary}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            className="w-full rounded-lg border p-3 text-sm min-h-[100px]"
                            style={{
                                backgroundColor: colors.card,
                                borderColor: colors.border,
                                color: colors.text,
                            }}
                        />
                    </View>

                    {/* Emergency Section */}
                    <View
                        className="rounded-xl border p-4 mt-2"
                        style={{
                            backgroundColor: isDark ? 'rgba(220,38,38,0.05)' : '#fef2f2',
                            borderColor: isDark ? 'rgba(220,38,38,0.15)' : '#fecdd3',
                        }}
                    >
                        <View className="flex-row items-center gap-2 mb-3">
                            <Ionicons name="warning" size={18} color={colors.status.error} />
                            <Text className="text-sm font-bold" style={{ color: colors.status.error }}>
                                Trạng thái khẩn cấp
                            </Text>
                        </View>
                        <View className="flex-row gap-3">
                            <View className="flex-1 rounded-lg border p-3 flex-row items-center justify-center gap-2"
                                style={{
                                    backgroundColor: isDark ? 'rgba(220,38,38,0.1)' : '#fff',
                                    borderColor: `${colors.primary}30`,
                                }}
                            >
                                <Ionicons name="medkit" size={18} color={colors.primary} />
                                <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
                                    Cần hỗ trợ
                                </Text>
                            </View>
                            <View
                                className="flex-1 rounded-lg p-3 flex-row items-center justify-center gap-2"
                                style={{ backgroundColor: colors.primary }}
                            >
                                <Ionicons name="close-circle" size={18} color="#fff" />
                                <Text className="text-sm font-semibold text-white">Thất bại</Text>
                            </View>
                        </View>
                        <Text
                            className="text-xs mt-2 text-center"
                            style={{ color: isDark ? 'rgba(239,68,68,0.6)' : 'rgba(220,38,38,0.6)' }}
                        >
                            Chỉ sử dụng khi nhiệm vụ không thể tiếp tục hoặc gặp nguy hiểm.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Sticky Footer */}
            <StickyFooterButton
                title="Gửi báo cáo tổng hợp"
                icon="send"
                backgroundColor={colors.secondary}
            />
        </View>
    );
}
