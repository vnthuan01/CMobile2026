import { useQuery } from '@tanstack/react-query';
import { teamService } from '../services/teamService';

export const teamKeys = {
  all: ['team'] as const,
  myTeam: () => [...teamKeys.all, 'myTeam'] as const,
};

export function useMyTeam(enabled = true) {
  return useQuery({
    queryKey: teamKeys.myTeam(),
    queryFn: () => teamService.getMyTeam(),
    enabled,
    select: (result: any) => ({
      team: result.success ? result.data : null,
      errorMessage: result.success ? null : (result.message ?? null),
      isEmpty:
        !result.success &&
        (result.status === 404 ||
          /chưa|not found|không thuộc team/i.test(result.message ?? '')),
    }),
  });
}
