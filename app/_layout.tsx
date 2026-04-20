import '@/global.css';
import { focusManager, QueryClientProvider } from '@tanstack/react-query';
import {
    Slot,
    useRootNavigationState,
    useRouter,
    useSegments,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    AppState,
    type AppStateStatus,
    Easing,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
    configureReanimatedLogger,
    ReanimatedLogLevel,
} from 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { appToastConfig } from '../src/components/common/AppToast';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { useAuthBootstrap } from '../src/hooks/useAuthBootstrap';
import { useNotificationRealtime } from '../src/hooks/useNotificationRealtime';
import { queryClient } from '../src/lib/queryClient';
import type { AuthState } from '../src/store/authStore';
import { useAuthStore } from '../src/store/authStore';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: true,
});

const textDefaults = Text as unknown as {
  defaultProps?: Record<string, unknown>;
};
textDefaults.defaultProps = textDefaults.defaultProps ?? {};
textDefaults.defaultProps.allowFontScaling = false;

const textInputDefaults = TextInput as unknown as {
  defaultProps?: Record<string, unknown>;
};
textInputDefaults.defaultProps = textInputDefaults.defaultProps ?? {};
textInputDefaults.defaultProps.allowFontScaling = false;

void SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore when already prevented or unavailable.
});

const MIN_STARTUP_LOADING_MS = 650;

function StartupLoadingScreen({
  backgroundColor,
  primaryColor,
  textColor,
}: {
  backgroundColor: string;
  primaryColor: string;
  textColor: string;
}) {
  const fadeAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View
      style={[styles.loadingContainer, { backgroundColor, opacity: fadeAnim }]}
    >
      <View style={styles.brandBlock}>
        <Text style={[styles.brandText, { color: primaryColor }]}>
          ReliefCare
        </Text>
        <Text style={[styles.loadingText, { color: textColor }]}>
          Đang khởi tạo ứng dụng...
        </Text>
      </View>
      <ActivityIndicator size="large" color={primaryColor} />
    </Animated.View>
  );
}

function RootLayoutContent() {
  const router = useRouter();
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();
  const { isDark, colors } = useTheme();
  useAuthBootstrap();
  useNotificationRealtime();

  const isAuthenticated = useAuthStore(
    (state: AuthState) => state.isAuthenticated,
  );
  const isLoading = useAuthStore((state: AuthState) => state.isLoading);
  const hasHiddenNativeSplash = useRef(false);
  const startupShownAtRef = useRef<number | null>(null);
  const [isStartupLoadingVisible, setIsStartupLoadingVisible] =
    useState(isLoading);
  const [hasCompletedStartupPhase, setHasCompletedStartupPhase] =
    useState(false);

  useEffect(() => {
    const onAppStateChange = (status: AppStateStatus) => {
      focusManager.setFocused(status === 'active');
    };

    const subscription = AppState.addEventListener('change', onAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  //check theo group
  const inAuthRoute = segments[0] === '(auth)';
  const inPublicDonateRoute = segments[0] === 'donate';

  useEffect(() => {
    if (!rootNavigationState?.key || hasHiddenNativeSplash.current) return;

    const frameId = requestAnimationFrame(() => {
      SplashScreen.hideAsync().catch(() => {
        // Ignore when splash is already hidden.
      });
    });

    hasHiddenNativeSplash.current = true;
    return () => cancelAnimationFrame(frameId);
  }, [rootNavigationState?.key]);

  useEffect(() => {
    if (hasCompletedStartupPhase) return;

    if (isLoading) {
      if (startupShownAtRef.current === null) {
        startupShownAtRef.current = Date.now();
      }
      setIsStartupLoadingVisible(true);
      return;
    }

    if (startupShownAtRef.current === null) {
      setIsStartupLoadingVisible(false);
      setHasCompletedStartupPhase(true);
      return;
    }

    const elapsed = Date.now() - startupShownAtRef.current;
    const remaining = Math.max(0, MIN_STARTUP_LOADING_MS - elapsed);

    const timeoutId = setTimeout(() => {
      setIsStartupLoadingVisible(false);
      setHasCompletedStartupPhase(true);
    }, remaining);

    return () => clearTimeout(timeoutId);
  }, [hasCompletedStartupPhase, isLoading]);

  useEffect(() => {
    if (!rootNavigationState?.key || isLoading || segments.length === 0) return;

    if (!isAuthenticated && !inAuthRoute && !inPublicDonateRoute) {
      router.replace('/welcome');
      return;
    }

    if (isAuthenticated && inAuthRoute) {
      router.replace('/(tabs)');
    }
  }, [
    inAuthRoute,
    inPublicDonateRoute,
    isAuthenticated,
    isLoading,
    rootNavigationState?.key,
    router,
    segments,
  ]);

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={['left', 'right']}
      >
        {isStartupLoadingVisible ? (
          <StartupLoadingScreen
            backgroundColor={colors.background}
            primaryColor={colors.primary}
            textColor={colors.text}
          />
        ) : (
          <Slot />
        )}
      </SafeAreaView>
      <Toast config={appToastConfig} />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 18,
  },
  brandBlock: {
    alignItems: 'center',
    gap: 6,
  },
  brandLogo: {
    width: 112,
    height: 112,
    marginBottom: 6,
  },
  brandText: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '500',
  },
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ThemeProvider>
            <RootLayoutContent />
          </ThemeProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
