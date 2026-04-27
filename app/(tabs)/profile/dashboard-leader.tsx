import DashboardTeamLeaderScreen from '@/src/features/teamleader/screens/DashboardTeamLeaderScreen';
import { useMyTeam } from '@/src/hooks/useMyTeam';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';

export default function ProfileDashboardLeaderRoute() {
  const router = useRouter();
  const { colors } = useTheme();
  const { data } = useMyTeam();

  if (data?.teamMode && data.teamMode !== 'relief') {
    return (
      <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: colors.background }}>
        <Text className="text-center text-lg font-bold" style={{ color: colors.text }}>
          Dashboard nhóm trưởng chỉ áp dụng cho đội cứu trợ
        </Text>
        <Text className="mt-2 text-center" style={{ color: colors.textSecondary }}>
          Đội cứu hộ sử dụng Trung tâm nhiệm vụ để phối hợp nhiệm vụ chung của nhóm.
        </Text>
      </View>
    );
  }

  return (
    <DashboardTeamLeaderScreen
      onBack={() => router.replace('/profile')}
      onAllocateTask={() => router.push('/profile/allocate-task' as any)}
      onViewMissionDetail={() => router.push('/profile/tasks' as any)}
    />
  );
}
