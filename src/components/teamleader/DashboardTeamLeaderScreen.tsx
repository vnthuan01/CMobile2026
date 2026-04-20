import '@/global.css';
import MemberCard, { type TeamMember } from '@/src/components/common/MemberCard';
import StickyFooterButton from '@/src/components/common/StickyFooterButton';
import { useTheme } from '@/src/context/ThemeContext';
import { useActiveAssignedCampaign } from '@/src/hooks/useActiveAssignedCampaign';
import { useCampaignTasks, useCampaignTeams } from '@/src/hooks/useLeaderTasks';
import { useMyTeam } from '@/src/hooks/useMyTeam';
import { CampaignTaskStatus, type CampaignTaskResponse, type CampaignTeamResponse } from '@/src/types/leaderTask';
import type { TeamMemberSummary } from '@/src/types/team';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DashboardTeamLeaderScreenProps {
  onBack?: () => void;
  onAllocateTask?: () => void;
  onViewMissionDetail?: () => void;
}

const FILTER_CHIPS = ['Tất cả', 'Sẵn sàng'];

const initialsOf = (name?: string) =>
  (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

export default function DashboardTeamLeaderScreen({
  onAllocateTask,
  onViewMissionDetail,
}: DashboardTeamLeaderScreenProps) {
  const { top, bottom } = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [activeChip, setActiveChip] = useState(0);
  const { data: myTeamData, isLoading: isTeamLoading } = useMyTeam();

  const team = myTeamData?.team;
  const teamMode = myTeamData?.teamMode ?? 'rescue';
  const { campaignId } = useActiveAssignedCampaign(team);
  const { data: campaignTeams = [] } = useCampaignTeams(campaignId);
  const myCampaignTeam = campaignTeams.find((item: CampaignTeamResponse) => item.teamId === team?.teamId) ?? campaignTeams[0];
  const { data: taskData, isLoading: isTasksLoading } = useCampaignTasks(campaignId, {
    pageIndex: 1,
    pageSize: 50,
    campaignTeamId: myCampaignTeam?.campaignTeamId,
  });

  const members: TeamMember[] = useMemo(() => {
    const source = team?.members ?? [];
    return source.map((member: TeamMemberSummary) => ({
      id: member.userId,
      name: member.displayName,
      role: member.skills?.[0]?.name ?? member.role ?? 'Thành viên',
      status: member.role === 'Leader' ? 'busy' : 'ready',
      location: member.email,
      initials: initialsOf(member.displayName),
    }));
  }, [team?.members]);

  const filteredMembers = activeChip === 1
    ? members.filter((member) => member.status === 'ready')
    : members;

  const taskItems = taskData?.items ?? [];
  const completed = taskItems.filter((task: CampaignTaskResponse) => task.status === CampaignTaskStatus.Completed).length;
  const inProgress = taskItems.filter((task: CampaignTaskResponse) => task.status === CampaignTaskStatus.InProgress).length;
  const progress = taskItems.length ? Math.round((completed / taskItems.length) * 100) : 0;
  const currentTask = taskItems[0];

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View
        style={{ paddingTop: top, backgroundColor: colors.card, borderBottomColor: colors.border }}
        className="flex-row items-center justify-between border-b px-4 pb-2 shadow-sm"
      >
        <View className="flex-row items-center gap-3">
          <View
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb', borderWidth: 2, borderColor: `${colors.primary}30` }}
          >
            <Text className="text-sm font-bold" style={{ color: colors.textSecondary }}>
              {initialsOf(team?.leader?.displayName || team?.name)}
            </Text>
          </View>
          <View>
            <Text className="text-xs font-medium" style={{ color: colors.textSecondary }}>Nhóm trưởng</Text>
            <Text className="text-base font-bold leading-tight" style={{ color: colors.text }}>
              {team?.leader?.displayName || team?.name || 'Chưa có team'}
            </Text>
          </View>
        </View>
        <TouchableOpacity className="relative h-10 w-10 items-center justify-center rounded-full">
          <Ionicons name="notifications-outline" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: bottom + 100 }} className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {isTeamLoading || isTasksLoading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : teamMode !== 'relief' ? (
          <View className="rounded-2xl border border-dashed p-5" style={{ borderColor: colors.border }}>
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              Màn hình này dành cho đội cứu trợ
            </Text>
            <Text className="mt-2 text-sm" style={{ color: colors.textSecondary }}>
              Đội cứu hộ sử dụng nhiệm vụ chung của nhóm tại Trung tâm nhiệm vụ thay vì phân công công việc cá nhân.
            </Text>
          </View>
        ) : (
          <>
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-bold" style={{ color: colors.text }}>Nhiệm vụ hiện tại</Text>
                <TouchableOpacity onPress={onViewMissionDetail} className="flex-row items-center gap-1">
                  <Text className="text-sm font-medium" style={{ color: colors.secondary }}>Chi tiết</Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.secondary} />
                </TouchableOpacity>
              </View>

              <View className="rounded-2xl border p-5 shadow-sm" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                <Text className="text-xs font-semibold" style={{ color: colors.textSecondary }}>
                  {myCampaignTeam?.teamName || team?.name || 'Đội hiện tại'}
                </Text>
                <Text className="mt-2 text-lg font-bold leading-tight" style={{ color: colors.text }}>
                  {currentTask?.title || 'Chưa có nhiệm vụ nào'}
                </Text>
                <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
                  {currentTask?.description || 'Hãy tạo hoặc phân công task mới cho chiến dịch hiện tại.'}
                </Text>

                <View className="mb-4 mt-4">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-sm font-medium" style={{ color: colors.textSecondary }}>Tiến độ chung</Text>
                    <Text className="text-sm font-bold" style={{ color: colors.primary }}>{progress}%</Text>
                  </View>
                  <View className="h-2.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6' }}>
                    <View className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: colors.primary }} />
                  </View>
                </View>

                <View className="flex-row items-center justify-between border-t pt-3" style={{ borderTopColor: colors.border }}>
                  <Text className="text-xs" style={{ color: colors.textSecondary }}>
                    {completed}/{taskItems.length} hoàn thành
                  </Text>
                  <Text className="text-xs" style={{ color: colors.textSecondary }}>
                    {inProgress} đang xử lý
                  </Text>
                </View>
              </View>
            </View>

            <View>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-bold" style={{ color: colors.text }}>
                  Thành viên nhóm <Text style={{ color: colors.textSecondary }}>({members.length})</Text>
                </Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 16 }}>
                {FILTER_CHIPS.map((chip, i) => (
                  <TouchableOpacity
                    key={chip}
                    onPress={() => setActiveChip(i)}
                    className="shrink-0 items-center justify-center rounded-full px-4 py-1.5 border"
                    style={{
                      backgroundColor: activeChip === i ? (isDark ? '#fff' : '#111418') : colors.card,
                      borderColor: activeChip === i ? 'transparent' : colors.border,
                    }}
                  >
                    <Text className="text-sm font-medium" style={{ color: activeChip === i ? (isDark ? '#111418' : '#fff') : colors.textSecondary }}>{chip}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View className="gap-3">
                {filteredMembers.map((member) => <MemberCard key={member.id} member={member} />)}
                {filteredMembers.length === 0 ? (
                  <View className="rounded-2xl border border-dashed p-5" style={{ borderColor: colors.border }}>
                    <Text style={{ color: colors.textSecondary }}>Chưa có thành viên phù hợp.</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {teamMode === 'relief' ? (
        <StickyFooterButton title="Phân công công việc" icon="add-circle" backgroundColor={colors.secondary} onPress={onAllocateTask} />
      ) : null}
    </View>
  );
}
