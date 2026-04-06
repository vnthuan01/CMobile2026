import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { stationJoinRequestService } from '../services/stationJoinRequestService';
import type { CreateStationJoinRequestPayload } from '../types/joinRequest';

export const stationJoinRequestKeys = {
  all: ['stationJoinRequests'] as const,
  myList: (pageIndex: number, pageSize: number) =>
    [...stationJoinRequestKeys.all, 'myList', { pageIndex, pageSize }] as const,
};

export function useStationJoinRequests(pageIndex = 1, pageSize = 10, enabled = true) {
  return useQuery({
    queryKey: stationJoinRequestKeys.myList(pageIndex, pageSize),
    queryFn: () =>
      stationJoinRequestService.getMyRequests({ pageIndex, pageSize }),
    enabled,
    select: (result) => ({
      requests: result.success ? (result.data?.data ?? []) : [],
      pagination: result.success ? result.data : null,
      errorMessage: result.success ? null : (result.message ?? null),
    }),
  });
}

export function useCreateStationJoinRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStationJoinRequestPayload) =>
      stationJoinRequestService.create(payload),
    onSuccess: (result) => {
      if (result?.success) {
        queryClient.invalidateQueries({ queryKey: stationJoinRequestKeys.all });
      }
    },
  });
}

export function useCancelStationJoinRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) =>
      stationJoinRequestService.cancel(requestId),
    onSuccess: (result) => {
      if (result?.success) {
        queryClient.invalidateQueries({ queryKey: stationJoinRequestKeys.all });
      }
    },
  });
}
