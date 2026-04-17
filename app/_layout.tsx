import '@/global.css';
import { QueryClientProvider } from '@tanstack/react-query';
import {
    Slot,
    useRootNavigationState,
    useRouter,
    useSegments,
} from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'react-native';
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

  //check theo group
  const inAuthRoute = segments[0] === '(auth)';

  useEffect(() => {
    if (!rootNavigationState?.key || isLoading || segments.length === 0) return;

    if (!isAuthenticated && !inAuthRoute) {
      router.replace('/welcome');
      return;
    }

    if (isAuthenticated && inAuthRoute) {
      router.replace('/(tabs)');
    }
  }, [
    inAuthRoute,
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
        <Slot />
      </SafeAreaView>
      <Toast config={appToastConfig} />
    </>
  );
}

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
