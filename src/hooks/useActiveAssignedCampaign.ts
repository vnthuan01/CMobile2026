import { useMemo } from 'react';
import type { AssignedCampaignSummary, TeamDetailResponse } from '@/src/types/team';

export function useActiveAssignedCampaign(
  team?: TeamDetailResponse | null,
  selectedCampaignId?: string | null,
  fallbackAssignedCampaigns: AssignedCampaignSummary[] = [],
) {
  return useMemo(() => {
    const assignedCampaigns = [...(team?.assignedCampaigns ?? []), ...fallbackAssignedCampaigns]
      .filter(
      (campaign: AssignedCampaignSummary) =>
        String(campaign?.campaignId ?? '').length > 0,
      )
      .reduce<AssignedCampaignSummary[]>((acc, campaign) => {
        if (acc.some((item) => item.campaignId === campaign.campaignId)) return acc;
        acc.push(campaign);
        return acc;
      }, []);

    const selectedCampaign = selectedCampaignId
      ? assignedCampaigns.find(
          (campaign: AssignedCampaignSummary) =>
            campaign.campaignId === selectedCampaignId,
        ) ?? null
      : null;

    const activeCampaign =
      selectedCampaign ??
      assignedCampaigns.find(
        (campaign: AssignedCampaignSummary) =>
          String(campaign?.campaignId ?? '').length > 0,
      ) ?? null;

    return {
      assignedCampaigns,
      selectedCampaign,
      activeCampaign,
      campaignId: activeCampaign?.campaignId ?? null,
      campaignName: activeCampaign?.campaignName ?? null,
    };
  }, [fallbackAssignedCampaigns, selectedCampaignId, team?.assignedCampaigns]);
}
