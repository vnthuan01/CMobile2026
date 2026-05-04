import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const CAMPAIGN_SELECTION_STORAGE_KEY = 'campaign_selection_by_team';

interface CampaignSelectionState {
  selectedCampaignByTeamId: Record<string, string>;
  hasHydrated: boolean;
  setSelectedCampaignId: (
    teamId: string | null | undefined,
    campaignId: string | null | undefined,
  ) => void;
  clearSelectedCampaignId: (teamId?: string | null) => void;
  loadSelections: () => Promise<void>;
}

export const useCampaignSelectionStore = create<CampaignSelectionState>(
  (set, get) => ({
    selectedCampaignByTeamId: {},
    hasHydrated: false,
    setSelectedCampaignId: (teamId, campaignId) => {
      if (!teamId) return;
      const nextSelections = {
        ...get().selectedCampaignByTeamId,
        [teamId]: campaignId ?? '',
      };
      set({ selectedCampaignByTeamId: nextSelections });
      AsyncStorage.setItem(
        CAMPAIGN_SELECTION_STORAGE_KEY,
        JSON.stringify(nextSelections),
      ).catch(() => {});
    },
    clearSelectedCampaignId: (teamId) => {
      if (!teamId) return;
      const nextSelections = { ...get().selectedCampaignByTeamId };
      delete nextSelections[teamId];
      set({ selectedCampaignByTeamId: nextSelections });
      AsyncStorage.setItem(
        CAMPAIGN_SELECTION_STORAGE_KEY,
        JSON.stringify(nextSelections),
      ).catch(() => {});
    },
    loadSelections: async () => {
      try {
        const raw = await AsyncStorage.getItem(CAMPAIGN_SELECTION_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            set({ selectedCampaignByTeamId: parsed, hasHydrated: true });
            return;
          }
        }
      } catch {
      }
      set({ hasHydrated: true });
    },
  }),
);
