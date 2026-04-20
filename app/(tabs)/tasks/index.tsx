import '@/global.css';
import ReliefTasksScreen from '@/src/features/volunteer/screens/ReliefTasksScreen';
import RescueMissionCenterScreen from '@/src/features/volunteer/screens/RescueMissionCenterScreen';
import { useMyTeam } from '@/src/hooks/useMyTeam';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function TasksRouteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const openMapOnLoad = params.openMap === '1' || params.openMap === 'true';
  const { data } = useMyTeam();
  const teamMode = data?.teamMode ?? 'rescue';

  if (teamMode === 'relief') {
    return <ReliefTasksScreen onBack={() => router.back()} />;
  }

  return (
    <RescueMissionCenterScreen
      onBack={() => router.back()}
      openMapOnLoad={openMapOnLoad}
    />
  );
}
