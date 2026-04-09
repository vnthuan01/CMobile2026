import TeamTasksScreen from '@/src/features/volunteer/screens/TeamTasksScreen';
import { useRouter } from 'expo-router';

export default function ProfileTasksRoute() {
  const router = useRouter();

  return <TeamTasksScreen onBack={() => router.replace('/profile')} />;
}
