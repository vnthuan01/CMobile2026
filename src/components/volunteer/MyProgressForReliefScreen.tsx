import ProgressForReliefScreen from './ProgressForReliefScreen';
import { useRouter } from 'expo-router';

interface MyProgressForReliefScreenProps {
  onBack?: () => void;
}

export default function MyProgressForReliefScreen({ onBack }: MyProgressForReliefScreenProps) {
  const router = useRouter();

  return (
    <ProgressForReliefScreen
      onBack={onBack}
      onMarkSOS={() => router.push('/profile/new-sos' as any)}
      viewMode="personal"
    />
  );
}
