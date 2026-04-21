import '@/global.css';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type EmergencyType = 'medical' | 'fire' | 'trapped';

interface NewSOSForVolunteerScreenProps {
    onBack?: () => void;
    defaultType?: string;
    isEmergencyDefault?: boolean;
}

const EMERGENCY_TYPES: {
    id: EmergencyType;
    icon: string;
    label: string;
    iconColor: string;
    bgColor: string;
    darkBgColor: string;
}[] = [
        {
            id: 'medical',
            icon: 'medkit',
            label: 'Y tế',
            iconColor: '#dc2626',
            bgColor: '#fee2e2',
            darkBgColor: 'rgba(220,38,38,0.2)',
        },
        {
            id: 'fire',
            icon: 'flame',
            label: 'Hỏa hoạn',
            iconColor: '#ea580c',
            bgColor: '#ffedd5',
            darkBgColor: 'rgba(234,88,12,0.2)',
        },
        {
            id: 'trapped',
            icon: 'person',
            label: 'Mắc kẹt',
            iconColor: '#6b7280',
            bgColor: '#f3f4f6',
            darkBgColor: 'rgba(107,114,128,0.2)',
        },
    ];

export default function NewSOSForVolunteerScreen({
    onBack,
    defaultType,
    isEmergencyDefault,
}: NewSOSForVolunteerScreenProps) {
    const { bottom } = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const [selectedType, setSelectedType] = useState<EmergencyType | null>((defaultType as EmergencyType) || 'medical');
    const [safeWord, setSafeWord] = useState('');

    useEffect(() => {
        if (defaultType === 'medical' || defaultType === 'fire' || defaultType === 'trapped') {
            setSelectedType(defaultType);
        } else if (isEmergencyDefault) {
            setSelectedType('medical');
        }
    }, [defaultType, isEmergencyDefault]);

    // Pulse animation
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(0.7)).current;

    useState(() => {
        Animated.loop(
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.3,
                        duration: 1200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1200,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.sequence([
                    Animated.timing(opacityAnim, {
                        toValue: 0,
                        duration: 1200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 0.7,
                        duration: 1200,
                        useNativeDriver: true,
                    }),
                ]),
            ]),
        ).start();
    });

    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            {/* Header */}
            <ScreenHeader
                title="Tạo SOS mới"
                onBack={onBack}
                rightAction={
                    <TouchableOpacity className="relative p-2">
                        <Ionicons name="settings-outline" size={24} color={colors.text} />
                        <View className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
                    </TouchableOpacity>
                }
            />

            <ScrollView
                contentContainerStyle={{ paddingBottom: bottom + 40, alignItems: 'center' }}
                className="flex-1"
                showsVerticalScrollIndicator={false}
            >
                {/* Status Header */}
                <View className="items-center pt-2">
                    <View className="flex-row items-center gap-2 mb-1">
                        <View className="h-2.5 w-2.5 rounded-full bg-green-500" />
                        <Text className="text-sm font-bold uppercase tracking-wider" style={{ color: colors.text }}>
                            Đang hoạt động
                        </Text>
                    </View>
                    <Text className="text-xs font-mono mt-1" style={{ color: colors.textSecondary }}>
                        GPS: 10.7626° N, 106.6601° E
                    </Text>
                </View>

                {/* Title */}
                <View className="items-center mt-6 mb-4 px-6">
                    <Text className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: colors.text }}>
                        KHẨN CẤP
                    </Text>
                    <Text className="text-sm leading-relaxed text-center" style={{ color: colors.textSecondary }}>
                        {isEmergencyDefault ? 'SOS khẩn cấp đã được chọn mặc định cho bạn. Hãy kiểm tra nhanh loại sự cố rồi gửi tín hiệu cầu cứu GPS.' : 'Giữ nút bên dưới trong 3 giây để phát tín hiệu cầu cứu GPS.'}
                    </Text>
                </View>

                {/* Map Preview */}
                <View className="w-full px-6 mb-6">
                    <View
                        className="w-full h-32 rounded-xl overflow-hidden border items-center justify-center"
                        style={{
                        backgroundColor: colors.surface,
                            borderColor: colors.border,
                        }}
                    >
                        <View className="flex-row items-center gap-1 px-3 py-1.5 rounded-full shadow-lg mb-2" style={{ backgroundColor: colors.card }}>
                            <Ionicons name="navigate" size={14} color={colors.primary} />
                            <Text className="text-xs font-bold" style={{ color: colors.text }}>
                                Vị trí hiện tại
                            </Text>
                        </View>
                        <TouchableOpacity
                            className="flex-row items-center gap-1 px-3 py-1.5 rounded-lg shadow-md"
                            style={{ backgroundColor: colors.primary }}
                        >
                            <Ionicons name="create-outline" size={14} color={colors.white} />
                            <Text className="text-[10px] font-semibold uppercase tracking-wide text-white">
                                Chọn vị trí khác
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View className="flex-row items-center justify-between mt-2 px-1">
                        <Text className="text-[10px]" style={{ color: colors.textSecondary }}>
                            Độ chính xác:{' '}
                            <Text style={{ color: colors.status.completed }} className="font-medium">
                                Cao (~5m)
                            </Text>
                        </Text>
                        <TouchableOpacity>
                            <Text className="text-[10px]" style={{ color: colors.primary }}>
                                Làm mới GPS
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* SOS Button */}
                <View className="items-center mb-8">
                    <View className="relative">
                        {/* Pulse ring */}
                        <Animated.View
                            style={{
                                position: 'absolute',
                                width: 160,
                                height: 160,
                                borderRadius: 80,
                                borderWidth: 2,
                                borderColor: colors.primary,
                                transform: [{ scale: pulseAnim }],
                                opacity: opacityAnim,
                            }}
                        />
                        <TouchableOpacity
                            className="w-40 h-40 rounded-full items-center justify-center"
                            style={{
                                backgroundColor: isDark ? '#1a1a2e' : '#1e1e2e',
                                borderWidth: 4,
                                borderColor: colors.primary,
                                shadowColor: colors.primary,
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 0.3,
                                shadowRadius: 15,
                                elevation: 10,
                            }}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="warning" size={48} color={colors.primary} />
                            <Text className="text-white font-bold text-base uppercase tracking-wide mt-1">
                                Gửi Tín Hiệu
                            </Text>
                            <Text className="text-[10px] font-medium mt-0.5 uppercase tracking-widest" style={{ color: `${colors.primary}cc` }}>
                                Nguy Hiểm
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Emergency Type Grid */}
                <View className="w-full px-6 mb-6">
                    <View className="flex-row gap-3">
                        {EMERGENCY_TYPES.map((type) => (
                            <TouchableOpacity
                                key={type.id}
                                onPress={() => setSelectedType(type.id)}
                                className="flex-1 flex-col items-center justify-center gap-2 rounded-xl border p-2.5"
                                style={{
                                    backgroundColor: selectedType === type.id
                                        ? `${type.iconColor}15`
                                        : colors.card,
                                    borderColor: selectedType === type.id
                                        ? `${type.iconColor}50`
                                        : colors.border,
                                }}
                            >
                                <View
                                    className="h-9 w-9 items-center justify-center rounded-full"
                                    style={{ backgroundColor: isDark ? type.darkBgColor : type.bgColor }}
                                >
                                    <Ionicons name={type.icon as any} size={20} color={type.iconColor} />
                                </View>
                                <Text
                                    className="text-[11px] font-semibold"
                                    style={{ color: colors.text }}
                                >
                                    {type.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Evidence Section */}
                <View className="w-full px-6 mb-6">
                    <View className="flex-row items-center justify-between mb-2 px-1">
                        <Text className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                            Cung cấp bằng chứng
                        </Text>
                        <View
                            className="px-2 py-0.5 rounded-full"
                            style={{                                 backgroundColor: colors.surface, }}
                        >
                            <Text className="text-[10px]" style={{ color: colors.textSecondary }}>
                                Minh bạch
                            </Text>
                        </View>
                    </View>
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            className="flex-1 flex-row items-center gap-3 rounded-lg border p-3"
                            style={{ backgroundColor: colors.card, borderColor: colors.border }}
                        >
                            <View
                                className="h-10 w-10 items-center justify-center rounded-full"
                                style={{ backgroundColor: `${colors.secondary}18` }}
                            >
                                <Ionicons name="camera" size={22} color={colors.secondary} />
                            </View>
                            <View>
                                <Text className="text-xs font-bold" style={{ color: colors.text }}>Chụp ảnh</Text>
                                <Text className="text-[10px]" style={{ color: colors.textSecondary }}>Gửi hiện trường</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-1 flex-row items-center gap-3 rounded-lg border p-3"
                            style={{ backgroundColor: colors.card, borderColor: colors.border }}
                        >
                            <View
                                className="h-10 w-10 items-center justify-center rounded-full"
                                style={{ backgroundColor: `${colors.accent}18` }}
                            >
                                <Ionicons name="videocam" size={22} color={colors.accent} />
                            </View>
                            <View>
                                <Text className="text-xs font-bold" style={{ color: colors.text }}>Quay video</Text>
                                <Text className="text-[10px]" style={{ color: colors.textSecondary }}>Ghi lại sự cố</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Safe Word Input */}
                <View className="w-full px-6 mb-4">
                    <Text className="text-sm font-medium mb-2 px-1" style={{ color: colors.textSecondary }}>
                        Mật mã an toàn (Safe-word)
                    </Text>
                    <View className="relative">
                        <View className="absolute left-4 top-1/2 z-10" style={{ transform: [{ translateY: -10 }] }}>
                            <Ionicons name="lock-closed" size={20} color={colors.textSecondary} />
                        </View>
                        <TextInput
                            value={safeWord}
                            onChangeText={setSafeWord}
                            placeholder="Nhập mật mã để xác nhận an toàn..."
                            placeholderTextColor={colors.textSecondary}
                            secureTextEntry
                            className="w-full rounded-lg border py-3.5 pl-11 pr-4 text-sm"
                            style={{
                                backgroundColor: colors.card,
                                borderColor: colors.border,
                                color: colors.text,
                            }}
                        />
                    </View>
                    <Text
                        className="text-[10px] mt-2 text-center italic"
                        style={{ color: colors.textSecondary, opacity: 0.8 }}
                    >
                        Nhập sai mật mã 3 lần sẽ tự động kích hoạt chế độ im lặng.
                    </Text>
                </View>
            </ScrollView>

            {/* Slide to Safety Bar */}
            <View className="px-6 pb-8">
                <View
                    className="relative h-14 rounded-full overflow-hidden flex-row items-center p-1 border"
                    style={{
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                    }}
                >
                    <View className="absolute inset-0 items-center justify-center">
                        <Text
                            className="text-sm font-semibold tracking-widest uppercase"
                            style={{ color: colors.textSecondary, opacity: 0.5 }}
                        >
                            Trượt để báo an toàn
                        </Text>
                    </View>
                    <View
                        className="h-12 w-14 items-center justify-center rounded-full bg-green-500 shadow-lg z-10"
                    >
                        <Ionicons name="chevron-forward" size={24} color={colors.white} />
                    </View>
                </View>
            </View>
        </View>
    );
}
