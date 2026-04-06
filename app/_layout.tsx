import '@/global.css';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { ThemeProvider } from '../src/context/ThemeContext';
import { useTheme } from '../src/context/ThemeContext';
import { authService } from '../src/services/authService';
import type { AuthState } from '../src/store/authStore';
import { useAuthStore } from '../src/store/authStore';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../src/lib/queryClient';

function RootLayoutContent() {
  const router = useRouter();
  const segments = useSegments();
  const { isDark, colors } = useTheme();

  const isAuthenticated = useAuthStore(
    (state: AuthState) => state.isAuthenticated,
  );
  const isLoading = useAuthStore((state: AuthState) => state.isLoading);

  //check theo group
  const inAuthRoute = segments[0] === '(auth)';

  //Restore token khi app start
  useEffect(() => {
    authService.restoreToken();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !inAuthRoute) {
      router.replace('/welcome');
      return;
    }

    if (isAuthenticated && inAuthRoute) {
      router.replace('/(tabs)');
    }
  }, [inAuthRoute, isAuthenticated, isLoading, router]);

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <Slot />
      <Toast />
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
