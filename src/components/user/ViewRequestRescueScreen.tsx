import '@/global.css';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import { useTheme } from '@/src/context/ThemeContext';
import { useCancelRescueRequest } from '@/src/hooks/useCancelRescueRequest';
import { useRequestTrackingDetail } from '@/src/hooks/useRequestTracking';
import { rescueTeamService } from '@/src/services/rescueTeamService';
import { showWarningToast } from '@/src/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import UserRescueTrackingMap from './UserRescueTrackingMap';

const WEATHER_FIELD_LABELS: Record<string, string> = {
  weather: 'Thời tiết',
  weathercondition: 'Tình trạng thời tiết',
  condition: 'Tình trạng',
  description: 'Mô tả thời tiết',
  summary: 'Tổng quan',
  forecast: 'Dự báo',
  temperature: 'Nhiệt độ',
  temperaturec: 'Nhiệt độ',
  temp: 'Nhiệt độ',
  feelslike: 'Cảm giác như',
  feelslikec: 'Cảm giác như',
  humidity: 'Độ ẩm',
  wind: 'Gió',
  windspeed: 'Tốc độ gió',
  windspeedkmh: 'Tốc độ gió',
  windgust: 'Gió giật',
  winddirection: 'Hướng gió',
  visibility: 'Tầm nhìn',
  pressure: 'Áp suất',
  cloud: 'Mây che phủ',
  cloudcover: 'Mây che phủ',
  rainfall: 'Lượng mưa',
  rain: 'Mưa',
  precipitation: 'Lượng mưa',
  precipprobability: 'Xác suất mưa',
  uv: 'Chỉ số UV',
  uvindex: 'Chỉ số UV',
  sunrise: 'Mặt trời mọc',
  sunset: 'Mặt trời lặn',
  alert: 'Cảnh báo',
  warning: 'Cảnh báo',
  note: 'Ghi chú',
  location: 'Khu vực',
  updatedat: 'Thời điểm cập nhật',
  observationtime: 'Thời điểm quan trắc',
};

const WEATHER_VALUE_MAP: Record<string, string> = {
  clear: 'Trời quang',
  sunny: 'Nắng ráo',
  partlycloudy: 'Có mây rải rác',
  cloudy: 'Nhiều mây',
  overcast: 'Âm u nhiều mây',
  mist: 'Sương mù nhẹ',
  fog: 'Sương mù',
  haze: 'Mù khô',
  smoke: 'Khói bụi',
  drizzle: 'Mưa phùn',
  rain: 'Mưa',
  lightrain: 'Mưa nhẹ',
  moderaterain: 'Mưa vừa',
  heavyrain: 'Mưa lớn',
  shower: 'Mưa rào',
  storm: 'Dông bão',
  thunderstorm: 'Giông sét',
  squall: 'Mưa giông mạnh',
  wind: 'Có gió',
  windy: 'Gió mạnh',
  humid: 'Độ ẩm cao',
  cold: 'Trời lạnh',
  hot: 'Trời nóng',
  dangerous: 'Nguy hiểm',
  moderate: 'Mức trung bình',
  high: 'Mức cao',
  low: 'Mức thấp',
  north: 'Bắc',
  south: 'Nam',
  east: 'Đông',
  west: 'Tây',
  northeast: 'Đông Bắc',
  northwest: 'Tây Bắc',
  southeast: 'Đông Nam',
  southwest: 'Tây Nam',
};

const WEATHER_UNIT_MAP: Array<[RegExp, string]> = [
  [/\bkm\/h\b/gi, 'km/giờ'],
  [/\bm\/s\b/gi, 'm/giây'],
  [/\bmm\b/gi, 'mm'],
  [/\bmb\b/gi, 'mb'],
  [/\bhpa\b/gi, 'hPa'],
  [/\bmi\b/gi, 'dặm'],
  [/\bkm\b/gi, 'km'],
  [/\b%\b/g, '%'],
];

interface ViewRequestRescueScreenProps {
  requestId: string;
  onBack?: () => void;
}

export default function ViewRequestRescueScreen({
  requestId,
  onBack,
}: ViewRequestRescueScreenProps) {
  const { bottom } = useSafeAreaInsets();
  const { colors } = useTheme();
  const trackingQuery = useRequestTrackingDetail(requestId);
  const cancelMutation = useCancelRescueRequest();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelReasonError, setCancelReasonError] = useState('');
  const [fallbackRouteCoordinates, setFallbackRouteCoordinates] = useState<
    [number, number][]
  >([]);
  const [loadingDirections, setLoadingDirections] = useState(false);
  const [fallbackDistanceKm, setFallbackDistanceKm] = useState<number | null>(
    null,
  );
  const [fallbackEtaMinutes, setFallbackEtaMinutes] = useState<number | null>(
    null,
  );
  const [showFullscreenMap, setShowFullscreenMap] = useState(false);

  const detail = trackingQuery.data?.detail ?? null;
  const teamLocation = trackingQuery.data?.teamLocation ?? null;
  const loading = trackingQuery.isLoading;

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
  const canCancelRequest =
    detail?.rescueRequestStatus === 'Pending' && !detail?.assignedRescueTeam;

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
    if (!polyline) return fallbackRouteCoordinates;
    return rescueTeamService.decodePolyline(polyline);
  }, [activeTeam?.routePolyline, fallbackRouteCoordinates]);

  useEffect(() => {
    let isMounted = true;

    const loadDirections = async () => {
      if (activeTeam?.routePolyline) {
        setFallbackRouteCoordinates([]);
        setFallbackDistanceKm(null);
        setFallbackEtaMinutes(null);
        return;
      }

      if (!teamCoordinate || !victimCoordinate || !shouldShowTeamTracking) {
        setFallbackRouteCoordinates([]);
        setFallbackDistanceKm(null);
        setFallbackEtaMinutes(null);
        return;
      }

      try {
        setLoadingDirections(true);
        const route = await rescueTeamService.fetchDirectionsPolyline(
          {
            latitude: teamCoordinate[1],
            longitude: teamCoordinate[0],
          },
          {
            latitude: victimCoordinate[1],
            longitude: victimCoordinate[0],
          },
        );

        if (!isMounted) return;

        if (route.success && route.polyline) {
          setFallbackRouteCoordinates(
            rescueTeamService.decodePolyline(route.polyline),
          );
          setFallbackDistanceKm(
            route.distanceMeters != null ? route.distanceMeters / 1000 : null,
          );
          setFallbackEtaMinutes(
            route.durationSeconds != null ? route.durationSeconds / 60 : null,
          );
        } else {
          setFallbackRouteCoordinates([]);
          setFallbackDistanceKm(null);
          setFallbackEtaMinutes(null);
        }
      } catch {
        if (isMounted) {
          setFallbackRouteCoordinates([]);
          setFallbackDistanceKm(null);
          setFallbackEtaMinutes(null);
        }
      } finally {
        if (isMounted) {
          setLoadingDirections(false);
        }
      }
    };

    loadDirections();

    return () => {
      isMounted = false;
    };
  }, [
    activeTeam?.routePolyline,
    shouldShowTeamTracking,
    teamCoordinate,
    victimCoordinate,
  ]);

  const canRenderMap = !!(victimCoordinate || teamCoordinate);
  const distanceToVictimKm =
    activeTeam?.distanceKmToVictim ?? fallbackDistanceKm ?? null;
  const etaToVictimMinutes =
    activeTeam?.estimatedMinutesToArrival ?? fallbackEtaMinutes ?? null;
  const formatDateTime = (value?: string | null) => {
    if (!value) return '---';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString('vi-VN');
  };

  const formatDistanceKm = (value?: number | null) => {
    if (value == null || Number.isNaN(value)) return '--';
    return value >= 10 ? value.toFixed(0) : value.toFixed(1);
  };

  const formatMinutes = (value?: number | null) => {
    if (value == null || Number.isNaN(value)) return '--';
    return String(Math.round(value));
  };

  const statusBadge = (status?: string) => {
    switch (status) {
      case 'Pending':
        return {
          bg: `${colors.status.pending}22`,
          text: colors.status.pending,
          label: 'Chờ xác minh',
        };
      case 'Verified':
        return {
          bg: `${colors.status.incoming}22`,
          text: colors.status.incoming,
          label: 'Đã xác minh',
        };
      case 'Assigned':
        return {
          bg: `${colors.status.inProgress}22`,
          text: colors.status.inProgress,
          label: 'Đã điều phối đội',
        };
      case 'InProgress':
        return {
          bg: `${colors.status.completed}22`,
          text: colors.status.completed,
          label: 'Đội đang tiếp cận / xử lý',
        };
      case 'Completed':
        return {
          bg: `${colors.status.completed}22`,
          text: colors.status.completed,
          label: 'Hoàn thành',
        };
      case 'Cancelled':
        return {
          bg: `${colors.status.cancelled}22`,
          text: colors.status.cancelled,
          label: 'Đã hủy',
        };
      default:
        return {
          bg: `${colors.border}`,
          text: colors.textSecondary,
          label: status || 'Khác',
        };
    }
  };

  const openCancelModal = () => {
    if (!canCancelRequest) {
      showWarningToast(
        'Không thể hủy yêu cầu',
        'Chỉ có thể hủy khi đơn đang chờ xác minh và chưa được gán đội.',
      );
      return;
    }

    setCancelReason('');
    setCancelReasonError('');
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    if (cancelMutation.isPending) return;
    setShowCancelModal(false);
  };

  const submitCancelRequest = async () => {
    const normalizedReason = cancelReason.trim();

    if (!normalizedReason) {
      setCancelReasonError('Vui lòng nhập lý do hủy yêu cầu.');
      return;
    }

    setCancelReasonError('');

    const latestResult = await trackingQuery.refetch();
    const latestDetail = latestResult.data?.detail;
    const latestCanCancel =
      latestDetail?.rescueRequestStatus === 'Pending' &&
      !latestDetail?.assignedRescueTeam;

    if (!latestCanCancel) {
      showWarningToast(
        'Không thể hủy yêu cầu',
        'Đơn đã đổi trạng thái và không còn hợp lệ để hủy. Vui lòng tải lại màn hình.',
      );
      return;
    }

    if (__DEV__) {
      console.info('[CancelRequest] Submit from ViewRequestRescueScreen', {
        requestId,
        status: latestDetail?.rescueRequestStatus,
        hasAssignedTeam: !!latestDetail?.assignedRescueTeam,
        reason: normalizedReason,
      });
    }

    cancelMutation.mutate(
      {
        requestId,
        payload: { reason: normalizedReason },
      },
      {
        onSuccess: () => {
          setShowCancelModal(false);
          trackingQuery.refetch();
        },
      },
    );
  };

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator color={colors.primary} />
        <Text className="mt-3 text-sm" style={{ color: colors.textSecondary }}>
          Đang tải chi tiết yêu cầu...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenHeader title="Theo dõi yêu cầu" onBack={onBack} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottom + 120 }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => canRenderMap && setShowFullscreenMap(true)}
          className="relative h-64 w-full overflow-hidden"
          disabled={!canRenderMap}
        >
          {canRenderMap ? (
            <UserRescueTrackingMap
              victimCoordinate={victimCoordinate}
              teamCoordinate={teamCoordinate}
              routeCoordinates={routeCoordinates}
              mapStyle=""
            />
          ) : (
            <View
              className="h-full w-full items-center justify-center"
              style={{ backgroundColor: colors.surface }}
            >
              <Ionicons name="map" size={60} color={colors.status.error} />
            </View>
          )}
          {canRenderMap ? (
            <View className="absolute inset-x-0 bottom-0 px-4 pb-4">
              <View
                className="flex-row items-center justify-between rounded-2xl px-4 py-3"
                style={{ backgroundColor: 'rgba(17, 24, 39, 0.64)' }}
              >
                <View className="flex-1 pr-3">
                  <Text className="text-sm font-semibold text-white">
                    Chạm để mở bản đồ toàn màn hình
                  </Text>
                  <Text className="mt-0.5 text-xs text-white/80">
                    Xem rõ lộ trình đội cứu hộ đang đến vị trí của bạn
                  </Text>
                </View>
                <Ionicons name="expand-outline" size={20} color="#FFFFFF" />
              </View>
            </View>
          ) : null}
          {activeTeam && shouldShowTeamTracking ? (
            <View
              className="absolute left-4 top-4 flex-row items-center gap-2 rounded-full border px-4 py-2 shadow-lg"
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
                  {formatMinutes(etaToVictimMinutes)} phút
                </Text>
              </View>
            </View>
          ) : null}
        </TouchableOpacity>

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
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1">
                <Text
                  className="text-lg font-bold"
                  style={{ color: colors.text }}
                >
                  Thông tin yêu cầu
                </Text>
                <Text
                  className="mt-1 text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Tóm tắt nội dung và thời gian cập nhật của yêu cầu.
                </Text>
              </View>

              <View
                className="rounded-full px-3 py-1"
                style={{ backgroundColor: colors.surface }}
              >
                <Text
                  className="text-xs font-bold"
                  style={{ color: colors.textSecondary }}
                >
                  #{requestId.slice(0, 8)}
                </Text>
              </View>
            </View>

            <View
              className="mt-4 rounded-2xl p-3"
              style={{ backgroundColor: colors.surface }}
            >
              <Text
                className="text-xs font-semibold uppercase"
                style={{ color: colors.textSecondary }}
              >
                Địa điểm
              </Text>
              <Text
                className="mt-1 text-sm font-medium"
                style={{ color: colors.text }}
              >
                {detail?.address || 'Chưa có địa chỉ'}
              </Text>
            </View>

            <View className="mt-4 gap-3">
              <InfoRow
                icon="document-text-outline"
                label="Mô tả"
                value={detail?.description || 'Không có mô tả'}
                multiline
              />
              <InfoRow
                icon="time-outline"
                label="Thời gian gửi"
                value={formatDateTime(detail?.createdAt)}
              />
              <InfoRow
                icon="refresh-outline"
                label="Cập nhật gần nhất"
                value={formatDateTime(detail?.updatedAt)}
              />
            </View>
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
              <View className="mt-4 flex-row items-center gap-2">
                <View
                  className="rounded-full px-3 py-1"
                  style={{
                    backgroundColor: latestVerification.status
                      ? `${colors.status.completed}22`
                      : `${colors.status.pending}22`,
                  }}
                >
                  <Text
                    className="text-xs font-bold"
                    style={{
                      color: latestVerification.status
                        ? colors.status.completed
                        : colors.status.pending,
                    }}
                  >
                    {latestVerification.status
                      ? 'Đã xác minh'
                      : 'Chưa xác minh'}
                  </Text>
                </View>
              </View>
              {latestVerification.reason ? (
                <View
                  className="mt-4 rounded-2xl p-3"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Text
                    className="text-xs font-semibold uppercase"
                    style={{ color: colors.textSecondary }}
                  >
                    Lý do
                  </Text>
                  <Text className="mt-1 text-sm" style={{ color: colors.text }}>
                    {latestVerification.reason}
                  </Text>
                </View>
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
              <View
                className="mt-4 rounded-2xl p-3"
                style={{ backgroundColor: colors.surface }}
              >
                <Text
                  className="text-xs font-semibold uppercase"
                  style={{ color: colors.textSecondary }}
                >
                  Đội phụ trách
                </Text>
                <Text
                  className="mt-1 text-base font-semibold"
                  style={{ color: colors.text }}
                >
                  {activeTeam.teamName || 'Chưa có thông tin đội'}
                </Text>
              </View>

              <View className="mt-4 flex-row flex-wrap gap-3">
                <MetricCard
                  icon="time-outline"
                  label="ETA"
                  value={`${formatMinutes(etaToVictimMinutes)} phút`}
                />
                <MetricCard
                  icon="navigate-outline"
                  label="Khoảng cách"
                  value={`${formatDistanceKm(distanceToVictimKm)} km`}
                />
              </View>

              <View className="mt-3">
                <InfoRow
                  icon="map-outline"
                  label="Chỉ dẫn đường"
                  value={
                    loadingDirections
                      ? 'Đang tải lộ trình đội cứu hộ đến vị trí của bạn...'
                      : routeCoordinates.length >= 2
                        ? 'Bản đồ đang hiển thị tuyến đường đội cứu hộ di chuyển đến vị trí của bạn.'
                        : 'Chưa có dữ liệu chỉ dẫn đường từ đội cứu hộ đến vị trí của bạn.'
                  }
                  multiline
                />
              </View>

              <View className="mt-3">
                <InfoRow
                  icon="locate-outline"
                  label="Tracking gần nhất"
                  value={formatDateTime(activeTeam.lastTrackedAt)}
                />
              </View>
            </View>
          </View>
        ) : null}

        <View className="mt-4 px-4 pb-6">
          <TouchableOpacity
            onPress={openCancelModal}
            disabled={cancelMutation.isPending || !canCancelRequest}
            className="h-12 w-full flex-row items-center justify-center gap-2 rounded-xl border"
            style={{
              backgroundColor: colors.card,
              borderColor: canCancelRequest
                ? colors.status.error
                : colors.border,
              opacity: canCancelRequest ? 1 : 0.6,
            }}
          >
            <Ionicons
              name="close-circle-outline"
              size={20}
              color={
                canCancelRequest ? colors.status.error : colors.textSecondary
              }
            />
            <Text
              className="text-sm font-bold"
              style={{
                color: canCancelRequest
                  ? colors.status.error
                  : colors.textSecondary,
              }}
            >
              {cancelMutation.isPending
                ? 'Đang gửi yêu cầu hủy...'
                : 'Hủy yêu cầu cứu hộ'}
            </Text>
          </TouchableOpacity>
          <Text
            className="mt-2 text-center text-xs"
            style={{ color: colors.icon }}
          >
            {canCancelRequest
              ? 'Bạn có thể hủy khi đã an toàn hoặc không cần hỗ trợ nữa.'
              : 'Không thể hủy ở trạng thái hiện tại. Chỉ hủy khi đơn đang chờ xác minh và chưa được gán đội.'}
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={showFullscreenMap}
        animationType="slide"
        onRequestClose={() => setShowFullscreenMap(false)}
      >
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
          <ScreenHeader
            title="Bản đồ cứu hộ"
            onBack={() => setShowFullscreenMap(false)}
          />

          <View className="flex-1">
            {canRenderMap ? (
              <UserRescueTrackingMap
                victimCoordinate={victimCoordinate}
                teamCoordinate={teamCoordinate}
                routeCoordinates={routeCoordinates}
                mapStyle=""
              />
            ) : (
              <View
                className="flex-1 items-center justify-center"
                style={{ backgroundColor: colors.surface }}
              >
                <Ionicons name="map" size={60} color={colors.status.error} />
              </View>
            )}

            <View className="absolute left-4 right-4 top-4">
              <View
                className="rounded-2xl px-4 py-3"
                style={{ backgroundColor: 'rgba(17, 24, 39, 0.7)' }}
              >
                <Text className="text-sm font-semibold text-white">
                  Lộ trình đội cứu hộ đến vị trí của bạn
                </Text>
                <Text className="mt-1 text-xs text-white/80">
                  Khoảng cách {formatDistanceKm(distanceToVictimKm)} km • ETA{' '}
                  {formatMinutes(etaToVictimMinutes)} phút
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCancelModal}
        animationType="fade"
        transparent
        onRequestClose={closeCancelModal}
      >
        <View
          className="flex-1 justify-center px-5"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
        >
          <View
            className="rounded-2xl border p-4"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              Xác nhận hủy yêu cầu
            </Text>
            <Text
              className="mt-2 text-sm"
              style={{ color: colors.textSecondary }}
            >
              Vui lòng nhập lý do trước khi hủy yêu cầu cứu hộ.
            </Text>

            <TextInput
              value={cancelReason}
              onChangeText={(value) => {
                setCancelReason(value);
                if (cancelReasonError && value.trim()) {
                  setCancelReasonError('');
                }
              }}
              placeholder="Nhập lý do hủy yêu cầu"
              placeholderTextColor={colors.textSecondary}
              editable={!cancelMutation.isPending}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="mt-3 min-h-[96px] rounded-xl border px-3 py-2 text-sm"
              style={{
                borderColor: cancelReasonError
                  ? colors.status.error
                  : colors.border,
                color: colors.text,
                backgroundColor: colors.background,
              }}
            />

            {cancelReasonError ? (
              <Text
                className="mt-2 text-xs"
                style={{ color: colors.status.error }}
              >
                {cancelReasonError}
              </Text>
            ) : null}

            <View className="mt-4 flex-row gap-3">
              <TouchableOpacity
                onPress={closeCancelModal}
                disabled={cancelMutation.isPending}
                className="h-11 flex-1 items-center justify-center rounded-xl border"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: colors.textSecondary }}
                >
                  Không hủy
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={submitCancelRequest}
                disabled={cancelMutation.isPending}
                className="h-11 flex-1 items-center justify-center rounded-xl"
                style={{ backgroundColor: colors.status.error }}
              >
                <Text
                  className="text-sm font-bold"
                  style={{ color: colors.white }}
                >
                  {cancelMutation.isPending ? 'Đang xử lý...' : 'Đồng ý hủy'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function normalizeWeatherKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function translateWeatherLabel(rawKey: string) {
  const normalizedKey = normalizeWeatherKey(rawKey);
  return WEATHER_FIELD_LABELS[normalizedKey] || rawKey.trim();
}

function translateWeatherValue(rawValue: string) {
  let result = rawValue.trim();
  const normalized = normalizeWeatherKey(result);

  if (WEATHER_VALUE_MAP[normalized]) {
    return WEATHER_VALUE_MAP[normalized];
  }

  Object.entries(WEATHER_VALUE_MAP).forEach(([key, translated]) => {
    const matcher = new RegExp(`\\b${key}\\b`, 'gi');
    result = result.replace(matcher, translated);
  });

  WEATHER_UNIT_MAP.forEach(([pattern, replacement]) => {
    result = result.replace(pattern, replacement);
  });

  result = result
    .replace(/\bfeels like\b/gi, 'cảm giác như')
    .replace(/\btemperature\b/gi, 'nhiệt độ')
    .replace(/\bhumidity\b/gi, 'độ ẩm')
    .replace(/\bwind speed\b/gi, 'tốc độ gió')
    .replace(/\bwind direction\b/gi, 'hướng gió')
    .replace(/\bvisibility\b/gi, 'tầm nhìn')
    .replace(/\bpressure\b/gi, 'áp suất')
    .replace(/\bcloud cover\b/gi, 'mây che phủ')
    .replace(/\buv index\b/gi, 'chỉ số UV')
    .replace(/\brainfall\b/gi, 'lượng mưa')
    .replace(/\bupdated at\b/gi, 'thời điểm cập nhật')
    .replace(/\bobservation time\b/gi, 'thời điểm quan trắc');

  return result;
}

function formatWeatherNoteVi(note?: string | null) {
  if (!note?.trim()) return ['Không có ghi chú.'];

  const trimmed = note.trim();

  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const lines = Object.entries(parsed)
        .filter(([, value]) => value != null && String(value).trim() !== '')
        .map(([key, value]) => {
          const label = translateWeatherLabel(key);
          const translatedValue = translateWeatherValue(String(value));
          return `${label}: ${translatedValue}`;
        });

      if (lines.length > 0) {
        return lines;
      }
    }
  } catch {
    // ignore JSON parse failure and continue with text formatting
  }

  const rawLines = trimmed
    .split(/\r?\n+/)
    .flatMap((line) => line.split(/;+/))
    .map((line) => line.trim())
    .filter(Boolean);

  const formattedLines = rawLines.map((line) => {
    const matched = line.match(
      /^([A-Za-z][A-Za-z\s/_-]{1,40})\s*[:=-]\s*(.+)$/,
    );

    if (matched) {
      const [, key, value] = matched;
      return `${translateWeatherLabel(key)}: ${translateWeatherValue(value)}`;
    }

    return translateWeatherValue(line);
  });

  return formattedLines.length > 0
    ? formattedLines
    : [translateWeatherValue(trimmed)];
}

function InfoRow({
  icon,
  label,
  value,
  multiline = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  multiline?: boolean;
}) {
  const { colors } = useTheme();

  return (
    <View
      className="flex-row items-start gap-3 rounded-2xl p-3"
      style={{ backgroundColor: colors.surface }}
    >
      <View
        className="mt-0.5 h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: colors.card }}
      >
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View className="flex-1">
        <Text
          className="text-xs font-semibold uppercase"
          style={{ color: colors.textSecondary }}
        >
          {label}
        </Text>
        <Text
          className="mt-1 text-sm"
          style={{ color: colors.text }}
          numberOfLines={multiline ? undefined : 2}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  const { colors } = useTheme();

  return (
    <View
      className="min-w-[140px] flex-1 rounded-2xl p-3"
      style={{ backgroundColor: colors.surface }}
    >
      <View className="flex-row items-center gap-2">
        <Ionicons name={icon} size={16} color={colors.primary} />
        <Text
          className="text-xs font-semibold uppercase"
          style={{ color: colors.textSecondary }}
        >
          {label}
        </Text>
      </View>
      <Text
        className="mt-2 text-sm font-semibold"
        style={{ color: colors.text }}
      >
        {value}
      </Text>
    </View>
  );
}
