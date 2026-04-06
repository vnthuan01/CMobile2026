import RequestsScreen from '@/app/(tabs)/requests';
import { useRouter } from 'expo-router';

export default function ProfileRequestsRoute() {
  const router = useRouter();

  return <RequestsScreen onBack={() => router.replace('/profile')} />;
}
