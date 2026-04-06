import '@/global.css';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { ThemeProvider } from '../src/context/ThemeContext';
import { authService } from '../src/services/authService';
import type { AuthState } from '../src/store/authStore';
import { useAuthStore } from '../src/store/authStore';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../src/lib/queryClient';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

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
      router.replace('/login');
      return;
    }

    if (isAuthenticated && inAuthRoute) {
      router.replace('/(tabs)');
    }
  }, [inAuthRoute, isAuthenticated, isLoading, router]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ThemeProvider>
            <StatusBar barStyle="light-content" backgroundColor="#161616" />
            <Slot />
            <Toast />
          </ThemeProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
