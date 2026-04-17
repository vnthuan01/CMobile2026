import '@/global.css';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import { useTheme } from '@/src/context/ThemeContext';
import { useBottomContentInset } from '@/src/hooks/useBottomContentInset';
import {
  useCampaignDetail,
  useVolunteerRegistrationCampaigns,
} from '@/src/hooks/useDonation';
import {
  CampaignResourceType,
  type CampaignDetail,
  type CampaignListItem,
} from '@/src/services/donationService';
import { useProfileFlowStore } from '@/src/store/profileFlowStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useEffect } from 'react';
import { showErrorToast } from '@/src/utils/toast';

const getCampaignPriority = (status: number) => {
  switch (Number(status)) {
    case 1:
      return 0;
    case 7:
      return 1;
    case 6:
      return 2;
    case 2:
      return 3;
    case 5:
      return 4;
    case 8:
      return 5;
    case 3:
      return 6;
    case 4:
      return 7;
    case 0:
      return 8;
    default:
      return 9;
  }
};

const getCampaignStatusMeta = (status: number, colors: any) => {
  switch (Number(status)) {
    case 0:
      return { label: 'Nháp', bg: colors.surface, text: colors.textSecondary };
    case 1:
      return {
        label: 'Đang hoạt động',
        bg: `${colors.status.completed}18`,
        text: colors.status.completed,
      };
    case 2:
      return {
        label: 'Tạm dừng',
        bg: `${colors.status.incoming}18`,
        text: colors.status.incoming,
      };
    case 3:
      return {
        label: 'Hoàn thành',
        bg: `${colors.status.completed}18`,
        text: colors.status.completed,
      };
    case 4:
      return {
        label: 'Đã hủy',
        bg: `${colors.status.error}18`,
        text: colors.status.error,
      };
    case 5:
      return {
        label: 'Đã đủ mục tiêu',
        bg: `${colors.status.completed}18`,
        text: colors.status.completed,
      };
    case 6:
      return {
        label: 'Sẵn sàng triển khai',
        bg: `${colors.status.pending}18`,
        text: colors.status.pending,
      };
    case 7:
      return {
        label: 'Đang triển khai',
        bg: `${colors.status.inProgress}18`,
        text: colors.status.inProgress,
      };
    case 8:
      return {
        label: 'Đang đóng',
        bg: `${colors.status.cancelled}18`,
        text: colors.status.cancelled,
      };
    default:
      return {
        label: 'Khả dụng',
        bg: `${colors.status.pending}18`,
        text: colors.status.pending,
      };
  }
};

const getPeopleGoal = (campaign?: CampaignDetail | null) =>
  (campaign?.goals || []).find(
    (goal) => goal.resourceType === CampaignResourceType.People,
  );

export default function VolunteerCampaignPickerScreen() {
  const router = useRouter();
  const bottomInset = useBottomContentInset(24);
  const { colors } = useTheme();
  const { data, isLoading, isError, refetch } =
    useVolunteerRegistrationCampaigns(true);
  const selectedVolunteerCampaign = useProfileFlowStore(
    (state) => state.selectedVolunteerCampaign,
  );
  const setSelectedVolunteerCampaign = useProfileFlowStore(
    (state) => state.setSelectedVolunteerCampaign,
  );

  const campaigns = data?.items ?? [];
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(
    selectedVolunteerCampaign?.campaignId ?? null,
  );
  const [searchKeyword, setSearchKeyword] = useState('');

  const expandedCampaignDetailQuery = useCampaignDetail(
    expandedCampaignId || undefined,
    !!expandedCampaignId,
  );

  useEffect(() => {
    if (isError && (data as any) == null) {
      showErrorToast(
        'Không tải được danh sách chiến dịch',
        'Vui lòng thử lại sau.',
      );
    }
  }, [data, isError]);

  useEffect(() => {
    if (expandedCampaignDetailQuery.error) {
      showErrorToast(
        'Không tải được chi tiết chiến dịch',
        expandedCampaignDetailQuery.error.message,
      );
    }
  }, [expandedCampaignDetailQuery.error]);

  const filteredCampaigns = useMemo(() => {
    const normalizedKeyword = searchKeyword.trim().toLowerCase();
    const source = !normalizedKeyword
      ? campaigns
      : campaigns.filter((campaign: CampaignListItem) => {
          const haystack =
            `${campaign.name} ${campaign.description || ''}`.toLowerCase();
          return haystack.includes(normalizedKeyword);
        });

    return [...source].sort((a, b) => {
      const priorityDiff =
        getCampaignPriority(a.status) - getCampaignPriority(b.status);
      if (priorityDiff !== 0) return priorityDiff;
      return a.name.localeCompare(b.name, 'vi');
    });
  }, [campaigns, searchKeyword]);

  const chooseCampaign = (campaign: CampaignListItem) => {
    setSelectedVolunteerCampaign(campaign);
    router.back();
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenHeader title="Chọn chiến dịch" onBack={() => router.back()} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: bottomInset }}
        showsVerticalScrollIndicator={false}
      >
        <View className="p-4">
          <View
            className="rounded-2xl border p-4"
            style={{ borderColor: colors.border, backgroundColor: colors.card }}
          >
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              Chọn chiến dịch để tham gia tình nguyện
            </Text>
            <Text
              className="mt-2 text-sm leading-6"
              style={{ color: colors.textSecondary }}
            >
              Khi bạn mở rộng một chiến dịch, ứng dụng sẽ lấy chi tiết realtime
              từ hệ thống rồi hiển thị đầy đủ thông tin trước khi bạn chọn tham
              gia.
            </Text>
          </View>

          <View
            className="mt-4 rounded-2xl border px-4 py-3"
            style={{ borderColor: colors.border, backgroundColor: colors.card }}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons
                name="search-outline"
                size={18}
                color={colors.textSecondary}
              />
              <TextInput
                value={searchKeyword}
                onChangeText={setSearchKeyword}
                placeholder="Tìm theo tên chiến dịch"
                placeholderTextColor={colors.textSecondary}
                className="flex-1 text-sm"
                style={{ color: colors.text }}
              />
            </View>
          </View>

          {isLoading ? (
            <View className="items-center justify-center py-16">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text
                className="mt-3 text-sm"
                style={{ color: colors.textSecondary }}
              >
                Đang tải danh sách chiến dịch...
              </Text>
            </View>
          ) : isError ? (
            <View
              className="mt-4 items-center rounded-2xl border border-dashed px-5 py-10"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.card,
              }}
            >
              <Ionicons
                name="alert-circle-outline"
                size={42}
                color={colors.status.error}
              />
              <Text
                className="mt-3 text-lg font-bold"
                style={{ color: colors.text }}
              >
                Không tải được danh sách chiến dịch
              </Text>
              <TouchableOpacity
                onPress={() => void refetch()}
                className="mt-4 rounded-xl px-4 py-3"
                style={{ backgroundColor: `${colors.primary}18` }}
              >
                <Text className="font-bold" style={{ color: colors.primary }}>
                  Thử lại
                </Text>
              </TouchableOpacity>
            </View>
          ) : filteredCampaigns.length === 0 ? (
            <View
              className="mt-4 items-center rounded-2xl border border-dashed px-5 py-10"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.card,
              }}
            >
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                Không tìm thấy chiến dịch phù hợp với từ khóa tìm kiếm.
              </Text>
            </View>
          ) : (
            <View className="mt-4 gap-3">
              {filteredCampaigns.map((campaign: CampaignListItem) => {
                const expanded = expandedCampaignId === campaign.campaignId;
                const selected =
                  selectedVolunteerCampaign?.campaignId === campaign.campaignId;
                const statusMeta = getCampaignStatusMeta(
                  campaign.status,
                  colors,
                );

                const detail =
                  expanded &&
                  expandedCampaignDetailQuery.data?.campaignId ===
                    campaign.campaignId
                    ? expandedCampaignDetailQuery.data
                    : null;

                const peopleGoal = getPeopleGoal(detail);
                const peopleTarget = peopleGoal?.targetAmount ?? 0;
                const peopleReached = peopleGoal?.receivedAmount ?? 0;
                const remainingPeople = Math.max(
                  peopleTarget - peopleReached,
                  0,
                );

                return (
                  <TouchableOpacity
                    key={campaign.campaignId}
                    onPress={() =>
                      setExpandedCampaignId((prev) =>
                        prev === campaign.campaignId
                          ? null
                          : campaign.campaignId,
                      )
                    }
                    activeOpacity={0.9}
                    className="rounded-2xl border p-4"
                    style={{
                      borderColor: selected ? colors.primary : colors.border,
                      backgroundColor: colors.card,
                    }}
                  >
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1">
                        <View className="mb-2 flex-row flex-wrap items-center gap-2">
                          <View
                            className="rounded-full px-3 py-1"
                            style={{ backgroundColor: statusMeta.bg }}
                          >
                            <Text
                              className="text-xs font-bold"
                              style={{ color: statusMeta.text }}
                            >
                              {statusMeta.label}
                            </Text>
                          </View>
                        </View>

                        <Text
                          className="text-base font-bold leading-6"
                          style={{ color: colors.text }}
                        >
                          {campaign.name}
                        </Text>

                        <Text
                          className="mt-2 text-xs font-medium"
                          style={{ color: colors.textSecondary }}
                        >
                          {new Date(campaign.startDate).toLocaleDateString(
                            'vi-VN',
                          )}{' '}
                          -{' '}
                          {new Date(campaign.endDate).toLocaleDateString(
                            'vi-VN',
                          )}
                        </Text>
                      </View>

                      <Ionicons
                        name={expanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={colors.textSecondary}
                      />
                    </View>

                    {expanded ? (
                      <View
                        className="mt-4 rounded-xl p-4"
                        style={{ backgroundColor: colors.surface }}
                      >
                        {expandedCampaignDetailQuery.isLoading ? (
                          <View className="items-center py-4">
                            <ActivityIndicator color={colors.primary} />
                            <Text
                              className="mt-3 text-sm"
                              style={{ color: colors.textSecondary }}
                            >
                              Đang tải chi tiết chiến dịch...
                            </Text>
                          </View>
                        ) : detail ? (
                          <>
                            <View className="gap-2">
                              <InfoLine
                                label="Mô tả"
                                value={detail.description || 'Chưa có mô tả'}
                              />
                              <InfoLine
                                label="Địa chỉ"
                                value={
                                  detail.addressDetail || 'Chưa có địa chỉ'
                                }
                              />

                              <InfoLine
                                label="Mục tiêu nhân lực"
                                value={
                                  peopleTarget > 0
                                    ? `${peopleReached}/${peopleTarget} người • Còn thiếu ${remainingPeople} người`
                                    : 'Chưa có mục tiêu nhân lực'
                                }
                              />
                            </View>

                            <TouchableOpacity
                              onPress={() => chooseCampaign(campaign)}
                              className="mt-4 rounded-xl px-4 py-3"
                              style={{ backgroundColor: colors.primary }}
                            >
                              <Text
                                className="text-center text-sm font-bold"
                                style={{ color: colors.white }}
                              >
                                Chọn chiến dịch này
                              </Text>
                            </TouchableOpacity>
                          </>
                        ) : (
                          <Text
                            className="text-sm"
                            style={{ color: colors.textSecondary }}
                          >
                            Không tải được chi tiết chiến dịch.
                          </Text>
                        )}
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();

  return (
    <View>
      <Text
        className="text-xs font-semibold uppercase"
        style={{ color: colors.textSecondary }}
      >
        {label}
      </Text>
      <Text className="mt-1 text-sm leading-6" style={{ color: colors.text }}>
        {value}
      </Text>
    </View>
  );
}
