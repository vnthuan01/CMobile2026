import Header from '@/src/components/header/header';
import { useTheme } from '@/src/context/ThemeContext';
import ViewRequestRescueScreen from '@/src/features/rescue/screens/ViewRequestRescueScreen';
import { useMyRescueRequests } from '@/src/hooks/useMyRescueRequests';
import type { MyRescueRequestItem } from '@/src/types/rescue';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
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

const FILTERS: { label: string; value: RequestFilter }[] = [
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
  const { data: requests = [], isLoading: loading } = useMyRescueRequests({
    pageSize: 20,
  });

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
      return requests.filter((r: MyRescueRequestItem) =>
        processingStatuses.includes(r.rescueRequestStatus),
      );
    }
    if (filter === 'completed') {
      return requests.filter(
        (r: MyRescueRequestItem) => r.rescueRequestStatus === 'Completed',
      );
    }
    if (filter === 'cancelled') {
      return requests.filter(
        (r: MyRescueRequestItem) => r.rescueRequestStatus === 'Cancelled',
      );
    }
    return requests;
  }, [filter, requests]);

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
        return {
          label: 'Đã hủy',
          bg: `${colors.status.error}22`,
          text: colors.status.error,
        };
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
                  style={{
                    backgroundColor: active ? colors.primary : colors.card,
                  }}
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
            <View className="mt-6 px-4">
              <Text
                className="mb-3 text-base font-bold"
                style={{ color: colors.text }}
              >
                Danh sách đơn của tôi
              </Text>

              <View className="gap-3">
                {filteredRequests.length === 0 ? (
                  <View
                    className="rounded-xl p-4 shadow-sm"
                    style={{ backgroundColor: colors.card }}
                  >
                    <Text
                      className="text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      Không có đơn cứu hộ nào trong mục này.
                    </Text>
                  </View>
                ) : (
                  filteredRequests.map((item: MyRescueRequestItem) => (
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
                      isEmergency={
                        String(item.rescueRequestType) === '1' ||
                        String(item.rescueRequestType).toLowerCase() ===
                          'emergency'
                      }
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
  isEmergency,
  date,
  onPress,
}: {
  id: string;
  status: string;
  statusColor: 'green' | 'gray' | 'red';
  type: string;
  isEmergency: boolean;
  date: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  const badgeColors =
    status === 'Chờ xác minh'
      ? isEmergency
        ? { bg: `${colors.status.error}18`, text: colors.status.error }
        : { bg: `${colors.status.pending}18`, text: colors.status.pending }
      : statusColor === 'green'
        ? { bg: `${colors.status.completed}18`, text: colors.status.completed }
        : statusColor === 'red'
          ? { bg: `${colors.status.error}18`, text: colors.status.error }
          : { bg: colors.surface, text: colors.textSecondary };

  const typeColor = isEmergency ? colors.status.error : colors.status.pending;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between rounded-xl p-4 shadow-sm"
      style={{ backgroundColor: colors.card }}
    >
      <View className="flex-1">
        <View className="mb-1 flex-row items-center gap-2">
          <View
            className="rounded-full px-2 py-0.5"
            style={{ backgroundColor: badgeColors.bg }}
          >
            <Text
              className="text-xs font-bold"
              style={{ color: badgeColors.text }}
            >
              {status}
            </Text>
          </View>
        </View>
        <Text className="font-bold" style={{ color: colors.text }}>
          {id}
        </Text>
        <View className="mt-0.5 flex-row items-center">
          <Text className="text-sm" style={{ color: typeColor }}>
            {type}
          </Text>
          <Text className="text-sm" style={{ color: colors.textSecondary }}>
            {' '}
            • {date}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}
