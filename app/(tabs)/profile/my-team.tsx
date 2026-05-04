import MyCurrentTeamScreen from '@/src/features/team/screens/MyCurrentTeamScreen';
import { useRouter } from 'expo-router';

export default function ProfileMyTeamRoute() {
  const router = useRouter();

  return (
    <MyCurrentTeamScreen
      onBack={() => router.replace('/profile')}
      onOpenTasks={() => router.replace('/profile/tasks' as any)}
    />
  );
}
