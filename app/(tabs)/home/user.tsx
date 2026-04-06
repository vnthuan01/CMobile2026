import '@/global.css';
import ViewRequestRescueScreen from '@/src/components/user/ViewRequestRescueScreen';
import {
  fetchMyRescueRequests,
  MyRescueRequestItem,
} from '@/src/services/rescueService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
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
  const [currentScreen, setCurrentScreen] = useState<UserScreen>('home');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );
  const [requests, setRequests] = useState<MyRescueRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RequestFilter>('all');

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const response = await fetchMyRescueRequests({
          pageNumber: 1,
          pageSize: 20,
        });
        setRequests(response.data || []);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, []);

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

  const historyRequests = useMemo(
    () =>
      requests.filter((r) =>
        ['Completed', 'Cancelled'].includes(r.rescueRequestStatus),
      ),
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
      style={{ paddingTop: top, paddingBottom: bottom + 96 }}
      className="bg-background-light"
    >
      <View className="bg-white px-4 py-4 shadow-sm">
        <Text className="text-xl font-bold">Theo dõi yêu cầu</Text>
        <Text className="mt-1 text-sm text-text-secondary">
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
                className={`rounded-full px-4 py-2 ${active ? 'bg-primary' : 'bg-white'}`}
              >
                <Text
                  className={`font-semibold ${active ? 'text-white' : 'text-text-primary'}`}
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
          <ActivityIndicator color="#DA251D" />
          <Text className="mt-3 text-sm text-text-secondary">
            Đang tải yêu cầu của bạn...
          </Text>
        </View>
      ) : (
        <>
          {activeRequest ? (
            <View className="mt-4 px-4">
              <Text className="mb-3 text-base font-bold">Đang hoạt động</Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedRequestId(activeRequest.requestId);
                  setCurrentScreen('track');
                }}
                className="overflow-hidden rounded-xl bg-white shadow-sm"
              >
                <View className="h-32 items-center justify-center bg-gray-200">
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
                      <Text className="text-lg font-bold">
                        Yêu cầu #{activeRequest.requestId.slice(0, 8)}
                      </Text>
                      <Text
                        className="mt-1 text-sm text-text-secondary"
                        numberOfLines={2}
                      >
                        {activeRequest.description || activeRequest.address}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={24}
                      color="#6b7280"
                    />
                  </View>

                  {(activeRequest.assignedRescueTeam?.operationStatus ===
                    'EnRoute' ||
                    activeRequest.rescueRequestStatus === 'InProgress') &&
                  activeRequest.assignedRescueTeam ? (
                    <View className="mt-3 flex-row items-center gap-2 rounded-lg bg-blue-50 p-3">
                      <Ionicons name="car" size={20} color="#DA251D" />
                      <Text className="flex-1 text-sm font-medium text-primary">
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
            <Text className="mb-3 text-base font-bold">
              {filter === 'all' ? 'Tất cả yêu cầu' : 'Danh sách yêu cầu'}
            </Text>

            <View className="gap-3">
              {filteredRequests.length === 0 ? (
                <View className="rounded-xl bg-white p-4 shadow-sm">
                  <Text className="text-sm text-text-secondary">
                    Chưa có yêu cầu nào trong mục này.
                  </Text>
                </View>
              ) : (
                filteredRequests.map((item) => {
                  const statusUi = getStatusUi(item.rescueRequestStatus);
                  return (
                    <TouchableOpacity
                      key={item.requestId}
                      onPress={() => {
                        setSelectedRequestId(item.requestId);
                        setCurrentScreen('track');
                      }}
                      className="flex-row items-center justify-between rounded-xl bg-white p-4 shadow-sm"
                    >
                      <View className="flex-1">
                        <View className="mb-1 flex-row items-center gap-2">
                          <View
                            className={`rounded-full px-2 py-0.5 ${statusUi.bg}`}
                          >
                            <Text
                              className={`text-xs font-bold ${statusUi.text}`}
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
                        color="#6b7280"
                      />
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </View>

          {historyRequests.length > 0 ? (
            <View className="mt-6 px-4">
              <Text className="mb-3 text-base font-bold">Lịch sử</Text>
              <View className="gap-3">
                {historyRequests.slice(0, 3).map((item) => {
                  const statusUi = getStatusUi(item.rescueRequestStatus);
                  return (
                    <TouchableOpacity
                      key={item.requestId}
                      onPress={() => {
                        setSelectedRequestId(item.requestId);
                        setCurrentScreen('track');
                      }}
                      className="flex-row items-center justify-between rounded-xl bg-white p-4 shadow-sm"
                    >
                      <View className="flex-1">
                        <View className="mb-1 flex-row items-center gap-2">
                          <View
                            className={`rounded-full px-2 py-0.5 ${statusUi.bg}`}
                          >
                            <Text
                              className={`text-xs font-bold ${statusUi.text}`}
                            >
                              {statusUi.label}
                            </Text>
                          </View>
                        </View>
                        <Text className="font-bold">
                          #{item.requestId.slice(0, 8)}
                        </Text>
                        <Text className="mt-0.5 text-sm text-text-secondary">
                          {getTypeLabel(item.rescueRequestType)} •{' '}
                          {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#6b7280"
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
        <TouchableOpacity className="h-16 flex-row items-center justify-center gap-3 rounded-xl bg-red-600">
          <Ionicons name="warning" size={26} color="#fff" />
          <Text className="text-xl font-black text-white">SOS – KHẨN CẤP</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/donate')}
          className="mt-4 h-16 flex-row items-center justify-center gap-3 rounded-xl border border-primary bg-white"
        >
          <Ionicons name="heart" size={26} color="#DA251D" />
          <Text className="text-xl font-black text-primary">
            ỦNG HỘ CỨU TRỢ
          </Text>
        </TouchableOpacity>

        <Text className="mt-2 text-center text-xs text-gray-400">
          Nhấn để gửi tín hiệu khẩn cấp hoặc đóng góp cứu trợ
        </Text>
      </View>
    </ScrollView>
  );
}
