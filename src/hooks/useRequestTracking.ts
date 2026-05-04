import { useQuery } from '@tanstack/react-query';
import { fetchRescueRequestDetail, fetchRescueTeamLocation } from '../services/rescueService';

export const requestTrackingKeys = {
  all: ['requestTracking'] as const,
  detail: (requestId: string) => [...requestTrackingKeys.all, requestId] as const,
};

export function useRequestTrackingDetail(requestId: string) {
  return useQuery({
    queryKey: requestTrackingKeys.detail(requestId),
    queryFn: async () => {
      const detail = await fetchRescueRequestDetail(requestId);
      let teamLocation = null;

      if (
        ['Assigned', 'InProgress'].includes(detail.rescueRequestStatus) &&
        detail.assignedRescueTeam
      ) {
        try {
          teamLocation = await fetchRescueTeamLocation(requestId);
        } catch {
          teamLocation = null;
        }
      }

      return { detail, teamLocation };
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchInterval: (query: { state: { data?: { detail?: { rescueRequestStatus?: string } } } }) => {
      const status = query.state.data?.detail?.rescueRequestStatus;
      return status && ['Assigned', 'InProgress'].includes(status) ? 10000 : false;
    },
  });
}
