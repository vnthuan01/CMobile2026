import { useSendTeamTrackingHeartbeat } from '@/src/hooks/useTeamTracking';
import { useUploadImage } from '@/src/hooks/useUploadImage';
import {
  completeRescueOperation,
  fetchRescueRequestDetail,
  updateRescueOperationStatus,
} from '@/src/services/rescueService';
import {
  RescueActiveBatchResponse,
  RescueBatchItem,
  RescueTeamHistoryBatch,
  RescueTeamHistoryRequestItem,
  rescueTeamService,
} from '@/src/services/rescueTeamService';
import {
  TeamDetailResponse,
  TeamTrackingHeartbeatRequest,
  teamService,
} from '@/src/services/teamService';
import { useAuthStore } from '@/src/store/authStore';
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from '@/src/utils/toast';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type TasksScreenType = 'list' | 'map';
type MissionFilter =
  | 'all'
  | 'emergency'
  | 'normal'
  | 'in-progress'
  | 'pending'
  | 'done';
type LeaderActionMode = 'progress' | 'complete' | null;

const normalizePriorityLevel = (
  value: number | string | null | undefined,
): number | null => {
  if (value == null) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;

  const normalized = String(value).trim().toLowerCase();
  if (!normalized) return null;

  const numericValue = Number(normalized);
  if (Number.isFinite(numericValue)) return numericValue;

  if (
    normalized.includes('khẩn') ||
    normalized.includes('urgent') ||
    normalized.includes('critical') ||
    normalized.includes('emergency')
  ) {
    return 3;
  }

  if (normalized === 'cao' || normalized.includes('high')) return 2;
  if (normalized.includes('trung') || normalized.includes('medium')) return 1;
  if (normalized === 'thấp' || normalized.includes('low')) return 0;

  return null;
};

const mapHistoryBatchToUiBatch = (
  historyBatch: RescueTeamHistoryBatch,
  teamId: string,
): RescueActiveBatchResponse => ({
  rescueBatchId: historyBatch.rescueBatchId,
  teamId,
  isActive: false,
  status: 'Closed',
  routePolyline: null,
  totalDistanceKm: null,
  estimatedMinutes: null,
  createdAt: historyBatch.createdAt,
  closedAt: historyBatch.closedAt,
  items: (historyBatch.requests || [])
    .map(
      (request: RescueTeamHistoryRequestItem): RescueBatchItem => ({
        rescueBatchItemId: `${historyBatch.rescueBatchId}-${request.requestId}`,
        rescueRequestId: request.requestId,
        disasterType: request.disasterType,
        rescueRequestType: request.rescueRequestType,
        priorityPoint: request.priority ?? null,
        priorityLevel: normalizePriorityLevel(request.priorityLevel),
        rescueRequestStatus: request.rescueRequestStatus,
        description: request.address || 'Nhiệm vụ cứu hộ',
        address: request.address,
        latitude: null,
        longitude: null,
        reporterFullName: request.reporterFullName,
        reporterPhone: request.reporterPhone,
        sequenceOrder: request.sequenceOrder,
        isAutoAssigned: false,
        distanceKm: null,
        estimatedMinutes: null,
        status: request.batchItemStatus,
        createdAt: request.createdAt,
      }),
    )
    .sort((a, b) => a.sequenceOrder - b.sequenceOrder),
});

export function useTeamTasksController() {
  const user = useAuthStore((s) => s.user);
  const sendHeartbeatMutation = useSendTeamTrackingHeartbeat();
  const uploadImageMutation = useUploadImage();

  const [screen, setScreen] = useState<TasksScreenType>('list');
  const [team, setTeam] = useState<TeamDetailResponse | null>(null);
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
  const [cachedBatch, setCachedBatch] =
    useState<RescueActiveBatchResponse | null>(null);
  const [historyBatches, setHistoryBatches] = useState<
    RescueActiveBatchResponse[]
  >([]);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>(
    [],
  );
  const [teamId, setTeamId] = useState<string | null>(null);
  const [teamName, setTeamName] = useState<string | null>(null);
  const [isSyncingEta, setIsSyncingEta] = useState(false);
  const [lastHeartbeatAt, setLastHeartbeatAt] = useState<string | null>(null);
  const [leaderActionMode, setLeaderActionMode] =
    useState<LeaderActionMode>(null);
  const [activeActionMission, setActiveActionMission] =
    useState<RescueBatchItem | null>(null);
  const [leaderNote, setLeaderNote] = useState('');
  const [leaderImages, setLeaderImages] = useState<string[]>([]);
  const [operationStatusMap, setOperationStatusMap] = useState<
    Record<string, string>
  >({});
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [heartbeatIntervalMs, setHeartbeatIntervalMs] = useState<number | null>(
    null,
  );
  const [lastHeartbeatError, setLastHeartbeatError] = useState<string | null>(
    null,
  );
  const [lastHeartbeatSuccessAt, setLastHeartbeatSuccessAt] = useState<
    string | null
  >(null);
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
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(
    null,
  );
  const heartbeatInFlightRef = useRef(false);
  const actionSubmittingRef = useRef(false);
  const latestUserLocationRef = useRef<typeof userLocation>(null);

  const loadData = useCallback(async (isRefresh?: boolean) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErrorMessage(null);

    try {
      const teamResult = await teamService.getMyTeam();
      const nextTeamId = teamResult.data?.teamId;
      const nextTeamName = teamResult.data?.name;

      if (!teamResult.success || !nextTeamId) {
        setErrorMessage(
          teamResult.message || 'Không xác định được team hiện tại.',
        );
        setBatch(null);
        return;
      }

      setTeam(teamResult.data);
      const batchResult =
        await rescueTeamService.getActiveBatchByTeam(nextTeamId);
      if (!batchResult.success) {
        setErrorMessage(
          batchResult.message || 'Không tải được dữ liệu nhiệm vụ.',
        );
        setBatch(null);
        return;
      }

      if (!batchResult.data) {
        const historyResult =
          await rescueTeamService.getHistoryByTeam(nextTeamId);
        const mappedHistoryBatches: RescueActiveBatchResponse[] = (
          historyResult.data?.data || []
        ).map((historyBatch) =>
          mapHistoryBatchToUiBatch(historyBatch, nextTeamId),
        );

        setTeamId(nextTeamId);
        setTeamName(nextTeamName || null);
        setBatch(null);
        setHistoryBatches(mappedHistoryBatches);
        setCurrentMission(null);
        setSelectedMission(mappedHistoryBatches[0]?.items?.[0] || null);
        return;
      }

      const nextBatch = batchResult.data;
      const nextCurrentMission = rescueTeamService.getCurrentMission(
        nextBatch.items,
      );

      setTeamId(nextTeamId);
      setTeamName(nextTeamName || null);
      setBatch(nextBatch);
      setCachedBatch(nextBatch);

      // Also load history even when there's an active batch
      try {
        const historyResult =
          await rescueTeamService.getHistoryByTeam(nextTeamId);
        const mappedHistoryBatches: RescueActiveBatchResponse[] = (
          historyResult.data?.data || []
        ).map((historyBatch) =>
          mapHistoryBatchToUiBatch(historyBatch, nextTeamId),
        );
        setHistoryBatches(mappedHistoryBatches);
      } catch {
        setHistoryBatches([]);
      }
      setCurrentMission(nextCurrentMission);
      if (nextCurrentMission?.rescueRequestId) {
        try {
          const detail = await fetchRescueRequestDetail(
            nextCurrentMission.rescueRequestId,
          );
          const operationStatus =
            detail.assignedRescueTeam?.operationStatus ||
            detail.rescueOperations?.find((item) => item.teamId === nextTeamId)
              ?.status;

          if (operationStatus) {
            setOperationStatusMap((prev) => ({
              ...prev,
              [nextCurrentMission.rescueRequestId]: operationStatus,
            }));
          }
        } catch {
          // ignore detail failure, keep batch data fallback
        }
      }
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
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    let isMounted = true;

    const watchLocation = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== 'granted') {
          if (isMounted) setUserLocation(null);
          return;
        }

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (isMounted) {
          setUserLocation({
            latitude: current.coords.latitude,
            longitude: current.coords.longitude,
            accuracy: current.coords.accuracy,
            speedKph:
              current.coords.speed != null && current.coords.speed >= 0
                ? current.coords.speed * 3.6
                : null,
            headingDegree:
              current.coords.heading != null && current.coords.heading >= 0
                ? current.coords.heading
                : null,
          });
        }

        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 8000,
            distanceInterval: 8,
          },
          (position) => {
            if (!isMounted) return;

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
          },
        );

        locationSubscriptionRef.current = subscription;
      } catch {
        if (isMounted) setUserLocation(null);
      }
    };

    watchLocation();

    return () => {
      isMounted = false;
      locationSubscriptionRef.current?.remove();
      locationSubscriptionRef.current = null;
    };
  }, []);

  useEffect(() => {
    latestUserLocationRef.current = userLocation;
  }, [userLocation]);

  useEffect(() => {
    const sendHeartbeat = async () => {
      const latestUserLocation = latestUserLocationRef.current;
      if (!teamId || !latestUserLocation || !batch?.rescueBatchId) return;
      if (heartbeatInFlightRef.current) return;
      if (actionSubmittingRef.current) return;

      heartbeatInFlightRef.current = true;
      setIsSyncingEta(true);
      try {
        const payload: TeamTrackingHeartbeatRequest = {
          latitude: latestUserLocation.latitude,
          longitude: latestUserLocation.longitude,
          accuracyMeters: latestUserLocation.accuracy ?? null,
          speedKph: latestUserLocation.speedKph ?? null,
          headingDegree: latestUserLocation.headingDegree ?? null,
          source: 0,
          capturedAtUtc: new Date().toISOString(),
          rescueBatchId: batch.rescueBatchId,
          rescueOperationId: null,
          note: 'Cập nhật vị trí từ ứng dụng di động',
        };

        const heartbeat = await sendHeartbeatMutation.mutateAsync({
          teamId,
          payload,
        });
        if (!heartbeat.success) {
          setLastHeartbeatError(
            heartbeat.message || 'Heartbeat thất bại, sẽ thử lại.',
          );
          return;
        }

        setLastHeartbeatAt(new Date().toISOString());
        setLastHeartbeatSuccessAt(new Date().toISOString());
        setLastHeartbeatError(null);

        const refreshedBatch =
          await rescueTeamService.getActiveBatchByTeam(teamId);
        if (!refreshedBatch.success) return;
        if (!refreshedBatch.data) {
          setBatch(null);
          setCurrentMission(null);
          setSelectedMission(null);
          return;
        }

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
      } catch {
        setLastHeartbeatError('Heartbeat thất bại, sẽ thử lại.');
      } finally {
        heartbeatInFlightRef.current = false;
        setIsSyncingEta(false);
      }
    };

    if (!teamId || !userLocation || !batch?.rescueBatchId || actionSubmitting) {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      return;
    }

    sendHeartbeat();

    const speed =
      latestUserLocationRef.current?.speedKph ?? userLocation.speedKph ?? 0;
    const intervalMs = speed >= 5 ? 15000 : 30000;
    setHeartbeatIntervalMs(intervalMs);

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    heartbeatIntervalRef.current = setInterval(() => {
      sendHeartbeat();
    }, intervalMs);

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    };
  }, [
    actionSubmitting,
    batch?.rescueBatchId,
    sendHeartbeatMutation,
    teamId,
    userLocation ? (userLocation.speedKph ?? 0) >= 5 : false,
  ]);

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

  const displayBatch = batch ?? cachedBatch;

  const filteredItems = useMemo(() => {
    if (!displayBatch?.items) return [];
    return rescueTeamService.getFilteredItems(displayBatch.items, filter);
  }, [displayBatch?.items, filter]);

  const isLeader = useMemo(() => {
    if (!user?.id || !team?.leader?.userId) return false;
    return user.id === team.leader.userId;
  }, [team?.leader?.userId, user?.id]);

  const isCurrentMissionSelected =
    !!selectedMission &&
    selectedMission.rescueBatchItemId === currentMission?.rescueBatchItemId;

  const summary = useMemo(() => {
    const total = displayBatch?.items?.length || 0;
    const emergencyCount =
      displayBatch?.items?.filter(
        (item: RescueBatchItem) => item.rescueRequestType === 'Emergency',
      ).length || 0;
    return { total, emergencyCount };
  }, [displayBatch?.items]);

  const mapStyle = rescueTeamService.getMapStyleUrl();

  const getMissionDisplayStatus = useCallback(
    (item?: RescueBatchItem | null) => {
      if (!item) return null;
      return operationStatusMap[item.rescueRequestId] || item.status || null;
    },
    [operationStatusMap],
  );

  const openMapScreen = (item?: RescueBatchItem | null) => {
    if (item) setSelectedMission(item);
    setScreen('map');
  };

  const resetLeaderForms = () => {
    setLeaderActionMode(null);
    setActiveActionMission(null);
    setLeaderNote('');
    setLeaderImages([]);
  };

  const getEffectiveMissionState = useCallback(
    (item?: RescueBatchItem | null) => {
      if (!item) return null;

      const operationStatus = getMissionDisplayStatus(item);
      const normalized = String(operationStatus || '').toLowerCase();

      if (
        normalized === 'done' ||
        normalized === 'rescuecompleted' ||
        normalized === 'closed' ||
        normalized === 'cancelled'
      ) {
        return 'done';
      }

      if (normalized === 'enroute' || normalized === 'rescuing') {
        return 'in_progress';
      }

      return 'pending';
    },
    [getMissionDisplayStatus],
  );

  const currentMissionForUi = useMemo(() => {
    if (!displayBatch?.items?.length) return null;

    const inProgressMission = displayBatch.items.find(
      (item) => getEffectiveMissionState(item) === 'in_progress',
    );
    if (inProgressMission) return inProgressMission;

    return (
      displayBatch.items.find(
        (item) => getEffectiveMissionState(item) !== 'done',
      ) || null
    );
  }, [displayBatch?.items, getEffectiveMissionState]);

  const pickLeaderImages = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      showWarningToast(
        'Cần quyền thư viện ảnh',
        'Cho phép truy cập để đính kèm minh chứng.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) return;

    setUploadingImages(true);
    try {
      const uploadedUrls: string[] = [];
      for (const asset of result.assets.slice(0, 5 - leaderImages.length)) {
        const uploadResult = await uploadImageMutation.mutateAsync({
          localUri: asset.uri,
          fileName: asset.fileName || `mission_${Date.now()}.jpg`,
          mimeType: asset.mimeType ?? 'image/jpeg',
        });

        if (!uploadResult.success || !uploadResult.url) {
          showErrorToast(
            'Upload thất bại',
            uploadResult.message || 'Không thể upload ảnh minh chứng.',
          );
          continue;
        }

        uploadedUrls.push(uploadResult.url);
      }

      if (uploadedUrls.length > 0) {
        setLeaderImages((prev) => [...prev, ...uploadedUrls]);
      }
    } finally {
      setUploadingImages(false);
    }
  }, [leaderImages.length, uploadImageMutation]);

  const resolveOperationId = useCallback(
    async (requestId: string) => {
      const detail = await fetchRescueRequestDetail(requestId);
      const operation = detail.rescueOperations?.find(
        (item) => item.teamId === teamId,
      );

      if (!operation?.rescueOperationId) {
        throw new Error('Không tìm thấy operation của team cho nhiệm vụ này.');
      }

      return operation.rescueOperationId;
    },
    [teamId],
  );

  const submitProgressUpdate = useCallback(
    async (status: 2 | 3, mission?: RescueBatchItem | null) => {
      if (actionSubmittingRef.current) return;

      const targetMission = mission || activeActionMission || selectedMission;
      if (!targetMission?.rescueRequestId) {
        showWarningToast(
          'Thiếu dữ liệu',
          'Không xác định được yêu cầu cứu hộ hiện tại.',
        );
        return;
      }

      actionSubmittingRef.current = true;
      setActionSubmitting(true);
      try {
        const operationId = await resolveOperationId(
          targetMission.rescueRequestId,
        );
        await updateRescueOperationStatus(
          targetMission.rescueRequestId,
          operationId,
          {
            status,
            note: leaderNote.trim() || null,
          },
        );

        const detail = await fetchRescueRequestDetail(
          targetMission.rescueRequestId,
        );
        const operationStatus =
          detail.assignedRescueTeam?.operationStatus ||
          detail.rescueOperations?.find((item) => item.teamId === teamId)
            ?.status;

        if (operationStatus) {
          setOperationStatusMap((prev) => ({
            ...prev,
            [targetMission.rescueRequestId]: operationStatus,
          }));
        }

        showSuccessToast(
          'Cập nhật thành công',
          'Đã cập nhật tiến độ nhiệm vụ.',
        );
        resetLeaderForms();
        await loadData(true);
      } catch (error: any) {
        showErrorToast(
          'Không thể cập nhật',
          error?.message || 'Cập nhật tiến độ thất bại.',
        );
      } finally {
        actionSubmittingRef.current = false;
        setActionSubmitting(false);
      }
    },
    [
      activeActionMission,
      leaderNote,
      loadData,
      resolveOperationId,
      selectedMission,
    ],
  );

  const submitCompleteMission = useCallback(
    async (mission?: RescueBatchItem | null) => {
      if (actionSubmittingRef.current) return;

      const targetMission = mission || activeActionMission || selectedMission;
      if (!targetMission?.rescueRequestId) {
        showWarningToast(
          'Thiếu dữ liệu',
          'Không xác định được yêu cầu cứu hộ hiện tại.',
        );
        return;
      }

      if (leaderImages.length === 0) {
        showWarningToast(
          'Thiếu ảnh minh chứng',
          'Cần ít nhất 1 ảnh trước khi hoàn thành nhiệm vụ.',
        );
        return;
      }

      actionSubmittingRef.current = true;
      setActionSubmitting(true);
      try {
        const operationId = await resolveOperationId(
          targetMission.rescueRequestId,
        );
        await completeRescueOperation(
          targetMission.rescueRequestId,
          operationId,
          {
            attachments: leaderImages.map((fileUrl) => ({
              fileUrl,
              contentType: 'image/jpeg',
            })),
            note: leaderNote.trim() || null,
          },
        );

        const detail = await fetchRescueRequestDetail(
          targetMission.rescueRequestId,
        );
        const operationStatus =
          detail.assignedRescueTeam?.operationStatus ||
          detail.rescueOperations?.find((item) => item.teamId === teamId)
            ?.status;

        if (operationStatus) {
          setOperationStatusMap((prev) => ({
            ...prev,
            [targetMission.rescueRequestId]: operationStatus,
          }));
        }

        showSuccessToast(
          'Hoàn thành nhiệm vụ',
          'Đã xác nhận hoàn thành nhiệm vụ thành công.',
        );
        setSelectedMission(null);
        resetLeaderForms();
        await loadData(true);
      } catch (error: any) {
        showErrorToast(
          'Không thể hoàn thành',
          error?.message || 'Hoàn thành nhiệm vụ thất bại.',
        );
      } finally {
        actionSubmittingRef.current = false;
        setActionSubmitting(false);
      }
    },
    [
      activeActionMission,
      leaderImages,
      leaderNote,
      loadData,
      resolveOperationId,
      selectedMission,
      teamId,
    ],
  );

  const heartbeatStatusLabel = useMemo(() => {
    if (lastHeartbeatError) return `Lỗi đồng bộ vị trí: ${lastHeartbeatError}`;
    if (!lastHeartbeatAt) {
      return isSyncingEta ? 'Đang cập nhật ETA...' : null;
    }

    const date = new Date(lastHeartbeatAt);
    if (Number.isNaN(date.getTime())) return null;

    return `Đồng bộ lúc ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  }, [isSyncingEta, lastHeartbeatAt, lastHeartbeatError]);

  const heartbeatStatusTone = useMemo(() => {
    if (lastHeartbeatError) return 'error';
    if (lastHeartbeatAt) return 'success';
    if (isSyncingEta) return 'info';
    return null;
  }, [isSyncingEta, lastHeartbeatAt, lastHeartbeatError]);

  const fmtTime = (iso: string | null) => {
    if (!iso) return '---';
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
      ? '---'
      : d.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
  };

  const debugTrackingLines = useMemo(
    () => [
      `teamId: ${teamId || '---'}`,
      `batchId: ${batch?.rescueBatchId?.slice(0, 8) || '---'}`,
      `màn hình: ${screen === 'map' ? 'bản đồ' : 'danh sách'}`,
      `có vị trí: ${userLocation ? 'có' : 'không'}`,
      `đồng bộ: ${heartbeatIntervalRef.current ? 'bật' : 'tắt'} / ${heartbeatIntervalMs ?? '---'}ms`,
      `trạng thái: ${isSyncingEta ? 'đang gửi' : 'chờ'}`,
      `thành công: ${fmtTime(lastHeartbeatSuccessAt)}`,
      `lỗi: ${lastHeartbeatError || '---'}`,
      `sync: ${fmtTime(lastHeartbeatAt)}`,
      `vĩ độ: ${userLocation?.latitude ?? '---'}`,
      `kinh độ: ${userLocation?.longitude ?? '---'}`,
      `độ chính xác: ${userLocation?.accuracy ?? '---'}`,
      `tốc độ: ${userLocation?.speedKph ?? '---'}`,
      `hướng di chuyển: ${userLocation?.headingDegree ?? '---'}`,
      `nhiệm vụ hiện tại: ${currentMission?.rescueBatchItemId || '---'}`,
      `nhiệm vụ đang chọn: ${selectedMission?.rescueBatchItemId || '---'}`,
      `eta: ${selectedMission?.estimatedMinutes ?? '---'} phút`,
      `khoảng cách: ${selectedMission?.distanceKm ?? '---'} km`,
    ],
    [
      batch?.rescueBatchId,
      currentMission?.rescueBatchItemId,
      heartbeatIntervalMs,
      isSyncingEta,
      lastHeartbeatError,
      lastHeartbeatSuccessAt,
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
    ],
  );

  return {
    screen,
    setScreen,
    team,
    batch,
    selectedMission,
    setSelectedMission,
    currentMission,
    filter,
    setFilter,
    loading,
    refreshing,
    errorMessage,
    cachedBatch,
    historyBatches,
    routeCoordinates,
    teamId,
    teamName,
    isSyncingEta,
    lastHeartbeatAt,
    leaderActionMode,
    setLeaderActionMode,
    activeActionMission,
    setActiveActionMission,
    leaderNote,
    setLeaderNote,
    leaderImages,
    setLeaderImages,
    operationStatusMap,
    actionSubmitting,
    uploadingImages,
    heartbeatIntervalMs,
    lastHeartbeatError,
    lastHeartbeatSuccessAt,
    userLocation,
    loadData,
    displayBatch,
    filteredItems,
    isLeader,
    isCurrentMissionSelected,
    summary,
    mapStyle,
    getMissionDisplayStatus,
    openMapScreen,
    resetLeaderForms,
    getEffectiveMissionState,
    currentMissionForUi,
    pickLeaderImages,
    submitProgressUpdate,
    submitCompleteMission,
    heartbeatStatusLabel,
    heartbeatStatusTone,
    debugTrackingLines,
  };
}
