import '@/global.css';
import { useTheme } from '@/src/context/ThemeContext';
import { useMyRescueRequests } from '@/src/hooks/useMyRescueRequests';
import { useRescueRequestDetail } from '@/src/hooks/useRescueRequestDetail';
import { rescueTeamService } from '@/src/services/rescueTeamService';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import UserRescueTrackingMap from '../user/UserRescueTrackingMap';

export default function UserHomeContent() {
  const { bottom } = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();

  const queryClient = useQueryClient();
  const { data: requests = [], isLoading: loadingRequests } =
    useMyRescueRequests({ pageSize: 10 });

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['rescueRequests'] });
    }, [queryClient]),
  );

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
      requests
        .filter((r) =>
          ['Completed', 'Cancelled'].includes(r.rescueRequestStatus),
        )
        .slice(0, 3),
    [requests],
  );

  const activeRequestDetailQuery = useRescueRequestDetail(
    activeRequest?.requestId ?? null,
  );
  const activeRequestDetail = activeRequestDetailQuery.data ?? null;

  const teamCoordinate = useMemo(() => {
    if (
      !activeRequest?.assignedRescueTeam ||
      activeRequest.assignedRescueTeam.currentLongitude == null ||
      activeRequest.assignedRescueTeam.currentLatitude == null
    ) {
      return null;
    }

    return [
      activeRequest.assignedRescueTeam.currentLongitude,
      activeRequest.assignedRescueTeam.currentLatitude,
    ] as [number, number];
  }, [activeRequest?.assignedRescueTeam]);

  const victimCoordinate = useMemo(() => {
    if (
      activeRequestDetail?.longitude == null ||
      activeRequestDetail?.latitude == null
    ) {
      return null;
    }

    return [activeRequestDetail.longitude, activeRequestDetail.latitude] as [
      number,
      number,
    ];
  }, [activeRequestDetail?.latitude, activeRequestDetail?.longitude]);

  const canRenderRequestMap = !!(teamCoordinate || victimCoordinate);

  const routeCoordinates = useMemo(() => {
    const polyline = activeRequest?.assignedRescueTeam?.routePolyline;
    if (!polyline) return [];

    return rescueTeamService.decodePolyline(polyline);
  }, [activeRequest?.assignedRescueTeam?.routePolyline]);

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
        return {
          label: 'Đã hủy',
          bgColor: `${colors.status.cancelled}22`,
          textColor: colors.status.cancelled,
        };
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

  const formatRequestId = (id: string) => `#${id.slice(0, 8)}`;
  const openRequestsScreen = () => router.push('/requests');
  const openRequestDetail = (requestId: string) => {
    router.push({
      pathname: '/(tabs)/requests/[requestId]',
      params: { requestId },
    });
  };

  return (
    <View style={{ paddingBottom: bottom + 20 }}>
      <View className="mt-6 px-4">
        <Text className="mb-3 text-lg font-bold" style={{ color: colors.text }}>
          Hành động nhanh
        </Text>
        <View className="flex-row gap-3">
          <QuickActionCard
            icon="alert-circle"
            label="Gửi yêu cầu"
            description="Tạo yêu cầu cứu hộ"
            variant="request"
            onPress={() => router.push('/create-request')}
          />
          <QuickActionCard
            icon="location"
            label="Theo dõi"
            description="Xem tiến độ cứu hộ"
            variant="tracking"
            onPress={openRequestsScreen}
          />
          <QuickActionCard
            icon="heart"
            label="Ủng hộ"
            description="Đóng góp cứu trợ"
            variant="donate"
            onPress={() => router.push('/donate')}
          />
        </View>
      </View>
      <View className="mt-6 px-4">
        <Text className="mb-3 text-lg font-bold" style={{ color: colors.text }}>
          Yêu cầu gần đây
        </Text>

        {loadingRequests ? (
          <View
            className="items-center justify-center rounded-xl py-10 shadow-sm"
            style={{ backgroundColor: colors.card }}
          >
            <ActivityIndicator color={colors.primary} />
            <Text
              className="mt-3 text-sm"
              style={{ color: colors.textSecondary }}
            >
              Đang tải yêu cầu của bạn...
            </Text>
          </View>
        ) : activeRequest ? (
          <TouchableOpacity
            onPress={() => openRequestDetail(activeRequest.requestId)}
            className="overflow-hidden rounded-xl shadow-sm"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderWidth: 1,
            }}
          >
            <View
              className="h-32 overflow-hidden"
              style={{ backgroundColor: colors.surface }}
            >
              {canRenderRequestMap ? (
                <UserRescueTrackingMap
                  victimCoordinate={victimCoordinate}
                  teamCoordinate={teamCoordinate}
                  routeCoordinates={routeCoordinates}
                  mapStyle={rescueTeamService.getMapStyleUrl() ?? ''}
                />
              ) : (
                <View className="h-full items-center justify-center">
                  <Ionicons name="map" size={40} color={colors.textSecondary} />
                </View>
              )}
            </View>
            <View className="p-4">
              <View className="mb-2 flex-row items-center gap-2">
                <View
                  className="rounded-full px-2 py-0.5"
                  style={{
                    backgroundColor: getStatusUi(
                      activeRequest.rescueRequestStatus,
                    ).bgColor,
                  }}
                >
                  <Text
                    className="text-xs font-bold"
                    style={{
                      color: getStatusUi(activeRequest.rescueRequestStatus)
                        .textColor,
                    }}
                  >
                    {getStatusUi(activeRequest.rescueRequestStatus).label}
                  </Text>
                </View>
                <View
                  className="rounded-full px-2 py-0.5"
                  style={{ backgroundColor: `${colors.status.pending}22` }}
                >
                  <Text
                    className="text-xs font-bold"
                    style={{ color: colors.status.pending }}
                  >
                    {getTypeLabel(activeRequest.rescueRequestType)}
                  </Text>
                </View>
              </View>
              <Text
                className="text-lg font-bold"
                style={{ color: colors.text }}
              >
                Yêu cầu cứu hộ {formatRequestId(activeRequest.requestId)}
              </Text>
              <Text
                className="mt-1 text-sm"
                style={{ color: colors.textSecondary }}
                numberOfLines={2}
              >
                {activeRequest.description || activeRequest.address}
              </Text>
              {(activeRequest.assignedRescueTeam?.operationStatus ===
                'EnRoute' ||
                activeRequest.rescueRequestStatus === 'InProgress') &&
              activeRequest.assignedRescueTeam ? (
                <View
                  className="mt-3 flex-row items-center gap-2 rounded-lg p-2"
                  style={{
                    backgroundColor: `${colors.status.incoming}18`,
                  }}
                >
                  <Ionicons
                    name="car"
                    size={18}
                    color={colors.status.incoming}
                  />
                  <Text
                    className="text-sm font-medium"
                    style={{ color: colors.status.incoming }}
                  >
                    {activeRequest.assignedRescueTeam.teamName} đang đến -{' '}
                    {activeRequest.assignedRescueTeam
                      .estimatedMinutesToArrival ?? '--'}{' '}
                    phút
                  </Text>
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
        ) : (
          <View
            className="rounded-xl p-4 shadow-sm"
            style={{ backgroundColor: colors.card }}
          >
            <Text style={{ color: colors.textSecondary }}>
              Bạn hiện chưa có yêu cầu cứu hộ nào đang xử lý.
            </Text>
          </View>
        )}
      </View>

      {historyRequests.length > 0 ? (
        <View className="mt-6 px-4">
          <Text
            className="mb-3 text-lg font-bold"
            style={{ color: colors.text }}
          >
            Lịch sử yêu cầu
          </Text>
          <View className="gap-3">
            {historyRequests.map((item) => (
              <RequestHistoryItem
                key={item.requestId}
                id={formatRequestId(item.requestId)}
                status={getStatusUi(item.rescueRequestStatus).label}
                statusColor={
                  item.rescueRequestStatus === 'Completed'
                    ? 'green'
                    : item.rescueRequestStatus === 'Cancelled'
                      ? 'red'
                      : 'gray'
                }
                type={getTypeLabel(item.rescueRequestType)}
                date={new Date(item.createdAt).toLocaleDateString('vi-VN')}
                onPress={() => openRequestDetail(item.requestId)}
              />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function QuickActionCard({
  icon,
  label,
  description,
  variant,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  variant: 'request' | 'tracking' | 'donate';
  onPress: () => void;
}) {
  const { colors } = useTheme();

  const toneColor =
    variant === 'request'
      ? colors.status.error
      : variant === 'tracking'
        ? colors.status.incoming
        : colors.status.completed;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="flex-1 items-center rounded-2xl border p-3"
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2,
      }}
    >
      <View
        className="h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: `${toneColor}1A` }}
      >
        <Ionicons name={icon} size={22} color={toneColor} />
      </View>

      <View className="mt-3 items-center">
        <Text
          className="text-base font-extrabold"
          style={{ color: colors.text }}
        >
          {label}
        </Text>
        <Text
          className="mt-0.5 text-center text-xs"
          style={{ color: colors.textSecondary }}
        >
          {description}
        </Text>
      </View>

      <View className="mt-2 flex-row justify-end">
        <Ionicons
          name="arrow-forward-circle"
          size={18}
          color={toneColor}
        ></Ionicons>
      </View>
    </TouchableOpacity>
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
  statusColor: 'green' | 'red' | 'gray';
  type: string;
  date: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const badgeBg =
    statusColor === 'green'
      ? `${colors.status.completed}22`
      : statusColor === 'red'
        ? `${colors.status.error}22`
        : colors.surface;
  const badgeText =
    statusColor === 'green'
      ? colors.status.completed
      : statusColor === 'red'
        ? colors.status.error
        : colors.textSecondary;

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
            style={{ backgroundColor: badgeBg }}
          >
            <Text className="text-xs font-bold" style={{ color: badgeText }}>
              {status}
            </Text>
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
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}
