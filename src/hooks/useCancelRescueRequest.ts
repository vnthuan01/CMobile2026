import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    cancelRescueRequest,
    fetchRescueRequestDetail,
} from '../services/rescueService';
import { extractApiErrorMessage } from '../utils/apiError';
import { showApiErrorToast } from '../utils/apiToast';
import { showErrorToast, showSuccessToast } from '../utils/toast';

export interface CancelRescueRequestMutationInput {
  requestId: string;
  payload: {
    reason: string;
  };
}

export function useCancelRescueRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, payload }: CancelRescueRequestMutationInput) =>
      cancelRescueRequest(requestId, payload),
    onSuccess: (_result: unknown, variables: CancelRescueRequestMutationInput) => {
      queryClient.invalidateQueries({ queryKey: ['rescueRequests'] });
      queryClient.invalidateQueries({
        queryKey: ['rescueRequestDetail', variables.requestId],
      });

      showSuccessToast('Huỷ yêu cầu thành công', 'Yêu cầu cứu hộ đã được huỷ.');
    },
    onError: async (
      error: unknown,
      variables: CancelRescueRequestMutationInput,
    ) => {
      if (__DEV__) {
        const axiosError = error as any;
        console.warn('[CancelRequest] Mutation error', {
          status: axiosError?.response?.status,
          data: axiosError?.response?.data,
          message: axiosError?.message,
        });
      }

      const rawMessage = extractApiErrorMessage(
        error,
        'Không thể huỷ yêu cầu cứu hộ.',
      );
      const normalized = rawMessage.toLowerCase();

      if (normalized.includes('404') || normalized.includes('not found')) {
        showErrorToast(
          'Không thể huỷ yêu cầu',
          'Không tìm thấy API hủy yêu cầu hoặc yêu cầu này không còn tồn tại trên hệ thống. Hãy kiểm tra log debug để xem URL, method và response backend.',
        );
        return;
      }

      if (
        normalized.includes('expected to affect 1 row') ||
        normalized.includes('actually affected 0 row') ||
        normalized.includes('has been modified or deleted')
      ) {
        try {
          const latest = await fetchRescueRequestDetail(variables.requestId);

          if (latest?.rescueRequestStatus === 'Cancelled') {
            queryClient.invalidateQueries({ queryKey: ['rescueRequests'] });
            queryClient.invalidateQueries({
              queryKey: ['rescueRequestDetail', variables.requestId],
            });
            showSuccessToast(
              'Yêu cầu đã được huỷ',
              'Trạng thái yêu cầu đã chuyển sang huỷ trên hệ thống.',
            );
            return;
          }

          if (
            latest?.rescueRequestStatus !== 'Pending' ||
            latest?.assignedRescueTeam
          ) {
            showErrorToast(
              'Không thể huỷ yêu cầu',
              'Yêu cầu không còn ở trạng thái chờ xác minh hoặc đã được gán đội nên không thể huỷ.',
            );
            return;
          }
        } catch {
          // Keep fallback message below when detail refetch is unavailable.
        }

        showErrorToast(
          'Không thể huỷ yêu cầu',
          'Yêu cầu không còn hợp lệ để hủy. Chỉ có thể hủy khi đơn đang chờ xác minh và chưa được gán đội.',
        );
        return;
      }

      showApiErrorToast(error, {
        errorTitle: 'Không thể huỷ yêu cầu',
        errorMessage: 'Không thể huỷ yêu cầu cứu hộ.',
      });
    },
  });
}
