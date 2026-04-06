import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelRescueRequest } from '../services/rescueService';

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
    },
  });
}
