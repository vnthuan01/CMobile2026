import '@/global.css';
import { Slot, useFocusEffect, useRouter, useSegments } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { ThemeProvider } from '../src/context/ThemeContext';
import { authService } from '../src/services/authService';
import { useAuthStore } from '../src/store/authStore';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  //check theo group
  const inAuthRoute = segments[0] === '(auth)';

  //Restore token khi app start
  useEffect(() => {
    authService.restoreToken();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (isLoading) return;

      //Chưa login → ép về login
      //   if (!isAuthenticated && !inAuthRoute) {
      //     router.replace('/login');
      //     return;
      //   }

      //Đã login mà còn ở auth → đá ra home
      //   if (isAuthenticated && inAuthRoute) {
      //     router.replace('/home/user'); // hoặc theo role
      //   }
    }, [isAuthenticated, isLoading, segments]),
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <StatusBar barStyle="light-content" backgroundColor="#161616" />
          <Slot />
          <Toast />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
