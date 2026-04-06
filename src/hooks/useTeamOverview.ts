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
    queryFn: () => teamService.getMyTeam(),
    enabled,
    select: (result) => ({
      team: result.success ? result.data : null,
      errorMessage: result.success ? null : (result.message ?? null),
      isEmpty:
        !result.success &&
        (result.status === 404 ||
          /chưa|not found|không thuộc team/i.test(result.message ?? '')),
    }),
  });
}

export function useVolunteerHomeOverview(enabled = true) {
  return useQuery({
    queryKey: teamOverviewKeys.volunteerHome(),
    enabled,
    queryFn: async () => {
      const teamResult = await teamService.getMyTeam();

      if (!teamResult.success || !teamResult.data?.teamId) {
        return {
          success: false,
          team: null,
          batch: null,
          operationStatusMap: {} as Record<string, string>,
          message: teamResult.message || 'Không tải được thông tin đội.',
          isEmpty:
            teamResult.status === 404 ||
            /chưa|not found|không thuộc team/i.test(teamResult.message ?? ''),
        };
      }

      const batchResult = await rescueTeamService.getActiveBatchByTeam(
        teamResult.data.teamId,
      );

      if (!batchResult.success || !batchResult.data) {
        return {
          success: false,
          team: teamResult.data,
          batch: null,
          operationStatusMap: {} as Record<string, string>,
          message: batchResult.message || 'Không tải được nhiệm vụ.',
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
        success: true,
        team: teamResult.data,
        batch: batchResult.data,
        operationStatusMap: Object.fromEntries(
          statusEntries.filter((entry) => Boolean(entry[1])) as Array<readonly [string, string]>,
        ),
        message: null,
        isEmpty: false,
      };
    },
  });
}
