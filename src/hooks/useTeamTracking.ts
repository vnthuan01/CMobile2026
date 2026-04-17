import { useMutation, useQuery } from '@tanstack/react-query';
import { teamService } from '../services/teamService';
import type { TeamTrackingHeartbeatRequest } from '../types/team';
import { showApiErrorToast, showApiResultToast } from '../utils/apiToast';

export const teamTrackingKeys = {
  all: ['teamTracking'] as const,
  latest: (teamId: string, limit: number) =>
    [...teamTrackingKeys.all, 'latest', { teamId, limit }] as const,
};

export function useTeamTrackingLatest(
  teamId: string | null | undefined,
  limit = 50,
  enabled = true,
) {
  return useQuery({
    queryKey: teamTrackingKeys.latest(teamId ?? '', limit),
    queryFn: async () => {
      const result = await teamService.getLatestTracking(teamId!, limit);

      if (!result.success) {
        throw new Error(result.message ?? 'Không thể tải lịch sử tracking team.');
      }

      return {
        points: result.data ?? [],
        errorMessage: null,
      };
    },
    enabled: enabled && !!teamId,
    staleTime: 1000 * 10,
    refetchInterval: 1000 * 15,
  });
}

export function useSendTeamTrackingHeartbeat() {
  return useMutation({
    mutationFn: ({
      teamId,
      payload,
    }: {
      teamId: string;
      payload: TeamTrackingHeartbeatRequest;
    }) => teamService.sendTrackingHeartbeat(teamId, payload),
    onSuccess: (result: Awaited<ReturnType<typeof teamService.sendTrackingHeartbeat>>) => {
      if (!result?.success) {
        showApiResultToast(result, {
          showSuccess: false,
          errorTitle: 'Không thể đồng bộ vị trí',
          errorMessage: 'Không thể đồng bộ vị trí đội cứu hộ.',
        });
      }
    },
    onError: (error: unknown) => {
      showApiErrorToast(error, {
        errorTitle: 'Không thể đồng bộ vị trí',
        errorMessage: 'Không thể đồng bộ vị trí đội cứu hộ.',
      });
    },
  });
}
