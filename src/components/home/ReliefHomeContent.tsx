import '@/global.css';
import { useTheme } from '@/src/context/ThemeContext';
import { useActiveAssignedCampaign } from '@/src/hooks/useActiveAssignedCampaign';
import { useAssignedCampaigns } from '@/src/hooks/useAssignedCampaigns';
import { useCampaignDetail } from '@/src/hooks/useDonation';
import { useCampaignTasks, useCampaignTeams } from '@/src/hooks/useLeaderTasks';
import { useSelectedCampaign } from '@/src/hooks/useSelectedCampaign';
import {
  CampaignTaskStatus,
  type CampaignTaskResponse,
  type CampaignTeamResponse,
} from '@/src/types/leaderTask';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

type Props = {
  team: any;
};

export default function ReliefHomeContent({ team }: Props) {
  const router = useRouter();
  const { colors } = useTheme();
  const { data: fallbackAssignedCampaigns, isLoading: isCampaignsLoading } =
    useAssignedCampaigns(team?.teamId ?? '', !!team?.teamId);
  const { selectedCampaignId, setSelectedCampaignId } = useSelectedCampaign(
    team,
    fallbackAssignedCampaigns || [],
  );
  const { activeCampaign, campaignId, assignedCampaigns } =
    useActiveAssignedCampaign(
      team,
      selectedCampaignId,
      fallbackAssignedCampaigns || [],
    );
  const { data: campaignDetail } = useCampaignDetail(
    campaignId || undefined,
    !!campaignId,
  );
  const { data: reliefCampaignTeams = [] } = useCampaignTeams(campaignId);
  const myReliefCampaignTeam =
    reliefCampaignTeams.find(
      (item: CampaignTeamResponse) => item.teamId === team?.teamId,
    ) ?? reliefCampaignTeams[0];
  const { data: reliefTaskPage, isLoading } = useCampaignTasks(campaignId, {
    pageIndex: 1,
    pageSize: 20,
    campaignTeamId: myReliefCampaignTeam?.campaignTeamId,
  });
  const reliefTasks = reliefTaskPage?.items ?? [];
  const reliefCompleted = reliefTasks.filter(
    (task: CampaignTaskResponse) =>
      task.status === CampaignTaskStatus.Completed,
  ).length;
  const reliefInProgress = reliefTasks.filter(
    (task: CampaignTaskResponse) =>
      task.status === CampaignTaskStatus.InProgress,
  ).length;
  const reliefCurrentTask = reliefTasks[0] ?? null;
  const campaignName =
    campaignDetail?.name ||
    activeCampaign?.campaignName ||
    myReliefCampaignTeam?.campaignName ||
    'Chiến dịch hiện tại';
  const hasTasks = reliefTasks.length > 0;
  return (
    <>
      <View className="mt-6 px-4">
        <SectionTitle
          title="Tổng quan công việc"
          subtitle="Tổng quan đội và công việc được giao trong chiến dịch"
        />
      </View>

      <View className="mt-4 px-4">
        <Card colors={colors.border} bg={colors.card}>
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <View
                className="self-start rounded-full px-3 py-1"
                style={{ backgroundColor: colors.surface }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: colors.textSecondary }}
                >
                  Đội cứu trợ
                </Text>
              </View>
              <Text
                className="mt-3 text-xl font-bold"
                style={{ color: colors.text }}
              >
                {team?.name || 'Chưa tham gia đội cứu trợ'}
              </Text>
              <Text
                className="mt-2 text-sm"
                style={{ color: colors.textSecondary }}
              >
                {team?.description ||
                  'Tham gia đội để nhận công việc được phân công từ nhóm trưởng trong chiến dịch.'}
              </Text>
            </View>
          </View>
        </Card>
      </View>

      <View className="mt-6 px-4">
        <Card colors={colors.border} bg={colors.card}>
          {isCampaignsLoading || isLoading ? (
            <View className="py-2">
              <View
                className="rounded-2xl border p-4"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                }}
              >
                <View
                  className="h-4 w-32 rounded-full"
                  style={{ backgroundColor: `${colors.primary}14` }}
                />
                <View
                  className="mt-3 h-3 w-48 rounded-full"
                  style={{ backgroundColor: `${colors.primary}10` }}
                />
                <View className="mt-4 flex-row gap-3">
                  <View
                    className="h-16 flex-1 rounded-2xl"
                    style={{ backgroundColor: `${colors.primary}10` }}
                  />
                  <View
                    className="h-16 flex-1 rounded-2xl"
                    style={{ backgroundColor: `${colors.primary}10` }}
                  />
                  <View
                    className="h-16 flex-1 rounded-2xl"
                    style={{ backgroundColor: `${colors.primary}10` }}
                  />
                </View>
                <View
                  className="mt-4 h-28 rounded-2xl"
                  style={{ backgroundColor: `${colors.primary}08` }}
                />
              </View>
            </View>
          ) : (
            <>
              <Text
                className="text-lg font-bold"
                style={{ color: colors.text }}
              >
                Công việc của đội
              </Text>
              <Text
                className="mt-1 text-sm"
                style={{ color: colors.textSecondary }}
              >
                {campaignName}
              </Text>
              {assignedCampaigns.length === 1 ? (
                <View
                  className="mt-3 self-start rounded-full px-3 py-1.5"
                  style={{ backgroundColor: `${colors.primary}10` }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: colors.primary }}
                  >
                    Chiến dịch hiện tại đã tự đồng bộ
                  </Text>
                </View>
              ) : null}
              {assignedCampaigns.length > 1 ? (
                <View className="mt-3 gap-2">
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: colors.textSecondary }}
                  >
                    Chọn chiến dịch để xem có công việc hay không
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {assignedCampaigns.map((campaign) => {
                      const selected = campaign.campaignId === campaignId;
                      const isCurrentCampaign =
                        campaign.campaignId === campaignId;
                      const campaignHasTasks = isCurrentCampaign
                        ? hasTasks
                        : null;

                      return (
                        <TouchableOpacity
                          key={campaign.campaignId}
                          onPress={() =>
                            setSelectedCampaignId(campaign.campaignId)
                          }
                          className="rounded-full border px-3 py-2"
                          style={{
                            borderColor: selected
                              ? colors.primary
                              : colors.border,
                            backgroundColor: selected
                              ? `${colors.primary}12`
                              : colors.card,
                          }}
                        >
                          <Text
                            className="text-xs font-semibold"
                            style={{
                              color: selected
                                ? colors.primary
                                : colors.textSecondary,
                            }}
                          >
                            {campaign.campaignName || 'Chiến dịch'}
                            {isCurrentCampaign
                              ? campaignHasTasks
                                ? ' • Có việc'
                                : ' • Chưa có việc'
                              : ''}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ) : null}
              {isLoading && campaignId ? (
                <View
                  className="mt-3 rounded-xl px-3 py-3"
                  style={{ backgroundColor: `${colors.primary}08` }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: colors.primary }}
                  >
                    Đang đồng bộ chiến dịch...
                  </Text>
                </View>
              ) : null}
              <View className="mt-4 flex-row gap-3">
                <MiniInfo
                  label="Tổng việc"
                  value={String(reliefTasks.length)}
                />
                <MiniInfo label="Đang làm" value={String(reliefInProgress)} />
                <MiniInfo label="Hoàn thành" value={String(reliefCompleted)} />
              </View>
              <View
                className="mt-4 rounded-2xl border p-4"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: colors.textSecondary }}
                >
                  Việc ưu tiên hiện tại
                </Text>
                <Text
                  className="mt-2 text-base font-bold"
                  style={{ color: colors.text }}
                >
                  {reliefCurrentTask?.title ||
                    'Chưa có công việc nào được giao'}
                </Text>
                <Text
                  className="mt-1 text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  {reliefCurrentTask?.description ||
                    'Nhóm trưởng có thể tạo và phân công công việc cho từng thành viên tại bảng điều phối nhóm.'}
                </Text>
                {assignedCampaigns.length > 1 ? (
                  <Text
                    className="mt-3 text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    Bạn đang có {assignedCampaigns.length} chiến dịch được gán.
                    Hiện màn này đang hiển thị chi tiết của 1 chiến dịch để bạn
                    biết chiến dịch nào có việc và chiến dịch nào chưa có việc.
                  </Text>
                ) : null}
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: '/profile/tasks' as any,
                      params: { campaignId: campaignId || undefined },
                    })
                  }
                  className="mt-4 rounded-xl px-4 py-3"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-center font-semibold text-white">
                    Xem công việc tôi
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Card>
      </View>
    </>
  );
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <View>
      <Text className="text-xl font-bold" style={{ color: '#111827' }}>
        {title}
      </Text>
      <Text className="mt-1 text-sm" style={{ color: '#6b7280' }}>
        {subtitle}
      </Text>
    </View>
  );
}

function Card({ children, colors, bg }: any) {
  return (
    <View
      className="rounded-2xl border p-4 shadow-sm"
      style={{ borderColor: colors, backgroundColor: bg }}
    >
      {children}
    </View>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <View
      className="flex-1 rounded-2xl px-3 py-3"
      style={{ backgroundColor: '#f8fafc' }}
    >
      <Text className="text-xs" style={{ color: '#64748b' }}>
        {label}
      </Text>
      <Text className="mt-1 text-base font-bold" style={{ color: '#0f172a' }}>
        {value}
      </Text>
    </View>
  );
}
