import '@/global.css';
import AppBottomSheet from '@/src/components/common/AppBottomSheet';
import ImageUploader from '@/src/components/common/ImageUploader';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import WebViewMap from '@/src/components/common/WebViewMap';
import { useTheme } from '@/src/context/ThemeContext';
import { useTeamTasksController } from '@/src/hooks/useTeamTasksController';
import {
  RescueActiveBatchResponse,
  RescueBatchItem as BaseRescueBatchItem,
  rescueTeamService,
} from '@/src/services/rescueTeamService';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  priorityLevel?: number | null;
};

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

export default function TeamTasksScreen({ onBack }: TeamTasksScreenProps) {
  const { bottom } = useSafeAreaInsets();
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
    openMapScreen,
    resetLeaderForms,
    currentMissionForUi,
    pickLeaderImages,
    submitProgressUpdate,
    submitCompleteMission,
    heartbeatStatusLabel,
    debugTrackingLines,
    activeActionMission,
  } = useTeamTasksController();

  const filteredItemsWithPriority = filteredItems as RescueBatchItem[];
  const historyBatchesWithPriority = historyBatches as Array<
    RescueActiveBatchResponse & { items: RescueBatchItem[] }
  >;

  const statusBadge = (status?: string) => {
    const normalized = String(status ?? '').toLowerCase();
    if (normalized === 'inprogress') {
      return { bg: `${colors.status.inProgress}22`, text: colors.status.inProgress, label: 'Đang làm' };
    }
    if (normalized === 'pending') {
      return { bg: `${colors.status.pending}22`, text: colors.status.pending, label: 'Chờ xử lý' };
    }
    if (normalized === 'done' || normalized === 'rescuecompleted') {
      return { bg: `${colors.status.completed}22`, text: colors.status.completed, label: 'Đã xong' };
    }
    if (normalized === 'enroute') {
      return { bg: `${colors.status.incoming}22`, text: colors.status.incoming, label: 'Đang di chuyển' };
    }
    if (normalized === 'rescuing') {
      return { bg: `${colors.status.incoming}22`, text: colors.status.incoming, label: 'Đang cứu hộ' };
    }
    if (normalized === 'closed' || normalized === 'cancelled') {
      return { bg: `${colors.status.cancelled}22`, text: colors.status.cancelled, label: 'Đã đóng' };
    }
    return { bg: colors.surface, text: colors.textSecondary, label: status || 'Khác' };
  };

  const typeBadge = (type?: string | null) => {
    const normalized = String(type ?? '').toLowerCase();
    if (normalized === 'emergency') {
      return { bg: `${colors.status.error}22`, text: colors.status.error, label: 'Khẩn cấp' };
    }
    return { bg: `${colors.status.incoming}22`, text: colors.status.incoming, label: 'Bình thường' };
  };

  const priorityBadge = (point?: number | null, level?: number | null) => ({
    pointLabel: `Điểm ưu tiên: ${point ?? 0}`,
    levelLabel: `Mức ưu tiên: ${getPriorityLevelLabel(level)}`,
    levelBg:
      level === 3
        ? '#FEE2E2'
        : level === 2
          ? '#FDE68A'
          : level === 1
            ? '#DBEAFE'
            : '#ECFCCB',
    levelText:
      level === 3
        ? '#B91C1C'
        : level === 2
          ? '#92400E'
          : level === 1
            ? '#1D4ED8'
            : '#3F6212',
    pointBg:
      (point ?? 0) >= 80
        ? '#FEE2E2'
        : (point ?? 0) >= 50
          ? '#FEF3C7'
          : '#F1F5F9',
    pointText:
      (point ?? 0) >= 80
        ? '#B91C1C'
        : (point ?? 0) >= 50
          ? '#92400E'
          : '#334155',
  });

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
            <Text className="text-center font-bold text-white">Cập nhật tiến độ</Text>
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
            <Text className="text-center font-bold" style={{ color: colors.text }}>
              Hoàn thành
            </Text>
          </TouchableOpacity>
        </View>

        {leaderActionMode ? (
          <View className="mt-4 rounded-2xl p-4" style={{ backgroundColor: colors.surface }}>
            <Text className="text-sm font-semibold" style={{ color: colors.text }}>
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
                    <Text className="text-sm" style={{ color: colors.textSecondary }}>
                      Đang upload ảnh minh chứng...
                    </Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  onPress={() => submitCompleteMission(mission)}
                  disabled={actionSubmitting || uploadingImages || leaderImages.length === 0}
                  className="mt-4 rounded-xl px-4 py-3"
                  style={{
                    backgroundColor: colors.primary,
                    opacity:
                      actionSubmitting || uploadingImages || leaderImages.length === 0
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

            <TouchableOpacity onPress={resetLeaderForms} className="mt-3 self-end">
              <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
                Đóng panel
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
          rightAction={
            selectedMission ? (
              <View className="items-end">
                {heartbeatStatusLabel ? (
                  <View
                    className="mb-1 rounded-full px-3 py-1"
                    style={{
                      backgroundColor: lastHeartbeatError
                        ? `${colors.error}22`
                        : isSyncingEta
                          ? `${colors.info}22`
                          : `${colors.success}22`,
                    }}
                  >
                    <Text
                      className="text-[10px] font-semibold"
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
            ) : undefined
          }
        />

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
              <AppBottomSheet open snapPoints={['50%', '82%']}>
                <Text className="text-xl font-bold" style={{ color: colors.text }}>
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
                    label={statusBadge(getMissionDisplayStatus(selectedMission) || undefined).label}
                    bg={statusBadge(getMissionDisplayStatus(selectedMission) || undefined).bg}
                    text={statusBadge(getMissionDisplayStatus(selectedMission) || undefined).text}
                  />
                </View>

                <View className="mt-4 flex-row gap-3">
                  <TouchableOpacity
                    onPress={() =>
                      rescueTeamService.openCallReporter(selectedMission.reporterPhone)
                    }
                    className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border py-3"
                    style={{ borderColor: colors.border }}
                  >
                    <Ionicons name="call-outline" size={18} color={colors.primary} />
                    <Text className="font-semibold" style={{ color: colors.text }}>
                      Gọi người báo tin
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => rescueTeamService.openExternalNavigation(selectedMission)}
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

                <View className="mt-4 rounded-2xl p-3" style={{ backgroundColor: colors.text }}>
                  {debugTrackingLines.map((line) => (
                    <Text
                      key={line}
                      className="text-[11px] leading-5"
                      style={{ color: colors.background }}
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
            <Ionicons name="map-outline" size={34} color={colors.textSecondary} />
            <Text className="mt-4 text-center text-base" style={{ color: colors.textSecondary }}>
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
            onPress={() => openMapScreen(selectedMission || currentMissionForUi)}
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
          <Ionicons name="alert-circle-outline" size={34} color={colors.error} />
          <Text className="mt-4 text-center text-xl font-bold" style={{ color: colors.text }}>
            Không tải được dữ liệu nhiệm vụ.
          </Text>
          <Text className="mt-2 text-center text-base" style={{ color: colors.textSecondary }}>
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
          <Ionicons name="file-tray-outline" size={34} color={colors.textSecondary} />
          <Text className="mt-4 text-center text-xl font-bold" style={{ color: colors.text }}>
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
          contentContainerStyle={{ paddingBottom: bottom + 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} />
          }
        >
          <View className="px-4 pt-4">
            <View className="rounded-3xl p-5" style={{ backgroundColor: colors.secondary }}>
              <Text className="text-2xl font-bold text-white">
                {teamName || team?.name || 'Nhóm hiện tại'}
              </Text>
              <Text className="mt-2 text-sm text-white/80">
                {summary.total} nhiệm vụ • {summary.emergencyCount} khẩn cấp
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

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
              <View className="flex-row gap-2">
                {FILTER_OPTIONS.map((option) => {
                  const active = filter === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => setFilter(option.value)}
                      className="rounded-full px-4 py-2"
                      style={{ backgroundColor: active ? colors.primary : colors.surface }}
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
                {filteredItemsWithPriority.map((item) => {
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
                      style={{ borderColor: colors.border, backgroundColor: colors.card }}
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
                        {currentMissionForUi?.rescueBatchItemId ===
                        item.rescueBatchItemId ? (
                          <View className="rounded-full bg-green-100 px-3 py-1">
                            <Text className="text-xs font-bold text-green-700">
                              Hiện tại
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      <Text className="mt-3 text-base font-bold" style={{ color: colors.text }}>
                        {item.description}
                      </Text>
                      <Text className="mt-2 text-sm" style={{ color: colors.textSecondary }}>
                        {item.address}
                      </Text>
                      <Text className="mt-2 text-sm font-medium" style={{ color: colors.text }}>
                        {formatDistanceKm(item.distanceKm)} km • {formatMinutes(item.estimatedMinutes)} phút
                      </Text>

                      <View className="mt-3 flex-row items-center justify-between">
                        <View className="flex-1 pr-3">
                          <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                            {item.reporterFullName || 'Người báo tin'}
                          </Text>
                          <Text className="text-sm" style={{ color: colors.textSecondary }}>
                            {item.reporterPhone || 'Không có số điện thoại'}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => rescueTeamService.openCallReporter(item.reporterPhone)}
                          className="h-10 w-10 items-center justify-center rounded-full"
                          style={{ backgroundColor: colors.surface }}
                        >
                          <Ionicons name="call-outline" size={18} color={colors.primary} />
                        </TouchableOpacity>
                      </View>

                      <View className="mt-4 flex-row gap-3">
                        <TouchableOpacity
                          onPress={() => openMapScreen(item)}
                          className="flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3"
                          style={{ backgroundColor: colors.primary }}
                        >
                          <Ionicons name="navigate-outline" size={18} color="#fff" />
                          <Text className="font-bold text-white">Dẫn đường</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => rescueTeamService.openExternalNavigation(item)}
                          className="flex-row items-center justify-center rounded-xl border px-4 py-3"
                          style={{ borderColor: colors.border }}
                        >
                          <Ionicons name="map-outline" size={18} color={colors.primary} />
                        </TouchableOpacity>
                      </View>

                      {currentMissionForUi?.rescueBatchItemId === item.rescueBatchItemId
                        ? renderLeaderMissionActions(item)
                        : null}
                    </View>
                  );
                })}
              </View>
            ) : (
              <View className="mt-4 gap-5">
                {historyBatchesWithPriority.map((historyBatch) => {
                  const historyItems = rescueTeamService.getFilteredItems(
                    historyBatch.items,
                    filter,
                  ) as RescueBatchItem[];

                  if (historyItems.length === 0) return null;

                  return (
                    <View key={historyBatch.rescueBatchId} className="gap-3">
                      <View className="rounded-2xl bg-slate-100 px-4 py-3">
                        <Text className="text-sm font-bold text-text-primary">
                          Batch {historyBatch.rescueBatchId.slice(0, 8)}
                        </Text>
                        <Text className="mt-1 text-xs text-text-secondary">
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

                            <View className="mt-3 flex-row items-center justify-between">
                              <View className="flex-1 pr-3">
                                <Text className="text-sm font-semibold text-text-primary">
                                  {item.reporterFullName || 'Người báo tin'}
                                </Text>
                                <Text className="text-sm text-text-secondary">
                                  {item.reporterPhone ||
                                    'Không có số điện thoại'}
                                </Text>
                              </View>
                              <TouchableOpacity
                                onPress={() =>
                                  rescueTeamService.openCallReporter(
                                    item.reporterPhone,
                                  )
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
                          </View>
                        );
                      })}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function Badge({ label, bg, text }: { label: string; bg: string; text: string }) {
  return (
    <View className="rounded-full px-3 py-1" style={{ backgroundColor: bg }}>
      <Text className="text-xs font-bold" style={{ color: text }}>
        {label}
      </Text>
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
    <View className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5" style={{ backgroundColor: bg }}>
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
    { status: 2 as const, short: 'Đi', label: 'Đang di chuyển', icon: 'navigate-outline' as const },
    { status: 3 as const, short: 'Làm', label: 'Đang cứu hộ', icon: 'medkit-outline' as const },
  ];

  return (
    <View className="overflow-hidden rounded-2xl border" style={{ borderColor: colors.border }}>
      <View className="flex-row">
        {steps.map((step, index) => {
          const isActive = currentStatus.toLowerCase().includes(step.status === 2 ? 'enroute' : 'rescuing');
          const backgroundColor = isActive ? `${colors.primary}18` : colors.card;
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
              <Text className="mt-2 text-center text-xs font-bold" style={{ color: textColor }}>
                {step.short}
              </Text>
              <Text className="mt-1 text-center text-[11px]" style={{ color: textColor }}>
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
    .filter(Boolean) as Array<{
    id: string;
    coordinate: [number, number];
    color: string;
    size?: number;
  }>;

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
