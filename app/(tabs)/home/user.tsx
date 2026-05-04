import '@/global.css';
import ViewRequestRescueScreen from '@/src/features/rescue/screens/ViewRequestRescueScreen';
import { useMyRescueRequests } from '@/src/hooks/useMyRescueRequests';
import { useTheme } from '@/src/context/ThemeContext';
import type { MyRescueRequestItem } from '@/src/types/rescue';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type UserScreen = 'home' | 'track';
type RequestFilter = 'all' | 'processing' | 'completed' | 'cancelled';

const FILTERS: Array<{ label: string; value: RequestFilter }> = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Đang xử lý', value: 'processing' },
  { label: 'Hoàn thành', value: 'completed' },
  { label: 'Đã hủy', value: 'cancelled' },
];

export default function CitizenHome() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const { colors } = useTheme();
  const { data: requests = [], isLoading: loading } = useMyRescueRequests({
    pageNumber: 1,
    pageSize: 20,
  });
  const [currentScreen, setCurrentScreen] = useState<UserScreen>('home');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );
  const [filter, setFilter] = useState<RequestFilter>('all');

  const filteredRequests = useMemo(() => {
    const processingStatuses = [
      'Pending',
      'Verified',
      'Assigned',
      'InProgress',
    ];
    if (filter === 'processing') {
      return requests.filter((r: MyRescueRequestItem) =>
        processingStatuses.includes(r.rescueRequestStatus),
      );
    }
    if (filter === 'completed') {
      return requests.filter((r: MyRescueRequestItem) => r.rescueRequestStatus === 'Completed');
    }
    if (filter === 'cancelled') {
      return requests.filter((r: MyRescueRequestItem) => r.rescueRequestStatus === 'Cancelled');
    }
    return requests;
  }, [filter, requests]);

  const activeRequest = useMemo(
    () =>
      requests.find((r: MyRescueRequestItem) =>
        ['Pending', 'Verified', 'Assigned', 'InProgress'].includes(
          r.rescueRequestStatus,
        ),
      ) || null,
    [requests],
  );

  const historyRequests = useMemo(
    () =>
      requests.filter((r: MyRescueRequestItem) =>
        ['Completed', 'Cancelled'].includes(r.rescueRequestStatus),
      ),
    [requests],
  );

  const getStatusUi = (status?: string) => {
    switch (status) {
      case 'Pending':
        return {
          label: 'Chờ xác minh',
          bgColor: `${colors.status.pending}22`,
          textColor: colors.status.pending,
        };
      case 'Verified':
        return {
          label: 'Đã xác minh',
          bgColor: `${colors.status.incoming}22`,
          textColor: colors.status.incoming,
        };
      case 'Assigned':
        return {
          label: 'Đã điều phối đội',
          bgColor: `${colors.status.inProgress}22`,
          textColor: colors.status.inProgress,
        };
      case 'InProgress':
        return {
          label: 'Đội đang tiếp cận / xử lý',
          bgColor: `${colors.status.completed}22`,
          textColor: colors.status.completed,
        };
      case 'Completed':
        return {
          label: 'Hoàn thành',
          bgColor: `${colors.status.completed}22`,
          textColor: colors.status.completed,
        };
      case 'Cancelled':
        return { label: 'Đã hủy', bgColor: `${colors.status.cancelled}22`, textColor: colors.status.cancelled };
      default:
        return {
          label: status || 'Khác',
          bgColor: colors.surface,
          textColor: colors.textSecondary,
        };
    }
  };

  const getTypeLabel = (type?: string | number) =>
    String(type) === '1' || String(type).toLowerCase() === 'emergency'
      ? 'Khẩn cấp'
      : 'Thông thường';

  if (currentScreen === 'track' && selectedRequestId) {
    return (
      <ViewRequestRescueScreen
        requestId={selectedRequestId}
        onBack={() => {
          setCurrentScreen('home');
          setSelectedRequestId(null);
        }}
      />
    );
  }

  return (
    <ScrollView
      style={{ paddingTop: top, paddingBottom: bottom + 96, backgroundColor: colors.background }}
    >
      <View className="px-4 py-4 shadow-sm" style={{ backgroundColor: colors.card }}>
        <Text className="text-xl font-bold" style={{ color: colors.text }}>Theo dõi yêu cầu</Text>
        <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
          Danh sách yêu cầu cứu trợ của bạn
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-4 px-4"
      >
        <View className="flex-row gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <TouchableOpacity
                key={f.value}
                onPress={() => setFilter(f.value)}
                className="rounded-full px-4 py-2"
                style={{ backgroundColor: active ? colors.primary : colors.card }}
              >
                <Text
                  className="font-semibold"
                  style={{ color: active ? colors.white : colors.text }}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {loading ? (
        <View className="mt-10 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
          <Text className="mt-3 text-sm" style={{ color: colors.textSecondary }}>
            Đang tải yêu cầu của bạn...
          </Text>
        </View>
      ) : (
        <>
          {activeRequest ? (
            <View className="mt-4 px-4">
              <Text className="mb-3 text-base font-bold" style={{ color: colors.text }}>Đang hoạt động</Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedRequestId(activeRequest.requestId);
                  setCurrentScreen('track');
                }}
                className="overflow-hidden rounded-xl shadow-sm"
                style={{ backgroundColor: colors.card }}
              >
                <View className="h-32 items-center justify-center" style={{ backgroundColor: colors.surface }}>
                  <Ionicons name="map" size={40} color={colors.textSecondary} />
                </View>

                <View className="p-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <View className="mb-2 flex-row items-center gap-2">
                        <View
                          className="rounded-full px-2 py-0.5"
                          style={{ backgroundColor: getStatusUi(activeRequest.rescueRequestStatus).bgColor }}
                        >
                          <Text
                            className="text-xs font-bold"
                            style={{ color: getStatusUi(activeRequest.rescueRequestStatus).textColor }}
                          >
                            {
                              getStatusUi(activeRequest.rescueRequestStatus)
                                .label
                            }
                          </Text>
                        </View>
                        <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: `${colors.status.pending}22` }}>
                          <Text className="text-xs font-bold" style={{ color: colors.status.pending }}>
                            {getTypeLabel(activeRequest.rescueRequestType)}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-lg font-bold" style={{ color: colors.text }}>
                        Yêu cầu #{activeRequest.requestId.slice(0, 8)}
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
                    <View className="mt-3 flex-row items-center gap-2 rounded-lg p-3" style={{ backgroundColor: `${colors.status.incoming}18` }}>
                      <Ionicons name="car" size={20} color={colors.status.incoming} />
                      <Text className="flex-1 text-sm font-medium" style={{ color: colors.status.incoming }}>
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
            <Text className="mb-3 text-base font-bold" style={{ color: colors.text }}>
              {filter === 'all' ? 'Tất cả yêu cầu' : 'Danh sách yêu cầu'}
            </Text>

            <View className="gap-3">
              {filteredRequests.length === 0 ? (
                <View className="rounded-xl p-4 shadow-sm" style={{ backgroundColor: colors.card }}>
                  <Text className="text-sm" style={{ color: colors.textSecondary }}>
                    Chưa có yêu cầu nào trong mục này.
                  </Text>
                </View>
              ) : (
                filteredRequests.map((item: MyRescueRequestItem) => {
                  const statusUi = getStatusUi(item.rescueRequestStatus);
                  return (
                    <TouchableOpacity
                      key={item.requestId}
                      onPress={() => {
                        setSelectedRequestId(item.requestId);
                        setCurrentScreen('track');
                      }}
                      className="flex-row items-center justify-between rounded-xl p-4 shadow-sm"
                      style={{ backgroundColor: colors.card }}
                    >
                      <View className="flex-1">
                        <View className="mb-1 flex-row items-center gap-2">
                          <View
                            className="rounded-full px-2 py-0.5"
                            style={{ backgroundColor: statusUi.bgColor }}
                          >
                            <Text
                              className="text-xs font-bold"
                              style={{ color: statusUi.textColor }}
                            >
                              {statusUi.label}
                            </Text>
                          </View>
                        </View>
                        <Text className="font-bold">
                          #{item.requestId.slice(0, 8)}
                        </Text>
                        <Text
                          className="mt-0.5 text-sm text-text-secondary"
                          numberOfLines={2}
                        >
                          {getTypeLabel(item.rescueRequestType)} •{' '}
                          {item.address || item.description}
                        </Text>
                      </View>
                        <Ionicons
                         name="chevron-forward"
                         size={20}
                         color={colors.textSecondary}
                       />
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </View>

          {historyRequests.length > 0 ? (
            <View className="mt-6 px-4">
              <Text className="mb-3 text-base font-bold" style={{ color: colors.text }}>Lịch sử</Text>
              <View className="gap-3">
                {historyRequests.slice(0, 3).map((item: MyRescueRequestItem) => {
                  const statusUi = getStatusUi(item.rescueRequestStatus);
                  return (
                    <TouchableOpacity
                      key={item.requestId}
                      onPress={() => {
                        setSelectedRequestId(item.requestId);
                        setCurrentScreen('track');
                      }}
                      className="flex-row items-center justify-between rounded-xl p-4 shadow-sm"
                      style={{ backgroundColor: colors.card }}
                    >
                      <View className="flex-1">
                        <View className="mb-1 flex-row items-center gap-2">
                          <View
                            className="rounded-full px-2 py-0.5"
                            style={{ backgroundColor: statusUi.bgColor }}
                          >
                            <Text
                              className="text-xs font-bold"
                              style={{ color: statusUi.textColor }}
                            >
                              {statusUi.label}
                            </Text>
                          </View>
                        </View>
                        <Text className="font-bold" style={{ color: colors.text }}>
                          #{item.requestId.slice(0, 8)}
                        </Text>
                        <Text className="mt-0.5 text-sm" style={{ color: colors.textSecondary }}>
                          {getTypeLabel(item.rescueRequestType)} •{' '}
                          {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : null}
        </>
      )}

      <View className="mt-8 px-4">
        <TouchableOpacity
          className="h-16 flex-row items-center justify-center gap-3 rounded-xl"
          style={{ backgroundColor: colors.status.error }}
        >
          <Ionicons name="warning" size={26} color={colors.white} />
          <Text className="text-xl font-black" style={{ color: colors.white }}>SOS – KHẨN CẤP</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/fundraising')}
          className="mt-4 h-16 flex-row items-center justify-center gap-3 rounded-xl border"
          style={{ borderColor: colors.primary, backgroundColor: colors.card }}
        >
          <Ionicons name="heart" size={26} color={colors.primary} />
          <Text className="text-xl font-black" style={{ color: colors.primary }}>
            ỦNG HỘ CỨU TRỢ
          </Text>
        </TouchableOpacity>

        <Text className="mt-2 text-center text-xs" style={{ color: colors.textSecondary }}>
          Nhấn để gửi tín hiệu khẩn cấp hoặc đóng góp cứu trợ
        </Text>
      </View>
    </ScrollView>
  );
}
