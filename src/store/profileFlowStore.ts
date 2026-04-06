import create from 'zustand';
import type { VolunteerProfileResponse } from '../types/volunteer';

interface ProfileFlowState {
  volunteerFormMode: 'create' | 'resubmit';
  volunteerFormInitialProfile: VolunteerProfileResponse | null;
  setVolunteerDraft: (
    mode: 'create' | 'resubmit',
    profile?: VolunteerProfileResponse | null,
  ) => void;
  resetVolunteerDraft: () => void;
}

export type ProfileFlowStoreState = ProfileFlowState;

export const useProfileFlowStore = create<ProfileFlowState>(
  (set: (partial: Partial<ProfileFlowState>) => void) => ({
  volunteerFormMode: 'create',
  volunteerFormInitialProfile: null,
  setVolunteerDraft: (
    mode: 'create' | 'resubmit',
    profile: VolunteerProfileResponse | null = null,
  ) => {
    set({
      volunteerFormMode: mode,
      volunteerFormInitialProfile: profile,
    });
  },
  resetVolunteerDraft: () => {
    set({
      volunteerFormMode: 'create',
      volunteerFormInitialProfile: null,
    });
  },
}),
);
