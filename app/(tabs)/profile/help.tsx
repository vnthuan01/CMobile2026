import HelpScreen from '@/src/components/screens/HelpScreen';
import { useRouter } from 'expo-router';

export default function ProfileHelpRoute() {
  const router = useRouter();

  return <HelpScreen onBack={() => router.replace('/profile')} />;
}
