import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

interface SosFloatingButtonProps {
  onPress: () => void;
  bottom: number;
  right?: number;
  size?: number;
  align?: 'center' | 'right';
}

export function SosFloatingButton({
  onPress,
  bottom,
  right = 18,
  size = 74,
  align = 'center',
}: SosFloatingButtonProps) {
  const { colors } = useTheme();
  const ring1 = useSharedValue(0);
  const ring2 = useSharedValue(0);
  const pulse = useSharedValue(1);
  const radius = size / 2;

  useEffect(() => {
    ring1.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 1900,
          easing: Easing.out(Easing.cubic),
        }),
        withTiming(0, { duration: 0 }),
      ),
      -1,
      false,
    );

    ring2.value = withRepeat(
      withSequence(
        withDelay(
          950,
          withTiming(1, {
            duration: 1900,
            easing: Easing.out(Easing.cubic),
          }),
        ),
        withTiming(0, { duration: 0 }),
      ),
      -1,
      false,
    );

    pulse.value = withRepeat(
      withSequence(
        withTiming(1.05, {
          duration: 950,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(1, {
          duration: 950,
          easing: Easing.inOut(Easing.quad),
        }),
      ),
      -1,
      false,
    );
  }, [pulse, ring1, ring2]);

  const ringStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(ring1.value, [0, 1], [1, 1.85]) }],
    opacity: interpolate(ring1.value, [0, 0.7, 1], [0.4, 0.18, 0]),
  }));

  const ringStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(ring2.value, [0, 1], [1, 1.85]) }],
    opacity: interpolate(ring2.value, [0, 0.7, 1], [0.3, 0.14, 0]),
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        ...(align === 'center'
          ? { left: '50%', marginLeft: -radius }
          : { right }),
        bottom,
        zIndex: 40,
      }}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: radius,
            borderWidth: 2,
            borderColor: colors.status.error,
          },
          ringStyle1,
        ]}
      />

      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: radius,
            borderWidth: 2,
            borderColor: colors.status.error,
          },
          ringStyle2,
        ]}
      />

      <Animated.View style={buttonStyle}>
        <Pressable
          onPress={onPress}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Gửi yêu cầu SOS"
          style={{
            width: size,
            height: size,
            borderRadius: radius,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.status.error,
            shadowColor: colors.status.error,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.28,
            shadowRadius: 10,
            elevation: 7,
          }}
        >
          <Ionicons
            name="warning"
            size={Math.max(28, Math.round(size * 0.38))}
            color={colors.white}
          />
          <Text
            style={{
              marginTop: 1,
              color: colors.white,
              fontSize: Math.max(11, Math.round(size * 0.15)),
              fontWeight: '900',
            }}
          >
            SOS
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
