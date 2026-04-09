import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import type { UpdateUserProfilePayload } from '../types/user';
import { showApiErrorToast, showApiResultToast } from '../utils/apiToast';
import { citizenProfileKeys } from './useCitizenProfile';

export const userProfileKeys = {
  all: ['userProfile'] as const,
  me: () => [...userProfileKeys.all, 'me'] as const,
};

export function useUserProfile(enabled = true) {
  return useQuery({
    queryKey: userProfileKeys.me(),
    queryFn: () => userService.getProfile(),
    enabled,
    select: (result) => ({
      profile: result.success ? result.data : null,
      errorMessage: result.success ? null : (result.message ?? null),
    }),
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateUserProfilePayload) =>
      userService.updateProfile(payload),
    onSuccess: async (result) => {
      if (result?.success) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: userProfileKeys.all }),
          queryClient.invalidateQueries({ queryKey: citizenProfileKeys.all }),
        ]);

        await Promise.all([
          queryClient.refetchQueries({ queryKey: userProfileKeys.all }),
          queryClient.refetchQueries({ queryKey: citizenProfileKeys.all }),
        ]);
      }

      showApiResultToast(result, {
        successTitle: 'Cập nhật thành công',
        successMessage: 'Thông tin cá nhân đã được cập nhật.',
        errorTitle: 'Không thể cập nhật',
        errorMessage: 'Không thể cập nhật thông tin cá nhân.',
      });
    },
    onError: (error) => {
      showApiErrorToast(error, {
        errorTitle: 'Không thể cập nhật',
        errorMessage: 'Không thể cập nhật thông tin cá nhân.',
      });
    },
  });
}
