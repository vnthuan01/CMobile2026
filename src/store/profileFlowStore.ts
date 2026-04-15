import { create } from 'zustand';
import type { CampaignListItem } from '../services/donationService';
import type { VolunteerProfileResponse } from '../types/volunteer';

interface ProfileFlowState {
  volunteerFormMode: 'create' | 'resubmit';
  volunteerFormInitialProfile: VolunteerProfileResponse | null;
  selectedVolunteerCampaign: CampaignListItem | null;
  setVolunteerDraft: (
    mode: 'create' | 'resubmit',
    profile?: VolunteerProfileResponse | null,
  ) => void;
  setSelectedVolunteerCampaign: (campaign: CampaignListItem | null) => void;
  resetVolunteerDraft: () => void;
}

export type ProfileFlowStoreState = ProfileFlowState;

export const useProfileFlowStore = create<ProfileFlowState>(
  (set: (partial: Partial<ProfileFlowState>) => void) => ({
    volunteerFormMode: 'create',
    volunteerFormInitialProfile: null,
    selectedVolunteerCampaign: null,
    setVolunteerDraft: (
      mode: 'create' | 'resubmit',
      profile: VolunteerProfileResponse | null = null,
    ) => {
      set({
        volunteerFormMode: mode,
        volunteerFormInitialProfile: profile,
      });
    },
    setSelectedVolunteerCampaign: (campaign: CampaignListItem | null) => {
      set({ selectedVolunteerCampaign: campaign });
    },
    resetVolunteerDraft: () => {
      set({
        volunteerFormMode: 'create',
        volunteerFormInitialProfile: null,
        selectedVolunteerCampaign: null,
      });
    },
  }),
);
