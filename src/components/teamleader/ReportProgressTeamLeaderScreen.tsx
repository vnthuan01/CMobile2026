import '@/global.css';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import StickyFooterButton from '@/src/components/common/StickyFooterButton';
import { useTheme } from '@/src/context/ThemeContext';
import { useActiveAssignedCampaign } from '@/src/hooks/useActiveAssignedCampaign';
import { useCampaignTaskDetail, useCampaignTasks, useCampaignTeams } from '@/src/hooks/useLeaderTasks';
import { useMyTeam } from '@/src/hooks/useMyTeam';
import { CampaignTaskStatus, MemberTaskStatus, type CampaignTaskResponse, type CampaignTeamResponse, type MemberTaskResponse } from '@/src/types/leaderTask';
import { showInfoToast } from '@/src/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ReportProgressTeamLeaderScreenProps {
  onBack?: () => void;
}

const initialsOf = (name?: string) =>
  (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

export default function ReportProgressTeamLeaderScreen({ onBack }: ReportProgressTeamLeaderScreenProps) {
  const { bottom } = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [summaryNote, setSummaryNote] = useState('');
  const { data: myTeamData, isLoading: isTeamLoading } = useMyTeam();
  const team = myTeamData?.team;
  const { campaignId } = useActiveAssignedCampaign(team);
  const { data: campaignTeams = [] } = useCampaignTeams(campaignId);
  const myCampaignTeam = campaignTeams.find((item: CampaignTeamResponse) => item.teamId === team?.teamId) ?? campaignTeams[0];
  const { data: taskData, isLoading: isTasksLoading } = useCampaignTasks(campaignId, {
    pageIndex: 1,
    pageSize: 50,
    campaignTeamId: myCampaignTeam?.campaignTeamId,
  });
  const firstTaskId = taskData?.items?.[0]?.campaignTaskId ?? null;
  const { data: firstTaskDetail, isLoading: isDetailLoading } = useCampaignTaskDetail(firstTaskId);

  const reportItems = useMemo(() => firstTaskDetail?.memberTasks ?? [], [firstTaskDetail?.memberTasks]);
  const totalTasks = taskData?.items?.length ?? 0;
  const completedTasks = (taskData?.items ?? []).filter((task: CampaignTaskResponse) => task.status === CampaignTaskStatus.Completed).length;
  const totalSubtasks = reportItems.length;
  const completedSubtasks = reportItems.filter((item: MemberTaskResponse) => item.status === MemberTaskStatus.Completed).length;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenHeader title="Báo cáo Tổng hợp Nhóm" onBack={onBack} />

      <ScrollView contentContainerStyle={{ paddingBottom: bottom + 120 }} className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="gap-6 w-full p-4">
          {isTeamLoading || isTasksLoading || isDetailLoading ? (
            <View className="items-center py-12"><ActivityIndicator size="large" color={colors.primary} /></View>
          ) : (
            <>
              <View className="relative overflow-hidden rounded-xl shadow-sm h-48" style={{ backgroundColor: isDark ? '#1a2632' : colors.card }}>
                <View className="absolute inset-0 z-10" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} />
                <View className="h-full items-center justify-center" style={{ backgroundColor: isDark ? '#374151' : '#d1d5db' }}>
                  <Ionicons name="bar-chart-outline" size={48} color="#6b7280" />
                </View>
                <View className="absolute bottom-0 left-0 right-0 p-4 z-20">
                  <Text className="text-white text-xl font-bold leading-tight mb-1">
                    {firstTaskDetail?.title || team?.name || 'Tổng hợp tiến độ'}
                  </Text>
                  <Text className="text-sm font-medium" style={{ color: '#e5e7eb' }}>
                    {myCampaignTeam?.campaignName || myCampaignTeam?.teamName || 'Chiến dịch hiện tại'}
                  </Text>
                  <View className="mt-3">
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-xs text-white">Tiến độ task</Text>
                      <Text className="text-xs text-white">{completedTasks}/{totalTasks}</Text>
                    </View>
                    <View className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>
                      <View className="h-full rounded-full" style={{ width: `${totalTasks ? (completedTasks / totalTasks) * 100 : 0}%`, backgroundColor: colors.primary }} />
                    </View>
                  </View>
                </View>
              </View>

              <View className="flex-row gap-3">
                {[
                  { icon: 'briefcase', count: `${completedTasks}/${totalTasks}`, label: 'Task', color: colors.primary, bgColor: `${colors.primary}12` },
                  { icon: 'people', count: `${completedSubtasks}/${totalSubtasks}`, label: 'Subtask', color: colors.secondary, bgColor: `${colors.secondary}12` },
                  { icon: 'document-text', count: `${reportItems.length}`, label: 'Báo cáo', color: colors.status.pending, bgColor: `${colors.status.pending}12` },
                ].map((stat, i) => (
                  <View key={i} className="flex-1 rounded-lg border p-3 items-center justify-center gap-1 shadow-sm" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                    <View className="rounded-full p-2" style={{ backgroundColor: stat.bgColor }}>
                      <Ionicons name={stat.icon as any} size={18} color={stat.color} />
                    </View>
                    <Text className="text-2xl font-bold leading-none" style={{ color: colors.text }}>{stat.count}</Text>
                    <Text className="text-xs font-medium" style={{ color: colors.textSecondary }}>{stat.label}</Text>
                  </View>
                ))}
              </View>

              <View>
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-lg font-bold" style={{ color: colors.text }}>Báo cáo thành viên</Text>
                </View>

                <View className="gap-3">
                  {reportItems.map((report: MemberTaskResponse) => (
                    <View key={report.memberTaskId} className="rounded-lg border p-4 shadow-sm" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                      <View className="flex-row items-start gap-3">
                        <View className="h-10 w-10 items-center justify-center rounded-full shrink-0" style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }}>
                          <Text className="text-sm font-bold" style={{ color: colors.textSecondary }}>{initialsOf(report.volunteerName)}</Text>
                        </View>
                        <View className="flex-1">
                          <View className="flex-row justify-between items-start">
                            <View>
                              <Text className="font-bold text-sm" style={{ color: colors.text }}>{report.volunteerName}</Text>
                              <Text className="text-xs" style={{ color: colors.textSecondary }}>{report.completedAt || report.assignedAt || 'Chưa có thời gian'}</Text>
                            </View>
                            <View className="rounded px-2 py-0.5" style={{ backgroundColor: report.status === MemberTaskStatus.Completed ? (isDark ? 'rgba(22,163,74,0.2)' : '#f0fdf4') : (isDark ? 'rgba(234,179,8,0.2)' : '#fefce8') }}>
                              <Text className="text-[10px] font-bold" style={{ color: report.status === MemberTaskStatus.Completed ? colors.status.completed : colors.status.pending }}>
                                {report.status === MemberTaskStatus.Completed ? 'Đã xong' : 'Đang xử lý'}
                              </Text>
                            </View>
                          </View>
                          <Text className="text-sm mt-2 leading-snug" style={{ color: colors.text }}>{report.subTaskTitle}</Text>
                          <Text className="text-sm mt-1 leading-snug" style={{ color: colors.textSecondary }}>{report.taskNote || 'Chưa có ghi chú.'}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                  {reportItems.length === 0 ? <Text style={{ color: colors.textSecondary }}>Chưa có báo cáo thành viên.</Text> : null}
                </View>
              </View>

              <View>
                <Text className="text-lg font-bold mb-2" style={{ color: colors.text }}>Ghi chú tổng hợp</Text>
                <TextInput
                  value={summaryNote}
                  onChangeText={setSummaryNote}
                  placeholder="Nhập tóm tắt tình hình hoặc chỉ đạo tiếp theo..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="w-full rounded-lg border p-3 text-sm min-h-[100px]"
                  style={{ backgroundColor: colors.card, borderColor: colors.border, color: colors.text }}
                />
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <StickyFooterButton title="Gửi báo cáo tổng hợp" icon="send" backgroundColor={colors.secondary} onPress={() => showInfoToast('MVP', 'Chức năng gửi báo cáo tổng hợp sẽ nối API sau.')} />
    </View>
  );
}
