import '@/global.css';
import { useTheme } from '@/src/context/ThemeContext';
import { useMyRescueRequests } from '@/src/hooks/useMyRescueRequests';
import { useRescueRequestDetail } from '@/src/hooks/useRescueRequestDetail';
import { rescueTeamService } from '@/src/services/rescueTeamService';
import type { MyRescueRequestItem } from '@/src/types/rescue';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect, useRouter } from 'expo-router';
import { type ReactNode, useCallback, useMemo } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import {
  DonateQuickActionIcon,
  TrackingQuickActionIcon,
  VolunteerQuickActionIcon,
} from '../icons';
import UserRescueTrackingMap from '../user/UserRescueTrackingMap';

export default function UserHomeContent() {
  const router = useRouter();
  const { colors } = useTheme();

  const queryClient = useQueryClient();
  const {
    data: requests = [] as MyRescueRequestItem[],
    isLoading: loadingRequests,
  } = useMyRescueRequests({ pageSize: 10 });

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['rescueRequests'] });
    }, [queryClient]),
  );

  const activeRequest = useMemo(
    () =>
      requests.find((r: MyRescueRequestItem) =>
        ['Pending', 'Verified', 'Assigned', 'InProgress'].includes(
          r.rescueRequestStatus,
        ),
      ) || null,
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
    <View style={{ paddingBottom: 20 }}>
      <View className="mt-6 px-4">
        <Text className="mb-3 text-lg font-bold" style={{ color: colors.text }}>
          Hành động nhanh
        </Text>
        <View className="flex-row gap-3">
          <QuickActionCard
            icon={<VolunteerQuickActionIcon size={68} />}
            label="Tình nguyện"
            description="Tạo hồ sơ TNV"
            variant="request"
            onPress={() => router.push('/profile/my-volunteer-profile' as any)}
          />
          <QuickActionCard
            icon={<TrackingQuickActionIcon size={68} />}
            label="Theo dõi"
            description="Yêu cầu của tôi"
            variant="tracking"
            onPress={openRequestsScreen}
          />
          <QuickActionCard
            icon={<DonateQuickActionIcon size={68} />}
            label="Ủng hộ"
            description="Góp quỹ cứu trợ"
            variant="donate"
            onPress={() => router.push('/fundraising')}
          />
        </View>
      </View>
      <View className="mt-6 px-4">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-lg font-bold" style={{ color: colors.text }}>
            Yêu cầu gần đây
          </Text>
          <TouchableOpacity onPress={openRequestsScreen} activeOpacity={0.8}>
            <Text
              className="text-sm font-semibold"
              style={{ color: colors.primary }}
            >
              Xem thêm
            </Text>
          </TouchableOpacity>
        </View>

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
  icon: ReactNode;
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
      className="relative h-32 flex-1 rounded-2xl px-3 pb-3 pt-3"
      style={{
        backgroundColor: 'bg-transparent',
        // borderColor: colors.border,
        // shadowColor: colors.black,
        // shadowOffset: { width: 0, height: 6 },
        // shadowOpacity: 0.06,
        // shadowRadius: 10,
        // elevation: 2,
      }}
    >
      <View className=" items-center justify-center overflow-hidden rounded-[22px]">
        <View className="items-center justify-center bg-transparent">
          {icon}
        </View>
      </View>

      <View
        className="mt-1 min-h-[56px] items-center justify-start px-1 py-1"
        style={{ backgroundColor: 'transparent' }}
      >
        <Text
          className="text-center text-[15px] font-extrabold leading-5"
          style={{ color: colors.text }}
          numberOfLines={1}
        >
          {label}
        </Text>
        <Text
          className="text-center text-xs leading-4"
          style={{ color: colors.textSecondary }}
          numberOfLines={2}
        >
          {description}
        </Text>
      </View>

      <View className="absolute right-4 top-2 justify-end">
        <Ionicons
          name="arrow-forward-circle"
          size={18}
          color={toneColor}
        ></Ionicons>
      </View>
    </TouchableOpacity>
  );
}
