import Header from '@/src/components/header/header';
import ViewRequestRescueScreen from '@/src/features/rescue/screens/ViewRequestRescueScreen';
import { useTheme } from '@/src/context/ThemeContext';
import { useMyRescueRequests } from '@/src/hooks/useMyRescueRequests';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type RequestsScreenType = 'list' | 'detail';
type RequestFilter = 'all' | 'processing' | 'completed' | 'cancelled';

interface RequestsScreenProps {
  onBack?: () => void;
}

const FILTERS: Array<{ label: string; value: RequestFilter }> = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Đang xử lý', value: 'processing' },
  { label: 'Hoàn thành', value: 'completed' },
  { label: 'Đã hủy', value: 'cancelled' },
];

export default function RequestsScreen({ onBack }: RequestsScreenProps) {
  const { bottom } = useSafeAreaInsets();
  const [currentScreen, setCurrentScreen] =
    useState<RequestsScreenType>('list');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );
  const [filter, setFilter] = useState<RequestFilter>('all');

  const { colors } = useTheme();

  const queryClient = useQueryClient();
  const { data: requests = [], isLoading: loading } = useMyRescueRequests({ pageSize: 20 });

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['rescueRequests'] });
    }, [queryClient]),
  );

  const filteredRequests = useMemo(() => {
    const processingStatuses = [
      'Pending',
      'Verified',
      'Assigned',
      'InProgress',
    ];
    if (filter === 'processing') {
      return requests.filter((r) =>
        processingStatuses.includes(r.rescueRequestStatus),
      );
    }
    if (filter === 'completed') {
      return requests.filter((r) => r.rescueRequestStatus === 'Completed');
    }
    if (filter === 'cancelled') {
      return requests.filter((r) => r.rescueRequestStatus === 'Cancelled');
    }
    return requests;
  }, [filter, requests]);

  const activeRequest = useMemo(
    () =>
      requests.find((r) =>
        ['Pending', 'Verified', 'Assigned', 'InProgress'].includes(
          r.rescueRequestStatus,
        ),
      ) || null,
    [requests],
  );

  const getStatusUi = (status?: string) => {
    switch (status) {
      case 'Pending':
        return {
          label: 'Chờ xác minh',
          bg: `${colors.status.pending}22`,
          text: colors.status.pending,
        };
      case 'Verified':
        return {
          label: 'Đã xác minh',
          bg: `${colors.status.incoming}22`,
          text: colors.status.incoming,
        };
      case 'Assigned':
        return {
          label: 'Đã điều phối đội',
          bg: `${colors.status.inProgress}22`,
          text: colors.status.inProgress,
        };
      case 'InProgress':
        return {
          label: 'Đội đang tiếp cận / xử lý',
          bg: `${colors.status.completed}22`,
          text: colors.status.completed,
        };
      case 'Completed':
        return {
          label: 'Hoàn thành',
          bg: `${colors.status.completed}22`,
          text: colors.status.completed,
        };
      case 'Cancelled':
        return { label: 'Đã hủy', bg: `${colors.status.error}22`, text: colors.status.error };
      default:
        return {
          label: status || 'Khác',
          bg: colors.surface,
          text: colors.textSecondary,
        };
    }
  };

  const getTypeLabel = (type?: string | number) =>
    String(type) === '1' || String(type).toLowerCase() === 'emergency'
      ? 'Khẩn cấp'
      : 'Thông thường';

  if (currentScreen === 'detail' && selectedRequestId) {
    return (
      <ViewRequestRescueScreen
        requestId={selectedRequestId}
        onBack={() => {
          setCurrentScreen('list');
          setSelectedRequestId(null);
        }}
      />
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Header
        title="Theo dõi yêu cầu"
        subtitle="Danh sách yêu cầu cứu trợ của bạn"
        onBack={onBack}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottom + 96 }}
        className="flex-1"
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4 px-4"
        >
          <View className="flex-row gap-2">
            {FILTERS.map((item) => {
              const active = filter === item.value;
              return (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => setFilter(item.value)}
                  className="rounded-full px-4 py-2"
                  style={{ backgroundColor: active ? colors.primary : colors.card }}
                >
                  <Text
                    className="font-semibold"
                    style={{ color: active ? colors.white : colors.text }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {loading ? (
          <View className="mt-10 items-center justify-center">
            <ActivityIndicator color={colors.primary} />
            <Text className="mt-3 text-sm text-text-secondary">
              Đang tải đơn cứu hộ của bạn...
            </Text>
          </View>
        ) : (
          <>
            {activeRequest ? (
              <View className="mt-4 px-4">
                <Text
                  className="mb-3 text-base font-bold"
                  style={{ color: colors.text }}
                >
                  Đang hoạt động
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedRequestId(activeRequest.requestId);
                    setCurrentScreen('detail');
                  }}
                  className="overflow-hidden rounded-xl shadow-sm"
                  style={{ backgroundColor: colors.card }}
                >
                  <View
                    className="h-32 items-center justify-center"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <Ionicons name="map" size={40} color={colors.textSecondary} />
                  </View>

                  <View className="p-4">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <View className="mb-2 flex-row items-center gap-2">
                          <View
                            className="rounded-full px-2 py-0.5"
                            style={{ backgroundColor: getStatusUi(activeRequest.rescueRequestStatus).bg }}
                          >
                            <Text
                              className="text-xs font-bold"
                              style={{ color: getStatusUi(activeRequest.rescueRequestStatus).text }}
                            >
                              {
                                getStatusUi(activeRequest.rescueRequestStatus)
                                  .label
                              }
                            </Text>
                          </View>
                          <View
                            className="rounded-full px-2 py-0.5"
                            style={{ backgroundColor: `${colors.status.pending}22` }}
                          >
                            <Text className="text-xs font-bold" style={{ color: colors.status.pending }}>
                              {getTypeLabel(activeRequest.rescueRequestType)}
                            </Text>
                          </View>
                        </View>

                        <Text
                          className="text-lg font-bold"
                          style={{ color: colors.text }}
                        >
                          Yêu cầu cứu trợ #{activeRequest.requestId.slice(0, 8)}
                        </Text>
                        <Text
                          className="mt-1 text-sm"
                          style={{ color: colors.textSecondary }}
                          numberOfLines={2}
                        >
                          {activeRequest.description || activeRequest.address}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={24}
                        color={colors.textSecondary}
                      />
                    </View>

                    {(activeRequest.assignedRescueTeam?.operationStatus ===
                      'EnRoute' ||
                      activeRequest.rescueRequestStatus === 'InProgress') &&
                    activeRequest.assignedRescueTeam ? (
                      <View
                        className="mt-3 flex-row items-center gap-2 rounded-lg p-3"
                        style={{ backgroundColor: `${colors.status.incoming}18` }}
                      >
                        <Ionicons name="car" size={20} color={colors.status.incoming} />
                        <Text
                          className="flex-1 text-sm font-medium"
                          style={{ color: colors.status.incoming }}
                        >
                          {activeRequest.assignedRescueTeam.teamName} đang đến -
                          Dự kiến{' '}
                          {activeRequest.assignedRescueTeam
                            .estimatedMinutesToArrival ?? '--'}{' '}
                          phút
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>
              </View>
            ) : null}

            <View className="mt-6 px-4">
              <Text
                className="mb-3 text-base font-bold"
                style={{ color: colors.text }}
              >
                Danh sách đơn của tôi
              </Text>

              <View className="gap-3">
                {filteredRequests.length === 0 ? (
                  <View className="rounded-xl p-4 shadow-sm" style={{ backgroundColor: colors.card }}>
                    <Text className="text-sm" style={{ color: colors.textSecondary }}>
                      Không có đơn cứu hộ nào trong mục này.
                    </Text>
                  </View>
                ) : (
                  filteredRequests.map((item) => (
                    <RequestHistoryItem
                      key={item.requestId}
                      id={`#${item.requestId.slice(0, 8)}`}
                      status={getStatusUi(item.rescueRequestStatus).label}
                      statusColor={
                        item.rescueRequestStatus === 'Completed'
                          ? 'green'
                          : item.rescueRequestStatus === 'Cancelled'
                            ? 'red'
                            : 'gray'
                      }
                      type={getTypeLabel(item.rescueRequestType)}
                      date={new Date(item.createdAt).toLocaleDateString(
                        'vi-VN',
                      )}
                      onPress={() => {
                        setSelectedRequestId(item.requestId);
                        setCurrentScreen('detail');
                      }}
                    />
                  ))
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function RequestHistoryItem({
  id,
  status,
  statusColor,
  type,
  date,
  onPress,
}: {
  id: string;
  status: string;
  statusColor: 'green' | 'gray' | 'red';
  type: string;
  date: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  const badgeColors =
    statusColor === 'green'
      ? { bg: `${colors.status.completed}18`, text: colors.status.completed }
      : statusColor === 'red'
        ? { bg: `${colors.status.error}18`, text: colors.status.error }
        : { bg: colors.surface, text: colors.textSecondary };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between rounded-xl p-4 shadow-sm"
      style={{ backgroundColor: colors.card }}
    >
      <View className="flex-1">
        <View className="mb-1 flex-row items-center gap-2">
          <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: badgeColors.bg }}>
            <Text className="text-xs font-bold" style={{ color: badgeColors.text }}>{status}</Text>
          </View>
        </View>
        <Text className="font-bold" style={{ color: colors.text }}>
          {id}
        </Text>
        <Text
          className="mt-0.5 text-sm"
          style={{ color: colors.textSecondary }}
        >
          {type} • {date}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.textSecondary}
      />
    </TouchableOpacity>
  );
}
