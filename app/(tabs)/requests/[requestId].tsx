import ViewRequestRescueScreen from '@/src/features/rescue/screens/ViewRequestRescueScreen';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function RequestDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ requestId?: string | string[] }>();

  const requestId = Array.isArray(params.requestId)
    ? params.requestId[0]
    : params.requestId;

  if (!requestId) {
    return null;
  }

  return (
    <ViewRequestRescueScreen
      requestId={requestId}
      onBack={() => router.back()}
    />
  );
}
