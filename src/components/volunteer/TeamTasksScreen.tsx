import '@/global.css';
import AppBottomSheet from '@/src/components/common/AppBottomSheet';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import { useTheme } from '@/src/context/ThemeContext';
import {
  RescueActiveBatchResponse,
  RescueBatchItem,
  rescueTeamService,
} from '@/src/services/rescueTeamService';
import {
  teamService,
  TeamTrackingHeartbeatRequest,
} from '@/src/services/teamService';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TasksScreenType = 'list' | 'map';
type MissionFilter =
  | 'all'
  | 'emergency'
  | 'normal'
  | 'in-progress'
  | 'pending'
  | 'done';

interface TeamTasksScreenProps {
  onBack?: () => void;
}

const FILTER_OPTIONS: Array<{ label: string; value: MissionFilter }> = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Khẩn cấp', value: 'emergency' },
  { label: 'Bình thường', value: 'normal' },
  { label: 'Đang làm', value: 'in-progress' },
  { label: 'Chờ xử lý', value: 'pending' },
  { label: 'Đã xong', value: 'done' },
];

const supportsNativeMap = Constants.appOwnership !== 'expo';

let TeamTasksMapNative: any = null;

if (supportsNativeMap) {
  try {
    TeamTasksMapNative = require('./TeamTasksMapNative').default;
  } catch {
    TeamTasksMapNative = null;
  }
}

export default function TeamTasksScreen({ onBack }: TeamTasksScreenProps) {
  const { bottom } = useSafeAreaInsets();
  const { colors } = useTheme();

  const [screen, setScreen] = useState<TasksScreenType>('list');
  const [batch, setBatch] = useState<RescueActiveBatchResponse | null>(null);
  const [selectedMission, setSelectedMission] =
    useState<RescueBatchItem | null>(null);
  const [currentMission, setCurrentMission] = useState<RescueBatchItem | null>(
    null,
  );
  const [filter, setFilter] = useState<MissionFilter>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>(
    [],
  );
  const [teamId, setTeamId] = useState<string | null>(null);
  const [teamName, setTeamName] = useState<string | null>(null);
  const [isSyncingEta, setIsSyncingEta] = useState(false);
  const [lastHeartbeatAt, setLastHeartbeatAt] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy?: number | null;
    speedKph?: number | null;
    headingDegree?: number | null;
  } | null>(null);
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const heartbeatInFlightRef = useRef(false);

  const loadData = useCallback(async (isRefresh?: boolean) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErrorMessage(null);

    try {
      const teamResult = await teamService.getMyTeam();
      const teamId = teamResult.data?.teamId;
      const teamName = teamResult.data?.name;

      if (!teamResult.success || !teamId) {
        setErrorMessage(
          teamResult.message || 'Không xác định được team hiện tại.',
        );
        setBatch(null);
        return;
      }

      const batchResult = await rescueTeamService.getActiveBatchByTeam(teamId);
      if (!batchResult.success || !batchResult.data) {
        setErrorMessage(
          batchResult.message || 'Không tải được dữ liệu nhiệm vụ.',
        );
        setBatch(null);
        return;
      }

      const nextBatch = batchResult.data;
      const nextCurrentMission = rescueTeamService.getCurrentMission(
        nextBatch.items,
      );

      setTeamId(teamId);
      setTeamName(teamName || null);
      setBatch(nextBatch);
      setCurrentMission(nextCurrentMission);
      setSelectedMission(
        (prev) => prev || nextCurrentMission || nextBatch.items[0] || null,
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const loadLocation = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== 'granted') return;
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speedKph:
            position.coords.speed != null && position.coords.speed >= 0
              ? position.coords.speed * 3.6
              : null,
          headingDegree:
            position.coords.heading != null && position.coords.heading >= 0
              ? position.coords.heading
              : null,
        });
      } catch {
        setUserLocation(null);
      }
    };

    loadLocation();
  }, []);

  useEffect(() => {
    const sendHeartbeat = async () => {
      if (!teamId || !userLocation || !batch?.rescueBatchId) return;
      if (heartbeatInFlightRef.current) return;

      heartbeatInFlightRef.current = true;
      setIsSyncingEta(true);
      try {
        const payload: TeamTrackingHeartbeatRequest = {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          accuracyMeters: userLocation.accuracy ?? null,
          speedKph: userLocation.speedKph ?? null,
          headingDegree: userLocation.headingDegree ?? null,
          source: 0,
          capturedAtUtc: new Date().toISOString(),
          rescueBatchId: batch.rescueBatchId,
          rescueOperationId: null,
          note: 'tracking from mobile',
        };

        const heartbeat = await teamService.sendTrackingHeartbeat(
          teamId,
          payload,
        );
        if (!heartbeat.success) return;

        setLastHeartbeatAt(new Date().toISOString());

        const refreshedBatch =
          await rescueTeamService.getActiveBatchByTeam(teamId);
        if (!refreshedBatch.success || !refreshedBatch.data) return;

        const nextBatch = refreshedBatch.data;
        const nextCurrentMission = rescueTeamService.getCurrentMission(
          nextBatch.items,
        );

        setBatch(nextBatch);
        setCurrentMission(nextCurrentMission);
        setSelectedMission((prev) => {
          if (!prev) return nextCurrentMission || nextBatch.items[0] || null;
          return (
            nextBatch.items.find(
              (item) => item.rescueBatchItemId === prev.rescueBatchItemId,
            ) ||
            nextCurrentMission ||
            nextBatch.items[0] ||
            null
          );
        });
      } finally {
        heartbeatInFlightRef.current = false;
        setIsSyncingEta(false);
      }
    };

    if (screen !== 'map' || !teamId || !userLocation || !batch?.rescueBatchId) {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      return;
    }

    sendHeartbeat();

    const speed = userLocation.speedKph ?? 0;
    const intervalMs = speed >= 5 ? 10000 : 20000;

    heartbeatIntervalRef.current = setInterval(() => {
      sendHeartbeat();
    }, intervalMs);

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    };
  }, [batch?.rescueBatchId, screen, teamId, userLocation]);

  useEffect(() => {
    const loadRoute = async () => {
      if (
        !selectedMission ||
        selectedMission.latitude == null ||
        selectedMission.longitude == null
      ) {
        setRouteCoordinates([]);
        return;
      }

      if (batch?.routePolyline) {
        setRouteCoordinates(
          rescueTeamService.decodePolyline(batch.routePolyline),
        );
        return;
      }

      if (!userLocation) {
        setRouteCoordinates([]);
        return;
      }

      const route = await rescueTeamService.fetchDirectionsPolyline(
        userLocation,
        {
          latitude: selectedMission.latitude,
          longitude: selectedMission.longitude,
        },
      );

      if (route.success && route.polyline) {
        setRouteCoordinates(rescueTeamService.decodePolyline(route.polyline));
      } else {
        setRouteCoordinates([]);
      }
    };

    loadRoute();
  }, [batch?.routePolyline, selectedMission, userLocation]);

  const filteredItems = useMemo(() => {
    if (!batch?.items) return [];
    return rescueTeamService.getFilteredItems(batch.items, filter);
  }, [batch?.items, filter]);

  const summary = useMemo(() => {
    const total = batch?.items?.length || 0;
    const emergencyCount =
      batch?.items?.filter((item) => item.rescueRequestType === 'Emergency')
        .length || 0;
    return { total, emergencyCount };
  }, [batch?.items]);

  const mapStyle = rescueTeamService.getGoongMapStyleUrl();

  const statusBadge = (status?: string) => {
    const normalized = String(status ?? '').toLowerCase();
    if (normalized === 'inprogress') {
      return { bg: '#DBEAFE', text: '#1D4ED8', label: 'Đang làm' };
    }
    if (normalized === 'pending') {
      return { bg: '#FEF3C7', text: '#92400E', label: 'Chờ xử lý' };
    }
    if (normalized === 'done') {
      return { bg: '#DCFCE7', text: '#166534', label: 'Đã xong' };
    }
    return { bg: '#E2E8F0', text: '#475569', label: status || 'Khác' };
  };

  const typeBadge = (type?: string) => {
    const normalized = String(type ?? '').toLowerCase();
    if (normalized === 'emergency') {
      return { bg: '#FEE2E2', text: '#B91C1C', label: 'Khẩn cấp' };
    }
    return { bg: '#DBEAFE', text: '#1D4ED8', label: 'Bình thường' };
  };

  const openMapScreen = (item?: RescueBatchItem | null) => {
    if (item) setSelectedMission(item);
    setScreen('map');
  };

  const heartbeatStatusLabel = useMemo(() => {
    if (isSyncingEta) return 'Dang cap nhat ETA...';
    if (!lastHeartbeatAt) return null;

    const date = new Date(lastHeartbeatAt);
    if (Number.isNaN(date.getTime())) return null;

    return `Da dong bo vi tri luc ${date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })}`;
  }, [isSyncingEta, lastHeartbeatAt]);

  const debugTrackingLines = useMemo(() => {
    return [
      `teamId: ${teamId || '---'}`,
      `batchId: ${batch?.rescueBatchId || '---'}`,
      `screen: ${screen}`,
      `heartbeat: ${isSyncingEta ? 'syncing' : 'idle'}`,
      `lastSync: ${lastHeartbeatAt || '---'}`,
      `lat: ${userLocation?.latitude ?? '---'}`,
      `lng: ${userLocation?.longitude ?? '---'}`,
      `accuracy: ${userLocation?.accuracy ?? '---'}`,
      `speedKph: ${userLocation?.speedKph ?? '---'}`,
      `heading: ${userLocation?.headingDegree ?? '---'}`,
      `currentMission: ${currentMission?.rescueBatchItemId || '---'}`,
      `selectedMission: ${selectedMission?.rescueBatchItemId || '---'}`,
      `eta: ${selectedMission?.estimatedMinutes ?? '---'} phút`,
      `distance: ${selectedMission?.distanceKm ?? '---'} km`,
    ];
  }, [
    batch?.rescueBatchId,
    currentMission?.rescueBatchItemId,
    isSyncingEta,
    lastHeartbeatAt,
    screen,
    selectedMission?.distanceKm,
    selectedMission?.estimatedMinutes,
    selectedMission?.rescueBatchItemId,
    teamId,
    userLocation?.accuracy,
    userLocation?.headingDegree,
    userLocation?.latitude,
    userLocation?.longitude,
    userLocation?.speedKph,
  ]);

  if (screen === 'map') {
    return (
      <View className="flex-1 bg-background-light">
        <ScreenHeader
          title="Dẫn đường"
          onBack={() => setScreen('list')}
          rightAction={
            selectedMission ? (
              <View className="items-end">
                {heartbeatStatusLabel ? (
                  <View
                    className="mb-1 rounded-full px-3 py-1"
                    style={{
                      backgroundColor: isSyncingEta ? '#DBEAFE' : '#DCFCE7',
                    }}
                  >
                    <Text
                      className="text-[10px] font-semibold"
                      style={{ color: isSyncingEta ? '#1D4ED8' : '#166534' }}
                    >
                      {heartbeatStatusLabel}
                    </Text>
                  </View>
                ) : null}
                <Text className="text-xs text-text-secondary">
                  {selectedMission.estimatedMinutes != null
                    ? `${selectedMission.estimatedMinutes} phút`
                    : '--'}
                </Text>
                <Text className="text-xs font-semibold text-text-primary">
                  {selectedMission.distanceKm != null
                    ? `${selectedMission.distanceKm} km`
                    : '--'}
                </Text>
              </View>
            ) : undefined
          }
        />

        {mapStyle ? (
          <View className="flex-1">
            {supportsNativeMap && TeamTasksMapNative ? (
              <TeamTasksMapNative
                batch={batch}
                selectedMission={selectedMission}
                currentMission={currentMission}
                routeCoordinates={routeCoordinates}
                mapStyle={mapStyle}
                onSelectMission={setSelectedMission}
              />
            ) : (
              <FallbackMapPreview
                batch={batch}
                selectedMission={selectedMission}
                routeCoordinates={routeCoordinates}
                colors={colors}
                supportsNativeMap={supportsNativeMap}
              />
            )}

            {selectedMission ? (
              <AppBottomSheet
                open={!!selectedMission}
                snapPoints={['50%', '82%']}
              >
                <View className="flex-row flex-wrap gap-2">
                  <View
                    className="rounded-full px-3 py-1"
                    style={{
                      backgroundColor: typeBadge(
                        selectedMission.rescueRequestType,
                      ).bg,
                    }}
                  >
                    <Text
                      className="text-xs font-bold"
                      style={{
                        color: typeBadge(selectedMission.rescueRequestType)
                          .text,
                      }}
                    >
                      {typeBadge(selectedMission.rescueRequestType).label}
                    </Text>
                  </View>
                  <View
                    className="rounded-full px-3 py-1"
                    style={{
                      backgroundColor: statusBadge(selectedMission.status).bg,
                    }}
                  >
                    <Text
                      className="text-xs font-bold"
                      style={{
                        color: statusBadge(selectedMission.status).text,
                      }}
                    >
                      {statusBadge(selectedMission.status).label}
                    </Text>
                  </View>
                </View>

                <Text className="mt-3 text-lg font-bold text-text-primary">
                  {selectedMission.description}
                </Text>
                <Text className="mt-2 text-sm text-text-secondary">
                  {selectedMission.address}
                </Text>

                <View className="mt-3 flex-row items-center justify-between">
                  <View>
                    <Text className="text-sm font-semibold text-text-primary">
                      {selectedMission.reporterFullName || 'Người báo tin'}
                    </Text>
                    <Text className="text-sm text-text-secondary">
                      {selectedMission.reporterPhone ||
                        'Không có số điện thoại'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      rescueTeamService.openCallReporter(
                        selectedMission.reporterPhone,
                      )
                    }
                    className="h-11 w-11 items-center justify-center rounded-full bg-surface"
                  >
                    <Ionicons
                      name="call-outline"
                      size={18}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                </View>

                <View className="mt-4 flex-row gap-3">
                  <TouchableOpacity
                    onPress={() =>
                      rescueTeamService.openExternalNavigation(selectedMission)
                    }
                    className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3"
                  >
                    <Ionicons name="navigate-outline" size={18} color="#fff" />
                    <Text className="font-bold text-white">Bắt đầu</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      rescueTeamService.openExternalNavigation(selectedMission)
                    }
                    className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-surface-dark bg-white py-3"
                  >
                    <Ionicons
                      name="map-outline"
                      size={18}
                      color={colors.primary}
                    />
                    <Text className="font-bold text-text-primary">
                      Mở Google Maps
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="mt-4 rounded-2xl bg-slate-900 p-3">
                  <Text className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-300">
                    Tracking Debug
                  </Text>
                  {debugTrackingLines.map((line) => (
                    <Text
                      key={line}
                      className="text-[11px] leading-5 text-slate-100"
                    >
                      {line}
                    </Text>
                  ))}
                </View>
              </AppBottomSheet>
            ) : null}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="map-outline" size={34} color="#94A3B8" />
            <Text className="mt-4 text-center text-base text-text-secondary">
              Thiếu `EXPO_PUBLIC_GOONG_MAP_KEY`, chưa thể hiển thị Goong Map
              trong app.
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-light">
      <ScreenHeader
        title="Nhiệm vụ của team"
        onBack={onBack}
        rightAction={
          <TouchableOpacity
            onPress={() => openMapScreen(selectedMission || currentMission)}
            className="h-10 w-10 items-center justify-center rounded-full"
          >
            <Ionicons name="map-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        }
      />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="mt-3 text-text-secondary">Đang tải nhiệm vụ...</Text>
        </View>
      ) : errorMessage ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={34} color="#DC2626" />
          <Text className="mt-4 text-center text-xl font-bold text-text-primary">
            Không tải được dữ liệu nhiệm vụ.
          </Text>
          <Text className="mt-2 text-center text-base text-text-secondary">
            {errorMessage}
          </Text>
          <TouchableOpacity
            onPress={() => loadData()}
            className="mt-6 rounded-xl bg-primary px-5 py-3"
          >
            <Text className="font-bold text-white">Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : !batch || batch.items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="file-tray-outline" size={34} color="#94A3B8" />
          <Text className="mt-4 text-center text-xl font-bold text-text-primary">
            Hiện chưa có nhiệm vụ hoạt động.
          </Text>
          <TouchableOpacity
            onPress={() => loadData()}
            className="mt-6 rounded-xl bg-primary px-5 py-3"
          >
            <Text className="font-bold text-white">Tải lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: bottom + 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadData(true)}
            />
          }
        >
          <View className="px-4 pt-4">
            <View className="rounded-3xl bg-secondary p-5">
              <Text className="text-2xl font-bold text-white">
                {teamName || 'Team hien tai'}
              </Text>
              <Text className="mt-2 text-sm text-white/80">
                {summary.total} nhiệm vụ • {summary.emergencyCount} khẩn cấp
              </Text>
              <View className="mt-4 flex-row gap-3">
                <View className="bg-white/12 rounded-2xl px-3 py-2">
                  <Text className="text-xs text-white/70">
                    Tổng quãng đường
                  </Text>
                  <Text className="mt-1 text-lg font-bold text-white">
                    {batch.totalDistanceKm ?? '--'} km
                  </Text>
                </View>
                <View className="bg-white/12 rounded-2xl px-3 py-2">
                  <Text className="text-xs text-white/70">ETA</Text>
                  <Text className="mt-1 text-lg font-bold text-white">
                    {batch.estimatedMinutes ?? '--'} phút
                  </Text>
                </View>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-4"
            >
              <View className="flex-row gap-2">
                {FILTER_OPTIONS.map((option) => {
                  const active = filter === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => setFilter(option.value)}
                      className="rounded-full px-4 py-2"
                      style={{
                        backgroundColor: active ? colors.primary : '#E2E8F0',
                      }}
                    >
                      <Text
                        style={{
                          color: active ? '#fff' : '#334155',
                          fontWeight: '700',
                        }}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View className="mt-4 gap-3">
              {filteredItems.map((item) => {
                const type = typeBadge(item.rescueRequestType);
                const status = statusBadge(item.status);

                return (
                  <View
                    key={item.rescueBatchItemId}
                    className="rounded-2xl border border-surface-dark bg-white p-4"
                  >
                    <View className="flex-row flex-wrap gap-2">
                      <View
                        className="rounded-full px-3 py-1"
                        style={{ backgroundColor: type.bg }}
                      >
                        <Text
                          className="text-xs font-bold"
                          style={{ color: type.text }}
                        >
                          {type.label}
                        </Text>
                      </View>
                      <View
                        className="rounded-full px-3 py-1"
                        style={{ backgroundColor: status.bg }}
                      >
                        <Text
                          className="text-xs font-bold"
                          style={{ color: status.text }}
                        >
                          {status.label}
                        </Text>
                      </View>
                      {currentMission?.rescueBatchItemId ===
                      item.rescueBatchItemId ? (
                        <View className="rounded-full bg-green-100 px-3 py-1">
                          <Text className="text-xs font-bold text-green-700">
                            Hiện tại
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    <Text
                      className="mt-3 text-base font-bold text-text-primary"
                      numberOfLines={2}
                    >
                      {item.description}
                    </Text>
                    <View className="mt-2 flex-row items-start gap-2">
                      <Ionicons
                        name="location-outline"
                        size={16}
                        color={colors.primary}
                      />
                      <Text className="flex-1 text-sm text-text-secondary">
                        {item.address}
                      </Text>
                    </View>

                    <Text className="mt-2 text-sm font-medium text-text-primary">
                      {item.distanceKm ?? '--'} km •{' '}
                      {item.estimatedMinutes ?? '--'}
                      phút
                    </Text>

                    <View className="mt-3 flex-row items-center justify-between">
                      <View className="flex-1 pr-3">
                        <Text className="text-sm font-semibold text-text-primary">
                          {item.reporterFullName || 'Người báo tin'}
                        </Text>
                        <Text className="text-sm text-text-secondary">
                          {item.reporterPhone || 'Không có số điện thoại'}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          rescueTeamService.openCallReporter(item.reporterPhone)
                        }
                        className="h-10 w-10 items-center justify-center rounded-full bg-surface"
                      >
                        <Ionicons
                          name="call-outline"
                          size={18}
                          color={colors.primary}
                        />
                      </TouchableOpacity>
                    </View>

                    <View className="mt-4 flex-row gap-3">
                      <TouchableOpacity
                        onPress={() => openMapScreen(item)}
                        className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3"
                      >
                        <Ionicons
                          name="navigate-outline"
                          size={18}
                          color="#fff"
                        />
                        <Text className="font-bold text-white">Dẫn đường</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          rescueTeamService.openExternalNavigation(item)
                        }
                        className="flex-row items-center justify-center rounded-xl border border-surface-dark px-4 py-3"
                      >
                        <Ionicons
                          name="map-outline"
                          size={18}
                          color={colors.primary}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function FallbackMapPreview({
  batch,
  selectedMission,
  routeCoordinates,
  colors,
  supportsNativeMap,
}: {
  batch: RescueActiveBatchResponse | null;
  selectedMission: RescueBatchItem | null;
  routeCoordinates: [number, number][];
  colors: any;
  supportsNativeMap: boolean;
}) {
  return (
    <View className="flex-1 items-center justify-center bg-slate-100 px-4">
      <View className="w-full max-w-[420px] rounded-3xl border border-slate-200 bg-white p-5">
        <View className="flex-row items-center gap-2">
          <Ionicons name="map-outline" size={22} color={colors.primary} />
          <Text className="text-lg font-bold text-text-primary">
            {supportsNativeMap ? 'Goong Map Preview' : 'Fallback Preview'}
          </Text>
        </View>

        <Text className="mt-3 text-sm leading-6 text-text-secondary">
          {supportsNativeMap
            ? 'Map native đã được tích hợp, nhưng màn hiện đang dùng preview an toàn để tránh crash trong môi trường hiện tại.'
            : 'Expo Go không hỗ trợ native map module này. Hãy dùng dev build để xem Goong Map thật trong app.'}
        </Text>

        <View className="mt-4 rounded-2xl bg-surface p-4">
          <Text className="text-sm font-semibold text-text-primary">
            {selectedMission?.description || 'Chưa chọn nhiệm vụ'}
          </Text>
          <Text className="mt-2 text-sm text-text-secondary">
            Marker queue: {batch?.items?.length || 0}
          </Text>
          <Text className="mt-1 text-sm text-text-secondary">
            Route preview points: {routeCoordinates.length}
          </Text>
          <Text className="mt-1 text-sm text-text-secondary">
            Địa chỉ: {selectedMission?.address || '---'}
          </Text>
        </View>
      </View>
    </View>
  );
}
