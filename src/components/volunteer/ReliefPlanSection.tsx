import '@/global.css';
import WebViewMap, { type MapMarker } from '@/src/components/common/WebViewMap';
import { useTheme } from '@/src/context/ThemeContext';
import type { ReliefCampaignPlanSummary } from '@/src/types/reliefDistribution';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ReliefPlanSectionProps = {
  summary?: ReliefCampaignPlanSummary | null;
  isLoading?: boolean;
  onOpenAllocateTask?: () => void;
  onOpenProgress?: (distributionPointId: string) => void;
  onOpenIsolatedFlow?: () => void;
  onOpenAllIsolatedHouseholds?: () => void;
};

export default function ReliefPlanSection({
  summary,
  isLoading,
  onOpenAllocateTask,
  onOpenProgress,
  onOpenIsolatedFlow,
  onOpenAllIsolatedHouseholds,
}: ReliefPlanSectionProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const canAllocate = !!onOpenAllocateTask;
  const canOpenIsolatedFlow = !!onOpenIsolatedFlow;
  const canOpenProgress = !!onOpenProgress;
  const canOpenAllIsolatedHouseholds = !!onOpenAllIsolatedHouseholds;
  const [isFullMapVisible, setIsFullMapVisible] = useState(false);
  const [selectedAreaMarkerId, setSelectedAreaMarkerId] = useState<
    string | null
  >(null);
  const [sheetIndex, setSheetIndex] = useState(0);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const areaMarkerEntries = useMemo(
    () =>
      (summary?.areas ?? [])
        .filter(
          (area) =>
            typeof area.latitude === 'number' &&
            typeof area.longitude === 'number',
        )
        .map((area, index) => {
          const severityScore =
            (area.isolatedHouseholdCount ?? 0) * 20 +
            (area.householdCount ?? 0) * 2 +
            (area.population ?? 0) * 0.1;
          const hasIsolatedHouseholds = (area.isolatedHouseholdCount ?? 0) > 0;
          const isHighPriorityArea =
            (area.isolatedHouseholdCount ?? 0) >= 2 ||
            (area.pendingHouseholds ?? 0) >= 2 ||
            String(area.recommendedOperationalMode || '')
              .toLowerCase()
              .includes('ưu tiên');
          const id = `${area.locationId || area.areaName}-${index}`;

          return {
            id,
            area,
            severityScore,
            marker: {
              id,
              coordinate: [
                area.longitude as number,
                area.latitude as number,
              ] as [number, number],
              color: !hasIsolatedHouseholds
                ? colors.status.completed
                : isHighPriorityArea
                  ? colors.error
                  : colors.status.pending,
              size: !hasIsolatedHouseholds ? 14 : isHighPriorityArea ? 22 : 18,
            } satisfies MapMarker,
          };
        }),
    [
      colors.error,
      colors.status.completed,
      colors.status.pending,
      summary?.areas,
    ],
  );
  const areaMarkers = useMemo(
    () =>
      areaMarkerEntries.map((entry) =>
        entry.id === selectedAreaMarkerId
          ? {
              ...entry.marker,
              color: colors.secondary,
              size: (entry.marker.size ?? 18) + 8,
            }
          : entry.marker,
      ),
    [areaMarkerEntries, colors.secondary, selectedAreaMarkerId],
  );
  const selectedAreaEntry = useMemo(
    () =>
      areaMarkerEntries.find((entry) => entry.id === selectedAreaMarkerId) ??
      areaMarkerEntries[0] ??
      null,
    [areaMarkerEntries, selectedAreaMarkerId],
  );
  const snapPoints = useMemo(() => ['18%', '50%', '84%'], []);
  const sortedIsolatedHouseholds = useMemo(
    () => [...(summary?.isolatedHouseholdItems ?? [])].sort(
      (a, b) => {
        const scoreA =
          (a.isolationSeverityLevel ?? 0) * 100 +
          (a.floodSeverityLevel ?? 0) * 10 +
          (a.requiresBoat ? 5 : 0) +
          (a.requiresLocalGuide ? 3 : 0) +
          (a.householdSize ?? 0);
        const scoreB =
          (b.isolationSeverityLevel ?? 0) * 100 +
          (b.floodSeverityLevel ?? 0) * 10 +
          (b.requiresBoat ? 5 : 0) +
          (b.requiresLocalGuide ? 3 : 0) +
          (b.householdSize ?? 0);

        return scoreB - scoreA;
      },
    ),
    [summary?.isolatedHouseholdItems],
  );
  const selectedAreaHouseholds = useMemo(() => {
    if (!selectedAreaEntry) return [];

    return sortedIsolatedHouseholds.filter((item) => {
      if (
        typeof item.latitude === 'number' &&
        typeof item.longitude === 'number' &&
        typeof selectedAreaEntry.area.latitude === 'number' &&
        typeof selectedAreaEntry.area.longitude === 'number'
      ) {
        const latDiff = Math.abs(
          item.latitude - selectedAreaEntry.area.latitude,
        );
        const lngDiff = Math.abs(
          item.longitude - selectedAreaEntry.area.longitude,
        );
        if (latDiff <= 0.03 && lngDiff <= 0.03) {
          return true;
        }
      }

      if (selectedAreaEntry.area.locationId && item.locationId) {
        return item.locationId === selectedAreaEntry.area.locationId;
      }

      const normalizedAreaName = selectedAreaEntry.area.areaName
        .replace(/Cụm tọa độ\s*/i, '')
        .replace(/\(.+?\)/g, '')
        .trim();

      return normalizedAreaName
        ? item.address?.includes(normalizedAreaName)
        : false;
    });
  }, [selectedAreaEntry, sortedIsolatedHouseholds]);

  if (isLoading) {
    return (
      <View
        className="items-center rounded-2xl border p-5"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
      >
        <ActivityIndicator color={colors.primary} />
        <Text className="mt-3 text-sm" style={{ color: colors.textSecondary }}>
          Đang tải kế hoạch cứu trợ...
        </Text>
      </View>
    );
  }

  if (!summary) {
    return (
      <View
        className="rounded-2xl border border-dashed p-5"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
      >
        <Text className="text-lg font-bold" style={{ color: colors.text }}>
          Kế hoạch cứu trợ
        </Text>
        <Text className="mt-2 text-sm" style={{ color: colors.textSecondary }}>
          Chưa có dữ liệu kế hoạch cứu trợ. Bạn vẫn có thể theo dõi công việc,
          điểm phát và tồn kho ở các tab còn lại.
        </Text>
      </View>
    );
  }

  const openAreaMap = async (
    latitude?: number | null,
    longitude?: number | null,
    areaName?: string,
  ) => {
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return;
    }

    const label = encodeURIComponent(areaName || 'Khu vực ưu tiên');
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}%20(${label})`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  };

  const mapCenter: [number, number] = areaMarkers.length
    ? areaMarkers[0].coordinate
    : [106.629, 10.724];

  const handleOpenFullMap = () => {
    if (!areaMarkerEntries.length) return;
    setSelectedAreaMarkerId((current) => current || areaMarkerEntries[0].id);
    setSheetIndex(0);
    setIsFullMapVisible(true);
  };

  const handleSelectAreaMarker = (markerId: string) => {
    setSelectedAreaMarkerId(markerId);
    bottomSheetRef.current?.snapToIndex(1);
  };

  const selectedAreaBadge = selectedAreaEntry
    ? selectedAreaEntry.area.isolatedHouseholdCount === 0
      ? {
          label: 'Không có hộ cô lập',
          color: colors.status.completed,
          bg: `${colors.status.completed}18`,
        }
      : (selectedAreaEntry.area.isolatedHouseholdCount ?? 0) >= 2 ||
          (selectedAreaEntry.area.pendingHouseholds ?? 0) >= 2 ||
          String(selectedAreaEntry.area.recommendedOperationalMode || '')
            .toLowerCase()
            .includes('ưu tiên')
        ? {
            label: 'Nguy cấp cao',
            color: colors.error,
            bg: `${colors.error}18`,
          }
        : {
            label: 'Ưu tiên trung bình',
            color: colors.status.pending,
            bg: `${colors.status.pending}18`,
          }
    : null;

  return (
    <View className="gap-4">
      <View
        className="rounded-2xl border p-4"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
      >
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1">
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              Kế hoạch cứu trợ dự kiến
            </Text>
            <Text
              className="mt-1 text-sm"
              style={{ color: colors.textSecondary }}
            >
              Tóm tắt nhu cầu theo campaign để điều phối hộ cô lập, điểm phát,
              nhân lực và thiết bị.
            </Text>
          </View>
          {canAllocate ? (
            <TouchableOpacity
              onPress={onOpenAllocateTask}
              className="rounded-xl px-3 py-2"
              style={{
                backgroundColor: `${colors.primary}14`,
                borderWidth: 1,
                borderColor: `${colors.primary}30`,
              }}
            >
              <Text
                className="text-sm font-bold"
                style={{ color: colors.primary }}
              >
                Phân công
              </Text>
            </TouchableOpacity>
          ) : (
            <View
              className="rounded-xl px-3 py-2"
              style={{ backgroundColor: `${colors.border}35` }}
            >
              <Text
                className="text-sm font-bold"
                style={{ color: colors.textSecondary }}
              >
                Theo dõi kế hoạch
              </Text>
            </View>
          )}
        </View>

        <View className="mt-4 gap-3">
          <View
            className="rounded-xl border p-3"
            style={{
              borderColor: `${colors.primary}24`,
              backgroundColor: `${colors.primary}08`,
            }}
          >
            <Text
              className="text-sm font-bold"
              style={{ color: colors.primary }}
            >
              Cách tổ chức 1 - Hộ không cô lập / Nhận tại điểm
            </Text>
            <Text
              className="mt-1 text-xs"
              style={{ color: colors.textSecondary }}
            >
              Đội tập trung vào điểm phát, ca trực, hàng chờ phát và điều phối
              người tại điểm nhận hàng.
            </Text>
          </View>
          <View
            className="rounded-xl border p-3"
            style={{
              borderColor: `${colors.status.pending}24`,
              backgroundColor: `${colors.status.pending}08`,
            }}
          >
            <Text
              className="text-sm font-bold"
              style={{ color: colors.status.pending }}
            >
              Cách tổ chức 2 - Hộ cô lập / Giao tận nơi
            </Text>
            <Text
              className="mt-1 text-xs"
              style={{ color: colors.textSecondary }}
            >
              Đội cơ động tập trung vào tuyến tiếp cận, độ ngập, xuồng, áo phao
              và người dẫn đường cho các hộ cô lập.
            </Text>
            {canOpenIsolatedFlow ? (
              <TouchableOpacity
                onPress={onOpenIsolatedFlow}
                className="mt-3 self-start rounded-lg px-3 py-2"
                style={{ backgroundColor: `${colors.status.pending}18` }}
              >
                <Text
                  className="text-xs font-bold"
                  style={{ color: colors.status.pending }}
                >
                  Mở tuyến hộ cô lập
                </Text>
              </TouchableOpacity>
            ) : (
              <Text
                className="mt-3 text-xs font-semibold"
                style={{ color: colors.status.pending }}
              >
                Chế độ xem: chỉ theo dõi tuyến hộ cô lập.
              </Text>
            )}
          </View>
        </View>

        <View className="mt-4 flex-row flex-wrap gap-3">
          <PlanChip
            label="Tổng hộ"
            value={summary.totalHouseholds}
            colors={colors}
          />
          <PlanChip
            label="Hộ cô lập"
            value={summary.isolatedHouseholds}
            colors={colors}
            tone="danger"
          />
          <PlanChip
            label="Khu vực"
            value={summary.areas.length}
            colors={colors}
          />
          <PlanChip
            label="Điểm phát"
            value={summary.distributionPointCount}
            colors={colors}
          />
          <PlanChip
            label="Số đội gợi ý"
            value={summary.suggestedTeamCount}
            colors={colors}
            tone="secondary"
          />
          <PlanChip
            label="Nhân lực"
            value={summary.estimatedReliefPersonnel}
            colors={colors}
          />
          <PlanChip
            label="TNV địa phương"
            value={summary.estimatedLocalVolunteers}
            colors={colors}
          />
          <PlanChip
            label="Xuồng"
            value={summary.estimatedBoatCount}
            colors={colors}
          />
          <PlanChip
            label="Áo phao"
            value={summary.estimatedLifeJacketCount}
            colors={colors}
          />
          <PlanChip
            label="Mật độ TB"
            value={Math.round(summary.averagePopulationDensity)}
            colors={colors}
          />
          <PlanChip
            label="Vùng cơ động"
            value={summary.mobileTeamPriorityAreaCount}
            colors={colors}
            tone="danger"
          />
          <PlanChip
            label="Vùng điểm phát"
            value={summary.pickupPriorityAreaCount}
            colors={colors}
          />
        </View>
      </View>

      <View
        className="rounded-2xl border p-4"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
      >
        <Text className="text-base font-bold" style={{ color: colors.text }}>
          Khu vực ưu tiên
        </Text>
        {areaMarkers.length > 0 ? (
          <View
            className="mt-3 overflow-hidden rounded-2xl border"
            style={{ borderColor: colors.border }}
          >
            <WebViewMap
              center={mapCenter}
              zoom={11}
              markers={areaMarkers}
              height={220}
              onMarkerPress={handleSelectAreaMarker}
            />
          </View>
        ) : (
          <View
            className="mt-3 rounded-2xl border border-dashed p-4"
            style={{ borderColor: colors.border }}
          >
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              Chưa có tọa độ để hiển thị bản đồ khu vực ưu tiên.
            </Text>
          </View>
        )}
        <View
          className="mt-3 rounded-2xl border p-3"
          style={{
            borderColor: colors.border,
            backgroundColor: `${colors.primary}06`,
          }}
        >
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text
                className="text-sm font-bold"
                style={{ color: colors.text }}
              >
                Bản đồ khu vực ưu tiên
              </Text>
              <Text
                className="mt-1 text-xs"
                style={{ color: colors.textSecondary }}
              >
                Marker hiển thị trực tiếp các cụm hộ cô lập theo tọa độ. Màu đỏ
                là cụm ưu tiên cao, màu cảnh báo là mức trung bình.
              </Text>
            </View>
            {areaMarkers.length > 0 ? (
              <View
                className="rounded-full px-2.5 py-1"
                style={{ backgroundColor: `${colors.status.pending}18` }}
              >
                <Text
                  className="text-xs font-bold"
                  style={{ color: colors.status.pending }}
                >
                  {areaMarkers.length} cụm hộ cô lập
                </Text>
              </View>
            ) : null}
          </View>
          <View className="mt-3 flex-row flex-wrap gap-2">
            <LegendDot
              color={colors.error}
              label="Cụm nguy cấp cao"
              colors={colors}
            />
            <LegendDot
              color={colors.status.pending}
              label="Cụm ưu tiên trung bình"
              colors={colors}
            />
            <LegendDot
              color={colors.status.completed}
              label="Cụm không có hộ cô lập"
              colors={colors}
            />
          </View>
          {areaMarkers.length > 0 ? (
            <TouchableOpacity
              onPress={handleOpenFullMap}
              className="mt-3 flex-row items-center self-start rounded-full px-3 py-2"
              style={{
                backgroundColor: `${colors.primary}16`,
                borderWidth: 1,
                borderColor: `${colors.primary}28`,
              }}
            >
              <View
                className="mr-2 h-6 w-6 items-center justify-center rounded-full"
                style={{ backgroundColor: `${colors.primary}22` }}
              >
                <Ionicons name="map" size={14} color={colors.primary} />
              </View>
              <Text
                className="text-xs font-bold"
                style={{ color: colors.primary }}
              >
                Mở bản đồ toàn màn hình
              </Text>
            </TouchableOpacity>
          ) : null}
          {selectedAreaEntry ? (
            <View
              className="mt-3 rounded-xl border p-3"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.card,
              }}
            >
              <Text
                className="text-sm font-bold"
                style={{ color: colors.text }}
              >
                {selectedAreaEntry.area.areaName}
              </Text>
              <Text
                className="mt-1 text-xs"
                style={{ color: colors.textSecondary }}
              >
                {selectedAreaEntry.area.householdCount} hộ ·{' '}
                {selectedAreaEntry.area.population} người ·{' '}
                {selectedAreaEntry.area.isolatedHouseholdCount} hộ cô lập
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View
        className="rounded-2xl border p-4"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
      >
        <View className="flex-row items-center justify-between gap-3">
          <Text className="text-base font-bold" style={{ color: colors.text }}>
            Hộ cô lập ưu tiên
          </Text>
          {canOpenAllIsolatedHouseholds ? (
            <TouchableOpacity
              onPress={onOpenAllIsolatedHouseholds}
              className="rounded-full px-3 py-2"
              style={{
                backgroundColor: `${colors.status.pending}14`,
                borderWidth: 1,
                borderColor: `${colors.status.pending}30`,
              }}
            >
              <Text
                className="text-xs font-bold"
                style={{ color: colors.status.pending }}
              >
                Xem tất cả hộ cô lập
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
        {sortedIsolatedHouseholds.length > 0 ? (
          <Text
            className="mt-2 text-xs"
            style={{ color: colors.textSecondary }}
          >
            Danh sách hộ cô lập được ưu tiên sắp xếp theo mức nguy cấp. Bản đồ
            phía trên đang hiển thị theo cụm/khu vực ưu tiên.
          </Text>
        ) : (
          <Text className="mt-3" style={{ color: colors.textSecondary }}>
            Không có hộ cô lập trong chiến dịch này.
          </Text>
        )}
      </View>

      <View
        className="rounded-2xl border p-4"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
      >
        <Text className="text-base font-bold" style={{ color: colors.text }}>
          Điểm phát hàng
        </Text>
        <View className="mt-3 gap-3">
          {summary.distributionPoints.length > 0 ? (
            summary.distributionPoints.map((point) => (
              <TouchableOpacity
                key={point.distributionPointId}
                disabled={!canOpenProgress}
                onPress={() => onOpenProgress?.(point.distributionPointId)}
                className="rounded-xl border p-3"
                style={{ borderColor: colors.border }}
              >
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="font-bold" style={{ color: colors.text }}>
                      {point.name}
                    </Text>
                    <Text
                      className="mt-1 text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      {point.address || 'Dang lay dia chi'}
                    </Text>
                  </View>
                  <Ionicons
                    name={canOpenProgress ? 'arrow-forward' : 'eye-outline'}
                    size={18}
                    color={
                      canOpenProgress ? colors.primary : colors.textSecondary
                    }
                  />
                </View>
                <View className="mt-3 flex-row flex-wrap gap-2">
                  <Pill
                    text={`${point.assignedHouseholdCount} hộ`}
                    colors={colors}
                  />
                  <Pill
                    text={`${point.pendingDeliveryCount} chờ phát`}
                    colors={colors}
                  />
                  <Pill
                    text={`${point.suggestedPersonnelCount} nhân lực`}
                    colors={colors}
                  />
                  <Pill
                    text={`${point.suggestedLocalVolunteerCount} TNV địa phương`}
                    colors={colors}
                  />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={{ color: colors.textSecondary }}>
              Chưa có điểm phát trong campaign.
            </Text>
          )}
        </View>
      </View>

      <View
        className="rounded-2xl border p-4"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
      >
        <Text className="text-base font-bold" style={{ color: colors.text }}>
          Nhu cầu nguồn lực
        </Text>
        <View className="mt-3 gap-3">
          {summary.resourceRequirements.length > 0 ? (
            summary.resourceRequirements.map((item, index) => (
              <View
                key={`${item.resourceType}-${item.resourceName}-${index}`}
                className="rounded-xl border p-3"
                style={{ borderColor: colors.border }}
              >
                <View className="flex-row items-center justify-between gap-3">
                  <View className="flex-1">
                    <Text
                      className="font-semibold"
                      style={{ color: colors.text }}
                    >
                      {item.resourceName}
                    </Text>
                    <Text
                      className="mt-1 text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      {item.resourceType}
                    </Text>
                  </View>
                  <Text
                    className="text-lg font-bold"
                    style={{ color: colors.primary }}
                  >
                    {item.estimatedQuantity}
                  </Text>
                </View>
                {item.notes ? (
                  <Text
                    className="mt-2 text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    {item.notes}
                  </Text>
                ) : null}
              </View>
            ))
          ) : (
            <Text style={{ color: colors.textSecondary }}>
              Chưa có dữ liệu nguồn lực.
            </Text>
          )}
        </View>
      </View>

      <Modal
        visible={isFullMapVisible}
        animationType="slide"
        onRequestClose={() => setIsFullMapVisible(false)}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View
            className="flex-1"
            style={{ backgroundColor: colors.background }}
          >
            <View
              className="flex-row items-center justify-between border-b px-4 pb-3"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.card,
              }}
            >
              <View
                className="flex-1 pr-3"
                style={{ paddingTop: Math.max(insets.top, 12) }}
              >
                <Text
                  className="text-lg font-bold"
                  style={{ color: colors.text }}
                >
                  Bản đồ các hộ cô lập
                </Text>
                <Text
                  className="mt-1 text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  Chạm vào marker để xem đầy đủ thông tin cụm hộ và các hộ liên
                  quan.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsFullMapVisible(false)}
                className="rounded-full px-3 py-2"
                style={{
                  backgroundColor: `${colors.primary}14`,
                  marginTop: Math.max(insets.top, 12),
                }}
              >
                <Text
                  className="text-xs font-bold"
                  style={{ color: colors.primary }}
                >
                  Đóng
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-1">
              <WebViewMap
                center={mapCenter}
                zoom={11}
                markers={areaMarkers}
                height={360}
                style={{ flex: 1 }}
                onMarkerPress={handleSelectAreaMarker}
              />
            </View>

            <BottomSheet
              ref={bottomSheetRef}
              index={sheetIndex}
              snapPoints={snapPoints}
              onChange={setSheetIndex}
              enablePanDownToClose={false}
              topInset={Math.max(insets.top, 12) + 56}
              backgroundStyle={{
                backgroundColor: colors.card,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
              }}
              handleIndicatorStyle={{
                backgroundColor: colors.border,
                width: 48,
              }}
            >
              <BottomSheetScrollView
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingBottom: Math.max(insets.bottom, 16),
                  gap: 12,
                }}
              >
                {selectedAreaEntry ? (
                  <>
                    {selectedAreaBadge ? (
                      <View
                        className="self-start rounded-full px-3 py-1.5"
                        style={{ backgroundColor: selectedAreaBadge.bg }}
                      >
                        <Text
                          className="text-xs font-bold"
                          style={{ color: selectedAreaBadge.color }}
                        >
                          {selectedAreaBadge.label}
                        </Text>
                      </View>
                    ) : null}
                    <View
                      className="rounded-2xl border p-4"
                      style={{ borderColor: colors.border }}
                    >
                      <View className="flex-row items-start justify-between gap-3">
                        <View className="flex-1">
                          <Text
                            className="text-base font-bold"
                            style={{ color: colors.text }}
                          >
                            {selectedAreaEntry.area.areaName}
                          </Text>
                          <Text
                            className="mt-1 text-sm"
                            style={{ color: colors.textSecondary }}
                          >
                            {selectedAreaEntry.area.householdCount} hộ ·{' '}
                            {selectedAreaEntry.area.population} người ·{' '}
                            {selectedAreaEntry.area.isolatedHouseholdCount} hộ
                            cô lập
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() =>
                            openAreaMap(
                              selectedAreaEntry.area.latitude,
                              selectedAreaEntry.area.longitude,
                              selectedAreaEntry.area.areaName,
                            )
                          }
                          className="rounded-full px-3 py-2"
                          style={{ backgroundColor: `${colors.primary}14` }}
                        >
                          <Text
                            className="text-xs font-bold"
                            style={{ color: colors.primary }}
                          >
                            Mở ngoài app
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <Text
                        className="mt-3 text-xs"
                        style={{ color: colors.textSecondary }}
                      >
                        {selectedAreaEntry.area.recommendedOperationalMode} ·{' '}
                        {selectedAreaEntry.area.recommendedDeliveryStrategy}
                      </Text>
                    </View>

                    <Text
                      className="text-sm font-bold"
                      style={{ color: colors.text }}
                    >
                      Các hộ cô lập trong cụm này (
                      {selectedAreaHouseholds.length})
                    </Text>

                    {selectedAreaHouseholds.length > 0 ? (
                      selectedAreaHouseholds.map((item) => (
                        <View
                          key={item.campaignHouseholdId}
                          className="rounded-xl border p-3"
                          style={{ borderColor: colors.border }}
                        >
                          <View className="flex-row items-start justify-between gap-3">
                            <View className="flex-1">
                              <Text
                                className="font-bold"
                                style={{ color: colors.text }}
                              >
                                {item.headOfHouseholdName} ·{' '}
                                {item.householdCode}
                              </Text>
                              <Text
                                className="mt-1 text-sm"
                                style={{ color: colors.textSecondary }}
                              >
                                {item.address || 'Dang lay dia chi'}
                              </Text>
                            </View>
                            <View
                              className="rounded-full px-2.5 py-1"
                              style={{
                                backgroundColor: `${colors.status.pending}18`,
                              }}
                            >
                              <Text
                                className="text-xs font-bold"
                                style={{ color: colors.status.pending }}
                              >
                                {item.priorityLabel}
                              </Text>
                            </View>
                          </View>
                          <View className="mt-3 flex-row flex-wrap gap-2">
                            <Pill
                              text={`${item.householdSize} người`}
                              colors={colors}
                            />
                            <Pill
                              text={item.suggestedSupportMode}
                              colors={colors}
                            />
                            <Pill
                              text={`${item.estimatedReliefPersonnel} nhân lực`}
                              colors={colors}
                            />
                            <Pill
                              text={`${item.estimatedBoatCount} xuồng`}
                              colors={colors}
                            />
                            <Pill
                              text={`${item.estimatedLifeJacketCount} áo phao`}
                              colors={colors}
                            />
                            {item.requiresBoat ? (
                              <Pill text="Cần xuồng" colors={colors} />
                            ) : null}
                            {item.requiresLocalGuide ? (
                              <Pill text="Cần dẫn đường" colors={colors} />
                            ) : null}
                          </View>
                          <Text
                            className="mt-2 text-xs"
                            style={{ color: colors.textSecondary }}
                          >
                            Mức ngập: {item.floodSeverityLevel ?? 0} · Mức cô
                            lập: {item.isolationSeverityLevel ?? 0}
                          </Text>
                          {item.campaignTeamName ? (
                            <Text
                              className="mt-2 text-xs"
                              style={{ color: colors.textSecondary }}
                            >
                              Đội phụ trách: {item.campaignTeamName}
                            </Text>
                          ) : null}
                        </View>
                      ))
                    ) : selectedAreaEntry.area.isolatedHouseholdCount > 0 ? (
                      <View className="gap-3">
                        {[0, 1].map((index) => (
                          <View
                            key={`household-skeleton-${index}`}
                            className="rounded-xl border p-3"
                            style={{ borderColor: colors.border }}
                          >
                            <SkeletonLine width="58%" colors={colors} />
                            <SkeletonLine
                              width="82%"
                              colors={colors}
                              style={{ marginTop: 8 }}
                            />
                            <View className="mt-3 flex-row flex-wrap gap-2">
                              <SkeletonPill colors={colors} width={86} />
                              <SkeletonPill colors={colors} width={104} />
                              <SkeletonPill colors={colors} width={92} />
                            </View>
                            <SkeletonLine
                              width="46%"
                              colors={colors}
                              style={{ marginTop: 12 }}
                            />
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={{ color: colors.textSecondary }}>
                        Cum nay hien khong co ho co lap.
                      </Text>
                    )}
                  </>
                ) : (
                  <Text style={{ color: colors.textSecondary }}>
                    Chọn một marker để xem thông tin chi tiết.
                  </Text>
                )}
              </BottomSheetScrollView>
            </BottomSheet>
          </View>
        </GestureHandlerRootView>
      </Modal>
    </View>
  );
}

function PlanChip({
  label,
  value,
  colors,
  tone,
}: {
  label: string;
  value: number;
  colors: any;
  tone?: 'danger' | 'secondary';
}) {
  const tint =
    tone === 'danger'
      ? colors.status.pending
      : tone === 'secondary'
        ? colors.secondary
        : colors.primary;
  return (
    <View
      className="min-w-[100px] flex-1 rounded-2xl p-3"
      style={{
        backgroundColor: `${tint}12`,
        borderWidth: 1,
        borderColor: `${tint}22`,
      }}
    >
      <Text className="text-xs" style={{ color: colors.textSecondary }}>
        {label}
      </Text>
      <Text className="mt-1 text-lg font-bold" style={{ color: tint }}>
        {value}
      </Text>
    </View>
  );
}

function Pill({ text, colors }: { text: string; colors: any }) {
  return (
    <View
      className="rounded-full px-3 py-1"
      style={{ backgroundColor: `${colors.primary}12` }}
    >
      <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
        {text}
      </Text>
    </View>
  );
}

function LegendDot({
  color,
  label,
  colors,
}: {
  color: string;
  label: string;
  colors: any;
}) {
  return (
    <View
      className="flex-row items-center rounded-full px-3 py-1.5"
      style={{ backgroundColor: colors.card }}
    >
      <View
        className="mr-2 h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      <Text
        className="text-xs font-semibold"
        style={{ color: colors.textSecondary }}
      >
        {label}
      </Text>
    </View>
  );
}

function SkeletonLine({
  width,
  colors,
  style,
}: {
  width: string;
  colors: any;
  style?: any;
}) {
  return (
    <View
      style={[
        {
          width,
          height: 12,
          borderRadius: 999,
          backgroundColor: `${colors.primary}12`,
        },
        style,
      ]}
    />
  );
}

function SkeletonPill({ width, colors }: { width: number; colors: any }) {
  return (
    <View
      style={{
        width,
        height: 28,
        borderRadius: 999,
        backgroundColor: `${colors.primary}10`,
      }}
    />
  );
}
