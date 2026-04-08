import UserProfileViewScreen from '@/src/components/profile/UserProfileViewScreen';
import { useRouter } from 'expo-router';

export default function UserProfileViewRoute() {
  const router = useRouter();

  return (
    <UserProfileViewScreen
      onBack={() => router.back()}
      onEdit={() => router.replace('/profile/edit')}
    />
  );
}
