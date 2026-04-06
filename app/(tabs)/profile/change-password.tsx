import ChangePasswordScreen from '@/src/components/screens/ChangePasswordScreen';
import { useRouter } from 'expo-router';

export default function ProfileChangePasswordRoute() {
  const router = useRouter();

  return <ChangePasswordScreen onBack={() => router.replace('/profile')} />;
}
