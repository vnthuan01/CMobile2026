import UserProfileViewScreen from '@/src/components/profile/UserProfileViewScreen';
import { useRouter } from 'expo-router';

export default function UserProfileViewRoute() {
  const router = useRouter();

  return (
    <UserProfileViewScreen
      onBack={() => router.replace('/profile')}
      onEdit={() => router.replace('/profile/edit')}
    />
  );
}
