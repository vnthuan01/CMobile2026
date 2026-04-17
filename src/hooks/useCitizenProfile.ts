import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/userService';

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
    queryFn: () => userService.getProfile(),
    enabled,
    refetchInterval,
    refetchOnMount: 'always',
    select: (result: any) => ({
      profile: result.success ? result.data : null,
      errorMessage: result.success ? null : (result.message ?? null),
    }),
  });
}
