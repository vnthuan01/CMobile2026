import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface StatusRadioOptionProps {
    selected: boolean;
    onSelect: () => void;
    icon: string;
    title: string;
    subtitle: string;
    accentColor: string;
}

export default function StatusRadioOption({
    selected,
    onSelect,
    icon,
    title,
    subtitle,
    accentColor,
}: StatusRadioOptionProps) {
    const { colors, isDark } = useTheme();

    return (
        <TouchableOpacity
            onPress={onSelect}
            className="relative flex-row items-center gap-4 rounded-xl border p-4"
            style={{
                backgroundColor: colors.card,
                borderColor: selected ? accentColor : colors.border,
                borderWidth: selected ? 1.5 : 1,
            }}
        >
            {/* Radio circle */}
            <View
                className="h-5 w-5 items-center justify-center rounded-full border-2"
                style={{
                    borderColor: selected ? accentColor : colors.border,
                }}
            >
                {selected && (
                    <View
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: accentColor }}
                    />
                )}
            </View>

            {/* Icon circle */}
            <View
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{
                    backgroundColor: isDark
                        ? `${accentColor}20`
                        : `${accentColor}18`,
                }}
            >
                <Ionicons name={icon as any} size={20} color={accentColor} />
            </View>

            {/* Text */}
            <View className="flex grow flex-col">
                <Text
                    className="text-sm font-bold leading-normal"
                    style={{ color: colors.text }}
                >
                    {title}
                </Text>
                <Text
                    className="text-xs font-normal leading-normal"
                    style={{ color: colors.textSecondary }}
                >
                    {subtitle}
                </Text>
            </View>
        </TouchableOpacity>
    );
}
