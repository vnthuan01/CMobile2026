import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { teamJoinRequestService } from '../services/teamJoinRequestService';
import type { CreateTeamJoinRequestPayload } from '../types/joinRequest';
import { showApiErrorToast, showApiResultToast } from '../utils/apiToast';

export const teamJoinRequestKeys = {
  all: ['teamJoinRequests'] as const,
  myList: (pageIndex: number, pageSize: number) =>
    [...teamJoinRequestKeys.all, 'myList', { pageIndex, pageSize }] as const,
};

export function useMyTeamJoinRequests(pageIndex = 1, pageSize = 10, enabled = true) {
  return useQuery({
    queryKey: teamJoinRequestKeys.myList(pageIndex, pageSize),
    queryFn: async () => {
      const result = await teamJoinRequestService.getMyRequests({ pageIndex, pageSize });

      if (!result.success) {
        throw new Error(
          result.message ?? 'Không thể tải danh sách yêu cầu tham gia team.',
        );
      }

      return {
        requests: result.data?.data ?? [],
        pagination: result.data,
        errorMessage: null,
      };
    },
    enabled,
  });
}

export function useCreateTeamJoinRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTeamJoinRequestPayload) =>
      teamJoinRequestService.create(payload),
    onSuccess: (result: Awaited<ReturnType<typeof teamJoinRequestService.create>>) => {
      if (result?.success) {
        queryClient.invalidateQueries({ queryKey: teamJoinRequestKeys.all });
      }

      showApiResultToast(result, {
        successTitle: 'Gửi yêu cầu thành công',
        successMessage: 'Yêu cầu tham gia đội đã được gửi.',
        errorTitle: 'Không thể gửi yêu cầu',
        errorMessage: 'Không thể gửi yêu cầu tham gia đội.',
      });
    },
    onError: (error: unknown) => {
      showApiErrorToast(error, {
        errorTitle: 'Không thể gửi yêu cầu',
        errorMessage: 'Không thể gửi yêu cầu tham gia đội.',
      });
    },
  });
}

export function useCancelTeamJoinRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => teamJoinRequestService.cancel(requestId),
    onSuccess: (result: Awaited<ReturnType<typeof teamJoinRequestService.cancel>>) => {
      if (result?.success) {
        queryClient.invalidateQueries({ queryKey: teamJoinRequestKeys.all });
      }

      showApiResultToast(result, {
        successTitle: 'Huỷ yêu cầu thành công',
        successMessage: 'Đã huỷ yêu cầu tham gia đội.',
        errorTitle: 'Không thể huỷ yêu cầu',
        errorMessage: 'Không thể huỷ yêu cầu tham gia đội.',
      });
    },
    onError: (error: unknown) => {
      showApiErrorToast(error, {
        errorTitle: 'Không thể huỷ yêu cầu',
        errorMessage: 'Không thể huỷ yêu cầu tham gia đội.',
      });
    },
  });
}
