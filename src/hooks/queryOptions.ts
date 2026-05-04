export type MobileQueryMode = 'static' | 'normal' | 'live';

const MOBILE_QUERY_DEFAULTS = {
  refetchOnReconnect: true,
  refetchOnMount: true,
  refetchOnWindowFocus: false,
} as const;

export function mobileQueryOptions<T extends Record<string, unknown>>(
  mode: MobileQueryMode,
  extra?: T,
) {
  const staleTime =
    mode === 'static' ? 1000 * 60 : mode === 'live' ? 1000 * 10 : 1000 * 30;

  return {
    ...MOBILE_QUERY_DEFAULTS,
    staleTime,
    ...(extra ?? {}),
  };
}
