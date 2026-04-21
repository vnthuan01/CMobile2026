import ProgressForReliefScreen from '@/src/features/volunteer/screens/ProgressForReliefScreen';
import { useRouter } from 'expo-router';

export default function ProgressForReliefRoute() {
  const router = useRouter();

  return <ProgressForReliefScreen onBack={() => router.back()} />;
}
