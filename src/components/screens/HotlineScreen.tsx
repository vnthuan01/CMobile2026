import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Linking,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/context/ThemeContext';
import { useBottomContentInset } from '@/src/hooks/useBottomContentInset';

interface HotlineScreenProps {
    onBack?: () => void;
}

const REGIONS = ['Miền Bắc', 'Miền Trung', 'Miền Nam'];

const NATIONAL_HOTLINES = [
    { number: '113', name: 'Cảnh sát', icon: 'local-police', color: 'text-primary' },
    { number: '114', name: 'Cứu hỏa', icon: 'local-fire-department', color: 'text-primary' },
    { number: '115', name: 'Cấp cứu', icon: 'medical-services', color: 'text-primary' },
] as const;

type LocalDirectory = {
    city: string;
    description: string;
    icon: string;
    contacts: {
        name: string;
        number: string;
        icon: string;
        color: string;
        displayNumber?: string;
    }[];
};

const LOCAL_DIRECTORIES: LocalDirectory[] = [
    {
        city: 'Hà Nội',
        description: 'Thủ đô',
        icon: 'location-city',
        contacts: [
            {
                name: 'Tìm kiếm cứu nạn',
                number: '024382578',
                icon: 'flood',
                color: 'text-primary',
            },
            {
                name: 'Cấp thoát nước',
                number: '024382578',
                displayNumber: '024.xxxx',
                icon: 'water-drop',
                color: 'text-secondary',
            },
        ],
    },
    {
        city: 'Hải Phòng',
        description: 'Thành phố cảng',
        icon: 'anchor',
        contacts: [
            {
                name: 'Y tế khẩn cấp',
                number: '0225115',
                icon: 'medical-services',
                color: 'text-primary',
            },
            {
                name: 'Sự cố điện lực',
                number: '19001234',
                displayNumber: '1900.xxxx',
                icon: 'bolt',
                color: 'text-accent',
            },
        ],
    },
    {
        city: 'Quảng Ninh',
        description: 'Vùng ven biển',
        icon: 'landscape',
        contacts: [
            {
                name: 'Phòng chống thiên tai',
                number: '0203xxxx',
                icon: 'tsunami',
                color: 'text-primary',
            },
        ],
    },
];

export default function HotlineScreen({ onBack }: HotlineScreenProps) {
    const router = useRouter();
    const { top } = useSafeAreaInsets();
    const bottomInset = useBottomContentInset(24);
    const { colors } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('Miền Bắc');
    const [expandedCity, setExpandedCity] = useState<string | null>('Hà Nội');

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    const handleCall = (number: string) => {
        const phoneUrl = Platform.select({
            ios: `telprompt:${number}`,
            android: `tel:${number}`,
            default: `tel:${number}`,
        });
        Linking.openURL(phoneUrl);
    };

    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            {/* Header */}
            <View
                className="mb-2 flex-row items-center justify-between border-b px-4 py-3 pb-2"
                style={{ paddingTop: top, borderColor: colors.border, backgroundColor: colors.card }}
            >
                <TouchableOpacity
                    onPress={handleBack}
                    className="h-12 w-12 items-center justify-center rounded-full"
                >
                    <Ionicons
                        name="chevron-back"
                        size={22}
                        color={colors.text}
                    />
                </TouchableOpacity>

                <Text className="flex-1 pr-12 text-center text-lg font-bold" style={{ color: colors.text }}>
                    Hotline Khẩn cấp
                </Text>

                <TouchableOpacity className="flex-row items-center gap-1 rounded-full px-3 py-1.5" style={{ backgroundColor: `${colors.status.error}18` }}>
                    <Ionicons name="alert-circle" size={18} color={colors.status.error} />
                    <Text className="text-sm font-bold" style={{ color: colors.status.error }}>SOS</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: bottomInset }}
                showsVerticalScrollIndicator={false}
            >
                {/* Search Bar */}
                <View className="sticky top-0 z-20 px-4 py-4" style={{ backgroundColor: colors.background }}>
                    <View className="relative flex-row items-center rounded-2xl px-4 shadow-sm" style={{ backgroundColor: colors.card }}>
                        <Ionicons name="search" size={20} color={colors.textSecondary} />
                        <TextInput
                            className="flex-1 py-3.5 pl-3 pr-4 text-base"
                            style={{ color: colors.text }}
                            placeholder="Tìm kiếm tỉnh/thành phố..."
                            placeholderTextColor={colors.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {/* National Emergency */}
                <View className="mb-6 px-4">
                    <Text className="mb-3 px-1 text-sm font-bold uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                        Gọi Khẩn Cấp Quốc Gia
                    </Text>
                    <View className="flex-row gap-3">
                        {NATIONAL_HOTLINES.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => handleCall(item.number)}
                                className="flex-1 items-center justify-center rounded-2xl border-b-4 border-primary p-4 shadow-sm active:scale-95"
                                style={{ backgroundColor: colors.card }}
                            >
                                <View className="mb-2 flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: `${colors.status.error}12` }}>
                                    <Ionicons name={item.number === '113' ? 'shield-checkmark' : item.number === '114' ? 'flame' : 'medkit'} size={28} color={colors.status.error} />
                                </View>
                                <Text className="text-2xl font-black leading-none" style={{ color: colors.text }}>
                                    {item.number}
                                </Text>
                                <Text className="mt-1 text-xs font-semibold" style={{ color: colors.textSecondary }}>
                                    {item.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Regions Tabs */}
                <View className="px-4 pb-4">
                    <View className="flex-row rounded-xl p-1.5 shadow-sm" style={{ backgroundColor: colors.card }}>
                        {REGIONS.map((region) => (
                            <TouchableOpacity
                                key={region}
                                onPress={() => setSelectedRegion(region)}
                                className={`flex-1 rounded-lg py-2.5 ${selectedRegion === region
                                    ? 'bg-primary shadow-md'
                                    : ''
                                    }`}
                                style={selectedRegion !== region ? { backgroundColor: colors.surface } : {}}
                            >
                                <Text
                                    className={`text-center text-sm ${selectedRegion === region
                                        ? 'font-bold text-white'
                                        : 'font-medium'
                                        }`}
                                    style={selectedRegion !== region ? { color: colors.textSecondary } : {}}
                                >
                                    {region}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Local Directory */}
                <View className="flex-col gap-4 px-4">
                    <Text className="px-1 text-sm font-bold uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                        Danh bạ địa phương
                    </Text>

                    {LOCAL_DIRECTORIES.map((dir, index) => (
                        <View
                            key={index}
                            className="overflow-hidden rounded-2xl shadow-sm"
                            style={{ backgroundColor: colors.card }}
                        >
                            <TouchableOpacity
                                onPress={() =>
                                    setExpandedCity(expandedCity === dir.city ? null : dir.city)
                                }
                                className="flex-row items-center justify-between border-b p-4"
                                style={{ borderColor: colors.border }}
                            >
                                <View className="flex-row items-center gap-4">
                                    <View className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${colors.secondary}18` }}>
                                        <Ionicons
                                            name={dir.city === 'Hà Nội' ? 'business' : dir.city === 'Hải Phòng' ? 'boat' : 'map'}
                                            size={24}
                                            color={colors.secondary}
                                        />
                                    </View>
                                    <View>
                                        <Text className="text-lg font-bold" style={{ color: colors.text }}>
                                            {dir.city}
                                        </Text>
                                        <Text className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                                            {dir.description}
                                        </Text>
                                    </View>
                                </View>
                                <View className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: colors.surface }}>
                                    <Ionicons
                                        name={
                                            expandedCity === dir.city
                                                ? 'chevron-up'
                                                : 'chevron-down'
                                        }
                                        size={20}
                                        color={colors.textSecondary}
                                    />
                                </View>
                            </TouchableOpacity>
                            {expandedCity === dir.city && (
                                <View className="space-y-3 p-4" style={{ backgroundColor: colors.surface }}>
                                    {dir.contacts.map((contact, cIndex) => (
                                        <View
                                            key={cIndex}
                                            className="mb-3 flex-row items-center justify-between rounded-xl border p-3"
                                            style={{ borderColor: colors.border, backgroundColor: colors.card }}
                                        >
                                            <View className="flex-row items-center gap-3">
                                                <Ionicons name="information-circle" size={20} color={contact.color.includes('primary') ? colors.primary : contact.color.includes('secondary') ? colors.secondary : colors.status.pending} />
                                                <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                                                    {contact.name}
                                                </Text>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => handleCall(contact.number)}
                                                className={`flex-row items-center gap-2 rounded-lg px-4 py-2 ${contact.displayNumber
                                                    ? 'border'
                                                    : 'shadow-sm'
                                                    }`}
                                                style={contact.displayNumber
                                                    ? { borderColor: colors.border, backgroundColor: colors.card }
                                                    : { backgroundColor: colors.secondary }
                                                }
                                            >
                                                <Ionicons
                                                    name="call"
                                                    size={14}
                                                    color={contact.displayNumber ? colors.textSecondary : colors.white}
                                                />
                                                <Text
                                                    className="text-sm font-bold"
                                                    style={{ color: contact.displayNumber ? colors.text : colors.white }}
                                                >
                                                    {contact.displayNumber || 'Gọi ngay'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    ))}
                    <View className="py-4 text-center">
                        <View className="flex-row items-center justify-center gap-1">
                            <Ionicons name="checkmark-circle" size={14} color={colors.textSecondary} />
                            <Text className="text-xs" style={{ color: colors.textSecondary }}>Dữ liệu đã được lưu offline</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
