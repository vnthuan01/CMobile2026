import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useRef, useState } from 'react';
import {
    Animated,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

// ─────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────

export type DialogType = 'default' | 'danger' | 'success' | 'info';

export interface DialogOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  type?: DialogType;
  /** Whether to show the cancel button. Defaults to true */
  showCancel?: boolean;
}

export interface AppDialogProps extends DialogOptions {
  visible: boolean;
}

// ─────────────────────────────────────────────
//  Icon map
// ─────────────────────────────────────────────

const DIALOG_ICON: Record<DialogType, keyof typeof Ionicons.glyphMap> = {
  default: 'help-circle-outline',
  danger: 'warning-outline',
  success: 'checkmark-circle-outline',
  info: 'information-circle-outline',
};

// ─────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────

export function AppDialog({
  visible,
  title,
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Huỷ',
  onConfirm,
  onCancel,
  type = 'default',
  showCancel = true,
}: AppDialogProps) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const confirmColor = React.useMemo<string>(() => {
    switch (type) {
      case 'danger':
        return colors.error;
      case 'success':
        return colors.error;
      case 'info':
        return colors.info;
      default:
        return colors.primary;
    }
  }, [type, colors]);

  const iconColor = confirmColor;

  // Run scale/fade when visibility changes
  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 16,
          stiffness: 220,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset for next open
      scaleAnim.setValue(0.88);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onCancel}>
        <View
          style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.52)' }]}
        />
      </TouchableWithoutFeedback>

      {/* Card */}
      <View style={[styles.centeredWrapper, { pointerEvents: 'box-none' }]}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* Icon */}
          <View
            style={[styles.iconCircle, { backgroundColor: `${iconColor}18` }]}
          >
            <Ionicons name={DIALOG_ICON[type]} size={32} color={iconColor} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

          {/* Message */}
          {!!message && (
            <Text style={[styles.message, { color: colors.textSecondary }]}>
              {message}
            </Text>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            {showCancel && (
              <TouchableOpacity
                style={[
                  styles.btn,
                  styles.cancelBtn,
                  { borderColor: colors.border },
                ]}
                onPress={onCancel}
                activeOpacity={0.7}
              >
                <Text style={[styles.btnText, { color: colors.textSecondary }]}>
                  {cancelLabel}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.btn,
                styles.confirmBtn,
                {
                  backgroundColor: confirmColor,
                  flex: showCancel ? 1 : undefined,
                  minWidth: showCancel ? undefined : 160,
                  alignSelf: showCancel ? 'auto' : 'center',
                },
              ]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={[styles.btnText, styles.confirmBtnText]}>
                {confirmLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────
//  useDialog hook
// ─────────────────────────────────────────────

interface UseDialogReturn {
  dialogProps: AppDialogProps;
  showDialog: (options: DialogOptions) => void;
  hideDialog: () => void;
}

export function useDialog(): UseDialogReturn {
  const [state, setState] = useState<AppDialogProps>({
    visible: false,
    title: '',
  });

  const showDialog = useCallback((options: DialogOptions) => {
    setState({ ...options, visible: true });
  }, []);

  const hideDialog = useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }));
  }, []);

  const dialogProps: AppDialogProps = {
    ...state,
    onCancel: () => {
      state.onCancel?.();
      hideDialog();
    },
    onConfirm: () => {
      state.onConfirm?.();
      hideDialog();
    },
  };

  return { dialogProps, showDialog, hideDialog };
}

// ─────────────────────────────────────────────
//  Styles
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  centeredWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '84%',
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
    width: '100%',
  },
  btn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    borderWidth: 1.5,
  },
  confirmBtn: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  confirmBtnText: {
    color: '#FFFFFF',
  },
});

export default AppDialog;
