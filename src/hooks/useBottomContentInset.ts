import { useSegments } from 'expo-router';
import { useMemo } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TAB_BASE_HEIGHT = Platform.OS === 'ios' ? 74 : 56;

export function getTabBarBottomPadding(bottomInset: number) {
  return Platform.OS === 'ios'
    ? Math.max(bottomInset, 14)
    : Math.max(bottomInset, 18);
}

export function getTabBarHeight(bottomInset: number) {
  return TAB_BASE_HEIGHT + getTabBarBottomPadding(bottomInset);
}

export function useBottomContentInset(basePadding = 24) {
  const { bottom } = useSafeAreaInsets();
  const segments = useSegments();
  const isTabsRoute = segments[0] === '(tabs)';

  return useMemo(
    () => bottom + basePadding + (isTabsRoute ? getTabBarHeight(bottom) : 0),
    [basePadding, bottom, isTabsRoute],
  );
}
