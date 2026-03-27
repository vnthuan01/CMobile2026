import '@/global.css';
import TeamTasksScreen from '@/src/components/volunteer/TeamTasksScreen';
import { useRouter } from 'expo-router';

export default function TasksRouteScreen() {
  const router = useRouter();
  return <TeamTasksScreen onBack={() => router.back()} />;
}
