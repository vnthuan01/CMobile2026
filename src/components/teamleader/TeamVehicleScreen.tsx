import '@/global.css';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import { useTheme } from '@/src/context/ThemeContext';
import { useActiveAssignedCampaign } from '@/src/hooks/useActiveAssignedCampaign';
import { useAssignedCampaigns } from '@/src/hooks/useAssignedCampaigns';
import { useCampaignVehicles } from '@/src/hooks/useCampaignVehicles';
import { useCampaignDetail } from '@/src/hooks/useDonation';
import { useCampaignTeams } from '@/src/hooks/useLeaderTasks';
import { useMyTeam } from '@/src/hooks/useMyTeam';
import { useSelectedCampaign } from '@/src/hooks/useSelectedCampaign';
import type { CampaignTeamResponse } from '@/src/types/leaderTask';
import {
  VehicleAssignmentStatusLabels,
  VehicleStatusLabels,
  type CampaignAssignedVehicle,
} from '@/src/types/vehicle';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TeamVehicleScreenProps {
  onBack?: () => void;
  onAssignDriver?: (vehicle: CampaignAssignedVehicle) => void;
  onReleaseVehicle?: (vehicle: CampaignAssignedVehicle) => void;
  onHandoffVehicle?: (vehicle: CampaignAssignedVehicle) => void;
  onReturnToCoordinator?: (vehicle: CampaignAssignedVehicle) => void;
}

export default function TeamVehicleScreen({
  onBack,
  onAssignDriver,
  onReleaseVehicle,
  onHandoffVehicle,
  onReturnToCoordinator,
}: TeamVehicleScreenProps) {
  const { bottom } = useSafeAreaInsets();
  const { colors } = useTheme();
  const { data: myTeamData, isLoading: isTeamLoading } = useMyTeam();
  const team = myTeamData?.team;
  const { data: fallbackAssignedCampaigns = [] } = useAssignedCampaigns(
    team?.teamId,
    !!team?.teamId,
  );
  const { selectedCampaignId } = useSelectedCampaign(
    team,
    fallbackAssignedCampaigns,
  );
  const { campaignId, activeCampaign } = useActiveAssignedCampaign(
    team,
    selectedCampaignId,
    fallbackAssignedCampaigns,
  );
  const { data: campaignDetail } = useCampaignDetail(
    campaignId || undefined,
    !!campaignId,
  );
  const { data: campaignTeams = [] } = useCampaignTeams(campaignId);
  const myCampaignTeam =
    campaignTeams.find(
      (item: CampaignTeamResponse) => item.teamId === team?.teamId,
    ) ?? campaignTeams[0];
  const {
    data: vehicles = [],
    isLoading: isVehiclesLoading,
    refetch,
  } = useCampaignVehicles(campaignId, myCampaignTeam?.campaignTeamId);

  const availableVehicles = useMemo(
    () => vehicles.filter((vehicle) => !vehicle.assignedDriverId),
    [vehicles],
  );
  const inUseVehicles = useMemo(
    () => vehicles.filter((vehicle) => !!vehicle.assignedDriverId),
    [vehicles],
  );

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenHeader
        title="Phương tiện của đội"
        subtitle={
          campaignDetail?.name ||
          activeCampaign?.campaignName ||
          'Chiến dịch cứu trợ'
        }
        onBack={onBack}
        rightAction={
          <TouchableOpacity
            onPress={() => refetch()}
            className="h-10 w-10 items-center justify-center rounded-full"
          >
            <Ionicons name="refresh" size={20} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: bottom + 32 }}
      >
        <View className="mb-4 flex-row gap-3">
          <View
            className="flex-1 rounded-2xl p-4"
            style={{ backgroundColor: colors.card }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: colors.textSecondary }}
            >
              Tổng phương tiện
            </Text>
            <Text
              className="mt-2 text-2xl font-bold"
              style={{ color: colors.text }}
            >
              {vehicles.length}
            </Text>
          </View>
          <View
            className="flex-1 rounded-2xl p-4"
            style={{ backgroundColor: colors.card }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: colors.textSecondary }}
            >
              Đang có người lái
            </Text>
            <Text
              className="mt-2 text-2xl font-bold"
              style={{ color: colors.text }}
            >
              {inUseVehicles.length}
            </Text>
          </View>
          <View
            className="flex-1 rounded-2xl p-4"
            style={{ backgroundColor: colors.card }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: colors.textSecondary }}
            >
              Sẵn sàng để điều phối
            </Text>
            <Text
              className="mt-2 text-2xl font-bold"
              style={{ color: colors.text }}
            >
              {availableVehicles.length}
            </Text>
          </View>
        </View>

        {isTeamLoading || isVehiclesLoading ? (
          <View className="items-center justify-center py-16">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text
              className="mt-3 text-sm"
              style={{ color: colors.textSecondary }}
            >
              Đang tải danh sách phương tiện...
            </Text>
          </View>
        ) : vehicles.length === 0 ? (
          <View
            className="rounded-2xl border border-dashed p-5"
            style={{ borderColor: colors.border }}
          >
            <Text
              className="text-base font-bold"
              style={{ color: colors.text }}
            >
              Chưa có phương tiện nào được cấp cho đội
            </Text>
            <Text
              className="mt-2 text-sm"
              style={{ color: colors.textSecondary }}
            >
              Coordinator cần gán phương tiện cho campaign team trước khi Team
              Leader có thể phân người lái hoặc release xe.
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {vehicles.map((vehicle) => (
              <View
                key={vehicle.campaignVehicleId}
                className="rounded-2xl border p-4"
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }}
              >
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text
                      className="text-lg font-bold"
                      style={{ color: colors.text }}
                    >
                      {vehicle.licensePlate}
                    </Text>
                    <Text
                      className="mt-1 text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      {vehicle.vehicleTypeName || 'Phương tiện cứu trợ'}
                    </Text>
                  </View>
                  <View
                    className="rounded-full px-3 py-1"
                    style={{ backgroundColor: `${colors.primary}12` }}
                  >
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: colors.primary }}
                    >
                      {VehicleAssignmentStatusLabels[vehicle.status] ||
                        'Đang điều phối'}
                    </Text>
                  </View>
                </View>

                <View className="mt-3 gap-1">
                  <Text className="text-sm" style={{ color: colors.text }}>
                    Loại phương tiện: {vehicle.vehicleTypeName || 'Chưa rõ loại xe'}
                  </Text>
                  <Text className="text-sm" style={{ color: colors.text }}>
                    Người lái hiện tại:{' '}
                    {vehicle.driverName?.trim() || 'Chưa giao ai'}
                  </Text>
                  <Text
                    className="text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    Trạng thái xe:{' '}
                    {VehicleStatusLabels[vehicle.currentVehicleStatus] ||
                      'Chưa rõ'}
                  </Text>
                  <Text
                    className="text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    Ghi chú:{' '}
                    {vehicle.note?.trim() ||
                      'Chưa gắn task hoặc hướng dẫn vận hành'}
                  </Text>
                </View>

                <View className="mt-4 flex-row flex-wrap gap-2">
                  <TouchableOpacity
                    onPress={() => onAssignDriver?.(vehicle)}
                    className="rounded-xl px-4 py-2"
                    style={{ backgroundColor: `${colors.primary}15` }}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: colors.primary }}
                    >
                      Chỉ định người lái
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onReleaseVehicle?.(vehicle)}
                    className="rounded-xl px-4 py-2"
                    style={{ backgroundColor: `${colors.status.completed}15` }}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: colors.status.completed }}
                    >
                      Đánh giấu xe đang sẵn sàng
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onHandoffVehicle?.(vehicle)}
                    className="rounded-xl px-4 py-2"
                    style={{ backgroundColor: `${colors.secondary}15` }}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: colors.secondary }}
                    >
                      Bàn giao
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onReturnToCoordinator?.(vehicle)}
                    className="rounded-xl px-4 py-2"
                    style={{ backgroundColor: `${colors.error}12` }}
                  >
                    <Text className="text-sm font-semibold" style={{ color: colors.error }}>
                      Trả điều phối trung tâm
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
