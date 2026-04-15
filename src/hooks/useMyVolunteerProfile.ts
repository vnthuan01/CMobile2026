import { useQuery } from '@tanstack/react-query';
import { volunteerService } from '../services/volunteerService';

export const volunteerProfileKeys = {
  all: ['volunteerProfile'] as const,
  myProfile: () => [...volunteerProfileKeys.all, 'myProfile'] as const,
  skills: () => [...volunteerProfileKeys.all, 'skills'] as const,
};

export function useMyVolunteerProfile(
  enabled = true,
  refetchInterval: number | false = false,
) {
  return useQuery({
    queryKey: volunteerProfileKeys.myProfile(),
    queryFn: () => volunteerService.getMyVolunteerProfile(),
    enabled,
    refetchInterval,
    select: (result) => ({
      profile: result.success ? result.data : null,
      errorMessage: result.success ? null : (result.message ?? null),
    }),
  });
}

export function useAllSkills(enabled = true) {
  return useQuery({
    queryKey: volunteerProfileKeys.skills(),
    queryFn: () => volunteerService.getAllSkills(),
    enabled,
    staleTime: 1000 * 60 * 10, // skills rarely change: 10 min
    select: (result) => (result.success ? result.data : []),
  });
}
