import '@/global.css';
import Header from '@/src/components/header/header';
import { useTheme } from '@/src/context/ThemeContext';
import {
  fetchRescueRequestDetail,
  fetchRescueTeamLocation,
  RescueRequestDetailResponse,
  TeamLocationResponse,
} from '@/src/services/rescueService';
import { rescueTeamService } from '@/src/services/rescueTeamService';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import UserRescueTrackingMap from './UserRescueTrackingMap';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ViewRequestRescueScreenProps {
  requestId: string;
  onBack?: () => void;
}

const supportsNativeMap = Constants.appOwnership !== 'expo';

export default function ViewRequestRescueScreen({
  requestId,
  onBack,
}: ViewRequestRescueScreenProps) {
  const { bottom } = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [detail, setDetail] = useState<RescueRequestDetailResponse | null>(
    null,
  );
  const [teamLocation, setTeamLocation] = useState<TeamLocationResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const load = async () => {
      try {
        const detailData = await fetchRescueRequestDetail(requestId);
        setDetail(detailData);

        if (
          ['Assigned', 'InProgress'].includes(detailData.rescueRequestStatus) &&
          detailData.assignedRescueTeam
        ) {
          const locationData = await fetchRescueTeamLocation(requestId);
          setTeamLocation(locationData);
        }
      } finally {
        setLoading(false);
      }
    };

    load();

    intervalId = setInterval(async () => {
      try {
        const locationData = await fetchRescueTeamLocation(requestId);
        setTeamLocation(locationData);
      } catch {
        // ignore polling errors for now
      }
    }, 15000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [requestId]);

  const headline = useMemo(() => {
    switch (detail?.rescueRequestStatus) {
      case 'Pending':
        return 'Yêu cầu của bạn đang chờ xác minh.';
      case 'Verified':
        return 'Yêu cầu đã được xác minh, đang chờ điều phối team.';
      case 'Assigned':
        return 'Đã điều phối đội cứu hộ, đang chờ đội xuất phát.';
      case 'InProgress':
        return 'Đội cứu hộ đang tiếp cận hoặc xử lý tại hiện trường.';
      case 'Completed':
        return 'Yêu cầu cứu hộ đã hoàn thành.';
      case 'Cancelled':
        return 'Yêu cầu đã bị hủy.';
      default:
        return 'Đang theo dõi yêu cầu cứu hộ của bạn.';
    }
  }, [detail?.rescueRequestStatus]);

  const activeTeam = teamLocation || detail?.assignedRescueTeam || null;
  const latestVerification = detail?.verifications?.[0];
  const operationStatus = activeTeam?.operationStatus || null;
  const shouldShowTeamTracking =
    operationStatus === 'EnRoute' ||
    detail?.rescueRequestStatus === 'InProgress';

  const mapStyle = rescueTeamService.getMapStyleUrl();

  const victimCoordinate = useMemo(() => {
    if (detail?.longitude == null || detail?.latitude == null) return null;
    return [detail.longitude, detail.latitude] as [number, number];
  }, [detail?.latitude, detail?.longitude]);

  const teamCoordinate = useMemo(() => {
    if (
      activeTeam?.currentLongitude == null ||
      activeTeam?.currentLatitude == null
    )
      return null;
    return [activeTeam.currentLongitude, activeTeam.currentLatitude] as [
      number,
      number,
    ];
  }, [activeTeam?.currentLatitude, activeTeam?.currentLongitude]);

  const routeCoordinates = useMemo(() => {
    const polyline = activeTeam?.routePolyline;
    if (!polyline) return [];
    return rescueTeamService.decodePolyline(polyline);
  }, [activeTeam?.routePolyline]);

  const statusBadge = (status?: string) => {
    switch (status) {
      case 'Pending':
        return { bg: `${colors.status.pending}22`, text: colors.status.pending, label: 'Chờ xác minh' };
      case 'Verified':
        return { bg: `${colors.status.incoming}22`, text: colors.status.incoming, label: 'Đã xác minh' };
      case 'Assigned':
        return { bg: `${colors.status.inProgress}22`, text: colors.status.inProgress, label: 'Đã điều phối đội' };
      case 'InProgress':
        return {
          bg: `${colors.status.completed}22`,
          text: colors.status.completed,
          label: 'Đội đang tiếp cận / xử lý',
        };
      case 'Completed':
        return { bg: `${colors.status.completed}22`, text: colors.status.completed, label: 'Hoàn thành' };
      case 'Cancelled':
        return { bg: `${colors.status.cancelled}22`, text: colors.status.cancelled, label: 'Đã hủy' };
      default:
        return { bg: `${colors.border}`, text: colors.textSecondary, label: status || 'Khác' };
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
        <Text className="mt-3 text-sm" style={{ color: colors.textSecondary }}>
          Đang tải chi tiết yêu cầu...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Header title="Theo dõi yêu cầu" onBack={onBack} center />

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottom + 120 }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="relative h-64 w-full overflow-hidden">
          {mapStyle && supportsNativeMap ? (
            <UserRescueTrackingMap
              victimCoordinate={victimCoordinate}
              teamCoordinate={teamCoordinate}
              routeCoordinates={routeCoordinates}
              mapStyle={mapStyle}
            />
          ) : (
            <View className="h-full w-full items-center justify-center" style={{ backgroundColor: colors.surface }}>
              <Ionicons name="map" size={60} color={colors.textSecondary} />
            </View>
          )}

          {activeTeam && shouldShowTeamTracking ? (
            <View
              className="absolute bottom-4 left-4 flex-row items-center gap-2 rounded-full border px-4 py-2 shadow-lg"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
            >
              <Ionicons name="time" size={20} color={colors.primary} />
              <View>
                <Text
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: colors.textSecondary }}
                >
                  Dự kiến đến
                </Text>
                <Text
                  className="text-sm font-bold"
                  style={{ color: colors.text }}
                >
                  {activeTeam.estimatedMinutesToArrival ?? '--'} phút
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        <View className="px-4 pb-2 pt-4">
          <View className="flex-row items-center gap-2">
            <View
              className="rounded-full px-3 py-1"
              style={{
                backgroundColor: statusBadge(detail?.rescueRequestStatus).bg,
              }}
            >
              <Text
                className="text-xs font-bold"
                style={{ color: statusBadge(detail?.rescueRequestStatus).text }}
              >
                {statusBadge(detail?.rescueRequestStatus).label}
              </Text>
            </View>
          </View>

          <Text
            className="mt-3 text-[26px] font-bold leading-tight"
            style={{ color: colors.text }}
          >
            {headline}
          </Text>
          <Text
            className="mt-1 text-sm"
            style={{ color: colors.textSecondary }}
          >
            {detail?.address}
          </Text>
        </View>

        <View className="p-4">
          <View
            className="rounded-2xl border p-4"
            style={{ borderColor: colors.border, backgroundColor: colors.card }}
          >
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              Thông tin đơn
            </Text>
            <Text
              className="mt-3 text-sm"
              style={{ color: colors.textSecondary }}
            >
              Mô tả: {detail?.description || 'Không có mô tả'}
            </Text>
            <Text
              className="mt-2 text-sm"
              style={{ color: colors.textSecondary }}
            >
              Thời gian gửi:{' '}
              {detail?.createdAt
                ? new Date(detail.createdAt).toLocaleString('vi-VN')
                : '---'}
            </Text>
            <Text
              className="mt-2 text-sm"
              style={{ color: colors.textSecondary }}
            >
              Cập nhật gần nhất:{' '}
              {detail?.updatedAt
                ? new Date(detail.updatedAt).toLocaleString('vi-VN')
                : '---'}
            </Text>
          </View>
        </View>

        {latestVerification ? (
          <View className="px-4">
            <View
              className="rounded-2xl border p-4"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.card,
              }}
            >
              <Text
                className="text-lg font-bold"
                style={{ color: colors.text }}
              >
                Kết quả xác minh
              </Text>
              <Text
                className="mt-3 text-sm"
                style={{ color: colors.textSecondary }}
              >
                Trạng thái:{' '}
                {latestVerification.status ? 'Đã xác minh' : 'Chưa xác minh'}
              </Text>
              {latestVerification.reason ? (
                <Text
                  className="mt-2 text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Lý do: {latestVerification.reason}
                </Text>
              ) : null}
              {latestVerification.note ? (
                <Text
                  className="mt-2 text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Ghi chú: {latestVerification.note}
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}

        {activeTeam && shouldShowTeamTracking ? (
          <View className="p-4">
            <View
              className="rounded-2xl border p-4"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.card,
              }}
            >
              <Text
                className="text-lg font-bold"
                style={{ color: colors.text }}
              >
                Team cứu hộ
              </Text>
              <Text
                className="mt-3 text-base font-semibold"
                style={{ color: colors.text }}
              >
                {activeTeam.teamName}
              </Text>
              <Text
                className="mt-2 text-sm"
                style={{ color: colors.textSecondary }}
              >
                ETA: {activeTeam.estimatedMinutesToArrival ?? '--'} phút
              </Text>
              <Text
                className="mt-2 text-sm"
                style={{ color: colors.textSecondary }}
              >
                Khoảng cách còn lại: {activeTeam.distanceKmToVictim ?? '--'} km
              </Text>
              <Text
                className="mt-2 text-sm"
                style={{ color: colors.textSecondary }}
              >
                Tracking gần nhất:{' '}
                {activeTeam.lastTrackedAt
                  ? new Date(activeTeam.lastTrackedAt).toLocaleString('vi-VN')
                  : '---'}
              </Text>
            </View>
          </View>
        ) : null}

        <View className="px-4 pb-6">
          <TouchableOpacity
            className="h-12 w-full flex-row items-center justify-center gap-2 rounded-xl border"
            style={{ backgroundColor: colors.card, borderColor: colors.status.error }}
          >
            <Ionicons name="close-circle-outline" size={20} color={colors.status.error} />
            <Text className="text-sm font-bold" style={{ color: colors.status.error }}>
              Hủy yêu cầu cứu hộ
            </Text>
          </TouchableOpacity>
          <Text className="mt-2 text-center text-xs" style={{ color: colors.icon }}>
            Chỉ hủy nếu bạn đã an toàn hoặc không cần hỗ trợ nữa.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
