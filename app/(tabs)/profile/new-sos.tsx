import NewSOSForVolunteerScreen from '@/src/features/volunteer/screens/NewSOSForVolunteerScreen';
import { useRouter } from 'expo-router';

export default function ProfileNewSosRoute() {
  const router = useRouter();

  return <NewSOSForVolunteerScreen onBack={() => router.replace('/profile')} />;
}
