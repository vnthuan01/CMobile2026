import { useMyTeam } from '@/src/hooks/useMyTeam';
import CitizenProfile from '@/src/features/profile/screens/CitizenProfileScreen';
import VolunteerProfile from '@/src/features/profile/screens/VolunteerProfileScreen';
import type { AuthState } from '@/src/store/authStore';
import { useAuthStore } from '@/src/store/authStore';
import { useRouter } from 'expo-router';

type CitizenProfileRoute =
  | '/profile/user-profile'
  | '/profile/my-volunteer-profile'
  | '/profile/change-password'
  | '/profile/settings'
  | '/profile/requests'
  | '/profile/help';

export default function ProfileIndexScreen() {
  const router = useRouter();
  const user = useAuthStore((state: AuthState) => state.user);
  const logout = useAuthStore((state: AuthState) => state.logout);
  const { data: myTeamData } = useMyTeam(Boolean(user));

  const role = (user?.role ?? '').toLowerCase();
  const isVolunteer = role === 'volunteer' || role === 'leader';
  const team = myTeamData?.team;
  const isLeader = !!user?.id && !!team?.leader?.userId && user.id === team.leader.userId;

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return isVolunteer ? (
    <VolunteerProfile
      onLogout={handleLogout}
      onNavigate={(route: string) => router.replace(route as any)}
      onEdit={() => router.replace('/profile/edit' as any)}
      isLeader={isLeader}
    />
  ) : (
    <CitizenProfile
      onLogout={handleLogout}
      onNavigate={(route: CitizenProfileRoute) => router.replace(route as any)}
    />
  );
}
