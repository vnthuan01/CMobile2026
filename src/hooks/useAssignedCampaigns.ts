import { useQuery } from '@tanstack/react-query';
import { teamService } from '../services/teamService';

export const assignedCampaignKeys = {
  all: ['assignedCampaigns'] as const,
  byTeam: (teamId: string) => [...assignedCampaignKeys.all, teamId] as const,
};

export function useAssignedCampaigns(teamId?: string | null, enabled = true) {
  return useQuery({
    queryKey: assignedCampaignKeys.byTeam(teamId || ''),
    queryFn: async () => {
      const result = await teamService.getAssignedCampaigns(teamId || '');
      if (!result.success) throw new Error(result.message);
      return result.data ?? [];
    },
    enabled: enabled && !!teamId,
    staleTime: 1000 * 15,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
}
