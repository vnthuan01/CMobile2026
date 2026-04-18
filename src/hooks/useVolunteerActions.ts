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
    queryKey: volunteerProfileKeys.registrationSkills(),
    queryFn: async () => {
      const result = await volunteerService.getAllSkills();

      if (!result.success) {
        throw new Error(result.message ?? 'Không thể lấy danh sách kỹ năng.');
      }

      return {
        skills: result.data ?? [],
        errorMessage: null,
      };
    },
    enabled,
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreateVolunteerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVolunteerRequest) =>
      volunteerService.createVolunteerProfile(payload),
    onSuccess: (result: Awaited<ReturnType<typeof volunteerService.createVolunteerProfile>>) => {
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
    onSuccess: (result: Awaited<ReturnType<typeof volunteerService.resubmitVolunteerProfile>>) => {
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
    onSuccess: (result: Awaited<ReturnType<typeof volunteerService.updateMyVolunteerProfile>>) => {
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
