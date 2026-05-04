import NewSOSForVolunteerScreen from '@/src/features/volunteer/screens/NewSOSForVolunteerScreen';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ProfileNewSosRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ emergency?: string; type?: string }>();

  return <NewSOSForVolunteerScreen onBack={() => router.replace('/profile')} defaultType={params.type} isEmergencyDefault={params.emergency === '1'} />;
}
