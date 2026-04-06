import ProgressForRescueScreen from '@/src/features/volunteer/screens/ProgressForRescueScreen';
import { useRouter } from 'expo-router';

export default function ProfileProgressRescueRoute() {
  const router = useRouter();

  return (
    <ProgressForRescueScreen
      onBack={() => router.replace('/profile')}
      onMarkSOS={() => router.push('/profile/new-sos' as any)}
    />
  );
}
