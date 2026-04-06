import '@/global.css';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import TaskCard, { TaskItem } from '@/src/components/common/TaskCard';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AllocateTaskScreenProps {
    onBack?: () => void;
}

const MOCK_TASKS: TaskItem[] = [
    {
        id: '1',
        title: 'Khảo sát địa hình',
        description: 'Kiểm tra khu vực ngập lụt',
        priority: 'medium',
        status: 'done',
        assignee: 'Hùng Nguyễn',
    },
    {
        id: '2',
        title: 'Vận chuyển gạo',
        description: 'Chuyển 50 bao gạo từ kho bãi đến điểm tập kết.',
        priority: 'high',
        status: 'pending',
        assignee: 'Minh Trí',
        assigneeCount: 2,
    },
    {
        id: '3',
        title: 'Phát thuốc men',
        description: 'Phân phát bộ sơ cứu cho các hộ bị cô lập.',
        priority: 'emergency',
        status: 'pending',
        assignee: 'Lan Anh',
    },
    {
        id: '4',
        title: 'Báo cáo cuối ngày',
        description: 'Tổng hợp số liệu và gửi về trung tâm.',
        priority: 'low',
        status: 'unassigned',
    },
];

const PRIORITY_OPTIONS = [
    { id: 'low', label: 'Thấp', color: '#6b7280' },
    { id: 'medium', label: 'Trung bình', color: '#1565C0' },
    { id: 'high', label: 'Cao', color: '#F05A53' },
    { id: 'emergency', label: 'Khẩn cấp', color: '#D32F2F' },
];

const MOCK_TEAM = [
    { name: 'Minh Trí', initials: 'MT', selected: true },
    { name: 'Thanh Hà', initials: 'TH', selected: false },
    { name: 'Quốc Bảo', initials: 'QB', selected: false },
];

export default function AllocateTaskScreen({ onBack }: AllocateTaskScreenProps) {
    const { bottom } = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const [selectedPriority, setSelectedPriority] = useState('medium');
    const [taskName, setTaskName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<string[]>(['Minh Trí']);

    const toggleMember = (name: string) => {
        setSelectedMembers(prev =>
            prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
        );
    };

    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            {/* Header */}
            <ScreenHeader
                title="Phân công Nhiệm vụ"
                onBack={onBack}
                backgroundColor={colors.secondary}
                titleColor="#fff"
                rightAction={
                    <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full">
                        <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
                    </TouchableOpacity>
                }
            />

            <ScrollView
                contentContainerStyle={{ paddingBottom: bottom + 40 }}
                className="flex-1"
                showsVerticalScrollIndicator={false}
            >
                {/* Main Mission */}
                <View className="p-4 gap-4">
                    <Text className="text-xl font-bold leading-tight" style={{ color: colors.text }}>
                        Nhiệm vụ Chính
                    </Text>

                    {/* Mission Hero Card */}
                    <View
                        className="h-48 rounded-xl overflow-hidden items-center justify-center shadow-md"
                        style={{ backgroundColor: isDark ? '#374151' : '#d1d5db' }}
                    >
                        <View className="absolute inset-0 items-start justify-end p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                            <View className="rounded px-2 py-1 mb-2 border" style={{ backgroundColor: '#D32F2F', borderColor: '#991b1b' }}>
                                <Text className="text-xs font-semibold text-white">Khẩn cấp</Text>
                            </View>
                            <Text className="text-white text-xl font-bold leading-tight mb-1">
                                Cứu trợ lương thực tại Xã A
                            </Text>
                            <View className="flex-row items-center">
                                <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.9)" />
                                <Text className="text-sm ml-1" style={{ color: 'rgba(255,255,255,0.9)' }}>
                                    Hết hạn: 14:00 hôm nay
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            className="absolute top-3 right-3 p-2 rounded-full border"
                            style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)' }}
                        >
                            <Ionicons name="map-outline" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Progress Card */}
                    <View
                        className="rounded-xl border p-4 shadow-sm"
                        style={{ backgroundColor: colors.card, borderColor: colors.border }}
                    >
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-sm font-medium" style={{ color: colors.text }}>
                                Tiến độ phân công
                            </Text>
                            <Text className="text-xs" style={{ color: colors.textSecondary }}>
                                2/6 hoàn thành
                            </Text>
                        </View>
                        <View className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }}>
                            <View className="h-full rounded-full" style={{ width: '35%', backgroundColor: colors.secondary }} />
                        </View>
                    </View>
                </View>

                {/* Task List */}
                <View className="px-4 pb-4">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-bold" style={{ color: colors.text }}>
                            Danh sách công việc
                        </Text>
                        <TouchableOpacity className="flex-row items-center px-2 py-1 rounded">
                            <Ionicons name="filter-outline" size={18} color={colors.secondary} />
                            <Text className="text-sm font-medium ml-1" style={{ color: colors.secondary }}>
                                Lọc
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View className="gap-3">
                        {MOCK_TASKS.map((task) => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                    </View>
                </View>

                {/* FAB */}
                <View className="absolute bottom-24 right-6 z-40">
                    <TouchableOpacity
                        className="h-14 w-14 items-center justify-center rounded-full shadow-lg"
                        style={{
                            backgroundColor: colors.primary,
                            shadowColor: colors.primary,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.4,
                            shadowRadius: 8,
                            elevation: 8,
                        }}
                    >
                        <Ionicons name="add" size={32} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* New Subtask Form */}
                <View
                    className="mx-4 mb-8 mt-6 rounded-t-xl border p-5 shadow-md"
                    style={{ backgroundColor: colors.card, borderColor: colors.border }}
                >
                    {/* Drag handle */}
                    <View className="self-center mb-4 mt-[-4px]">
                        <View
                            className="h-1.5 w-12 rounded-full"
                            style={{ backgroundColor: isDark ? '#4b5563' : '#d1d5db' }}
                        />
                    </View>

                    <Text className="font-bold text-lg mb-4" style={{ color: colors.text }}>
                        Thêm nhiệm vụ con mới
                    </Text>

                    <View className="gap-4">
                        {/* Task name */}
                        <View>
                            <Text className="text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>
                                Tên công việc
                            </Text>
                            <TextInput
                                value={taskName}
                                onChangeText={setTaskName}
                                placeholder="Nhập tên công việc..."
                                placeholderTextColor={colors.textSecondary}
                                className="w-full rounded-lg border p-2.5 text-sm"
                                style={{
                                    backgroundColor: isDark ? '#1f2937' : '#f9fafb',
                                    borderColor: colors.border,
                                    color: colors.text,
                                }}
                            />
                        </View>

                        {/* Priority */}
                        <View>
                            <Text className="text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                                Mức độ ưu tiên
                            </Text>
                            <View className="flex-row gap-2">
                                {PRIORITY_OPTIONS.map((p) => (
                                    <TouchableOpacity
                                        key={p.id}
                                        onPress={() => setSelectedPriority(p.id)}
                                        className="flex-1 flex-col items-center justify-center p-2 rounded-lg border"
                                        style={{
                                            borderColor: selectedPriority === p.id ? p.color : colors.border,
                                            backgroundColor: selectedPriority === p.id
                                                ? `${p.color}10`
                                                : 'transparent',
                                        }}
                                    >
                                        <View
                                            className="h-3 w-3 rounded-full mb-1"
                                            style={{ backgroundColor: p.color }}
                                        />
                                        <Text
                                            className="text-[10px] font-medium"
                                            style={{
                                                color: selectedPriority === p.id ? p.color : colors.textSecondary,
                                                fontWeight: selectedPriority === p.id ? '700' : '500',
                                            }}
                                        >
                                            {p.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Assign members */}
                        <View>
                            <Text className="text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                                Giao cho thành viên
                            </Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ gap: 16, paddingBottom: 8 }}
                            >
                                {MOCK_TEAM.map((member) => {
                                    const isSelected = selectedMembers.includes(member.name);
                                    return (
                                        <TouchableOpacity
                                            key={member.name}
                                            onPress={() => toggleMember(member.name)}
                                            className="flex-col items-center shrink-0"
                                            style={{ opacity: isSelected ? 1 : 0.6 }}
                                        >
                                            <View className="relative">
                                                <View
                                                    className="h-12 w-12 items-center justify-center rounded-full border-2"
                                                    style={{
                                                        backgroundColor: isDark ? '#374151' : '#e5e7eb',
                                                        borderColor: isSelected ? colors.secondary : 'transparent',
                                                    }}
                                                >
                                                    <Text className="text-sm font-bold" style={{ color: colors.textSecondary }}>
                                                        {member.initials}
                                                    </Text>
                                                </View>
                                                {isSelected && (
                                                    <View
                                                        className="absolute bottom-0 right-0 h-5 w-5 items-center justify-center rounded-full border-2"
                                                        style={{ backgroundColor: colors.secondary, borderColor: colors.card }}
                                                    >
                                                        <Ionicons name="checkmark" size={10} color="#fff" />
                                                    </View>
                                                )}
                                            </View>
                                            <Text
                                                className="text-xs mt-1"
                                                style={{
                                                    color: isSelected ? colors.secondary : colors.textSecondary,
                                                    fontWeight: isSelected ? '600' : '400',
                                                }}
                                            >
                                                {member.name}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                                {/* Add button */}
                                <TouchableOpacity className="flex-col items-center shrink-0" style={{ opacity: 0.6 }}>
                                    <View
                                        className="h-12 w-12 items-center justify-center rounded-full"
                                        style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }}
                                    >
                                        <Ionicons name="people-outline" size={22} color={colors.textSecondary} />
                                    </View>
                                    <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>Thêm</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>

                        {/* Submit */}
                        <TouchableOpacity
                            className="w-full flex-row items-center justify-center rounded-lg py-3 mt-2 shadow-lg"
                            style={{
                                backgroundColor: colors.primary,
                                shadowColor: colors.primary,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 6,
                            }}
                        >
                            <Ionicons name="send" size={18} color="#fff" />
                            <Text className="text-white font-bold ml-2">Tạo nhiệm vụ</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
