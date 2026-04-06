import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

export type TaskPriority = 'low' | 'medium' | 'high' | 'emergency';
export type TaskStatus = 'done' | 'pending' | 'unassigned';

export interface TaskItem {
    id: string;
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    assignee?: string;
    assigneeCount?: number;
}

interface TaskCardProps {
    task: TaskItem;
    onPress?: () => void;
}

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; borderColor: string; bgColor: string }> = {
    low: { label: 'Thấp', color: '#6b7280', borderColor: '#d1d5db', bgColor: '#f3f4f6' },
    medium: { label: 'Trung bình', color: '#1565C0', borderColor: '#1565C020', bgColor: '#e3f2fd' },
    high: { label: 'Cao', color: '#F05A53', borderColor: '#F05A5320', bgColor: '#fff1f0' },
    emergency: { label: 'Khẩn cấp', color: '#D32F2F', borderColor: '#D32F2F20', bgColor: '#fef2f2' },
};

export default function TaskCard({ task, onPress }: TaskCardProps) {
    const { colors, isDark } = useTheme();
    const priority = PRIORITY_CONFIG[task.priority];
    const isDone = task.status === 'done';

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="overflow-hidden rounded-xl border shadow-sm"
            style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderLeftWidth: 4,
                borderLeftColor: isDone ? '#22c55e' : priority.color,
                opacity: isDone ? 0.6 : 1,
            }}
        >
            <View className="flex-row items-start p-3">
                {/* Checkbox */}
                <View className="mr-3 pt-1 shrink-0">
                    {isDone ? (
                        <View className="h-6 w-6 items-center justify-center rounded-full bg-green-600">
                            <Ionicons name="checkmark" size={14} color="#fff" />
                        </View>
                    ) : (
                        <View
                            className="h-5 w-5 rounded-full border-2"
                            style={{ borderColor: colors.border }}
                        />
                    )}
                </View>

                {/* Content */}
                <View className="flex-1 min-w-0">
                    <View className="flex-row items-start justify-between mb-1">
                        <Text
                            className="text-base font-bold flex-1"
                            style={{
                                color: colors.text,
                                textDecorationLine: isDone ? 'line-through' : 'none',
                            }}
                            numberOfLines={1}
                        >
                            {task.title}
                        </Text>
                        {!isDone && (
                            <Ionicons name="ellipsis-horizontal" size={20} color={colors.icon} />
                        )}
                    </View>

                    <Text
                        className="text-sm mb-3"
                        style={{ color: colors.textSecondary }}
                        numberOfLines={1}
                    >
                        {task.description}
                    </Text>

                    <View className="flex-row items-center justify-between">
                        {/* Assignee */}
                        <View className="flex-row items-center">
                            {task.status === 'unassigned' ? (
                                <>
                                    <View
                                        className="h-7 w-7 items-center justify-center rounded-full border-2"
                                        style={{
                                            backgroundColor: colors.surface,
                                            borderColor: colors.card,
                                        }}
                                    >
                                        <Ionicons name="person-add" size={12} color={colors.icon} />
                                    </View>
                                    <Text className="ml-2 text-xs italic" style={{ color: colors.icon }}>
                                        Chưa giao
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <View
                                        className="h-7 w-7 items-center justify-center rounded-full"
                                        style={{ backgroundColor: colors.surface }}
                                    >
                                        <Ionicons name="person" size={14} color={colors.icon} />
                                    </View>
                                    {task.assignee && (
                                        <Text className="ml-2 text-xs font-medium" style={{ color: colors.textSecondary }}>
                                            {task.assignee}
                                        </Text>
                                    )}
                                    {(task.assigneeCount ?? 0) > 1 && (
                                        <View
                                            className="ml-[-6px] h-7 w-7 items-center justify-center rounded-full border-2"
                                            style={{
                                                backgroundColor: colors.surface,
                                                borderColor: colors.card,
                                            }}
                                        >
                                            <Text className="text-[10px] font-bold" style={{ color: colors.textSecondary }}>
                                                +{(task.assigneeCount ?? 1) - 1}
                                            </Text>
                                        </View>
                                    )}
                                </>
                            )}
                        </View>

                        {/* Priority badge */}
                        <View
                            className="rounded-lg px-2 py-1"
                            style={{
                                backgroundColor: isDark ? `${priority.color}18` : priority.bgColor,
                                borderWidth: 1,
                                borderColor: isDark ? `${priority.color}30` : priority.borderColor,
                            }}
                        >
                            <Text
                                className="text-xs font-bold"
                                style={{ color: priority.color }}
                            >
                                {isDone ? 'Xong' : priority.label}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}
