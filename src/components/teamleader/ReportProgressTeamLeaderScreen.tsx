import '@/global.css';
import CustomDropdown from '@/src/components/CustomDropdown';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import StickyFooterButton from '@/src/components/common/StickyFooterButton';
import { useTheme } from '@/src/context/ThemeContext';
import { useActiveAssignedCampaign } from '@/src/hooks/useActiveAssignedCampaign';
import { useAssignedCampaigns } from '@/src/hooks/useAssignedCampaigns';
import { useCampaignDetail } from '@/src/hooks/useDonation';
import { useCampaignTaskDetail, useCampaignTasks, useCampaignTeams } from '@/src/hooks/useLeaderTasks';
import { useMyTeam } from '@/src/hooks/useMyTeam';
import { useSelectedCampaign } from '@/src/hooks/useSelectedCampaign';
import { CampaignTaskStatus, MemberTaskStatus, type CampaignTaskResponse, type CampaignTeamResponse, type MemberTaskResponse } from '@/src/types/leaderTask';
import { showInfoToast } from '@/src/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueries } from '@tanstack/react-query';
import { leaderTaskKeys } from '@/src/hooks/useLeaderTasks';
import { leaderTaskService } from '@/src/services/leaderTaskService';

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

const dinhDangNgay = (value?: string | null) => {
  if (!value) return 'Chưa xác định';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN');
};

export default function ReportProgressTeamLeaderScreen({ onBack }: ReportProgressTeamLeaderScreenProps) {
  const { bottom } = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [summaryNote, setSummaryNote] = useState('');
  const { data: myTeamData, isLoading: isTeamLoading } = useMyTeam();
  const team = myTeamData?.team;
  const { data: fallbackAssignedCampaigns = [] } = useAssignedCampaigns(team?.teamId, !!team?.teamId);
  const { selectedCampaignId, setSelectedCampaignId } = useSelectedCampaign(
    team,
    fallbackAssignedCampaigns,
  );
  const { campaignId, activeCampaign, assignedCampaigns } = useActiveAssignedCampaign(
    team,
    selectedCampaignId,
    fallbackAssignedCampaigns,
  );
  const { data: campaignDetail } = useCampaignDetail(campaignId || undefined, !!campaignId);
  const { data: campaignTeams = [] } = useCampaignTeams(campaignId);
  const myCampaignTeam = campaignTeams.find((item: CampaignTeamResponse) => item.teamId === team?.teamId) ?? campaignTeams[0];
  const { data: taskData, isLoading: isTasksLoading } = useCampaignTasks(campaignId, {
    pageIndex: 1,
    pageSize: 50,
    campaignTeamId: myCampaignTeam?.campaignTeamId,
  });
  const firstTaskId = taskData?.items?.[0]?.campaignTaskId ?? null;
  const { data: firstTaskDetail, isLoading: isFirstDetailLoading } = useCampaignTaskDetail(firstTaskId);

  const taskDetailQueries = useQueries({
    queries: (taskData?.items ?? []).map((task) => ({
      queryKey: leaderTaskKeys.taskDetail(task.campaignTaskId),
      queryFn: async () => {
        const result = await leaderTaskService.getCampaignTaskDetail(task.campaignTaskId);
        if (!result.success) throw new Error(result.message);
        return result.data;
      },
      enabled: !!task.campaignTaskId,
    })),
  });

  const isDetailLoading = taskDetailQueries.some((query) => query.isLoading) || isFirstDetailLoading;

  const reportItems = useMemo(
    () => taskDetailQueries.flatMap((query) => query.data?.memberTasks ?? []),
    [taskDetailQueries],
  );
  const groupedReportItems = useMemo(() => {
    const groups = new Map<string, { title: string; notes: string[]; members: MemberTaskResponse[]; completedCount: number; totalCount: number }>();

    reportItems.forEach((item: MemberTaskResponse) => {
      const key = item.subTaskTitle?.trim().toLowerCase() || item.memberTaskId;
      const existing = groups.get(key);

      if (existing) {
        existing.members.push(item);
        existing.totalCount += 1;
        if (item.status === MemberTaskStatus.Completed) existing.completedCount += 1;
        if (item.taskNote && !existing.notes.includes(item.taskNote)) existing.notes.push(item.taskNote);
        return;
      }

      groups.set(key, {
        title: item.subTaskTitle,
        notes: item.taskNote ? [item.taskNote] : [],
        members: [item],
        completedCount: item.status === MemberTaskStatus.Completed ? 1 : 0,
        totalCount: 1,
      });
    });

    return Array.from(groups.values());
  }, [reportItems]);
  const totalTasks = taskData?.items?.length ?? 0;
  const completedTasks = (taskData?.items ?? []).filter((task: CampaignTaskResponse) => task.status === CampaignTaskStatus.Completed).length;
  const totalSubtasks = reportItems.length;
  const completedSubtasks = reportItems.filter((item: MemberTaskResponse) => item.status === MemberTaskStatus.Completed).length;
  const campaignOptions = useMemo(
    () => assignedCampaigns.map((campaign) => ({ label: campaign.campaignName || campaign.campaignId, value: campaign.campaignId })),
    [assignedCampaigns],
  );
  const campaignName = campaignDetail?.name || activeCampaign?.campaignName || myCampaignTeam?.campaignName || myCampaignTeam?.teamName || 'Chiến dịch hiện tại';
  const campaignStartDate = campaignDetail?.startDate || activeCampaign?.startDate;
  const campaignEndDate = campaignDetail?.endDate || activeCampaign?.endDate;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenHeader title="Báo cáo tổng hợp nhóm" onBack={onBack} />

      <ScrollView contentContainerStyle={{ paddingBottom: bottom + 120 }} className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="gap-6 w-full p-4">
          {isTeamLoading || isTasksLoading || isDetailLoading ? (
            <>
              {/* Hero/stats skeleton */}
              <View className="relative overflow-hidden rounded-xl shadow-sm h-48" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                <View className="h-24 bg-gray-200 mx-4 mt-4 rounded" style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }} />
                <View className="p-4">
                  <View className="h-7 w-3/4 rounded bg-gray-200 mb-2" style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }} />
                  <View className="h-4 w-1/2 rounded bg-gray-200 mb-2" style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }} />
                  <View className="h-4 w-2/3 rounded bg-gray-200 mb-4" style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }} />
                  <View className="h-4 w-20 rounded bg-gray-200" style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }} />
                </View>
              </View>

              {/* Stats cards skeleton */}
              <View className="flex-row gap-3">
                {[...Array(3)].map((_, i) => (
                  <View key={i} className="flex-1 rounded-lg border p-3 items-center justify-center gap-1 shadow-sm" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                    <View className="h-8 w-8 rounded-full bg-gray-200 mb-2" style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }} />
                    <View className="h-7 w-10 rounded bg-gray-200 mb-1" style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }} />
                    <View className="h-3 w-16 rounded bg-gray-200" style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }} />
                  </View>
                ))}
              </View>

              {/* Campaign card skeleton */}
              <View className="rounded-xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                <View className="h-4 w-36 rounded bg-gray-200 mb-3" style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }} />
                <View className="h-5 w-48 rounded bg-gray-200" style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }} />
              </View>

              {/* Report skeleton */}
              <View>
                <View className="h-8 w-44 rounded bg-gray-200 mb-3" style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }} />
                <View className="gap-3">
                  {[...Array(2)].map((_, i) => (
                    <View key={i} className="rounded-lg border p-4 shadow-sm" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                      <View className="flex-row items-start justify-between gap-3">
                        <View className="flex-1">
                          <View className="h-5 w-32 rounded bg-gray-200 mb-2" style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }} />
                          <View className="h-3 w-28 rounded bg-gray-200" style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }} />
                        </View>
                        <View className="h-6 w-16 rounded bg-gray-200" style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }} />
                      </View>
                      <View className="mt-3 gap-2">
                        {[...Array(2)].map((_, j) => (
                          <View key={j} className="flex-row items-start gap-3 rounded-lg p-3" style={{ backgroundColor: `${colors.primary}08` }}>
                            <View className="h-10 w-10 rounded-full bg-gray-200" style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }} />
                            <View className="flex-1">
                              <View className="h-4 w-24 rounded bg-gray-200 mb-2" style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }} />
                              <View className="h-3 w-28 rounded bg-gray-200" style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }} />
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Summary note skeleton */}
              <View>
                <View className="h-7 w-40 rounded bg-gray-200 mb-2" style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }} />
                <View className="h-24 w-full rounded-lg border bg-gray-200" style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb', borderColor: colors.border }} />
              </View>
            </>
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
                    {campaignName}
                  </Text>
                  <Text className="mt-1 text-xs" style={{ color: '#e5e7eb' }}>
                    Thời gian chiến dịch: {dinhDangNgay(campaignStartDate)} - {dinhDangNgay(campaignEndDate)}
                  </Text>
                  <View className="mt-3">
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-xs text-white">Tiến độ nhiệm vụ</Text>
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
                  { icon: 'briefcase', count: `${completedTasks}/${totalTasks}`, label: 'Nhiệm vụ', color: colors.primary, bgColor: `${colors.primary}12` },
                  { icon: 'people', count: `${completedSubtasks}/${totalSubtasks}`, label: 'Nhiệm vụ con', color: colors.secondary, bgColor: `${colors.secondary}12` },
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

              <View className="rounded-xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                <Text className="text-sm" style={{ color: colors.textSecondary }}>Chiến dịch đang xem báo cáo</Text>
                {assignedCampaigns.length > 1 ? (
                  <View className="mt-2">
                    <CustomDropdown
                      items={campaignOptions}
                      selectedValue={selectedCampaignId}
                      onValueChange={setSelectedCampaignId}
                      placeholder="Chọn chiến dịch"
                      title="Chọn chiến dịch"
                    />
                  </View>
                ) : (
                  <View className="mt-2 self-start rounded-full px-3 py-1.5" style={{ backgroundColor: `${colors.primary}10` }}>
                    <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
                      Chiến dịch hiện tại đã tự đồng bộ
                    </Text>
                  </View>
                )}
                {isTasksLoading ? (
                  <View className="mt-3 rounded-xl px-3 py-3" style={{ backgroundColor: `${colors.primary}08` }}>
                    <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
                      Đang đồng bộ chiến dịch...
                    </Text>
                  </View>
                ) : null}
              </View>

              <View>
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-lg font-bold" style={{ color: colors.text }}>Báo cáo thành viên</Text>
                </View>

                <View className="gap-3">
                  {groupedReportItems.map((group, index) => (
                    <View key={`${group.title}-${index}`} className="rounded-lg border p-4 shadow-sm" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                      <View className="flex-row items-start justify-between gap-3">
                        <View className="flex-1">
                          <Text className="font-bold text-sm" style={{ color: colors.text }}>{group.title}</Text>
                          <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
                            {group.completedCount}/{group.totalCount} thành viên hoàn thành
                          </Text>
                        </View>
                        <View className="rounded px-2 py-0.5" style={{ backgroundColor: group.completedCount === group.totalCount ? (isDark ? 'rgba(22,163,74,0.2)' : '#f0fdf4') : (isDark ? 'rgba(234,179,8,0.2)' : '#fefce8') }}>
                          <Text className="text-[10px] font-bold" style={{ color: group.completedCount === group.totalCount ? colors.status.completed : colors.status.pending }}>
                            {group.completedCount === group.totalCount ? 'Hoàn thành' : 'Đang xử lý'}
                          </Text>
                        </View>
                      </View>

                      {group.notes.length > 0 ? (
                        <Text className="mt-2 text-sm leading-snug" style={{ color: colors.textSecondary }}>
                          Ghi chú: {group.notes.join(' • ')}
                        </Text>
                      ) : null}

                      <View className="mt-3 gap-2">
                        {group.members.map((report) => (
                          <View key={report.memberTaskId} className="flex-row items-start gap-3 rounded-lg p-3" style={{ backgroundColor: `${colors.primary}08` }}>
                            <View className="h-10 w-10 items-center justify-center rounded-full shrink-0" style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }}>
                              <Text className="text-sm font-bold" style={{ color: colors.textSecondary }}>{initialsOf(report.volunteerName)}</Text>
                            </View>
                            <View className="flex-1">
                              <View className="flex-row justify-between items-start gap-2">
                                <View className="flex-1">
                                  <Text className="font-bold text-sm" style={{ color: colors.text }}>{report.volunteerName}</Text>
                                  <Text className="text-xs" style={{ color: colors.textSecondary }}>{report.completedAt || report.assignedAt || 'Chưa có thời gian'}</Text>
                                </View>
                                <View className="rounded px-2 py-0.5" style={{ backgroundColor: report.status === MemberTaskStatus.Completed ? (isDark ? 'rgba(22,163,74,0.2)' : '#f0fdf4') : (isDark ? 'rgba(234,179,8,0.2)' : '#fefce8') }}>
                                  <Text className="text-[10px] font-bold" style={{ color: report.status === MemberTaskStatus.Completed ? colors.status.completed : colors.status.pending }}>
                                    {report.status === MemberTaskStatus.Completed ? 'Đã xong' : 'Đang xử lý'}
                                  </Text>
                                </View>
                              </View>
                              {report.taskNote ? (
                                <Text className="text-xs mt-1 leading-snug" style={{ color: colors.textSecondary }}>{report.taskNote}</Text>
                              ) : null}
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                  {groupedReportItems.length === 0 ? <Text style={{ color: colors.textSecondary }}>Chưa có báo cáo thành viên.</Text> : null}
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
