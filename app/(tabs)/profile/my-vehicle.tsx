import MyVehicleScreen from '@/src/features/volunteer/screens/MyVehicleScreen';
import { useRouter } from 'expo-router';

export default function ProfileMyVehicleRoute() {
  const router = useRouter();

  return <MyVehicleScreen onBack={() => router.back()} />;
}
