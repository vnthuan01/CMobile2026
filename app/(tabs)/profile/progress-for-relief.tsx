import MyProgressForReliefScreen from '@/src/features/volunteer/screens/MyProgressForReliefScreen';
import { useRouter } from 'expo-router';

export default function ProgressForReliefRoute() {
  const router = useRouter();

  return <MyProgressForReliefScreen onBack={() => router.replace('/profile/tasks' as any)} />;
}
