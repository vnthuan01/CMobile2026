import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { stationJoinRequestService } from '../services/stationJoinRequestService';
import type { CreateStationJoinRequestPayload } from '../types/joinRequest';
import { showApiErrorToast, showApiResultToast } from '../utils/apiToast';

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

      showApiResultToast(result, {
        successTitle: 'Gửi yêu cầu thành công',
        successMessage: 'Yêu cầu tham gia trạm đã được gửi.',
        errorTitle: 'Không thể gửi yêu cầu',
        errorMessage: 'Không thể gửi yêu cầu tham gia trạm.',
      });
    },
    onError: (error) => {
      showApiErrorToast(error, {
        errorTitle: 'Không thể gửi yêu cầu',
        errorMessage: 'Không thể gửi yêu cầu tham gia trạm.',
      });
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

      showApiResultToast(result, {
        successTitle: 'Huỷ yêu cầu thành công',
        successMessage: 'Đã huỷ yêu cầu tham gia trạm.',
        errorTitle: 'Không thể huỷ yêu cầu',
        errorMessage: 'Không thể huỷ yêu cầu tham gia trạm.',
      });
    },
    onError: (error) => {
      showApiErrorToast(error, {
        errorTitle: 'Không thể huỷ yêu cầu',
        errorMessage: 'Không thể huỷ yêu cầu tham gia trạm.',
      });
    },
  });
}
