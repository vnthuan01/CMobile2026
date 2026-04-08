import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelRescueRequest } from '../services/rescueService';
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
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rescueRequests'] });
      queryClient.invalidateQueries({
        queryKey: ['rescueRequestDetail', variables.requestId],
      });

      showSuccessToast('Huỷ yêu cầu thành công', 'Yêu cầu cứu hộ đã được huỷ.');
    },
    onError: (error) => {
      const rawMessage = extractApiErrorMessage(
        error,
        'Không thể huỷ yêu cầu cứu hộ.',
      );
      const normalized = rawMessage.toLowerCase();

      if (
        normalized.includes('expected to affect 1 row') ||
        normalized.includes('has been modified or deleted')
      ) {
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
