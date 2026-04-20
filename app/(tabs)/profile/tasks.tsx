import ReliefTasksScreen from '@/src/features/volunteer/screens/ReliefTasksScreen';
import { useRouter } from 'expo-router';

export default function ProfileTasksRoute() {
  const router = useRouter();

  return <ReliefTasksScreen onBack={() => router.replace('/profile/my-team' as any)} />;
}
