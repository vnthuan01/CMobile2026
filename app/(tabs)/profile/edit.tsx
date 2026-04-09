import UpdateProfileCitizenScreen from '@/src/features/profile/screens/UpdateProfileCitizenScreen';
import UpdateProfileVolunteerScreen from '@/src/features/profile/screens/UpdateProfileVolunteerScreen';
import type { AuthState } from '@/src/store/authStore';
import { useAuthStore } from '@/src/store/authStore';
import { useRouter } from 'expo-router';

export default function EditProfileRoute() {
  const router = useRouter();
  const user = useAuthStore((state: AuthState) => state.user);
  const isVolunteer = (user?.role ?? '').toLowerCase() === 'volunteer';

  return isVolunteer ? (
    <UpdateProfileVolunteerScreen onBack={() => router.replace('/profile')} />
  ) : (
    <UpdateProfileCitizenScreen
      hideBackButton
      onCancel={() => router.replace('/profile/user-profile')}
      onSave={() => router.replace('/profile/user-profile')}
    />
  );
}
