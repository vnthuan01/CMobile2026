import { useQuery } from '@tanstack/react-query';
import { rescueTeamService } from '../services/rescueTeamService';

export const batchKeys = {
  all: ['activeBatch'] as const,
  byTeam: (teamId: string) => [...batchKeys.all, teamId] as const,
};

export function useActiveBatch(teamId: string | null | undefined) {
  return useQuery({
    queryKey: batchKeys.byTeam(teamId ?? ''),
    queryFn: () => rescueTeamService.getActiveBatchByTeam(teamId!),
    enabled: !!teamId,
    staleTime: 1000 * 20, // active ops refresh often: 20s
    refetchInterval: 1000 * 30, // auto-poll every 30s when mounted
    select: (result: any) => ({
      batch: result.success ? result.data : null,
      isEmpty: result.status === 404,
      errorMessage: result.success ? null : (result.message ?? null),
    }),
  });
}
