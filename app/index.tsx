import { useAuthStore } from '@/src/store/authStore';
import { Redirect } from 'expo-router';

export default function HomeRouter() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) return null;

  if (!user) return <Redirect href="/welcome" />;

  return <Redirect href="/(tabs)" />;
}
