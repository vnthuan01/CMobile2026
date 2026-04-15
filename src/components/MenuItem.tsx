import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
}

export default function MenuItem({
  icon,
  title,
  subtitle,
  onPress,
}: MenuItemProps) {
  const { colors } = useTheme();
  const accentColor = '#DA251D';

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between px-4 py-4"
      style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
    >
      <View className="flex-row items-center gap-3">
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: `${accentColor}18` }}
        >
          <Ionicons name={icon} size={22} color={accentColor} />
        </View>
        <View>
          <Text
            className="text-base font-medium"
            style={{ color: colors.text }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text className="text-xs" style={{ color: colors.textSecondary }}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.icon} />
    </TouchableOpacity>
  );
}
