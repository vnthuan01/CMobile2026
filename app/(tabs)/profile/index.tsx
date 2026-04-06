import CitizenProfile from '@/src/components/profile/CitizenProfile';
import VolunteerProfile from '@/src/components/profile/VolunteerProfile';
import type { AuthState } from '@/src/store/authStore';
import { useAuthStore } from '@/src/store/authStore';
import { useRouter } from 'expo-router';

type CitizenProfileRoute =
  | '/profile/my-volunteer-profile'
  | '/profile/change-password'
  | '/profile/settings'
  | '/profile/help';

type VolunteerProfileRoute =
  | '/profile/my-team'
  | '/profile/tasks'
  | '/profile/progress-rescue'
  | '/profile/progress-relief'
  | '/profile/dashboard-leader'
  | '/profile/report-leader'
  | '/profile/requests'
  | '/profile/change-password'
  | '/profile/settings'
  | '/profile/help';

export default function ProfileIndexScreen() {
  const router = useRouter();
  const user = useAuthStore((state: AuthState) => state.user);
  const logout = useAuthStore((state: AuthState) => state.logout);

  const role = (user?.role ?? '').toLowerCase();
  const isVolunteer = role === 'volunteer';

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return isVolunteer ? (
    <VolunteerProfile
      onLogout={handleLogout}
      onNavigate={(route: string) => router.push(route as any)}
      onEdit={() => router.push('/profile/edit' as any)}
    />
  ) : (
    <CitizenProfile
      onLogout={handleLogout}
      onNavigate={(route: string) => router.push(route as any)}
      onEdit={() => router.push('/profile/edit' as any)}
    />
  );
}
