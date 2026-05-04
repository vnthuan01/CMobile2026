import '@/global.css';
import ReliefHomeContent from '@/src/components/home/ReliefHomeContent';
import RescueHomeContent from '@/src/components/home/RescueHomeContent';
import { useTeamOverview } from '@/src/hooks/useTeamOverview';
import { showErrorToast, showInfoToast } from '@/src/utils/toast';
import { useTheme } from '@/src/context/ThemeContext';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function VolunteerHomeContent() {
  const { colors } = useTheme();
  const volunteerHomeQuery = useTeamOverview(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const team = volunteerHomeQuery.data?.team ?? null;
  const teamMode = volunteerHomeQuery.data?.teamMode ?? 'rescue';
  const batch = volunteerHomeQuery.data?.batch ?? null;
  const operationStatusMap = volunteerHomeQuery.data?.operationStatusMap ?? {};
  const loading = volunteerHomeQuery.isLoading || volunteerHomeQuery.isFetching;
  const errorMessage = volunteerHomeQuery.error?.message ?? null;

  useEffect(() => {
    volunteerHomeQuery.refetch();
  }, []);

  useEffect(() => {
    if (team || batch) setHasLoadedOnce(true);

    if (!volunteerHomeQuery.isLoading && volunteerHomeQuery.data?.isEmpty && hasLoadedOnce) {
      showInfoToast('Chưa có đội', 'Bạn chưa thuộc đội nào.');
    } else if (!volunteerHomeQuery.isLoading && errorMessage && hasLoadedOnce) {
      showErrorToast('Không tải được dữ liệu', errorMessage);
    }
  }, [batch, errorMessage, hasLoadedOnce, team, volunteerHomeQuery.data?.isEmpty, volunteerHomeQuery.isLoading]);

  if (loading && !team) {
    return (
      <View className="mt-10 items-center px-4">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-3 text-sm" style={{ color: colors.textSecondary }}>
          Đang tải dữ liệu đội và nhiệm vụ...
        </Text>
      </View>
    );
  }

  if (teamMode === 'relief') {
    return <ReliefHomeContent team={team} />;
  }

  return (
    <RescueHomeContent
      team={team}
      batch={batch}
      operationStatusMap={operationStatusMap}
      colors={colors}
      isDark={false}
      volunteerHomeQuery={volunteerHomeQuery}
    />
  );
}
