import MyVolunteerProfileScreen from '@/src/features/profile/screens/MyVolunteerProfileScreen';
import { useProfileFlowStore } from '@/src/store/profileFlowStore';
import type { VolunteerProfileResponse } from '@/src/types/volunteer';
import { useRouter } from 'expo-router';

export default function ProfileMyVolunteerProfileRoute() {
  const router = useRouter();
  const setVolunteerDraft = useProfileFlowStore.getState().setVolunteerDraft;

  return (
    <MyVolunteerProfileScreen
      onBack={() => router.replace('/profile')}
      onCreate={() => {
        setVolunteerDraft('create', null);
        router.push('/profile/register-volunteer' as any);
      }}
      onResubmit={(profile: VolunteerProfileResponse) => {
        setVolunteerDraft('resubmit', profile);
        router.push('/profile/register-volunteer' as any);
      }}
    />
  );
}
