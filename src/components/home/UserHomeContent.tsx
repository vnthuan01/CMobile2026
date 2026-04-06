import '@/global.css';
import { useTheme } from '@/src/context/ThemeContext';
import { rescueTeamService } from '@/src/services/rescueTeamService';
import { useMyRescueRequests } from '@/src/hooks/useMyRescueRequests';
import { useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import UserRescueTrackingMap from '../user/UserRescueTrackingMap';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const supportsNativeMap = Constants.appOwnership !== 'expo';

export default function UserHomeContent() {
  const { bottom } = useSafeAreaInsets();
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const queryClient = useQueryClient();
  const { data: requests = [], isLoading: loadingRequests } = useMyRescueRequests({ pageSize: 10 });

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

  const shouldShowTrackingMap =
    ((activeRequest?.assignedRescueTeam?.operationStatus === 'EnRoute' ||
      activeRequest?.rescueRequestStatus === 'InProgress') &&
      activeRequest?.assignedRescueTeam) ||
    null;

  const mapStyle = rescueTeamService.getMapStyleUrl();

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
  }, [
    activeRequest?.assignedRescueTeam,
    activeRequest?.assignedRescueTeam?.currentLatitude,
    activeRequest?.assignedRescueTeam?.currentLongitude,
  ]);

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

  const formatRequestId = (id: string) => `#${id.slice(0, 8)}`;
  const openRequestsScreen = () => router.push('/requests');

  return (
    <View style={{ paddingBottom: bottom + 20 }}>
      <View className="mt-6 px-4">
        <Text className="mb-3 text-lg font-bold" style={{ color: colors.text }}>
          Hành động nhanh
        </Text>
        <View className="flex-row gap-3">
          <QuickActionCard
            icon="add-circle"
            label="Gửi yêu cầu"
            color="primary"
            onPress={() => router.push('/create-request')}
          />
          <QuickActionCard
            icon="location"
            label="Theo dõi"
            color="green"
            onPress={openRequestsScreen}
          />
          <QuickActionCard
            icon="heart"
            label="Ủng hộ"
            color="orange"
            onPress={() => router.push('/donate')}
          />
        </View>
      </View>
r
      <View className="mt-6 px-4">
        <Text className="mb-3 text-lg font-bold" style={{ color: colors.text }}>
          Yêu cầu đang xử lý
        </Text>

        {loadingRequests ? (
          <View className="items-center justify-center rounded-xl bg-white py-10 shadow-sm">
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
            onPress={openRequestsScreen}
            className="overflow-hidden rounded-xl shadow-sm"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderWidth: 1,
            }}
          >
            <View
              className="h-32 overflow-hidden"
              style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6' }}
            >
              {shouldShowTrackingMap &&
              mapStyle &&
              supportsNativeMap ? (
                <UserRescueTrackingMap
                  victimCoordinate={null}
                  teamCoordinate={teamCoordinate}
                  routeCoordinates={routeCoordinates}
                  mapStyle={mapStyle}
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
                  className={`rounded-full px-2 py-0.5 ${getStatusUi(activeRequest.rescueRequestStatus).bg}`}
                >
                  <Text
                    className={`text-xs font-bold ${getStatusUi(activeRequest.rescueRequestStatus).text}`}
                  >
                    {getStatusUi(activeRequest.rescueRequestStatus).label}
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
                    backgroundColor: isDark
                      ? 'rgba(59, 130, 246, 0.15)'
                      : '#eff6ff',
                  }}
                >
                  <Ionicons name="car" size={18} color={colors.primary} />
                  <Text
                    className="text-sm font-medium"
                    style={{ color: isDark ? '#93c5fd' : colors.primary }}
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
          <View className="rounded-xl bg-white p-4 shadow-sm">
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
                onPress={openRequestsScreen}
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
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: 'primary' | 'green' | 'orange';
  onPress: () => void;
}) {
  const bgColor =
    color === 'primary'
      ? 'bg-primary'
      : color === 'green'
        ? 'bg-green-600'
        : 'bg-orange-500';

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const jumpAnim = useRef(new Animated.Value(0)).current;
  const outlineAnim = useRef(new Animated.Value(0)).current;
  const outlineScale = outlineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.8],
  });

  const outlineOpacity = outlineAnim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.5, 0.3, 0],
  });

  useEffect(() => {
    if (icon === 'add-circle') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(outlineAnim, {
            toValue: 1,
            duration: 1600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(outlineAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else if (icon === 'location') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(jumpAnim, {
            toValue: -4,
            duration: 600,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(jumpAnim, {
            toValue: 0,
            duration: 600,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [icon, jumpAnim, outlineAnim, pulseAnim]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`flex-1 items-center justify-center gap-2 rounded-xl ${bgColor} p-6 shadow-lg shadow-black/10`}
    >
      <View className="relative items-center justify-center">
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            width: 56,
            height: 56,
            borderRadius: 28,
            borderWidth: 2,
            borderColor: 'rgba(255,255,255,0.9)',
            opacity: outlineOpacity,
            transform: [{ scale: outlineScale }],
          }}
        />

        <Animated.View
          style={
            icon === 'location'
              ? { transform: [{ translateY: jumpAnim }] }
              : { transform: [{ scale: pulseAnim }] }
          }
        >
          <Ionicons name={icon} size={32} color="#fff" />
        </Animated.View>
      </View>
      <Text className="text-center font-bold text-white">{label}</Text>
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
      className="flex-row items-center justify-between rounded-xl bg-white p-4 shadow-sm"
    >
      <View className="flex-1">
        <View className="mb-1 flex-row items-center gap-2">
          <View className={`rounded-full ${bgColor} px-2 py-0.5`}>
            <Text className={`text-xs font-bold ${textColor}`}>{status}</Text>
          </View>
        </View>
        <Text className="font-bold">{id}</Text>
        <Text className="mt-0.5 text-sm text-text-secondary">
          {type} • {date}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#6b7280" />
    </TouchableOpacity>
  );
}
