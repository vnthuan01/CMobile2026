import { useQuery } from '@tanstack/react-query';
import { volunteerService } from '../services/volunteerService';

type VolunteerProfileResult = Awaited<
  ReturnType<typeof volunteerService.getMyVolunteerProfile>
>;

export const volunteerProfileKeys = {
  all: ['volunteerProfile'] as const,
  myProfile: () => [...volunteerProfileKeys.all, 'myProfile'] as const,
  skills: () => [...volunteerProfileKeys.all, 'skills'] as const,
  registrationSkills: () =>
    [...volunteerProfileKeys.all, 'registrationSkills'] as const,
};

export function useMyVolunteerProfile(
  enabled = true,
  _legacyRefetchInterval: number | false = false,
) {
  return useQuery({
    queryKey: volunteerProfileKeys.myProfile(),
    queryFn: async () => {
      const result = await volunteerService.getMyVolunteerProfile();

      if (!result.success) {
        throw new Error(result.message ?? 'Không thể tải hồ sơ volunteer.');
      }

      return result;
    },
    enabled,
    staleTime: 1000 * 60,
    refetchOnMount: true,
    refetchOnReconnect: true,
    select: (result: VolunteerProfileResult) => ({
      profile: result.data,
      errorMessage: null,
    }),
  });
}

export function useAllSkills(enabled = true) {
  return useQuery({
    queryKey: volunteerProfileKeys.skills(),
    queryFn: async () => {
      const result = await volunteerService.getAllSkills();

      if (!result.success) {
        throw new Error(result.message ?? 'Không thể lấy danh sách kỹ năng.');
      }

      return result.data;
    },
    enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnReconnect: true,
  });
}
