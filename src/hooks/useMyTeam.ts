import { useQuery } from '@tanstack/react-query';
import { teamService } from '../services/teamService';

export const teamKeys = {
  all: ['team'] as const,
  myTeam: () => [...teamKeys.all, 'myTeam'] as const,
};

export function useMyTeam(enabled = true) {
  return useQuery({
    queryKey: teamKeys.myTeam(),
    queryFn: async () => {
      const result = await teamService.getMyTeam();

      if (!result.success) {
        const isEmpty =
          result.status === 404 ||
          /chưa|not found|không thuộc team/i.test(result.message ?? '');

        if (isEmpty) {
          return {
            team: null,
            isEmpty: true,
            errorMessage: null,
          };
        }

        throw new Error(result.message ?? 'Không tải được thông tin team.');
      }

      return {
        team: result.data,
        isEmpty: false,
        errorMessage: null,
      };
    },
    enabled,
  });
}
