import ReportProgressTeamLeaderScreen from '@/src/components/teamleader/ReportProgressTeamLeaderScreen';
import { useRouter } from 'expo-router';

export default function ProfileReportLeaderRoute() {
  const router = useRouter();

  return (
    <ReportProgressTeamLeaderScreen
      onBack={() => router.replace('/profile/dashboard-leader' as any)}
    />
  );
}
