import '@/global.css';
import { useTheme } from '@/src/context/ThemeContext';
import { useAssignedCampaigns } from '@/src/hooks/useAssignedCampaigns';
import { useActiveAssignedCampaign } from '@/src/hooks/useActiveAssignedCampaign';
import { useCampaignTasks, useCampaignTeams } from '@/src/hooks/useLeaderTasks';
import { CampaignTaskStatus, type CampaignTaskResponse, type CampaignTeamResponse } from '@/src/types/leaderTask';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  team: any;
};

export default function ReliefHomeContent({ team }: Props) {
  const router = useRouter();
  const { colors } = useTheme();
  const { data: fallbackAssignedCampaigns, isLoading: isCampaignsLoading } = useAssignedCampaigns(team?.teamId ?? '', !!team?.teamId);
  const { activeCampaign, campaignId } = useActiveAssignedCampaign(team, null, fallbackAssignedCampaigns || []);
  const { data: reliefCampaignTeams = [] } = useCampaignTeams(campaignId);
  const myReliefCampaignTeam = reliefCampaignTeams.find(
    (item: CampaignTeamResponse) => item.teamId === team?.teamId,
  ) ?? reliefCampaignTeams[0];
  const { data: reliefTaskPage, isLoading } = useCampaignTasks(campaignId, {
    pageIndex: 1,
    pageSize: 20,
    campaignTeamId: myReliefCampaignTeam?.campaignTeamId,
  });
  const reliefTasks = reliefTaskPage?.items ?? [];
  const reliefCompleted = reliefTasks.filter((task: CampaignTaskResponse) => task.status === CampaignTaskStatus.Completed).length;
  const reliefInProgress = reliefTasks.filter((task: CampaignTaskResponse) => task.status === CampaignTaskStatus.InProgress).length;
  const reliefCurrentTask = reliefTasks[0] ?? null;

  return (
    <>
      <View className="mt-6 px-4">
        <SectionTitle title="Tổng quan công việc" subtitle="Tổng quan đội và công việc được giao trong chiến dịch" />
      </View>

      <View className="mt-4 px-4">
        <Card colors={colors.border} bg={colors.card}>
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <View className="rounded-full self-start px-3 py-1" style={{ backgroundColor: colors.surface }}>
                <Text className="text-xs font-semibold" style={{ color: colors.textSecondary }}>Đội cứu trợ</Text>
              </View>
              <Text className="mt-3 text-xl font-bold" style={{ color: colors.text }}>
                {team?.name || 'Chưa tham gia đội cứu trợ'}
              </Text>
              <Text className="mt-2 text-sm" style={{ color: colors.textSecondary }}>
                {team?.description || 'Tham gia đội để nhận công việc được phân công từ nhóm trưởng trong chiến dịch.'}
              </Text>
            </View>
          </View>
        </Card>
      </View>

      <View className="mt-6 px-4">
        <Card colors={colors.border} bg={colors.card}>
          {isCampaignsLoading || isLoading ? (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <>
              <Text className="text-lg font-bold" style={{ color: colors.text }}>Công việc của đội</Text>
              <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
                {activeCampaign?.campaignName || 'Chiến dịch hiện tại'}
              </Text>
              <View className="mt-4 flex-row gap-3">
                <MiniInfo label="Tổng việc" value={String(reliefTasks.length)} />
                <MiniInfo label="Đang làm" value={String(reliefInProgress)} />
                <MiniInfo label="Hoàn thành" value={String(reliefCompleted)} />
              </View>
              <View className="mt-4 rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
                <Text className="text-xs font-semibold" style={{ color: colors.textSecondary }}>Việc ưu tiên hiện tại</Text>
                <Text className="mt-2 text-base font-bold" style={{ color: colors.text }}>
                  {reliefCurrentTask?.title || 'Chưa có công việc nào được giao'}
                </Text>
                <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
                  {reliefCurrentTask?.description || 'Nhóm trưởng có thể tạo và phân công công việc cho từng thành viên tại bảng điều phối nhóm.'}
                </Text>
                <TouchableOpacity onPress={() => router.push('/profile/tasks' as any)} className="mt-4 rounded-xl px-4 py-3" style={{ backgroundColor: colors.primary }}>
                  <Text className="text-center font-semibold text-white">Xem công việc của đội</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Card>
      </View>
    </>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View>
      <Text className="text-xl font-bold" style={{ color: '#111827' }}>{title}</Text>
      <Text className="mt-1 text-sm" style={{ color: '#6b7280' }}>{subtitle}</Text>
    </View>
  );
}

function Card({ children, colors, bg }: any) {
  return <View className="rounded-2xl border p-4 shadow-sm" style={{ borderColor: colors, backgroundColor: bg }}>{children}</View>;
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-2xl px-3 py-3" style={{ backgroundColor: '#f8fafc' }}>
      <Text className="text-xs" style={{ color: '#64748b' }}>{label}</Text>
      <Text className="mt-1 text-base font-bold" style={{ color: '#0f172a' }}>{value}</Text>
    </View>
  );
}
