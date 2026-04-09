import ProgressForReliefScreen from '@/src/features/volunteer/screens/ProgressForReliefScreen';
import { useRouter } from 'expo-router';

export default function ProfileProgressReliefRoute() {
  const router = useRouter();

  return (
    <ProgressForReliefScreen
      onBack={() => router.replace('/profile')}
      onMarkSOS={() => router.push('/profile/new-sos' as any)}
    />
  );
}
