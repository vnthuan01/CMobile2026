import SettingsScreen from '@/src/features/profile/screens/SettingsScreen';
import { useRouter } from 'expo-router';

export default function ProfileSettingsRoute() {
  const router = useRouter();

  return <SettingsScreen onBack={() => router.replace('/profile')} />;
}
