import { useMutation, useQuery } from '@tanstack/react-query';
import { teamService } from '../services/teamService';
import type { TeamTrackingHeartbeatRequest } from '../types/team';

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
    queryFn: () => teamService.getLatestTracking(teamId!, limit),
    enabled: enabled && !!teamId,
    staleTime: 1000 * 10,
    refetchInterval: 1000 * 15,
    select: (result) => ({
      points: result.success ? (result.data ?? []) : [],
      errorMessage: result.success ? null : (result.message ?? null),
    }),
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
  });
}
