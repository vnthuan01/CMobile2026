import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  submitRescueRequest,
  type NormalRescuePayload,
  type EmergencyRescuePayload,
} from '../services/rescueService';
import { showApiErrorToast } from '../utils/apiToast';
import { showSuccessToast } from '../utils/toast';
import { rescueRequestKeys } from './useMyRescueRequests';

type RescuePayload = NormalRescuePayload | EmergencyRescuePayload;

export function useSubmitRescueRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RescuePayload) => submitRescueRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rescueRequestKeys.all });
      showSuccessToast('Gửi yêu cầu thành công', 'Yêu cầu cứu hộ đã được gửi.');
    },
    onError: (error: unknown) => {
      showApiErrorToast(error, {
        errorTitle: 'Không thể gửi yêu cầu',
        errorMessage: 'Không thể gửi yêu cầu cứu hộ.',
      });
    },
  });
}
