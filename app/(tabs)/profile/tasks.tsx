import TeamTasksScreen from '@/src/components/volunteer/TeamTasksScreen';
import { useRouter } from 'expo-router';

export default function ProfileTasksRoute() {
  const router = useRouter();

  return <TeamTasksScreen onBack={() => router.replace('/profile')} />;
}
