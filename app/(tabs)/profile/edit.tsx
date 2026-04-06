import UpdateProfileCitizenScreen from '@/src/components/profile/UpdateProfileCitizenScreen';
import UpdateProfileVolunteerScreen from '@/src/components/profile/UpdateProfileVolunteerScreen';
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
    <UpdateProfileCitizenScreen onBack={() => router.replace('/profile')} />
  );
}
