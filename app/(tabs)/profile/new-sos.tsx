import NewSOSForVolunteerScreen from '@/src/components/volunteer/NewSOSForVolunteerScreen';
import { useRouter } from 'expo-router';

export default function ProfileNewSosRoute() {
  const router = useRouter();

  return <NewSOSForVolunteerScreen onBack={() => router.replace('/profile')} />;
}
