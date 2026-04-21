import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  backgroundColor?: string;
  titleColor?: string;
  showBottomBorder?: boolean;
  showShadow?: boolean;
  // Legacy aliases for backward compatibility with Header
  center?: boolean;
  rightComponent?: React.ReactNode;
}

export default function ScreenHeader({
  title,
  subtitle,
  onBack,
  rightAction,
  backgroundColor,
  titleColor,
  showBottomBorder = true,
  showShadow = true,
  center: _center,
  rightComponent,
}: ScreenHeaderProps) {
  const { top } = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const sideSlotWidth = 96;

  const bgColor = backgroundColor ?? colors.card;
  const txtColor = titleColor ?? colors.text;
  const resolvedRightAction = rightAction ?? rightComponent ?? null;
  const isPrimaryHeader = bgColor === colors.primary;
  const backButtonBg = isPrimaryHeader
    ? 'rgba(255,255,255,0.16)'
    : isDark
      ? colors.surface
      : `${colors.primary}15`;
  const backIconColor = isPrimaryHeader ? '#fff' : colors.primary;

  return (
    <View
      style={[
        {
          paddingTop: top + 10,
          paddingBottom: 10,
          paddingHorizontal: 16,
          backgroundColor: bgColor,
          borderBottomColor: showBottomBorder ? colors.border : 'transparent',
          borderBottomWidth: showBottomBorder ? 1 : 0,
        },
        !isDark && showShadow && styles.shadow,
      ]}
      className={showBottomBorder ? 'border-b' : ''}
    >
      <View className="flex-row items-center">
        <View style={{ width: sideSlotWidth, alignItems: 'flex-start' }}>
          {onBack ? (
            <TouchableOpacity
              onPress={onBack}
              style={{ width: 40, height: 40, backgroundColor: backButtonBg }}
              className="items-center justify-center rounded-full"
            >
              <Ionicons
                name="arrow-back-outline"
                size={22}
                color={backIconColor}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        <View className="flex-1 items-center">
          <Text
            style={{ color: txtColor, fontSize: 18 }}
            className="text-center font-bold leading-tight"
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={{ color: colors.textSecondary, fontSize: 13 }}
              className="mt-0.5 text-center"
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={{ width: sideSlotWidth }} className="items-end">
          {resolvedRightAction}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
});
