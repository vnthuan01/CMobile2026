import ProgressForRescueScreen from '@/src/components/volunteer/ProgressForRescueScreen';
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
