import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import type { UpdateUserProfilePayload } from '../types/user';

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
    onSuccess: (result) => {
      if (result?.success) {
        queryClient.invalidateQueries({ queryKey: userProfileKeys.all });
      }
    },
  });
}
