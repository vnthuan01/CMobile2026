import { useQuery } from '@tanstack/react-query';
import { authService } from '../services/authService';

export const citizenProfileKeys = {
  all: ['citizenProfile'] as const,
  me: () => [...citizenProfileKeys.all, 'me'] as const,
};

export function useCitizenProfile(
  enabled = true,
  refetchInterval: number | false = false,
) {
  return useQuery({
    queryKey: citizenProfileKeys.me(),
    queryFn: () => authService.getProfile(),
    enabled,
    refetchInterval,
    select: (result) => ({
      profile: result.success ? result.data : null,
      errorMessage: result.success ? null : (result.message ?? null),
    }),
  });
}
