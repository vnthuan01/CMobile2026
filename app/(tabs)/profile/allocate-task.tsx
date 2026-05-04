import AllocateTaskScreen from '@/src/features/teamleader/screens/AllocateTaskScreen';
import { useRouter } from 'expo-router';

export default function ProfileAllocateTaskRoute() {
  const router = useRouter();

  return (
    <AllocateTaskScreen
      onBack={() => router.replace('/profile/dashboard-leader' as any)}
    />
  );
}
