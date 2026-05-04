import RegisterVolunteerScreen from '@/src/features/profile/screens/RegisterVolunteerScreen';
import type { ProfileFlowStoreState } from '@/src/store/profileFlowStore';
import { useProfileFlowStore } from '@/src/store/profileFlowStore';
import { useRouter } from 'expo-router';

export default function ProfileRegisterVolunteerRoute() {
  const router = useRouter();
  const volunteerFormMode = useProfileFlowStore(
    (state: ProfileFlowStoreState) => state.volunteerFormMode,
  );
  const volunteerFormInitialProfile = useProfileFlowStore(
    (state: ProfileFlowStoreState) => state.volunteerFormInitialProfile,
  );
  const resetVolunteerDraft =
    useProfileFlowStore.getState().resetVolunteerDraft;

  return (
    <RegisterVolunteerScreen
      onBack={() => router.replace('/profile/my-volunteer-profile')}
      onSuccess={() => {
        resetVolunteerDraft();
        router.replace({
          pathname: '/profile/my-volunteer-profile',
          params: { submitted: '1' },
        } as any);
      }}
      mode={volunteerFormMode}
      initialProfile={volunteerFormInitialProfile}
    />
  );
}
