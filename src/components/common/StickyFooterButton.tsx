import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface StickyFooterButtonProps {
  title: string;
  onPress?: () => void;
  icon?: string;
  backgroundColor?: string;
  disabled?: boolean;
}

export default function StickyFooterButton({
  title,
  onPress,
  icon,
  backgroundColor,
  disabled,
}: StickyFooterButtonProps) {
  const { bottom } = useSafeAreaInsets();
  const { colors } = useTheme();

  const bgColor = backgroundColor ?? colors.secondary;

  return (
    <View
      style={{
        paddingBottom: bottom - 36,
        backgroundColor: colors.card,
        borderTopColor: colors.border,
      }}
      className="absolute bottom-0 left-0 right-0 z-20 border-t p-4 shadow-lg"
    >
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        className="flex w-full flex-row items-center justify-center gap-2 rounded-xl px-4 py-3.5 shadow-lg"
        style={{ backgroundColor: bgColor, opacity: disabled ? 0.6 : 1 }}
      >
        <Text className="text-base font-bold tracking-tight text-white">
          {title}
        </Text>
        {icon && <Ionicons name={icon as any} size={16} color={colors.white} />}
      </TouchableOpacity>
    </View>
  );
}

