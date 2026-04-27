import { useTheme } from '@/src/context/ThemeContext';
import {
  useCampaignPackages,
  useCreateShortageRequest,
  useInventoryBalance,
  useShortageRequests,
} from '@/src/hooks/useReliefDistribution';
import type {
  CampaignInventoryBalanceItemResponse,
  CampaignPackageQueryRequest,
  DistributionPointResponse,
  ReliefPackageDefinitionResponse,
  SupplyShortageItemRequest,
  SupplyShortageRequestQueryRequest,
  SupplyShortageRequestResponse
} from '@/src/types/reliefDistribution';
import {
  SupplyShortageRequestStatus,
  SupplyShortageRequestStatusLabels,
} from '@/src/types/reliefDistribution';
import { showErrorToast, showSuccessToast } from '@/src/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface InventorySectionProps {
  campaignId: string | null;
  campaignTeamId?: string;
  userId?: string;
  distributionPoints: DistributionPointResponse[];
  defaultDistributionPointId?: string;
}

interface ShortageDraftItem {
  supplyItemId: string;
  supplyItemName: string;
  unit?: string;
  quantityRequested: string;
}

const SHORTAGE_STATUS_COLOR_MAP: Record<SupplyShortageRequestStatus, string> = {
  [SupplyShortageRequestStatus.Pending]: '#f59e0b',
  [SupplyShortageRequestStatus.Approved]: '#1565C0',
  [SupplyShortageRequestStatus.Fulfilled]: '#2e7d32',
  [SupplyShortageRequestStatus.Rejected]: '#d32f2f',
  [SupplyShortageRequestStatus.Cancelled]: '#9e9e9e',
};

export default function InventorySection({
  campaignId,
  campaignTeamId,
  userId,
  distributionPoints,
  defaultDistributionPointId,
}: InventorySectionProps) {
  const { colors } = useTheme();
  const [showInventoryDetails, setShowInventoryDetails] = useState(false);

  // State for shortage modal and form
  const [showShortageModal, setShowShortageModal] = useState(false);
  const [shortageReason, setShortageReason] = useState('');
  const [selectedDistributionPointId, setSelectedDistributionPointId] = useState<string>(
    defaultDistributionPointId || ''
  );
  const [shortageDraftItems, setShortageDraftItems] = useState<ShortageDraftItem[]>([]);

  // State for status filter
  const [statusFilter, setStatusFilter] = useState<SupplyShortageRequestStatus | 'all'>('all');

  const createShortageRequestMutation = useCreateShortageRequest();

  const packagesQuery: CampaignPackageQueryRequest = {
    isActive: true,
    pageSize: 50,
  };

  const { data: campaignPackagesData, isLoading: isPackagesLoading } = useCampaignPackages(
    campaignId,
    packagesQuery
  );
  const { data: inventoryBalanceData, isLoading: isInventoryBalanceLoading } =
    useInventoryBalance(campaignId);

  const shortageRequestsQuery: SupplyShortageRequestQueryRequest = {
    pageIndex: 1,
    pageSize: 20,
    campaignTeamId,
    requestedByUserId: userId,
  };

  // Only add status filter if not 'all'
  if (statusFilter !== 'all') {
    shortageRequestsQuery.status = statusFilter as SupplyShortageRequestStatus;
  }

  const { data: shortageRequestsData, isLoading: isShortageRequestsLoading } = useShortageRequests(
    campaignId,
    shortageRequestsQuery
  );

  const campaignPackages = campaignPackagesData?.items ?? [];
  const shortageRequests = shortageRequestsData?.items ?? [];
  const inventoryBalanceItems = inventoryBalanceData?.items ?? [];

  const inventoryBalanceMap = useMemo(
    () =>
      new Map(
        inventoryBalanceItems.map((item) => [item.supplyItemId, item]),
      ),
    [inventoryBalanceItems],
  );

  const lowStockCount = inventoryBalanceItems.filter(
    (item) => item.isLowStock || item.availableQuantity <= 10,
  ).length;
  const outOfStockCount = inventoryBalanceItems.filter(
    (item) => item.availableQuantity <= 0,
  ).length;

  // Available supply items
  const availableSupplyItems = useMemo(() => {
    const itemMap = new Map<
      string,
      {
        supplyItemId: string;
        supplyItemName: string;
        unit?: string;
        estimatedStock?: number;
        estimatedStockUnit?: string;
      }
    >();

    campaignPackages.forEach((pkg) => {
      pkg.items.forEach((item) => {
        if (!itemMap.has(item.supplyItemId)) {
          itemMap.set(item.supplyItemId, {
            supplyItemId: item.supplyItemId,
            supplyItemName: item.supplyItemName,
            unit: item.unit,
            estimatedStock: item.estimatedStock,
            estimatedStockUnit: item.estimatedStockUnit,
          });
        }
      });
    });

    return Array.from(itemMap.values());
  }, [campaignPackages]);

  // Initialize draft items when packages change
  const updateDraftItems = (items: typeof availableSupplyItems) => {
    setShortageDraftItems((current) => {
      const currentMap = new Map(current.map((item) => [item.supplyItemId, item]));
      return items.map((item) => ({
        supplyItemId: item.supplyItemId,
        supplyItemName: item.supplyItemName,
        unit: item.unit,
        quantityRequested: currentMap.get(item.supplyItemId)?.quantityRequested ?? '',
      }));
    });
  };

  useEffect(() => {
    updateDraftItems(availableSupplyItems);
  }, [availableSupplyItems]);

  useEffect(() => {
    if (!selectedDistributionPointId && defaultDistributionPointId) {
      setSelectedDistributionPointId(defaultDistributionPointId);
    }
  }, [defaultDistributionPointId, selectedDistributionPointId]);

  // Reset form helper
  const resetShortageForm = () => {
    setShortageReason('');
    setShortageDraftItems((current) =>
      current.map((item) => ({ ...item, quantityRequested: '' }))
    );
  };

  // Update quantity helper
  const updateShortageDraftQuantity = (supplyItemId: string, value: string) => {
    const normalized = value.replace(/[^0-9]/g, '');
    setShortageDraftItems((current) =>
      current.map((item) =>
        item.supplyItemId === supplyItemId
          ? { ...item, quantityRequested: normalized }
          : item
      )
    );
  };

  // Submit handler
  const handleSubmitShortageRequest = async () => {
    if (!campaignId) {
      showErrorToast('Thiếu chiến dịch', 'Không xác định được chiến dịch hiện tại.');
      return;
    }

    const items: SupplyShortageItemRequest[] = shortageDraftItems
      .map((item) => ({
        supplyItemId: item.supplyItemId,
        quantityRequested: Number(item.quantityRequested || 0),
      }))
      .filter((item) => Number.isFinite(item.quantityRequested) && item.quantityRequested > 0);

    if (!items.length) {
      showErrorToast('Thiếu vật tư', 'Nhập số lượng cần bổ sung cho ít nhất 1 vật tư.');
      return;
    }

    try {
      await createShortageRequestMutation.mutateAsync({
        campaignId,
        request: {
          distributionPointId: selectedDistributionPointId || undefined,
          campaignTeamId,
          reason: shortageReason.trim() || undefined,
          items,
        },
      });
      showSuccessToast('Đã gửi yêu cầu', 'Yêu cầu bổ sung vật tư đã được gửi lên kho chiến dịch.');
      setShowShortageModal(false);
      resetShortageForm();
    } catch (error: any) {
      showErrorToast('Gửi yêu cầu thất bại', error?.message);
    }
  };

  const hasOutOfStockItems = shortageDraftItems.some((item) => {
    const balance = inventoryBalanceMap.get(item.supplyItemId);
    return balance && balance.availableQuantity <= 0;
  });

  // Package card renderer
  const renderPackageCard = (pkg: ReliefPackageDefinitionResponse) => {
    return (
      <View
        key={pkg.reliefPackageDefinitionId}
        className="rounded-2xl border p-4"
        style={{ borderColor: colors.border }}
      >
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="font-bold" style={{ color: colors.text }}>
              {pkg.name}
            </Text>
            <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
              {pkg.description || 'Không có mô tả gói phát hàng.'}
            </Text>
            <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
              {pkg.items.length} vật phẩm trong gói này
            </Text>
          </View>
          <View
            className="rounded-full px-3 py-1"
            style={{
              backgroundColor: pkg.isActive ? `${colors.status.completed}18` : `${colors.status.pending}18`,
            }}
          >
            <Text
              className="text-xs font-bold"
              style={{ color: pkg.isActive ? colors.status.completed : colors.status.pending }}
            >
              {pkg.isActive ? 'Đang áp dụng' : 'Tạm ngưng'}
            </Text>
          </View>
        </View>

        <View className="mt-3 flex-row flex-wrap gap-2">
          {pkg.isDefault ? <StatusPill label="Gói mặc định" color={colors.primary} /> : null}
          {pkg.outputSupplyItemName ? (
            <StatusPill
              label={`Đầu ra: ${pkg.outputSupplyItemName}${pkg.outputUnit ? ` (${pkg.outputUnit})` : ''}`}
              color={colors.secondary}
            />
          ) : null}
          {pkg.cashSupportAmount > 0 ? (
            <StatusPill
              label={`Hỗ trợ tiền: ${pkg.cashSupportAmount.toLocaleString('vi-VN')}đ`}
              color={colors.status.completed}
            />
          ) : null}
        </View>

        <View
          className="mt-3 rounded-xl px-3 py-3"
          style={{ backgroundColor: `${colors.primary}08` }}
        >
          <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
            Gói này gồm {pkg.items.length} vật phẩm để phát hàng.
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View className="gap-4">
      {/* Tồn kho campaign */}
      <View
        className="rounded-2xl border p-4"
        style={{
          borderColor: colors.border,
          backgroundColor: colors.card,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setShowInventoryDetails((current) => !current)}
        >
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="text-lg font-bold" style={{ color: colors.text }}>
                Tồn kho chiến dịch
              </Text>
              <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
                Bấm để xem chi tiết tổng các mặt hàng trong tồn kho chiến dịch.
              </Text>
              <Text className="mt-2 text-xs" style={{ color: colors.textSecondary }}>
                {inventoryBalanceItems.length
                  ? `${inventoryBalanceItems.length} mặt hàng trong kho • ${outOfStockCount} hết hàng • ${lowStockCount} cần chú ý`
                  : 'Chưa có dữ liệu tồn kho chiến dịch'}
              </Text>
            </View>
            <Ionicons
              name={showInventoryDetails ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textSecondary}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowShortageModal(true)}
          className="mt-4 items-center rounded-2xl py-3"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-base font-bold text-white">Yêu cầu thêm hàng</Text>
        </TouchableOpacity>

        {showInventoryDetails ? (
          <View className="mt-4 gap-3">
            {isInventoryBalanceLoading ? (
              <View className="items-center py-6">
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : inventoryBalanceItems.length > 0 ? (
              inventoryBalanceItems.map((item) => {
                const stockState = getInventoryState(item);
                return (
                  <View
                    key={item.supplyItemId}
                    className="rounded-xl px-3 py-3"
                    style={{
                      backgroundColor:
                        stockState === 'out'
                          ? `${colors.status.error}12`
                          : stockState === 'low'
                            ? `${colors.status.pending}12`
                            : `${colors.primary}08`,
                      borderWidth: stockState === 'normal' ? 0 : 1,
                      borderColor:
                        stockState === 'out'
                          ? `${colors.status.error}35`
                          : stockState === 'low'
                            ? `${colors.status.pending}35`
                            : 'transparent',
                    }}
                  >
                    <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                      {item.supplyItemName}
                    </Text>
                    <Text
                      className="mt-1 text-xs"
                      style={{ color: getInventoryBalanceColor(colors, item) }}
                    >
                      {getInventoryBalanceText(item, item)}
                    </Text>
                    
                    {stockState === 'out' ? (
                      <Text className="mt-1 text-xs font-bold" style={{ color: colors.status.error }}>
                        Hết hàng
                      </Text>
                    ) : stockState === 'low' ? (
                      <Text className="mt-1 text-xs font-bold" style={{ color: colors.status.pending }}>
                        Sắp hết hàng
                      </Text>
                    ) : null}
                  </View>
                );
              })
            ) : (
              <View
                className="rounded-xl border border-dashed p-4"
                style={{ borderColor: colors.border }}
              >
                <Text style={{ color: colors.textSecondary }}>
                  Chưa có mặt hàng nào trong inventory balance.
                </Text>
              </View>
            )}
          </View>
        ) : null}
      </View>

      {/* Gói phát hàng */}
      <View
        className="rounded-2xl border p-4"
        style={{
          borderColor: colors.border,
          backgroundColor: colors.card,
        }}
      >
        <Text className="text-lg font-bold" style={{ color: colors.text }}>
          Gói phát hàng của chiến dịch
        </Text>
        <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
          Đây là cấu hình Gói sẵn có của chiến dịch.
        </Text>

        <View className="mt-4 gap-3">
          {isPackagesLoading ? (
            <View className="items-center py-6">
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : campaignPackages.length > 0 ? (
            campaignPackages.map(renderPackageCard)
          ) : (
            <View
              className="rounded-xl border border-dashed p-4"
              style={{ borderColor: colors.border }}
            >
              <Text style={{ color: colors.textSecondary }}>
                Chưa có gói phát hàng nào cho chiến dịch này.
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Yêu cầu bổ sung với bộ lọc trạng thái */}
      <View
        className="rounded-2xl border p-4"
        style={{
          borderColor: colors.border,
          backgroundColor: colors.card,
        }}
      >
        <Text className="text-lg font-bold" style={{ color: colors.text }}>
          Danh sách yêu cầu đã gửi
        </Text>
        <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
          Theo dõi các yêu cầu bổ sung vật tư bạn đã gửi cho chiến dịch hiện tại.
        </Text>

        {/* Status filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
          <View className="flex-row gap-2">
            {(
              [
                { value: 'all' as const, label: 'Tất cả' },
                { value: SupplyShortageRequestStatus.Pending, label: 'Chờ duyệt' },
                { value: SupplyShortageRequestStatus.Approved, label: 'Đã duyệt' },
                // { value: SupplyShortageRequestStatus.Fulfilled, label: 'Đã cấp' },
                { value: SupplyShortageRequestStatus.Rejected, label: 'Từ chối' },
                // { value: SupplyShortageRequestStatus.Cancelled, label: 'Đã hủy' },
              ] as const
            ).map((option) => {
              const selected = statusFilter === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setStatusFilter(option.value)}
                  className="rounded-full px-4 py-2"
                  style={{
                    backgroundColor: selected ? colors.primary : `${colors.primary}10`,
                    borderWidth: 1,
                    borderColor: selected ? colors.primary : `${colors.primary}22`,
                  }}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: selected ? '#fff' : colors.primary }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View className="mt-4 gap-3">
          {isShortageRequestsLoading ? (
            <View className="items-center py-6">
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : shortageRequests.length > 0 ? (
            shortageRequests.map((request: SupplyShortageRequestResponse) => {
              const statusColor = SHORTAGE_STATUS_COLOR_MAP[request.status];
              return (
                <View
                  key={request.supplyShortageRequestId}
                  className="rounded-2xl border p-4"
                  style={{ borderColor: colors.border }}
                >
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="font-bold" style={{ color: colors.text }}>
                        {request.distributionPointName || request.campaignTeamName || 'Yêu cầu bổ sung vật tư'}
                      </Text>
                      <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
                        Gửi lúc {formatDateTime(request.requestedAt)}
                      </Text>
                    </View>
                    <View
                      className="rounded-full px-3 py-1"
                      style={{ backgroundColor: `${statusColor}18` }}
                    >
                      <Text className="text-xs font-bold" style={{ color: statusColor }}>
                        {SupplyShortageRequestStatusLabels[request.status]}
                      </Text>
                    </View>
                  </View>

                  {request.reason ? (
                    <Text className="mt-3 text-sm" style={{ color: colors.text }}>
                      Lý do: {request.reason}
                    </Text>
                  ) : null}

                  <View className="mt-3 gap-2">
                    {request.items.map((item) => (
                      <View
                        key={item.supplyShortageRequestItemId}
                        className="rounded-xl px-3 py-2"
                        style={{ backgroundColor: `${colors.primary}08` }}
                      >
                        <View className="flex-row items-center justify-between gap-3">
                          <Text className="flex-1 text-sm" style={{ color: colors.text }}>
                            {item.supplyItemName}
                          </Text>
                          <Text className="text-sm font-bold" style={{ color: colors.primary }}>
                            Xin {item.quantityRequested}
                            {item.quantityApproved !== undefined ? ` / duyệt ${item.quantityApproved}` : ''}
                          </Text>
                        </View>
                        {item.note ? (
                          <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
                            {item.note}
                          </Text>
                        ) : null}
                      </View>
                    ))}
                  </View>

                  {request.reviewNote ? (
                    <Text className="mt-3 text-xs" style={{ color: colors.textSecondary }}>
                      Ghi chú duyệt: {request.reviewNote}
                    </Text>
                  ) : null}
                </View>
              );
            })
          ) : (
            <View
              className="rounded-xl border border-dashed p-4"
              style={{ borderColor: colors.border }}
            >
              <Text style={{ color: colors.textSecondary }}>
                Bạn chưa gửi yêu cầu bổ sung nào trong chiến dịch này.
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Shortage request modal */}
      <Modal
        visible={showShortageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowShortageModal(false)}
      >
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          onPress={() => setShowShortageModal(false)}
        >
          <Pressable
            className="rounded-t-3xl px-4 pb-8 pt-4"
            style={{ backgroundColor: colors.card }}
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              Gửi yêu cầu nhập thêm hàng
            </Text>
            <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
              Chọn vật tư đang thiếu khi đi phát tại điểm phát hoặc hỗ trợ hộ dân bị cô lập.
            </Text>

            <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
              <View className="gap-4">
                <View>
                  <Text className="mb-2 text-sm font-semibold" style={{ color: colors.text }}>
                    Điểm phát áp dụng
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-2">
                      {distributionPoints.map((point) => {
                        const selected = point.distributionPointId === selectedDistributionPointId;
                        return (
                          <TouchableOpacity
                            key={point.distributionPointId}
                            onPress={() => setSelectedDistributionPointId(point.distributionPointId)}
                            className="rounded-full px-4 py-2"
                            style={{
                              backgroundColor: selected ? colors.primary : `${colors.primary}10`,
                              borderWidth: 1,
                              borderColor: selected ? colors.primary : `${colors.primary}22`,
                            }}
                          >
                            <Text
                              className="text-sm font-semibold"
                              style={{ color: selected ? '#fff' : colors.primary }}
                            >
                              {point.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </ScrollView>
                  {!distributionPoints.length ? (
                    <Text className="mt-2 text-xs" style={{ color: colors.textSecondary }}>
                      Không có điểm phát nào, yêu cầu sẽ được gắn theo đội chiến dịch.
                    </Text>
                  ) : (
                    <Text className="mt-2 text-xs" style={{ color: colors.textSecondary }}>
                      Đang chọn: {distributionPoints.find((p) => p.distributionPointId === selectedDistributionPointId)?.name || 'Chưa chọn'}
                    </Text>
                  )}
                </View>

                <View>
                  <Text className="mb-2 text-sm font-semibold" style={{ color: colors.text }}>
                    Lý do thiếu hàng
                  </Text>
                  <TextInput
                    value={shortageReason}
                    onChangeText={setShortageReason}
                    placeholder="Ví dụ: số hộ nhận tăng đột xuất, phát cho khu cô lập..."
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    className="rounded-2xl border px-4 py-3"
                    style={{
                      borderColor: colors.border,
                      color: colors.text,
                      backgroundColor: colors.background,
                      minHeight: 92,
                      textAlignVertical: 'top',
                    }}
                  />
                </View>

                <View>
                  <Text className="mb-2 text-sm font-semibold" style={{ color: colors.text }}>
                    Vật tư cần bổ sung
                  </Text>
                  <View className="gap-3">
                    {shortageDraftItems.length > 0 ? (
                      shortageDraftItems.map((item) => (
                        <View
                          key={item.supplyItemId}
                          className="rounded-2xl border p-3"
                          style={{ borderColor: colors.border }}
                        >
                          <Text className="font-semibold" style={{ color: colors.text }}>
                            {item.supplyItemName}
                          </Text>
                          <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
                            Đơn vị: {item.unit || 'Chưa xác định'}
                          </Text>
                          {inventoryBalanceMap.has(item.supplyItemId) ? (
                            <Text
                              className="mt-1 text-xs"
                              style={{
                                color: getInventoryBalanceColor(
                                  colors,
                                  inventoryBalanceMap.get(item.supplyItemId),
                                ),
                              }}
                            >
                              {getInventoryBalanceText(
                                inventoryBalanceMap.get(item.supplyItemId),
                                item,
                              )}
                            </Text>
                          ) : null}
                          {(() => {
                            const balance = inventoryBalanceMap.get(item.supplyItemId);
                            if (!balance || balance.availableQuantity > 0) return null;
                            return (
                              <View
                                className="mt-2 rounded-xl px-3 py-2"
                                style={{ backgroundColor: `${colors.status.error}12` }}
                              >
                                <Text
                                  className="text-xs font-bold"
                                  style={{ color: colors.status.error }}
                                >
                                  Vật tư này đã hết hàng trong kho chiến dịch. Hãy kiểm tra kỹ trước khi gửi yêu cầu.
                                </Text>
                              </View>
                            );
                          })()}
                          <TextInput
                            value={item.quantityRequested}
                            onChangeText={(value) => updateShortageDraftQuantity(item.supplyItemId, value)}
                            placeholder="Nhập số lượng cần xin"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="numeric"
                            className="mt-3 rounded-xl border px-4 py-3"
                            style={{
                              borderColor: colors.border,
                              color: colors.text,
                              backgroundColor: colors.background,
                            }}
                          />
                        </View>
                      ))
                    ) : (
                      <View
                        className="rounded-xl border border-dashed p-4"
                        style={{ borderColor: colors.border }}
                      >
                        <Text style={{ color: colors.textSecondary }}>
                          Chưa có vật tư nào từ danh sách gói phát để chọn.
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleSubmitShortageRequest}
                  disabled={createShortageRequestMutation.isPending}
                  className="items-center rounded-2xl py-3"
                  style={{
                    backgroundColor: hasOutOfStockItems
                      ? colors.status.error
                      : colors.primary,
                    opacity: createShortageRequestMutation.isPending ? 0.7 : 1,
                  }}
                >
                  <Text className="text-base font-bold text-white">
                    {createShortageRequestMutation.isPending ? 'Đang gửi...' : 'Gửi yêu cầu'}
                  </Text>
                </TouchableOpacity>
                {hasOutOfStockItems ? (
                  <Text className="text-center text-xs font-semibold" style={{ color: colors.status.error }}>
                    Có vật tư đang hết hàng. Kiểm tra kỹ số lượng cần xin để ưu tiên bổ sung khẩn cấp.
                  </Text>
                ) : null}
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function StatusPill({ label, color }: { label: string; color: string }) {
  const { colors } = useTheme();
  return (
    <View
      className="rounded-full px-3 py-1"
      style={{ backgroundColor: `${color}18` }}
    >
      <Text className="text-xs font-semibold" style={{ color }}>
        {label}
      </Text>
    </View>
  );
}

function formatDateTime(value?: string | null) {
  if (!value) return 'Chưa xác định';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN');
}

function getInventoryBalanceText(
  balance: CampaignInventoryBalanceItemResponse | undefined,
  item: {
    unit?: string;
    estimatedStock?: number;
    estimatedStockUnit?: string;
  },
) {
  if (balance) {
    return `Tồn kho chiến dịch: ${balance.availableQuantity} ${balance.unit || item.unit || ''}`.trim();
  }

  if (item.estimatedStock !== undefined) {
    return `Tồn kho ước tính: ${item.estimatedStock} ${item.estimatedStockUnit || item.unit || ''}`.trim();
  }

  return 'Chưa có dữ liệu tồn kho';
}

function getInventoryBalanceColor(
  colors: any,
  balance?: CampaignInventoryBalanceItemResponse,
) {
  if (!balance) return colors.status.completed;
  if (balance.availableQuantity <= 0) return colors.status.error;
  if (balance.isLowStock) return colors.status.pending;
  return colors.status.completed;
}

function getInventoryState(balance?: CampaignInventoryBalanceItemResponse) {
  if (!balance) return 'normal';
  if ((balance.availableQuantity ?? 0) <= 0) return 'out';
  if (balance.isLowStock) return 'low';
  return 'normal';
}
