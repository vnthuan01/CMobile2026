import SettingsScreen from '@/src/components/screens/SettingsScreen';
import { useRouter } from 'expo-router';

export default function ProfileSettingsRoute() {
  const router = useRouter();

  return <SettingsScreen onBack={() => router.replace('/profile')} />;
}
