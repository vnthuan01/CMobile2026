import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import type { UpdateUserProfilePayload } from '../types/user';
import { showApiErrorToast, showApiResultToast } from '../utils/apiToast';
import { citizenProfileKeys } from './useCitizenProfile';

type UserProfileResult = Awaited<ReturnType<typeof userService.getProfile>>;

export const userProfileKeys = {
  all: ['userProfile'] as const,
  me: () => [...userProfileKeys.all, 'me'] as const,
};

export function useUserProfile(enabled = true) {
  return useQuery({
    queryKey: userProfileKeys.me(),
    queryFn: async () => {
      const result = await userService.getProfile();

      if (!result.success) {
        throw new Error(result.message ?? 'Không thể tải hồ sơ người dùng.');
      }

      return result;
    },
    enabled,
    select: (result: UserProfileResult) => ({
      profile: result.data,
      errorMessage: null,
    }),
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateUserProfilePayload) =>
      userService.updateProfile(payload),
    onSuccess: async (result: Awaited<ReturnType<typeof userService.updateProfile>>) => {
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
    onError: (error: unknown) => {
      showApiErrorToast(error, {
        errorTitle: 'Không thể cập nhật',
        errorMessage: 'Không thể cập nhật thông tin cá nhân.',
      });
    },
  });
}
