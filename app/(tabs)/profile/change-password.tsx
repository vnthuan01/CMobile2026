import ChangePasswordScreen from '@/src/features/profile/screens/ChangePasswordScreen';
import { useRouter } from 'expo-router';

export default function ProfileChangePasswordRoute() {
  const router = useRouter();

  return <ChangePasswordScreen onBack={() => router.replace('/profile')} />;
}
