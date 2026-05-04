import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

export type MemberStatus = 'ready' | 'busy' | 'break';

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    status: MemberStatus;
    distance?: string;
    location?: string;
    initials: string;
}

interface MemberCardProps {
    member: TeamMember;
    onCall?: () => void;
    onChat?: () => void;
}

const STATUS_CONFIG: Record<MemberStatus, { label: string; color: string; dotColor: string; bgColor: string }> = {
    ready: { label: 'SẴN SÀNG', color: '#15803d', dotColor: '#22c55e', bgColor: '#f0fdf4' },
    busy: { label: 'BẬN', color: '#dc2626', dotColor: '#ef4444', bgColor: '#fef2f2' },
    break: { label: 'TẠM NGHỈ', color: '#ea580c', dotColor: '#f97316', bgColor: '#fff7ed' },
};

const ROLE_CONFIG: Record<string, { color: string; bgColor: string }> = {
    'Y tế': { color: '#1565C0', bgColor: '#e3f2fd' },
    'Hậu cần': { color: '#7c3aed', bgColor: '#f5f3ff' },
    'Cứu hộ': { color: '#d97706', bgColor: '#fffbeb' },
    'Lái xe': { color: '#0d9488', bgColor: '#f0fdfa' },
};

export default function MemberCard({ member, onCall, onChat }: MemberCardProps) {
    const { colors, isDark } = useTheme();
    const status = STATUS_CONFIG[member.status];
    const roleStyle = ROLE_CONFIG[member.role] ?? { color: colors.textSecondary, bgColor: colors.surface };

    return (
        <View
            className="flex-row items-center gap-4 rounded-2xl p-4 shadow-sm"
            style={{ backgroundColor: colors.card }}
        >
            {/* Avatar with status dot */}
            <View className="relative">
                <View
                    className="h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: colors.surface }}
                >
                    <Text className="text-base font-bold" style={{ color: colors.textSecondary }}>
                        {member.initials}
                    </Text>
                </View>
                <View
                    className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2"
                    style={{
                        backgroundColor: status.dotColor,
                        borderColor: colors.card,
                    }}
                />
            </View>

            {/* Info */}
            <View className="flex-1 min-w-0">
                <View className="flex-row items-start justify-between mb-1">
                    <Text
                        className="text-base font-bold"
                        style={{ color: colors.text }}
                        numberOfLines={1}
                    >
                        {member.name}
                    </Text>
                    <View
                        className="rounded-md px-2 py-1"
                        style={{
                            backgroundColor: isDark ? `${status.color}20` : status.bgColor,
                        }}
                    >
                        <Text
                            className="text-[10px] font-bold tracking-wider"
                            style={{ color: isDark ? `${status.color}cc` : status.color }}
                        >
                            {status.label}
                        </Text>
                    </View>
                </View>
                <View className="flex-row items-center gap-2">
                    <View
                        className="rounded px-2 py-0.5"
                        style={{ backgroundColor: isDark ? `${roleStyle.color}20` : roleStyle.bgColor }}
                    >
                        <Text
                            className="text-xs font-semibold"
                            style={{ color: roleStyle.color }}
                        >
                            {member.role}
                        </Text>
                    </View>
                    <Text
                        className="text-xs"
                        style={{ color: colors.textSecondary }}
                        numberOfLines={1}
                    >
                        {member.distance ?? member.location ?? ''}
                    </Text>
                </View>
            </View>

            {/* Action button */}
            <TouchableOpacity
                onPress={member.status === 'busy' ? onChat : onCall}
                className="h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.surface }}
            >
                <Ionicons
                    name={member.status === 'busy' ? 'chatbubble-outline' : 'call-outline'}
                    size={20}
                    color={colors.textSecondary}
                />
            </TouchableOpacity>
        </View>
    );
}
