import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/userService';

type CitizenProfileResult = Awaited<ReturnType<typeof userService.getProfile>>;

export const citizenProfileKeys = {
  all: ['citizenProfile'] as const,
  me: () => [...citizenProfileKeys.all, 'me'] as const,
};

export function useCitizenProfile(
  enabled = true,
  _legacyRefetchInterval: number | false = false,
) {
  return useQuery({
    queryKey: citizenProfileKeys.me(),
    queryFn: async () => {
      const result = await userService.getProfile();

      if (!result.success) {
        throw new Error(result.message ?? 'Không thể tải hồ sơ người dùng.');
      }

      return result;
    },
    enabled,
    staleTime: 1000 * 60,
    refetchOnMount: true,
    refetchOnReconnect: true,
    select: (result: CitizenProfileResult) => ({
      profile: result.data,
      errorMessage: null,
    }),
  });
}
