import HelpScreen from '@/src/features/profile/screens/HelpScreen';
import { useRouter } from 'expo-router';

export default function ProfileHelpRoute() {
  const router = useRouter();

  return <HelpScreen onBack={() => router.replace('/profile')} />;
}
