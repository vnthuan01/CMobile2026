import '@/global.css';
import AppBottomSheet from '@/src/components/common/AppBottomSheet';
import ImageUploader from '@/src/components/common/ImageUploader';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import WebViewMap from '@/src/components/common/WebViewMap';
import { useTheme } from '@/src/context/ThemeContext';
import { useBottomContentInset } from '@/src/hooks/useBottomContentInset';
import { useRescueTeamActions } from '@/src/hooks/useRescueTeamActions';
import { useTeamTasksController } from '@/src/hooks/useTeamTasksController';
import {
  RescueBatchItem as BaseRescueBatchItem,
  RescueActiveBatchResponse,
  rescueTeamService,
} from '@/src/services/rescueTeamService';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import TeamTasksMap from './TeamTasksMap';

type MissionFilter =
  | 'all'
  | 'emergency'
  | 'normal'
  | 'in-progress'
  | 'pending'
  | 'done';

type RescueBatchItem = BaseRescueBatchItem & {
  priorityPoint?: number | null;
  priorityLevel?: number | string | null;
};

interface RescueMissionCenterScreenProps {
  onBack?: () => void;
  openMapOnLoad?: boolean;
}

const FILTER_OPTIONS: { label: string; value: MissionFilter }[] = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Khẩn cấp', value: 'emergency' },
  { label: 'Bình thường', value: 'normal' },
  { label: 'Đang làm', value: 'in-progress' },
  { label: 'Chờ xử lý', value: 'pending' },
  { label: 'Đã xong', value: 'done' },
];

const supportsNativeMap = Constants.appOwnership !== 'expo';

export default function RescueMissionCenterScreen({
  onBack,
  openMapOnLoad = false,
}: RescueMissionCenterScreenProps) {
  const bottomInset = useBottomContentInset(24);
  const { colors } = useTheme();
  const {
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
    historyBatches,
    filteredHistoryBatches,
    routeCoordinates,
    teamName,
    isSyncingEta,
    leaderActionMode,
    setLeaderActionMode,
    setActiveActionMission,
    leaderNote,
    setLeaderNote,
    leaderImages,
    setLeaderImages,
    actionSubmitting,
    uploadingImages,
    lastHeartbeatError,
    loadData,
    displayBatch,
    filteredItems,
    isLeader,
    isCurrentMissionSelected,
    summary,
    mapStyle,
    getMissionDisplayStatus,
    getMissionMessage,
    openMapScreen,
    resetLeaderForms,
    currentMissionForUi,
    pickLeaderImages,
    submitProgressUpdate,
    submitCompleteMission,
    heartbeatStatusLabel,
  } = useTeamTasksController();

  const filteredItemsWithPriority = filteredItems as RescueBatchItem[];
  const historyBatchesWithPriority =
    historyBatches as (RescueActiveBatchResponse & {
      items: RescueBatchItem[];
    })[];
  const filteredHistoryBatchesWithPriority =
    filteredHistoryBatches as (RescueActiveBatchResponse & {
      items: RescueBatchItem[];
      filteredItems: RescueBatchItem[];
    })[];
  const autoOpenedMapRef = useRef(false);
  const { callReporter } = useRescueTeamActions();

  useEffect(() => {
    if (!openMapOnLoad || autoOpenedMapRef.current || loading) return;
    if (!currentMissionForUi) return;

    autoOpenedMapRef.current = true;
    openMapScreen(currentMissionForUi);
  }, [currentMissionForUi, loading, openMapOnLoad, openMapScreen]);

  const statusBadge = (status?: string) => {
    const normalized = String(status ?? '').toLowerCase();
    if (normalized === 'inprogress') {
      return {
        bg: `${colors.status.inProgress}22`,
        text: colors.status.inProgress,
        label: 'Đang làm',
      };
    }
    if (normalized === 'pending') {
      return {
        bg: `${colors.status.pending}22`,
        text: colors.status.pending,
        label: 'Chờ xử lý',
      };
    }
    if (normalized === 'assigned') {
      return {
        bg: `${colors.status.incoming}22`,
        text: colors.status.incoming,
        label: 'Được phân công',
      };
    }
    if (normalized === 'done' || normalized === 'rescuecompleted') {
      return {
        bg: `${colors.status.completed}22`,
        text: colors.status.completed,
        label: 'Đã xong',
      };
    }
    if (normalized === 'enroute') {
      return {
        bg: `${colors.status.incoming}22`,
        text: colors.status.incoming,
        label: 'Đang di chuyển',
      };
    }
    if (normalized === 'rescuing') {
      return {
        bg: `${colors.status.incoming}22`,
        text: colors.status.incoming,
        label: 'Đang cứu hộ',
      };
    }
    if (normalized === 'closed' || normalized === 'cancelled') {
      return {
        bg: `${colors.status.cancelled}22`,
        text: colors.status.cancelled,
        label: 'Đã đóng',
      };
    }
    return {
      bg: colors.surface,
      text: colors.textSecondary,
      label: status || 'Khác',
    };
  };

  const typeBadge = (type?: string | null) => {
    const normalized = String(type ?? '').toLowerCase();
    if (
      normalized === 'emergency' ||
      normalized === '1' ||
      normalized === 'khẩn cấp'
    ) {
      return {
        bg: `${colors.status.error}22`,
        text: colors.status.error,
        label: 'Khẩn cấp',
      };
    }
    return {
      bg: `${colors.status.incoming}22`,
      text: colors.status.incoming,
      label: 'Bình thường',
    };
  };

  const normalizePriorityLevel = (value?: number | string | null) => {
    if (value == null) return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;

    const normalized = String(value).trim().toLowerCase();
    if (!normalized) return null;
    if (normalized === '0' || normalized === 'low' || normalized === 'thấp')
      return 0;
    if (
      normalized === '1' ||
      normalized === 'medium' ||
      normalized === 'normal' ||
      normalized === 'trung bình'
    )
      return 1;
    if (normalized === '2' || normalized === 'high' || normalized === 'cao')
      return 2;
    if (
      normalized === '3' ||
      normalized === 'critical' ||
      normalized === 'emergency' ||
      normalized === 'khẩn cấp'
    )
      return 3;
    return null;
  };

  const priorityBadge = (
    point?: number | null,
    level?: number | string | null,
  ) => {
    const normalizedLevel = normalizePriorityLevel(level);
    const safePoint = point ?? 0;

    return {
      pointLabel: `Điểm ưu tiên: ${safePoint}`,
      levelLabel: `Mức ưu tiên: ${getPriorityLevelLabel(normalizedLevel)}`,
      levelBg:
        normalizedLevel === 3
          ? '#FEE2E2'
          : normalizedLevel === 2
            ? '#FDE68A'
            : normalizedLevel === 1
              ? '#DBEAFE'
              : '#ECFCCB',
      levelText:
        normalizedLevel === 3
          ? '#B91C1C'
          : normalizedLevel === 2
            ? '#92400E'
            : normalizedLevel === 1
              ? '#1D4ED8'
              : '#3F6212',
      pointBg:
        safePoint >= 80 ? '#FEE2E2' : safePoint >= 50 ? '#FEF3C7' : '#F1F5F9',
      pointText:
        safePoint >= 80 ? '#B91C1C' : safePoint >= 50 ? '#92400E' : '#334155',
    };
  };

  const getPriorityLevelLabel = (value?: number | null) => {
    if (value == null) return 'Không có mức ưu tiên';
    if (value === 0) return 'Thấp';
    if (value === 1) return 'Trung bình';
    if (value === 2) return 'Cao';
    if (value === 3) return 'Khẩn cấp';
    return 'Không hợp lệ';
  };

  const formatDistanceKm = (value?: number | null) => {
    if (value == null || Number.isNaN(value)) return '--';
    return value >= 10 ? value.toFixed(0) : value.toFixed(1);
  };

  const formatMinutes = (value?: number | null) => {
    if (value == null || Number.isNaN(value)) return '--';
    return String(Math.round(value));
  };

  const getVehicleLabel = (
    item: Pick<
      RescueBatchItem,
      'vehicleName' | 'vehicleLicensePlate' | 'vehicleId'
    >,
  ) => {
    const vehicleName = String(item.vehicleName ?? '').trim();
    const vehicleLicensePlate = String(item.vehicleLicensePlate ?? '').trim();
    const hasVehicle = Boolean(
      vehicleName || vehicleLicensePlate || item.vehicleId,
    );

    if (!hasVehicle) {
      return 'Chưa điều phối';
    }

    if (vehicleName && vehicleLicensePlate) {
      return `${vehicleName} - ${vehicleLicensePlate}`;
    }

    if (vehicleName) {
      return vehicleName;
    }

    if (vehicleLicensePlate) {
      return vehicleLicensePlate;
    }

    return 'Chưa điều phối';
  };

  const renderLeaderMissionActions = (mission: RescueBatchItem | null) => {
    const isActiveMission =
      !!mission &&
      !!currentMissionForUi &&
      mission.rescueBatchItemId === currentMissionForUi.rescueBatchItemId;

    if (!isLeader || !mission || !isActiveMission) return null;

    return (
      <View
        className="mt-4 rounded-2xl border p-4"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-bold" style={{ color: colors.text }}>
            Điều hành nhiệm vụ
          </Text>
          <View
            className="rounded-full px-3 py-1"
            style={{ backgroundColor: `${colors.info}22` }}
          >
            <Text className="text-xs font-bold" style={{ color: colors.info }}>
              Trưởng nhóm
            </Text>
          </View>
        </View>

        <View className="mt-4 flex-row gap-3">
          <TouchableOpacity
            onPress={() => {
              setSelectedMission(mission);
              setActiveActionMission(mission);
              setLeaderActionMode('progress');
            }}
            className="flex-1 rounded-xl px-4 py-3"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-center font-bold text-white">
              Cập nhật tiến độ
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setSelectedMission(mission);
              setActiveActionMission(mission);
              setLeaderActionMode('complete');
            }}
            className="flex-1 rounded-xl border px-4 py-3"
            style={{ borderColor: colors.border, backgroundColor: colors.card }}
          >
            <Text
              className="text-center font-bold"
              style={{ color: colors.text }}
            >
              Hoàn thành
            </Text>
          </TouchableOpacity>
        </View>

        {leaderActionMode ? (
          <View
            className="mt-4 rounded-2xl p-4"
            style={{ backgroundColor: colors.surface }}
          >
            <Text
              className="text-sm font-semibold"
              style={{ color: colors.text }}
            >
              {leaderActionMode === 'progress'
                ? 'Ghi chú cập nhật tiến độ'
                : 'Ghi chú hoàn thành nhiệm vụ'}
            </Text>

            <TextInput
              value={leaderNote}
              onChangeText={setLeaderNote}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="mt-3 min-h-[110px] rounded-xl border p-4 text-sm"
              placeholderTextColor={colors.textSecondary}
              placeholder="Nhập ghi chú điều hành..."
              style={{
                borderColor: colors.border,
                backgroundColor: colors.card,
                color: colors.text,
              }}
            />

            {leaderActionMode === 'progress' ? (
              <View className="mt-4">
                <StepGroup
                  currentStatus={String(getMissionDisplayStatus(mission) || '')}
                  disabled={actionSubmitting}
                  onSelect={submitProgressUpdate}
                />
              </View>
            ) : (
              <View className="mt-4">
                <ImageUploader
                  images={leaderImages}
                  onAddImage={pickLeaderImages}
                  onRemoveImage={(index: number) =>
                    setLeaderImages((prev) =>
                      prev.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                />

                {uploadingImages ? (
                  <View className="mt-3 flex-row items-center gap-2">
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text
                      className="text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      Đang upload ảnh minh chứng...
                    </Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  onPress={() => submitCompleteMission(mission)}
                  disabled={
                    actionSubmitting ||
                    uploadingImages ||
                    leaderImages.length === 0
                  }
                  className="mt-4 rounded-xl px-4 py-3"
                  style={{
                    backgroundColor: colors.primary,
                    opacity:
                      actionSubmitting ||
                      uploadingImages ||
                      leaderImages.length === 0
                        ? 0.55
                        : 1,
                  }}
                >
                  <Text className="text-center font-bold text-white">
                    Xác nhận hoàn thành
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              onPress={resetLeaderForms}
              className="mt-3 self-end"
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: colors.primary }}
              >
                Đóng
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  };

  if (screen === 'map') {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <ScreenHeader
          title="Dẫn đường"
          onBack={() => setScreen('list')}
          showBottomBorder={false}
          showShadow={false}
        />

        {selectedMission && heartbeatStatusLabel ? (
          <View className="items-end px-4 pb-2">
            <View
              className="self-end rounded-full px-3 py-1"
              style={{
                minWidth: 140,
                maxWidth: 320,
                backgroundColor: lastHeartbeatError
                  ? `${colors.error}22`
                  : isSyncingEta
                    ? `${colors.info}22`
                    : `${colors.success}22`,
              }}
            >
              <Text
                className="text-xs font-semibold"
                numberOfLines={1}
                style={{
                  color: lastHeartbeatError
                    ? colors.error
                    : isSyncingEta
                      ? colors.info
                      : colors.success,
                }}
              >
                {heartbeatStatusLabel}
              </Text>
            </View>
          </View>
        ) : null}

        {mapStyle ? (
          <View className="flex-1">
            {supportsNativeMap ? (
              <TeamTasksMap
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
              />
            )}

            {selectedMission ? (
              <AppBottomSheet
                open
                snapPoints={['52%', '76%']}
                allowCloseByPanDown={false}
              >
                <Text
                  className="text-xl font-bold"
                  style={{ color: colors.text }}
                >
                  {selectedMission.description}
                </Text>

                <View className="mt-4 flex-row flex-wrap gap-2">
                  <MetaBadge
                    icon="alert-circle-outline"
                    label={typeBadge(selectedMission.rescueRequestType).label}
                    bg={typeBadge(selectedMission.rescueRequestType).bg}
                    text={typeBadge(selectedMission.rescueRequestType).text}
                  />
                  <MetaBadge
                    icon="time-outline"
                    label={`${formatMinutes(selectedMission.estimatedMinutes)} phút`}
                    bg={`${colors.info}22`}
                    text={colors.info}
                  />
                  <MetaBadge
                    icon="navigate-outline"
                    label={`${formatDistanceKm(selectedMission.distanceKm)} km`}
                    bg={colors.surface}
                    text={colors.textSecondary}
                  />
                  <MetaBadge
                    icon="flag-outline"
                    label={
                      statusBadge(
                        getMissionDisplayStatus(selectedMission) || undefined,
                      ).label
                    }
                    bg={
                      statusBadge(
                        getMissionDisplayStatus(selectedMission) || undefined,
                      ).bg
                    }
                    text={
                      statusBadge(
                        getMissionDisplayStatus(selectedMission) || undefined,
                      ).text
                    }
                  />
                </View>

                <View
                  className="mt-4 rounded-xl border px-4 py-3"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: colors.textSecondary }}
                  >
                    Phương tiện
                  </Text>
                  <Text
                    className="mt-1 text-sm font-semibold"
                    style={{ color: colors.text }}
                  >
                    {getVehicleLabel(selectedMission)}
                  </Text>
                </View>

                <View className="mt-4 flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => callReporter(selectedMission.reporterPhone)}
                    className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border py-3"
                    style={{ borderColor: colors.border }}
                  >
                    <Ionicons
                      name="call-outline"
                      size={18}
                      color={colors.primary}
                    />
                    <Text
                      className="font-semibold"
                      style={{ color: colors.text }}
                    >
                      Gọi người báo tin
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      rescueTeamService.openExternalNavigation(selectedMission)
                    }
                    className="flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Ionicons name="navigate-outline" size={18} color="#fff" />
                    <Text className="font-semibold text-white">Dẫn đường</Text>
                  </TouchableOpacity>
                </View>

                {isLeader && isCurrentMissionSelected
                  ? renderLeaderMissionActions(selectedMission)
                  : null}
              </AppBottomSheet>
            ) : null}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons
              name="map-outline"
              size={34}
              color={colors.textSecondary}
            />
            <Text
              className="mt-4 text-center text-base"
              style={{ color: colors.textSecondary }}
            >
              Thiếu cấu hình bản đồ Goong.
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenHeader
        title="Nhiệm vụ của nhóm"
        onBack={onBack}
        rightAction={
          <TouchableOpacity
            onPress={() =>
              openMapScreen(selectedMission || currentMissionForUi)
            }
            className="h-10 w-10 items-center justify-center rounded-full"
          >
            <Ionicons name="map-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        }
      />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="mt-3" style={{ color: colors.textSecondary }}>
            Đang tải nhiệm vụ...
          </Text>
        </View>
      ) : errorMessage ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons
            name="alert-circle-outline"
            size={34}
            color={colors.error}
          />
          <Text
            className="mt-4 text-center text-xl font-bold"
            style={{ color: colors.text }}
          >
            Không tải được dữ liệu nhiệm vụ.
          </Text>
          <Text
            className="mt-2 text-center text-base"
            style={{ color: colors.textSecondary }}
          >
            {errorMessage}
          </Text>
          <TouchableOpacity
            onPress={() => loadData()}
            className="mt-6 rounded-xl px-5 py-3"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="font-bold text-white">Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : !displayBatch && historyBatches.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons
            name="file-tray-outline"
            size={34}
            color={colors.textSecondary}
          />
          <Text
            className="mt-4 text-center text-xl font-bold"
            style={{ color: colors.text }}
          >
            Hiện chưa có nhiệm vụ hoạt động.
          </Text>
          <TouchableOpacity
            onPress={() => loadData()}
            className="mt-6 rounded-xl px-5 py-3"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="font-bold text-white">Tải lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: bottomInset }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadData(true)}
            />
          }
        >
          <View className="px-4 pt-4">
            <View
              className="rounded-3xl p-5"
              style={{ backgroundColor: colors.secondary }}
            >
              <Text className="text-2xl font-bold text-white">
                {teamName || team?.name || 'Nhóm hiện tại'}
              </Text>
              <Text className="mt-2 text-sm text-white/80">
                {summary.total} nhiệm vụ • {summary.emergencyCount} khẩn cấp •{' '}
                {summary.normalCount} bình thường
              </Text>
              {heartbeatStatusLabel ? (
                <View
                  className="mt-4 rounded-2xl px-4 py-3"
                  style={{
                    backgroundColor: lastHeartbeatError
                      ? `${colors.error}22`
                      : isSyncingEta
                        ? `${colors.info}33`
                        : `${colors.success}33`,
                  }}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{
                      color: lastHeartbeatError
                        ? colors.error
                        : isSyncingEta
                          ? colors.info
                          : colors.success,
                    }}
                  >
                    {heartbeatStatusLabel}
                  </Text>
                </View>
              ) : null}
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
                        backgroundColor: active
                          ? colors.primary
                          : colors.surface,
                      }}
                    >
                      <Text
                        style={{
                          color: active ? colors.white : colors.textSecondary,
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

            {displayBatch ? (
              <View className="mt-4 gap-3">
                {filteredItemsWithPriority.length > 0 ? (
                  filteredItemsWithPriority.map((item) => {
                    const type = typeBadge(item.rescueRequestType);
                    const status = statusBadge(
                      getMissionDisplayStatus(item) || undefined,
                    );
                    const priority = priorityBadge(
                      item.priorityPoint,
                      item.priorityLevel,
                    );

                    return (
                      <View
                        key={item.rescueBatchItemId}
                        className="rounded-2xl border p-4"
                        style={{
                          borderColor: colors.border,
                          backgroundColor: colors.card,
                        }}
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
                            style={{ backgroundColor: priority.levelBg }}
                          >
                            <Text
                              className="text-xs font-bold"
                              style={{ color: priority.levelText }}
                            >
                              {priority.levelLabel}
                            </Text>
                          </View>
                          <View
                            className="rounded-full px-3 py-1"
                            style={{ backgroundColor: priority.pointBg }}
                          >
                            <Text
                              className="text-xs font-bold"
                              style={{ color: priority.pointText }}
                            >
                              {priority.pointLabel}
                            </Text>
                          </View>
                        </View>

                        <View className="mt-2 flex-row flex-wrap gap-2">
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
                          {currentMissionForUi?.rescueBatchItemId ===
                          item.rescueBatchItemId ? (
                            <View className="rounded-full bg-green-100 px-3 py-1">
                              <Text className="text-xs font-bold text-green-700">
                                Hiện tại
                              </Text>
                            </View>
                          ) : null}
                        </View>

                        <Text
                          className="mt-3 text-sm"
                          style={{ color: colors.textSecondary }}
                        >
                          Địa chỉ: {item.address || 'Chưa có địa chỉ'}
                        </Text>
                        <Text
                          className="mt-1 text-sm"
                          style={{ color: colors.textSecondary }}
                        >
                          Xe sử dụng: {getVehicleLabel(item)}
                        </Text>
                        <Text
                          className="mt-2 text-sm font-medium"
                          style={{ color: colors.text }}
                        >
                          Khoảng cách: {formatDistanceKm(item.distanceKm)} km •{' '}
                          {formatMinutes(item.estimatedMinutes)} phút
                        </Text>

                        <View className="mt-2 gap-1.5">
                          <Text
                            className="text-xs font-semibold"
                            style={{ color: colors.textSecondary }}
                          >
                            Tin nhắn:
                          </Text>
                          <Text
                            className="text-base font-bold"
                            style={{ color: colors.text }}
                          >
                            {getMissionMessage(item)}
                          </Text>
                        </View>

                        <View className="mt-3 flex-row items-center justify-between">
                          <View className="flex-1 pr-3">
                            <Text
                              className="text-sm"
                              style={{ color: colors.textSecondary }}
                            >
                              Tên nạn nhân:{' '}
                              <Text
                                className="font-semibold"
                                style={{ color: colors.text }}
                              >
                                {item.reporterFullName || 'Người báo tin'}
                              </Text>
                            </Text>
                            <Text
                              className="mt-1 text-sm"
                              style={{ color: colors.textSecondary }}
                            >
                              Số điện thoại:{' '}
                              <Text style={{ color: colors.text }}>
                                {item.reporterPhone || 'Không có số điện thoại'}
                              </Text>
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() =>
                              rescueTeamService.openCallReporter(
                                item.reporterPhone,
                              )
                            }
                            className="h-10 w-10 items-center justify-center rounded-full"
                            style={{ backgroundColor: colors.surface }}
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
                            className="flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3"
                            style={{ backgroundColor: colors.primary }}
                          >
                            <Ionicons
                              name="navigate-outline"
                              size={18}
                              color="#fff"
                            />
                            <Text className="font-bold text-white">
                              Dẫn đường
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() =>
                              rescueTeamService.openExternalNavigation(item)
                            }
                            className="flex-row items-center justify-center rounded-xl border px-4 py-3"
                            style={{ borderColor: colors.border }}
                          >
                            <Ionicons
                              name="map-outline"
                              size={18}
                              color={colors.primary}
                            />
                          </TouchableOpacity>
                        </View>

                        {currentMissionForUi?.rescueBatchItemId ===
                        item.rescueBatchItemId
                          ? renderLeaderMissionActions(item)
                          : null}
                      </View>
                    );
                  })
                ) : (
                  <View
                    className="rounded-2xl border p-4"
                    style={{
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                    }}
                  >
                    <Text style={{ color: colors.textSecondary }}>
                      Không có nhiệm vụ phù hợp.
                    </Text>
                  </View>
                )}
              </View>
            ) : null}

            {historyBatchesWithPriority.length > 0 &&
            filter !== 'in-progress' &&
            filter !== 'pending' ? (
              <View className={displayBatch ? 'mt-6 gap-5' : 'mt-4 gap-5'}>
                <Text
                  className="text-base font-bold"
                  style={{ color: colors.text }}
                >
                  Lịch sử đã xử lý
                </Text>

                {filteredHistoryBatchesWithPriority.map((historyBatch) => {
                  const historyItems = historyBatch.filteredItems;
                  return (
                    <View key={historyBatch.rescueBatchId} className="gap-3">
                      <View
                        className="rounded-2xl px-4 py-3"
                        style={{ backgroundColor: colors.surface }}
                      >
                        <Text
                          className="text-xs"
                          style={{ color: colors.textSecondary }}
                        >
                          {new Date(historyBatch.createdAt).toLocaleString(
                            'vi-VN',
                          )}{' '}
                          • {historyBatch.items.length} nhiệm vụ
                        </Text>
                      </View>

                      {historyItems.map((item) => {
                        const type = typeBadge(item.rescueRequestType);
                        const status = statusBadge(
                          getMissionDisplayStatus(item) || undefined,
                        );
                        const priority = priorityBadge(
                          item.priorityPoint,
                          item.priorityLevel,
                        );

                        return (
                          <View
                            key={item.rescueBatchItemId}
                            className="rounded-2xl border p-4"
                            style={{
                              borderColor: colors.border,
                              backgroundColor: colors.card,
                            }}
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
                                style={{ backgroundColor: priority.levelBg }}
                              >
                                <Text
                                  className="text-xs font-bold"
                                  style={{ color: priority.levelText }}
                                >
                                  {priority.levelLabel}
                                </Text>
                              </View>
                              <View
                                className="rounded-full px-3 py-1"
                                style={{ backgroundColor: priority.pointBg }}
                              >
                                <Text
                                  className="text-xs font-bold"
                                  style={{ color: priority.pointText }}
                                >
                                  {priority.pointLabel}
                                </Text>
                              </View>
                            </View>

                            <View className="mt-2 flex-row flex-wrap gap-2">
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
                              {currentMissionForUi?.rescueBatchItemId ===
                              item.rescueBatchItemId ? (
                                <View className="rounded-full bg-green-100 px-3 py-1">
                                  <Text className="text-xs font-bold text-green-700">
                                    Hiện tại
                                  </Text>
                                </View>
                              ) : null}
                            </View>

                            <View className="mt-3 gap-1.5">
                              <Text
                                className="text-sm"
                                style={{ color: colors.textSecondary }}
                              >
                                Địa chỉ: {item.address || 'Chưa có địa chỉ'}
                              </Text>
                              <Text
                                className="text-sm"
                                style={{ color: colors.textSecondary }}
                              >
                                Xe đã dùng: {getVehicleLabel(item)}
                              </Text>

                              <View className="mt-2 gap-1.5">
                                <Text
                                  className="text-xs font-semibold"
                                  style={{ color: colors.textSecondary }}
                                >
                                  Tin nhắn:
                                </Text>
                                <Text
                                  className="text-base font-bold"
                                  style={{ color: colors.text }}
                                  numberOfLines={3}
                                >
                                  {getMissionMessage(item)}
                                </Text>
                              </View>
                            </View>

                            <View className="mt-3 flex-row items-center justify-between">
                              <View className="flex-1 pr-3">
                                <Text
                                  className="text-sm"
                                  style={{ color: colors.textSecondary }}
                                >
                                  Tên nạn nhân:{' '}
                                  <Text
                                    className="font-semibold"
                                    style={{ color: colors.text }}
                                  >
                                    {item.reporterFullName || 'Người báo tin'}
                                  </Text>
                                </Text>
                                <Text
                                  className="mt-1 text-sm"
                                  style={{ color: colors.textSecondary }}
                                >
                                  Số điện thoại:{' '}
                                  <Text style={{ color: colors.text }}>
                                    {item.reporterPhone ||
                                      'Không có số điện thoại'}
                                  </Text>
                                </Text>
                              </View>
                              <TouchableOpacity
                                onPress={() => callReporter(item.reporterPhone)}
                                className="h-10 w-10 items-center justify-center rounded-full"
                                style={{ backgroundColor: colors.surface }}
                              >
                                <Ionicons
                                  name="call-outline"
                                  size={18}
                                  color={colors.primary}
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  );
                })}
              </View>
            ) : null}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function MetaBadge({
  icon,
  label,
  bg,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  bg: string;
  text: string;
}) {
  return (
    <View
      className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
      style={{ backgroundColor: bg }}
    >
      <Ionicons name={icon} size={14} color={text} />
      <Text className="text-xs font-semibold" style={{ color: text }}>
        {label}
      </Text>
    </View>
  );
}

function StepGroup({
  currentStatus,
  disabled,
  onSelect,
}: {
  currentStatus: string;
  disabled?: boolean;
  onSelect: (status: 2 | 3) => void;
}) {
  const { colors } = useTheme();
  const steps = [
    {
      status: 2 as const,
      short: 'Đang di chuyển',
      label: '',
      icon: 'navigate-outline' as const,
    },
    {
      status: 3 as const,
      short: 'Đang cứu hộ',
      label: '',
      icon: 'medkit-outline' as const,
    },
  ];

  return (
    <View
      className="overflow-hidden rounded-2xl border"
      style={{ borderColor: colors.border }}
    >
      <View className="flex-row">
        {steps.map((step, index) => {
          const isActive = currentStatus
            .toLowerCase()
            .includes(step.status === 2 ? 'enroute' : 'rescuing');
          const backgroundColor = isActive
            ? `${colors.primary}18`
            : colors.card;
          const textColor = isActive ? colors.primary : colors.textSecondary;
          return (
            <TouchableOpacity
              key={step.status}
              onPress={() => onSelect(step.status)}
              disabled={disabled}
              className="flex-1 items-center justify-center px-2 py-4"
              style={{
                backgroundColor,
                opacity: disabled ? 0.6 : 1,
                borderRightWidth: index < steps.length - 1 ? 1 : 0,
                borderRightColor: colors.border,
              }}
            >
              <Ionicons name={step.icon} size={18} color={textColor} />
              <Text
                className="mt-2 text-center text-xs font-bold"
                style={{ color: textColor }}
              >
                {step.short}
              </Text>
              <Text
                className="mt-1 text-center text-[11px]"
                style={{ color: textColor }}
              >
                {step.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function FallbackMapPreview({
  batch,
  selectedMission,
  routeCoordinates,
  colors,
}: {
  batch: RescueActiveBatchResponse | null;
  selectedMission: RescueBatchItem | null;
  routeCoordinates: [number, number][];
  colors: any;
}) {
  const markers = (batch?.items ?? [])
    .map((item) => {
      const coordinate = rescueTeamService.toMapCoordinate(item);
      if (!coordinate) return null;
      const emergency = item.rescueRequestType === 'Emergency';
      return {
        id: item.rescueBatchItemId,
        coordinate,
        color: emergency ? colors.error : colors.info,
        size: 14,
      };
    })
    .filter(Boolean) as {
    id: string;
    coordinate: [number, number];
    color: string;
    size?: number;
  }[];

  const center =
    (selectedMission && rescueTeamService.toMapCoordinate(selectedMission)) ||
    markers[0]?.coordinate ||
    ([106.629, 10.724] as const);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.surface }}>
      <WebViewMap
        center={center}
        zoom={13}
        markers={markers}
        routeCoordinates={routeCoordinates}
        routeColor={colors.info}
        style={{ flex: 1 }}
      />
    </View>
  );
}


