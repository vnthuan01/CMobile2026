import '@/global.css';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface UpdateProfileCitizenScreenProps {
    onBack?: () => void;
}

export default function UpdateProfileCitizenScreen({
    onBack,
}: UpdateProfileCitizenScreenProps) {
    const { bottom } = useSafeAreaInsets();
    const { colors, isDark } = useTheme();

    const [fullName, setFullName] = useState('Nguyễn Văn An');
    const [email, setEmail] = useState('an.nguyen@example.com');
    const [phone, setPhone] = useState('0901 234 567');
    const [address, setAddress] = useState(
        'Số 1, Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    );

    const renderInput = (
        label: string,
        value: string,
        onChange: (v: string) => void,
        opts?: { type?: string; multiline?: boolean; rows?: number; verified?: boolean },
    ) => (
        <View className="gap-1.5">
            <Text className="text-sm font-semibold ml-1" style={{ color: colors.textSecondary }}>
                {label}
            </Text>
            <View className="relative">
                {opts?.multiline ? (
                    <TextInput
                        value={value}
                        onChangeText={onChange}
                        multiline
                        numberOfLines={opts?.rows ?? 3}
                        textAlignVertical="top"
                        className="w-full rounded-lg border p-4 text-base"
                        style={{
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                            color: colors.text,
                        }}
                    />
                ) : (
                    <TextInput
                        value={value}
                        onChangeText={onChange}
                        keyboardType={
                            opts?.type === 'email' ? 'email-address' : opts?.type === 'tel' ? 'phone-pad' : 'default'
                        }
                        className="w-full rounded-lg border h-12 px-4 text-base"
                        style={{
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                            color: colors.text,
                            paddingRight: opts?.verified ? 40 : 16,
                        }}
                    />
                )}
                {opts?.verified && (
                    <View className="absolute right-3 top-1/2" style={{ transform: [{ translateY: -10 }] }}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.status.completed} />
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            <ScreenHeader title="Cập nhật hồ sơ" onBack={onBack} />

            <ScrollView
                contentContainerStyle={{ paddingBottom: bottom + 24 }}
                className="flex-1"
                showsVerticalScrollIndicator={false}
            >
                {/* Avatar */}
                <View className="items-center p-6">
                    <View className="relative">
                        <View
                            className="h-32 w-32 rounded-full items-center justify-center border-4 shadow-lg overflow-hidden"
                            style={{
                                backgroundColor: colors.surface,
                                borderColor: colors.card,
                            }}
                        >
                            <Ionicons name="person" size={56} color={colors.textSecondary} />
                        </View>
                        <TouchableOpacity
                            className="absolute bottom-1 right-1 p-2 rounded-full shadow-md border-2"
                            style={{
                                backgroundColor: colors.primary,
                                borderColor: colors.card,
                            }}
                        >
                            <Ionicons name="camera" size={16} color={colors.white} />
                        </TouchableOpacity>
                    </View>
                    <View className="mt-4 items-center">
                        <Text className="text-xl font-bold" style={{ color: colors.text }}>
                            {fullName}
                        </Text>
                        <Text className="text-sm" style={{ color: colors.textSecondary }}>
                            Công dân Việt Nam
                        </Text>
                    </View>
                </View>

                {/* Form */}
                <View className="px-6 gap-5">
                    {renderInput('Họ và tên', fullName, setFullName, { verified: true })}
                    {renderInput('Email', email, setEmail, { type: 'email', verified: true })}
                    {renderInput('Số điện thoại', phone, setPhone, { type: 'tel' })}
                    {renderInput('Địa chỉ', address, setAddress, { multiline: true, rows: 3 })}
                </View>

                {/* Buttons */}
                <View className="p-6 gap-3">
                    <TouchableOpacity
                        className="w-full items-center justify-center h-14 rounded-xl shadow-lg"
                        style={{
                            backgroundColor: colors.primary,
                            shadowColor: colors.primary,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.2,
                            shadowRadius: 8,
                            elevation: 6,
                        }}
                    >
                        <Text className="text-white font-bold text-base">Cập nhật</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={onBack}
                        className="w-full items-center justify-center h-12 rounded-xl"
                        style={{ backgroundColor: colors.surface }}
                    >
                        <Text className="font-semibold text-base" style={{ color: colors.textSecondary }}>
                            Hủy bỏ
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
