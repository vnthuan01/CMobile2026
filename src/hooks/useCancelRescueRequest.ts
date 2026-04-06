import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelRescueRequest } from '../services/rescueService';
import { showApiErrorToast } from '../utils/apiToast';
import { showSuccessToast } from '../utils/toast';

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
      showApiErrorToast(error, {
        errorTitle: 'Không thể huỷ yêu cầu',
        errorMessage: 'Không thể huỷ yêu cầu cứu hộ.',
      });
    },
  });
}
