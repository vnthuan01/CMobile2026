import '@/global.css';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SettingsScreenProps {
    onBack?: () => void;
}

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
    const { bottom } = useSafeAreaInsets();
    const [notifications, setNotifications] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [vibrationEnabled, setVibrationEnabled] = useState(true);
    const [locationEnabled, setLocationEnabled] = useState(true);

    const { colors, isDark, toggleTheme } = useTheme();

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const settings = await AsyncStorage.getItem('app_settings');
            if (settings) {
                const parsed = JSON.parse(settings);
                setNotifications(parsed.notifications ?? true);
                setSoundEnabled(parsed.soundEnabled ?? true);
                setVibrationEnabled(parsed.vibrationEnabled ?? true);
                setLocationEnabled(parsed.locationEnabled ?? true);
            }
        } catch {
        }
    };

    const saveSettings = async (key: string, value: any) => {
        try {
            const settings = await AsyncStorage.getItem('app_settings');
            const parsed = settings ? JSON.parse(settings) : {};
            parsed[key] = value;
            await AsyncStorage.setItem('app_settings', JSON.stringify(parsed));
        } catch {
        }
    };

    return (
        <View
            className="flex-1"
            style={{ backgroundColor: colors.background }}
        >
            <ScreenHeader title="Cài đặt" onBack={onBack} />

            <ScrollView
                contentContainerStyle={{ paddingBottom: bottom + 32 }}
                className="flex-1"
                showsVerticalScrollIndicator={false}
            >
                {/* Appearance Section */}
                <View
                    className="mt-4 px-4 py-4"
                    style={{ backgroundColor: colors.card }}
                >
                    <Text className="mb-4 text-base font-bold" style={{ color: colors.text }}>
                        Giao diện
                    </Text>
                    <View
                        className="flex-row items-center justify-between border-b px-0 py-2"
                        style={{ borderColor: colors.border }}
                    >
                        <View className="flex-row items-center gap-3">
                            <View
                                className="h-10 w-10 items-center justify-center rounded-full"
                                style={{ backgroundColor: colors.surface }}
                            >
                                <Ionicons name="moon-outline" size={20} color={colors.primary} />
                            </View>
                            <Text className="text-base font-medium" style={{ color: colors.text }}>Chế độ tối</Text>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: colors.border, true: `${colors.primary}66` }}
                            thumbColor={colors.primary}
                        />
                    </View>
                </View>

                {/* Notifications Section */}
                <View className="mt-4" style={{ backgroundColor: colors.card }}>
                    <View className="px-4 py-3">
                        <Text className="text-base font-bold" style={{ color: colors.text }}>Thông báo</Text>
                    </View>

                    <SettingToggle
                        icon="notifications-outline"
                        title="Cho phép thông báo"
                        subtitle="Nhận thông báo về yêu cầu cứu trợ"
                        value={notifications}
                        onValueChange={(val) => {
                            setNotifications(val);
                            saveSettings('notifications', val);
                        }}
                    />

                    <SettingToggle
                        icon="volume-high-outline"
                        title="Âm thanh"
                        subtitle="Phát âm thanh khi có thông báo"
                        value={soundEnabled}
                        onValueChange={(val) => {
                            setSoundEnabled(val);
                            saveSettings('soundEnabled', val);
                        }}
                    />

                    <SettingToggle
                        icon="phone-portrait-outline"
                        title="Rung"
                        subtitle="Rung khi có thông báo"
                        value={vibrationEnabled}
                        onValueChange={(val) => {
                            setVibrationEnabled(val);
                            saveSettings('vibrationEnabled', val);
                        }}
                    />
                </View>

                {/* Privacy Section */}
                <View className="mt-4" style={{ backgroundColor: colors.card }}>
                    <View className="px-4 py-3">
                        <Text className="text-base font-bold" style={{ color: colors.text }}>
                            Quyền riêng tư
                        </Text>
                    </View>

                    <SettingToggle
                        icon="location-outline"
                        title="Vị trí"
                        subtitle="Cho phép truy cập vị trí của bạn"
                        value={locationEnabled}
                        onValueChange={(val) => {
                            setLocationEnabled(val);
                            saveSettings('locationEnabled', val);
                        }}
                    />
                </View>

                {/* App Info Section */}
                <View className="mt-4" style={{ backgroundColor: colors.card }}>
                    <View className="px-4 py-3">
                        <Text className="text-base font-bold" style={{ color: colors.text }}>
                            Thông tin ứng dụng
                        </Text>
                    </View>

                    <SettingItem
                        icon="information-circle-outline"
                        title="Phiên bản"
                        value="1.0.0"
                    />

                    <SettingItem
                        icon="shield-checkmark-outline"
                        title="Chính sách bảo mật"
                        showArrow
                    />

                    <SettingItem
                        icon="document-text-outline"
                        title="Điều khoản sử dụng"
                        showArrow
                    />
                </View>

                {/* Danger Zone */}
                <View className="mt-4" style={{ backgroundColor: colors.card }}>
                    <View className="px-4 py-3">
                        <Text className="text-base font-bold" style={{ color: colors.status.error }}>
                            Vùng nguy hiểm
                        </Text>
                    </View>

                    <TouchableOpacity
                        className="flex-row items-center gap-3 border-b px-4 py-4"
                        style={{ borderColor: colors.border }}
                    >
                        <View className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: `${colors.status.error}12` }}>
                            <Ionicons name="trash-outline" size={20} color={colors.status.error} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-medium" style={{ color: colors.status.error }}>
                                Xóa tài khoản
                            </Text>
                            <Text className="text-xs" style={{ color: colors.textSecondary }}>
                                Xóa vĩnh viễn tài khoản và dữ liệu
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View className="h-8" />
            </ScrollView>
        </View>
    );
}

function SettingToggle({
    icon,
    title,
    subtitle,
    value,
    onValueChange,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
}) {
    const { colors, isDark } = useTheme();

    return (
        <View
            className="flex-row items-center justify-between border-b px-4 py-4"
            style={{ borderColor: colors.border }}
        >
            <View className="flex-row flex-1 items-center gap-3">
                <View
                    className="h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: colors.surface }}
                >
                    <Ionicons name={icon} size={20} color={colors.primary} />
                </View>
                <View className="flex-1">
                    <Text className="text-base font-medium" style={{ color: colors.text }}>{title}</Text>
                    <Text className="text-xs" style={{ color: colors.textSecondary }}>{subtitle}</Text>
                </View>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: colors.border, true: `${colors.primary}66` }}
                thumbColor={value ? colors.primary : colors.white}
            />
        </View>
    );
}

function SettingItem({
    icon,
    title,
    value,
    showArrow,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    value?: string;
    showArrow?: boolean;
}) {
    const { colors, isDark } = useTheme();

    return (
        <TouchableOpacity
            className="flex-row items-center justify-between border-b px-4 py-4"
            style={{ borderColor: colors.border }}
        >
            <View className="flex-row items-center gap-3">
                <View
                    className="h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: colors.surface }}
                >
                    <Ionicons name={icon} size={20} color={colors.primary} />
                </View>
                <Text className="text-base font-medium" style={{ color: colors.text }}>{title}</Text>
            </View>
            {value && <Text className="text-sm" style={{ color: colors.textSecondary }}>{value}</Text>}
            {showArrow && <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
        </TouchableOpacity>
    );
}
