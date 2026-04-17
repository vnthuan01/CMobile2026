import { useQuery } from '@tanstack/react-query';
import { rescueTeamService } from '../services/rescueTeamService';

export const batchKeys = {
  all: ['activeBatch'] as const,
  byTeam: (teamId: string) => [...batchKeys.all, teamId] as const,
};

export function useActiveBatch(teamId: string | null | undefined) {
  return useQuery({
    queryKey: batchKeys.byTeam(teamId ?? ''),
    queryFn: async () => {
      const result = await rescueTeamService.getActiveBatchByTeam(teamId!);

      if (!result.success) {
        throw new Error(result.message ?? 'Không tải được dữ liệu nhiệm vụ.');
      }

      return {
        batch: result.data,
        isEmpty: result.status === 404,
        errorMessage: null,
      };
    },
    enabled: !!teamId,
    staleTime: 1000 * 20, // active ops refresh often: 20s
    refetchInterval: 1000 * 30, // auto-poll every 30s when mounted
  });
}
