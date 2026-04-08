import '@/global.css';
import RequestRescueScreen from '@/src/features/rescue/screens/RequestRescueScreen';
import { useRouter } from 'expo-router';

export default function GuestSosRequestScreen() {
  const router = useRouter();

  return <RequestRescueScreen onBack={() => router.back()} />;
}
