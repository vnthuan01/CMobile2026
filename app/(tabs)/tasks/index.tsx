import '@/global.css';
import TeamTasksScreen from '@/src/components/volunteer/TeamTasksScreen';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function TasksRouteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ openMap?: string }>();
  const openMapOnLoad = params.openMap === '1' || params.openMap === 'true';

  return (
    <TeamTasksScreen
      onBack={() => router.back()}
      openMapOnLoad={openMapOnLoad}
    />
  );
}
