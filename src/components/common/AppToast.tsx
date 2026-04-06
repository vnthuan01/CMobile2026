import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast, { BaseToastProps, ToastConfig } from 'react-native-toast-message';
import { useTheme } from '@/src/context/ThemeContext';

// ─────────────────────────────────────────────
//  Type config
// ─────────────────────────────────────────────

type AppToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastTypeConfig {
  iconName: keyof typeof Ionicons.glyphMap;
  borderColor: string;
  iconColor: string;
}

const STATIC_TYPE_MAP: Record<AppToastType, Omit<ToastTypeConfig, 'borderColor' | 'iconColor'> & { colorKey: AppToastType }> = {
  success: { iconName: 'checkmark-circle', colorKey: 'success' },
  error: { iconName: 'close-circle', colorKey: 'error' },
  info: { iconName: 'information-circle', colorKey: 'info' },
  warning: { iconName: 'warning', colorKey: 'warning' },
};

// ─────────────────────────────────────────────
//  Single toast card (hook-aware)
// ─────────────────────────────────────────────

interface AppToastCardProps extends BaseToastProps {
  toastType: AppToastType;
}

function AppToastCard({ text1, text2, onPress, toastType }: AppToastCardProps) {
  const { colors, isDark } = useTheme();

  const typeMap: Record<AppToastType, ToastTypeConfig> = {
    success: { iconName: 'checkmark-circle', borderColor: colors.success, iconColor: colors.success },
    error: { iconName: 'close-circle', borderColor: colors.error, iconColor: colors.error },
    info: { iconName: 'information-circle', borderColor: colors.info, iconColor: colors.info },
    warning: { iconName: 'warning', borderColor: colors.warning, iconColor: colors.warning },
  };

  const cfg = typeMap[toastType];

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => {
        onPress?.();
        Toast.hide();
      }}
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: isDark ? colors.border : 'transparent',
          borderLeftColor: cfg.borderColor,
          shadowColor: isDark ? '#000' : '#333',
        },
      ]}
    >
      {/* Colored left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: cfg.borderColor }]} />

      {/* Icon */}
      <View style={styles.iconWrap}>
        <Ionicons name={cfg.iconName} size={24} color={cfg.iconColor} />
      </View>

      {/* Text content */}
      <View style={styles.textWrap}>
        <Text
          style={[styles.title, { color: colors.text }]}
          numberOfLines={2}
        >
          {text1}
        </Text>
        {!!text2 && (
          <Text
            style={[styles.message, { color: colors.textSecondary }]}
            numberOfLines={3}
          >
            {text2}
          </Text>
        )}
      </View>

      {/* Dismiss hint */}
      <Ionicons
        name="close"
        size={16}
        color={colors.textSecondary}
        style={styles.closeIcon}
      />
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────
//  Config object consumed by <Toast config={…} />
// ─────────────────────────────────────────────

export const appToastConfig: ToastConfig = {
  success: (props) => <AppToastCard {...props} toastType="success" />,
  error: (props) => <AppToastCard {...props} toastType="error" />,
  info: (props) => <AppToastCard {...props} toastType="info" />,
  warning: (props) => <AppToastCard {...props} toastType="warning" />,
};

// ─────────────────────────────────────────────
//  Styles
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    width: '92%',
    minHeight: 60,
    maxWidth: 420,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 0, // replaced by accentBar
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 6,
    paddingRight: 10,
    paddingVertical: 10,
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  iconWrap: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrap: {
    flex: 1,
    paddingVertical: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  closeIcon: {
    paddingLeft: 6,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
});

// ─────────────────────────────────────────────
//  Default export (convenience re-export of config)
// ─────────────────────────────────────────────

export default AppToastCard;
