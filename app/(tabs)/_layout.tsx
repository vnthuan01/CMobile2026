import { useTheme } from '@/src/context/ThemeContext';
import {
  getTabBarBottomPadding,
  getTabBarHeight,
} from '@/src/hooks/useBottomContentInset';
import { useAuthStore } from '@/src/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabIconProps = {
  color: string;
};

const ICON_SIZE = 24;

export default function TabsLayout() {
  const user = useAuthStore((s) => s.user);
  const role = (user?.role ?? '').toLowerCase();
  const { bottom } = useSafeAreaInsets();
  /* ================= THEME ================= */
  const { colors, isDark } = useTheme();

  const ringOne = useRef(new Animated.Value(0)).current;
  const ringTwo = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  // Theme Colors from Context
  const activeColor = colors.primary;
  const inactiveColor = colors.textSecondary;
  const tabBgColor = colors.card;
  const borderColor = colors.border;
  const tabBarBottomPadding = getTabBarBottomPadding(bottom);
  const tabBarHeight = getTabBarHeight(bottom);

  /* ================= COMMON OPTIONS ================= */
  const screenOptions = {
    headerShown: false,
    tabBarActiveTintColor: activeColor,
    tabBarInactiveTintColor: inactiveColor,

    tabBarLabelPosition: 'below-icon',
    tabBarAllowFontScaling: false,

    tabBarStyle: {
      height: tabBarHeight,
      paddingTop: 2,
      paddingBottom: tabBarBottomPadding,
      borderTopWidth: 0.5,
      borderTopColor: borderColor,
      backgroundColor: tabBgColor,
      overflow: 'visible',
    },

    tabBarItemStyle: {
      paddingTop: 2,
      paddingBottom: 2,
    },

    tabBarLabelStyle: {
      fontSize: 12,
      lineHeight: 16,
      paddingBottom: 0,
      includeFontPadding: false,
    },
  } as const;

  useEffect(() => {
    const ringOneLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(ringOne, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(ringOne, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    const ringTwoLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(900),
        Animated.timing(ringTwo, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(ringTwo, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.06,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
      ]),
    );

    ringOneLoop.start();
    ringTwoLoop.start();
    pulseLoop.start();

    return () => {
      ringOneLoop.stop();
      ringTwoLoop.stop();
      pulseLoop.stop();
    };
  }, [pulse, ringOne, ringTwo]);

  /* ================= VOLUNTEER ================= */
  if (role === 'volunteer') {
    return (
      <Tabs screenOptions={screenOptions}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Trang chủ',
            tabBarIcon: ({ color }: TabIconProps) => (
              <Ionicons name="home-outline" size={ICON_SIZE} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="tasks"
          options={{
            title: 'Nhiệm vụ',
            tabBarIcon: ({ color }: TabIconProps) => (
              <Ionicons name="list-outline" size={ICON_SIZE} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: 'Hồ sơ',
            tabBarIcon: ({ color }: TabIconProps) => (
              <Ionicons name="person-outline" size={ICON_SIZE} color={color} />
            ),
          }}
        />

        {/* hidden routes */}
        <Tabs.Screen name="home/user" options={{ href: null }} />
        <Tabs.Screen name="home/volunteer" options={{ href: null }} />
        <Tabs.Screen name="create-request" options={{ href: null }} />
        <Tabs.Screen name="requests" options={{ href: null }} />
        <Tabs.Screen name="notifications/index" options={{ href: null }} />
      </Tabs>
    );
  }

  /* ================= USER ================= */
  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color }: TabIconProps) => (
            <Ionicons name="home-outline" size={ICON_SIZE} color={color} />
          ),
        }}
      />

      {/* ===== FLOATING ACTION BUTTON ===== */}
      <Tabs.Screen
        name="create-request"
        options={{
          title: '',
          tabBarLabel: () => null,
          tabBarIcon: () => (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: -20,
              }}
            >
              <Animated.View
                style={{
                  position: 'absolute',
                  width: 62,
                  height: 62,
                  borderRadius: 31,
                  borderWidth: 2,
                  borderColor: colors.status.error,
                  transform: [
                    {
                      scale: ringOne.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.85],
                      }),
                    },
                  ],
                  opacity: ringOne.interpolate({
                    inputRange: [0, 0.7, 1],
                    outputRange: [0.35, 0.18, 0],
                  }),
                }}
              />

              <Animated.View
                style={{
                  position: 'absolute',
                  width: 62,
                  height: 62,
                  borderRadius: 31,
                  borderWidth: 2,
                  borderColor: colors.status.error,
                  transform: [
                    {
                      scale: ringTwo.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.85],
                      }),
                    },
                  ],
                  opacity: ringTwo.interpolate({
                    inputRange: [0, 0.7, 1],
                    outputRange: [0.28, 0.12, 0],
                  }),
                }}
              />

              <Animated.View
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: 31,
                  backgroundColor: colors.status.error,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: colors.status.error,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 11,
                  borderWidth: 4,
                  borderColor: isDark ? colors.card : colors.white,
                  transform: [{ scale: pulse }],
                }}
              >
                <Ionicons name="warning" size={23} color={colors.white} />
                <Text
                  style={{
                    marginTop: -1,
                    color: colors.white,
                    fontSize: 10,
                    fontWeight: '900',
                  }}
                >
                  SOS
                </Text>
              </Animated.View>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hồ sơ',
          tabBarIcon: ({ color }: TabIconProps) => (
            <Ionicons name="person-outline" size={ICON_SIZE} color={color} />
          ),
        }}
      />

      {/* hidden routes */}
      <Tabs.Screen name="home/user" options={{ href: null }} />
      <Tabs.Screen name="home/volunteer" options={{ href: null }} />
      <Tabs.Screen name="tasks" options={{ href: null }} />
      <Tabs.Screen name="requests" options={{ href: null }} />
      <Tabs.Screen name="notifications/index" options={{ href: null }} />
    </Tabs>
  );
}
