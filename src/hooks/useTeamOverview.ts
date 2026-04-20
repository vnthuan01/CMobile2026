import { useQuery } from '@tanstack/react-query';
import { fetchRescueRequestDetail } from '../services/rescueService';
import { rescueTeamService } from '../services/rescueTeamService';
import { teamService } from '../services/teamService';

export const teamOverviewKeys = {
  all: ['teamOverview'] as const,
  volunteerHome: () => [...teamOverviewKeys.all, 'volunteerHome'] as const,
  currentTeam: () => [...teamOverviewKeys.all, 'currentTeam'] as const,
};

export function useCurrentTeam(enabled = true) {
  return useQuery({
    queryKey: teamOverviewKeys.currentTeam(),
    queryFn: async () => {
      const result = await teamService.getMyTeam();

      if (!result.success) {
        const isEmpty =
          result.status === 404 ||
          /chưa|not found|không thuộc team/i.test(result.message ?? '');

        if (isEmpty) {
          return {
            team: null,
            teamMode: 'rescue' as const,
            isEmpty: true,
          };
        }

        throw new Error(result.message ?? 'Không tải được thông tin đội.');
      }

      return {
        team: result.data,
        teamMode: result.data?.teamMode ?? 'rescue',
        isEmpty: false,
      };
    },
    enabled,
  });
}

export function useVolunteerHomeOverview(enabled = true) {
  return useQuery({
    queryKey: teamOverviewKeys.volunteerHome(),
    enabled,
    queryFn: async () => {
      const teamResult = await teamService.getMyTeam();

      if (!teamResult.success) {
        const isEmpty =
          teamResult.status === 404 ||
          /chưa|not found|không thuộc team/i.test(teamResult.message ?? '');

        if (isEmpty) {
          return {
            team: null,
            batch: null,
            operationStatusMap: {} as Record<string, string>,
            teamMode: 'rescue' as const,
            isEmpty: true,
          };
        }

        throw new Error(teamResult.message || 'Không tải được thông tin đội.');
      }

      if (!teamResult.data?.teamId) {
        return {
          team: null,
          batch: null,
          operationStatusMap: {} as Record<string, string>,
          teamMode: teamResult.data?.teamMode ?? 'rescue',
          isEmpty: true,
        };
      }

      const batchResult = await rescueTeamService.getActiveBatchByTeam(
        teamResult.data.teamId,
      );

      if (!batchResult.success) {
        throw new Error(batchResult.message || 'Không tải được nhiệm vụ.');
      }

      if (!batchResult.data) {
        return {
          team: teamResult.data,
          batch: null,
          operationStatusMap: {} as Record<string, string>,
          teamMode: teamResult.data?.teamMode ?? 'rescue',
          isEmpty: false,
        };
      }

      const statusEntries = await Promise.all(
        (batchResult.data.items || []).map(async (item) => {
          try {
            const detail = await fetchRescueRequestDetail(item.rescueRequestId);
            const operationStatus = detail.assignedRescueTeam?.operationStatus || null;
            return [item.rescueRequestId, operationStatus] as const;
          } catch {
            return [item.rescueRequestId, null] as const;
          }
        }),
      );

      return {
        team: teamResult.data,
        batch: batchResult.data,
        operationStatusMap: Object.fromEntries(
          statusEntries.filter((entry) => Boolean(entry[1])) as Array<readonly [string, string]>,
        ),
        teamMode: teamResult.data?.teamMode ?? 'rescue',
        isEmpty: false,
      };
    },
  });
}

export const useTeamOverview = useVolunteerHomeOverview;
