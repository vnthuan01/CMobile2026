import { useCallback, useEffect, useMemo } from 'react';
import { useCampaignSelectionStore } from '@/src/store/campaignSelectionStore';
import type { AssignedCampaignSummary, TeamDetailResponse } from '@/src/types/team';

export function useSelectedCampaign(
  team?: TeamDetailResponse | null,
  assignedCampaigns: AssignedCampaignSummary[] = [],
  routeCampaignId?: string | null,
) {
  const teamId = team?.teamId ?? null;
  const hasHydrated = useCampaignSelectionStore((state) => state.hasHydrated);
  const loadSelections = useCampaignSelectionStore((state) => state.loadSelections);
  const selectedCampaignByTeamId = useCampaignSelectionStore(
    (state) => state.selectedCampaignByTeamId,
  );
  const setSelectedCampaignIdInStore = useCampaignSelectionStore(
    (state) => state.setSelectedCampaignId,
  );

  const storedCampaignId = teamId ? selectedCampaignByTeamId[teamId] ?? null : null;

  useEffect(() => {
    if (!hasHydrated) {
      loadSelections();
    }
  }, [hasHydrated, loadSelections]);

  const isAssignedCampaignValid = useMemo(() => {
    if (!storedCampaignId) return false;
    return assignedCampaigns.some((campaign) => campaign.campaignId === storedCampaignId);
  }, [assignedCampaigns, storedCampaignId]);

  const selectedCampaignId = useMemo(() => {
    if (routeCampaignId) return routeCampaignId;
    if (storedCampaignId && isAssignedCampaignValid) return storedCampaignId;
    return assignedCampaigns[0]?.campaignId ?? null;
  }, [assignedCampaigns, isAssignedCampaignValid, routeCampaignId, storedCampaignId]);

  useEffect(() => {
    if (!teamId || !selectedCampaignId) return;
    if (storedCampaignId === selectedCampaignId) return;
    setSelectedCampaignIdInStore(teamId, selectedCampaignId);
  }, [selectedCampaignId, setSelectedCampaignIdInStore, storedCampaignId, teamId]);

  const setSelectedCampaignId = useCallback(
    (campaignId: string | null | undefined) => {
      if (!teamId || !campaignId) return;
      setSelectedCampaignIdInStore(teamId, campaignId);
    },
    [setSelectedCampaignIdInStore, teamId],
  );

  return {
    selectedCampaignId,
    setSelectedCampaignId,
    hasHydrated,
  };
}
