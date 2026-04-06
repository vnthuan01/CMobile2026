import MyCurrentTeamScreen from '@/src/components/team/MyCurrentTeamScreen';
import { useRouter } from 'expo-router';

export default function ProfileMyTeamRoute() {
  const router = useRouter();

  return (
    <MyCurrentTeamScreen
      onBack={() => router.replace('/profile')}
      onOpenTasks={() => router.push('/profile/tasks' as any)}
    />
  );
}
