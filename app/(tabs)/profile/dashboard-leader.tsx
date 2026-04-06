import DashboardTeamLeaderScreen from '@/src/features/teamleader/screens/DashboardTeamLeaderScreen';
import { useRouter } from 'expo-router';

export default function ProfileDashboardLeaderRoute() {
  const router = useRouter();

  return (
    <DashboardTeamLeaderScreen
      onBack={() => router.replace('/profile')}
      onAllocateTask={() => router.push('/profile/allocate-task' as any)}
    />
  );
}
