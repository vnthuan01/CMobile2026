import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
    title: string;
    subtitle?: string;
    onBack?: () => void;
    center?: boolean;
    rightComponent?: React.ReactNode;
}

export default function Header({
    title,
    subtitle,
    onBack,
    center = false,
    rightComponent,
}: HeaderProps) {
    const { top } = useSafeAreaInsets();
    const { colors, isDark } = useTheme();

    // Theme Styles
    // We mix inline styles for dynamic theme colors with Tailwind for layout
    const arrowBgColor = isDark ? colors.border : colors.surface;

    return (
        <View
            style={{
                paddingTop: top + 10,
                paddingBottom: 10,
                backgroundColor: colors.card,
                borderBottomColor: colors.border
            }}
            className={`px-4 shadow-sm border-b`}
        >
            <View className={`flex-row items-center ${center ? 'justify-between' : 'gap-3'}`}>
                {onBack && (
                    <TouchableOpacity
                        onPress={onBack}
                        className="h-10 w-10 items-center justify-center rounded-full"
                        style={{ backgroundColor: arrowBgColor }}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                )}

                <View className={center ? 'flex-1 items-center' : 'flex-1'}>
                    <Text
                        style={{ color: colors.text }}
                        className={`font-bold ${center ? 'text-lg text-center' : 'text-xl'}`}
                    >
                        {title}
                    </Text>
                    {subtitle && (
                        <Text
                            style={{ color: colors.textSecondary }}
                            className={`text-sm ${center ? 'text-center' : ''}`}
                        >
                            {subtitle}
                        </Text>
                    )}
                </View>

                {center && (
                    <View className="w-10 items-end">
                        {rightComponent}
                    </View>
                )}
            </View>
        </View>
    );
}
