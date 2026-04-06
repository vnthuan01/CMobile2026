import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { teamJoinRequestService } from '../services/teamJoinRequestService';
import type { CreateTeamJoinRequestPayload } from '../types/joinRequest';

export const teamJoinRequestKeys = {
  all: ['teamJoinRequests'] as const,
  myList: (pageIndex: number, pageSize: number) =>
    [...teamJoinRequestKeys.all, 'myList', { pageIndex, pageSize }] as const,
};

export function useMyTeamJoinRequests(pageIndex = 1, pageSize = 10, enabled = true) {
  return useQuery({
    queryKey: teamJoinRequestKeys.myList(pageIndex, pageSize),
    queryFn: () => teamJoinRequestService.getMyRequests({ pageIndex, pageSize }),
    enabled,
    select: (result) => ({
      requests: result.success ? (result.data?.data ?? []) : [],
      pagination: result.success ? result.data : null,
      errorMessage: result.success ? null : (result.message ?? null),
    }),
  });
}

export function useCreateTeamJoinRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTeamJoinRequestPayload) =>
      teamJoinRequestService.create(payload),
    onSuccess: (result) => {
      if (result?.success) {
        queryClient.invalidateQueries({ queryKey: teamJoinRequestKeys.all });
      }
    },
  });
}

export function useCancelTeamJoinRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => teamJoinRequestService.cancel(requestId),
    onSuccess: (result) => {
      if (result?.success) {
        queryClient.invalidateQueries({ queryKey: teamJoinRequestKeys.all });
      }
    },
  });
}
