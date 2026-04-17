import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  volunteerService,
  type CreateVolunteerRequest,
  type ResubmitVolunteerProfileRequest,
} from '../services/volunteerService';
import { showApiErrorToast } from '../utils/apiToast';
import { volunteerProfileKeys } from './useMyVolunteerProfile';

export function useVolunteerSkills(enabled = true) {
  return useQuery({
    queryKey: volunteerProfileKeys.skills(),
    queryFn: () => volunteerService.getAllSkills(),
    enabled,
    staleTime: 1000 * 60 * 10,
    select: (result: any) => ({
      skills: result.success ? result.data : [],
      errorMessage: result.success ? null : (result.message ?? null),
    }),
  });
}

export function useCreateVolunteerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVolunteerRequest) =>
      volunteerService.createVolunteerProfile(payload),
    onSuccess: (result: any) => {
      if (result?.success) {
        queryClient.invalidateQueries({ queryKey: volunteerProfileKeys.all });
      }
    },
    onError: (error: unknown) => {
      showApiErrorToast(error, {
        errorTitle: 'Không thể gửi hồ sơ',
        errorMessage: 'Không thể gửi hồ sơ tình nguyện viên.',
      });
    },
  });
}

export function useResubmitVolunteerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ResubmitVolunteerProfileRequest) =>
      volunteerService.resubmitVolunteerProfile(payload),
    onSuccess: (result: any) => {
      if (result?.success) {
        queryClient.invalidateQueries({ queryKey: volunteerProfileKeys.all });
      }
    },
    onError: (error: unknown) => {
      showApiErrorToast(error, {
        errorTitle: 'Không thể gửi lại hồ sơ',
        errorMessage: 'Không thể gửi lại hồ sơ tình nguyện viên.',
      });
    },
  });
}

export function useUpdateVolunteerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ResubmitVolunteerProfileRequest) =>
      volunteerService.updateMyVolunteerProfile(payload),
    onSuccess: (result: any) => {
      if (result?.success) {
        queryClient.invalidateQueries({ queryKey: volunteerProfileKeys.all });
      }
    },
    onError: (error: unknown) => {
      showApiErrorToast(error, {
        errorTitle: 'Không thể cập nhật hồ sơ',
        errorMessage: 'Không thể cập nhật thông tin tình nguyện viên.',
      });
    },
  });
}
