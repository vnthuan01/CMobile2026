import { useSegments } from 'expo-router';
import { useMemo } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_EXTRA_INSET = Platform.OS === 'ios' ? 84 : 72;

export function useBottomContentInset(basePadding = 24) {
  const { bottom } = useSafeAreaInsets();
  const segments = useSegments();
  const isTabsRoute = segments[0] === '(tabs)';

  return useMemo(
    () => bottom + basePadding + (isTabsRoute ? TAB_EXTRA_INSET : 0),
    [basePadding, bottom, isTabsRoute],
  );
}
