import Header from '@/src/components/header/header';
import ViewRequestRescueScreen from '@/src/features/rescue/screens/ViewRequestRescueScreen';
import { useTheme } from '@/src/context/ThemeContext';
import { useMyRescueRequests } from '@/src/hooks/useMyRescueRequests';
import type { MyRescueRequestItem } from '@/src/types/rescue';
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

  const { colors, isDark } = useTheme();

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
          bg: 'bg-amber-100',
          text: 'text-amber-700',
        };
      case 'Verified':
        return {
          label: 'Đã xác minh',
          bg: 'bg-blue-100',
          text: 'text-blue-700',
        };
      case 'Assigned':
        return {
          label: 'Đã điều phối đội',
          bg: 'bg-violet-100',
          text: 'text-violet-700',
        };
      case 'InProgress':
        return {
          label: 'Đội đang tiếp cận / xử lý',
          bg: 'bg-green-100',
          text: 'text-green-700',
        };
      case 'Completed':
        return {
          label: 'Hoàn thành',
          bg: 'bg-green-100',
          text: 'text-green-700',
        };
      case 'Cancelled':
        return { label: 'Đã hủy', bg: 'bg-red-100', text: 'text-red-700' };
      default:
        return {
          label: status || 'Khác',
          bg: 'bg-gray-100',
          text: 'text-gray-700',
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
                  className={`rounded-full px-4 py-2 ${active ? 'bg-primary' : 'bg-white'}`}
                >
                  <Text
                    className={`font-semibold ${active ? 'text-white' : 'text-text-primary'}`}
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
                    className={`h-32 items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
                  >
                    <Ionicons name="map" size={40} color="#6b7280" />
                  </View>

                  <View className="p-4">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <View className="mb-2 flex-row items-center gap-2">
                          <View
                            className={`rounded-full px-2 py-0.5 ${getStatusUi(activeRequest.rescueRequestStatus).bg}`}
                          >
                            <Text
                              className={`text-xs font-bold ${getStatusUi(activeRequest.rescueRequestStatus).text}`}
                            >
                              {
                                getStatusUi(activeRequest.rescueRequestStatus)
                                  .label
                              }
                            </Text>
                          </View>
                          <View className="rounded-full bg-amber-100 px-2 py-0.5">
                            <Text className="text-xs font-bold text-amber-700">
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
                        color={isDark ? '#9ca3af' : '#6b7280'}
                      />
                    </View>

                    {(activeRequest.assignedRescueTeam?.operationStatus ===
                      'EnRoute' ||
                      activeRequest.rescueRequestStatus === 'InProgress') &&
                    activeRequest.assignedRescueTeam ? (
                      <View
                        className={`mt-3 flex-row items-center gap-2 rounded-lg p-3 ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}
                      >
                        <Ionicons name="car" size={20} color={colors.primary} />
                        <Text
                          className={`flex-1 text-sm font-medium ${isDark ? 'text-blue-300' : 'text-primary'}`}
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
                  <View className="rounded-xl bg-white p-4 shadow-sm">
                    <Text className="text-sm text-text-secondary">
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
  const { colors, isDark } = useTheme();

  const bgColor =
    statusColor === 'green'
      ? 'bg-green-50'
      : statusColor === 'red'
        ? 'bg-red-50'
        : 'bg-gray-50';
  const textColor =
    statusColor === 'green'
      ? 'text-green-700'
      : statusColor === 'red'
        ? 'text-red-700'
        : 'text-gray-700';

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between rounded-xl p-4 shadow-sm"
      style={{ backgroundColor: colors.card }}
    >
      <View className="flex-1">
        <View className="mb-1 flex-row items-center gap-2">
          <View className={`rounded-full ${bgColor} px-2 py-0.5`}>
            <Text className={`text-xs font-bold ${textColor}`}>{status}</Text>
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
        color={isDark ? '#9ca3af' : '#6b7280'}
      />
    </TouchableOpacity>
  );
}
