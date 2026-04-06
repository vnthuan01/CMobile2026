import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  submitRescueRequest,
  type NormalRescuePayload,
  type EmergencyRescuePayload,
} from '../services/rescueService';
import { rescueRequestKeys } from './useMyRescueRequests';

type RescuePayload = NormalRescuePayload | EmergencyRescuePayload;

export function useSubmitRescueRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RescuePayload) => submitRescueRequest(payload),
    onSuccess: () => {
      // Invalidate so the list screen refetches automatically
      queryClient.invalidateQueries({ queryKey: rescueRequestKeys.all });
    },
  });
}
