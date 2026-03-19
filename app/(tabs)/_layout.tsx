import { useTheme } from '@/src/context/ThemeContext';
import { useAuthStore } from '@/src/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Platform, View } from 'react-native';

const TAB_HEIGHT = Platform.OS === 'ios' ? 88 : 64;
const ICON_SIZE = 24;

export default function TabsLayout() {
  const user = useAuthStore((s) => s.user);
  const role = (user?.role ?? '').toLowerCase();
  /* ================= THEME ================= */
  const { colors, isDark } = useTheme();

  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  // Theme Colors from Context
  const activeColor = colors.primary;
  const inactiveColor = colors.textSecondary;
  const tabBgColor = colors.card;
  const borderColor = colors.border;

  /* ================= COMMON OPTIONS ================= */
  const screenOptions = {
    headerShown: false,
    tabBarActiveTintColor: activeColor,
    tabBarInactiveTintColor: inactiveColor,

    tabBarLabelPosition: 'below-icon',
    tabBarAllowFontScaling: false,

    tabBarStyle: {
      height: TAB_HEIGHT,
      paddingTop: 6,
      paddingBottom: Platform.OS === 'ios' ? 14 : 8,
      borderTopWidth: 0.5,
      borderTopColor: borderColor,
      backgroundColor: tabBgColor,
      overflow: 'visible',
    },

    tabBarItemStyle: {
      paddingVertical: 4,
    },

    tabBarLabelStyle: {
      fontSize: 12,
      lineHeight: 16,
      paddingBottom: 0,
      includeFontPadding: false,
    },
  } as const;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1.6,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [opacity, scale]);

  /* ================= VOLUNTEER ================= */
  if (role === 'volunteer') {
    return (
      <Tabs screenOptions={screenOptions}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Trang chủ',
            tabBarIcon: ({ color }) => (
              <Ionicons name="home-outline" size={ICON_SIZE} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="tasks"
          options={{
            title: 'Nhiệm vụ',
            tabBarIcon: ({ color }) => (
              <Ionicons name="list-outline" size={ICON_SIZE} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: 'Hồ sơ',
            tabBarIcon: ({ color }) => (
              <Ionicons name="person-outline" size={ICON_SIZE} color={color} />
            ),
          }}
        />

        {/* hidden routes */}
        <Tabs.Screen name="home/user" options={{ href: null }} />
        <Tabs.Screen name="home/volunteer" options={{ href: null }} />
        <Tabs.Screen name="create-request" options={{ href: null }} />
        <Tabs.Screen name="requests" options={{ href: null }} />
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
          tabBarIcon: ({ color }) => (
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
                marginTop: -24,
              }}
            >
              <Animated.View
                style={{
                  position: 'absolute',
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  borderWidth: 2,
                  borderColor: colors.primary,
                  transform: [{ scale }],
                  opacity,
                }}
              />

              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: colors.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.35,
                  shadowRadius: 8,
                  elevation: 10,
                  borderWidth: 4,
                  borderColor: isDark ? colors.card : '#ffffff',
                }}
              >
                <Ionicons name="add" size={32} color="#fff" />
              </View>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hồ sơ',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={ICON_SIZE} color={color} />
          ),
        }}
      />

      {/* hidden routes */}
      <Tabs.Screen name="home/user" options={{ href: null }} />
      <Tabs.Screen name="home/volunteer" options={{ href: null }} />
      <Tabs.Screen name="tasks" options={{ href: null }} />
      <Tabs.Screen name="requests" options={{ href: null }} />
    </Tabs>
  );
}
