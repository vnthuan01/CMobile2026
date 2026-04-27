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

type VolunteerProfileRoute =
  | '/tasks'
  | '/profile/my-team'
  | '/profile/tasks'
  | '/profile/dashboard-leader'
  | '/profile/requests'
  | '/profile/change-password'
  | '/profile/settings'
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
      onNavigate={(route: string) => router.push(route as any)}
      onEdit={() => router.push('/profile/edit' as any)}
      isLeader={isLeader}
    />
  ) : (
    <CitizenProfile
      onLogout={handleLogout}
      onNavigate={(route: CitizenProfileRoute) => router.push(route as any)}
    />
  );
}
