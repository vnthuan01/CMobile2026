import '@/global.css';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ChangePasswordScreenProps {
    onBack?: () => void;
}

interface ValidationErrors {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}

const MIN_PASSWORD_LENGTH = 8;

export default function ChangePasswordScreen({ onBack }: ChangePasswordScreenProps) {
    const { bottom } = useSafeAreaInsets();
    const { colors, isDark } = useTheme();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const strengthPalette = {
        error: colors.status.error,
        pending: colors.status.pending,
        warning: colors.status.pending,
        success: colors.status.completed,
        successStrong: colors.status.completed,
    };

    // ─── Validation helpers ───
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);
    const isLongEnough = newPassword.length >= MIN_PASSWORD_LENGTH;

    const strengthChecks = [
        { label: `Ít nhất ${MIN_PASSWORD_LENGTH} ký tự`, passed: isLongEnough },
        { label: 'Có chữ hoa (A-Z)', passed: hasUppercase },
        { label: 'Có chữ thường (a-z)', passed: hasLowercase },
        { label: 'Có số (0-9)', passed: hasNumber },
        { label: 'Có ký tự đặc biệt (!@#...)', passed: hasSpecial },
    ];

    const passedChecks = strengthChecks.filter((c) => c.passed).length;
    const strengthPercent = (passedChecks / strengthChecks.length) * 100;
    const strengthColor =
        strengthPercent <= 20
            ? strengthPalette.error
            : strengthPercent <= 40
                ? strengthPalette.pending
                : strengthPercent <= 60
                    ? strengthPalette.warning
                    : strengthPercent <= 80
                        ? strengthPalette.success
                        : strengthPalette.successStrong;
    const strengthLabel =
        strengthPercent <= 20
            ? 'Rất yếu'
            : strengthPercent <= 40
                ? 'Yếu'
                : strengthPercent <= 60
                    ? 'Trung bình'
                    : strengthPercent <= 80
                        ? 'Mạnh'
                        : 'Rất mạnh';

    const validate = (): boolean => {
        const newErrors: ValidationErrors = {};

        if (!currentPassword.trim()) {
            newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
        }

        if (!newPassword.trim()) {
            newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
        } else if (!isLongEnough) {
            newErrors.newPassword = `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự`;
        } else if (!hasUppercase || !hasLowercase) {
            newErrors.newPassword = 'Mật khẩu phải có cả chữ hoa và chữ thường';
        } else if (!hasNumber) {
            newErrors.newPassword = 'Mật khẩu phải có ít nhất 1 chữ số';
        } else if (newPassword === currentPassword) {
            newErrors.newPassword = 'Mật khẩu mới không được trùng với mật khẩu hiện tại';
        }

        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        setTouched({ currentPassword: true, newPassword: true, confirmPassword: true });

        if (!validate()) return;

        Alert.alert(
            'Xác nhận',
            'Bạn có chắc chắn muốn đổi mật khẩu?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Đổi mật khẩu',
                    style: 'destructive',
                    onPress: () => {
                        // TODO: Call API to change password
                        Alert.alert('Thành công', 'Mật khẩu đã được cập nhật!', [
                            { text: 'OK', onPress: onBack },
                        ]);
                    },
                },
            ],
        );
    };

    const renderPasswordField = (
        label: string,
        value: string,
        onChange: (v: string) => void,
        show: boolean,
        toggleShow: () => void,
        fieldKey: keyof ValidationErrors,
        placeholder: string,
    ) => {
        const error = touched[fieldKey] ? errors[fieldKey] : undefined;
        return (
            <View className="gap-2">
                <Text className="text-sm font-semibold ml-1" style={{ color: colors.text }}>
                    {label}
                </Text>
                <View className="relative">
                    <TextInput
                        value={value}
                        onChangeText={(v) => {
                            onChange(v);
                            if (touched[fieldKey]) {
                                // Re-validate on change after touched
                                setTimeout(() => validate(), 0);
                            }
                        }}
                        onBlur={() => {
                            setTouched((prev) => ({ ...prev, [fieldKey]: true }));
                            validate();
                        }}
                        placeholder={placeholder}
                        placeholderTextColor={colors.textSecondary}
                        secureTextEntry={!show}
                        className="w-full rounded-xl border h-14 px-4 pr-12 text-base"
                        style={{
                            backgroundColor: colors.card,
                            borderColor: error ? colors.status.error : colors.border,
                            color: colors.text,
                        }}
                    />
                    <TouchableOpacity
                        onPress={toggleShow}
                        className="absolute right-0 top-0 h-14 w-12 items-center justify-center"
                    >
                        <Ionicons
                            name={show ? 'eye-off-outline' : 'eye-outline'}
                            size={22}
                            color={colors.textSecondary}
                        />
                    </TouchableOpacity>
                </View>
                {error && (
                    <View className="flex-row items-center gap-1 ml-1">
                        <Ionicons name="alert-circle" size={14} color={colors.status.error} />
                        <Text className="text-xs font-medium" style={{ color: colors.status.error }}>
                            {error}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            <ScreenHeader title="Đổi mật khẩu" onBack={onBack} />

            <ScrollView
                contentContainerStyle={{ paddingBottom: bottom + 24 }}
                className="flex-1"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Intro */}
                <View className="px-6 pt-8 pb-6">
                    <Text className="text-2xl font-bold tracking-tight mb-2" style={{ color: colors.text }}>
                        Cập nhật mật khẩu
                    </Text>
                    <Text className="text-base leading-relaxed" style={{ color: colors.textSecondary }}>
                        Vui lòng nhập mật khẩu hiện tại và mật khẩu mới bên dưới để bảo vệ tài khoản của bạn.
                    </Text>
                </View>

                {/* Form */}
                <View className="px-6 gap-5">
                    {/* Current password */}
                    {renderPasswordField(
                        'Mật khẩu hiện tại',
                        currentPassword,
                        setCurrentPassword,
                        showCurrent,
                        () => setShowCurrent(!showCurrent),
                        'currentPassword',
                        'Nhập mật khẩu hiện tại',
                    )}

                    {/* Divider */}
                    <View className="h-px w-full" style={{ backgroundColor: colors.divider }} />

                    {/* New password */}
                    {renderPasswordField(
                        'Mật khẩu mới',
                        newPassword,
                        setNewPassword,
                        showNew,
                        () => setShowNew(!showNew),
                        'newPassword',
                        'Nhập mật khẩu mới',
                    )}

                    {/* Strength indicator */}
                    {newPassword.length > 0 && (
                        <View className="gap-3 px-1">
                            {/* Strength bar */}
                            <View>
                                <View className="flex-row items-center justify-between mb-1.5">
                                    <Text className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                                        Độ mạnh mật khẩu
                                    </Text>
                                    <Text className="text-xs font-bold" style={{ color: strengthColor }}>
                                        {strengthLabel}
                                    </Text>
                                </View>
                                <View className="flex-row gap-1">
                                    {[0, 1, 2, 3, 4].map((i) => (
                                        <View
                                            key={i}
                                            className="flex-1 h-1.5 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    i < passedChecks ? strengthColor : colors.border,
                                            }}
                                        />
                                    ))}
                                </View>
                            </View>

                            {/* Requirement checklist */}
                            <View className="gap-2">
                                {strengthChecks.map((check, i) => (
                                    <View key={i} className="flex-row items-center gap-2">
                                        <Ionicons
                                            name={check.passed ? 'checkmark-circle' : 'ellipse-outline'}
                                            size={16}
                                            color={check.passed ? colors.status.completed : colors.textSecondary}
                                        />
                                        <Text
                                            className="text-xs"
                                            style={{
                                                color: check.passed ? colors.status.completed : colors.textSecondary,
                                                fontWeight: check.passed ? '500' : '400',
                                            }}
                                        >
                                            {check.label}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Confirm password */}
                    {renderPasswordField(
                        'Xác nhận mật khẩu mới',
                        confirmPassword,
                        setConfirmPassword,
                        showConfirm,
                        () => setShowConfirm(!showConfirm),
                        'confirmPassword',
                        'Nhập lại mật khẩu mới',
                    )}

                    {/* Match indicator */}
                    {confirmPassword.length > 0 && newPassword.length > 0 && (
                        <View className="flex-row items-center gap-1.5 ml-1">
                            <Ionicons
                                name={newPassword === confirmPassword ? 'checkmark-circle' : 'close-circle'}
                                size={16}
                                color={newPassword === confirmPassword ? colors.status.completed : colors.status.error}
                            />
                            <Text
                                className="text-xs font-medium"
                                style={{
                                    color: newPassword === confirmPassword ? colors.status.completed : colors.status.error,
                                }}
                            >
                                {newPassword === confirmPassword ? 'Mật khẩu khớp' : 'Mật khẩu không khớp'}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Action Buttons */}
                <View className="px-6 mt-10 gap-3">
                    <TouchableOpacity
                        onPress={handleSubmit}
                        className="w-full items-center justify-center h-14 rounded-xl shadow-lg"
                        style={{
                            backgroundColor: colors.primary,
                            shadowColor: colors.primary,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.2,
                            shadowRadius: 8,
                            elevation: 6,
                            opacity:
                                currentPassword && newPassword && confirmPassword ? 1 : 0.5,
                        }}
                        disabled={!currentPassword || !newPassword || !confirmPassword}
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

                {/* Helper text */}
                <View className="px-6 mt-6">
                    <Text className="text-xs text-center" style={{ color: colors.textSecondary, opacity: 0.7 }}>
                        Sử dụng ít nhất {MIN_PASSWORD_LENGTH} ký tự bao gồm chữ hoa, chữ thường và số.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
