import '@/global.css';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import { useTheme } from '@/src/context/ThemeContext';
import { useActiveAssignedCampaign } from '@/src/hooks/useActiveAssignedCampaign';
import { useAssignedCampaigns } from '@/src/hooks/useAssignedCampaigns';
import {
  useHandoffCampaignVehicle,
  useMyCampaignVehicle,
  useReleaseCampaignVehicle,
  useReturnCampaignVehicleToCoordinator,
} from '@/src/hooks/useCampaignVehicles';
import { useMyTeam } from '@/src/hooks/useMyTeam';
import { useSelectedCampaign } from '@/src/hooks/useSelectedCampaign';
import type { TeamMemberSummary } from '@/src/types/team';
import {
  VehicleAssignmentStatus,
  VehicleAssignmentStatusLabels,
  VehicleStatus,
  VehicleStatusLabels,
} from '@/src/types/vehicle';
import { showErrorToast, showSuccessToast } from '@/src/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MyVehicleScreenProps {
  onBack?: () => void;
}

export default function MyVehicleScreen({ onBack }: MyVehicleScreenProps) {
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
  const { data: myVehicle, isLoading: isVehicleLoading } =
    useMyCampaignVehicle(campaignId);
  const releaseMutation = useReleaseCampaignVehicle();
  const handoffMutation = useHandoffCampaignVehicle();
  const returnToCoordinatorMutation = useReturnCampaignVehicleToCoordinator();
  const [releaseNote, setReleaseNote] = useState('');
  const [handoffNote, setHandoffNote] = useState('');
  const [returnCoordinatorNote, setReturnCoordinatorNote] = useState('');
  const [selectedVolunteerProfileId, setSelectedVolunteerProfileId] = useState<
    string | null
  >(null);

  const teammates = useMemo(
    () =>
      (team?.members ?? []).filter(
        (member: TeamMemberSummary) =>
          member.volunteerProfileId &&
          member.volunteerProfileId !== myVehicle?.assignedDriverId,
      ),
    [myVehicle?.assignedDriverId, team?.members],
  );

  const handleRelease = async () => {
    if (!campaignId || !myVehicle) {
      showErrorToast(
        'Thiếu dữ liệu',
        'Không xác định được phương tiện đang nhận.',
      );
      return;
    }

    try {
      await releaseMutation.mutateAsync({
        campaignId,
        campaignVehicleId: myVehicle.campaignVehicleId,
        request: {
          note:
            releaseNote.trim() ||
            'Hoàn tất ca, bỏ gán người sử dụng và đánh giấu xe đang sẵn sàng.',
        },
      });
      setReleaseNote('');
      showSuccessToast('Đã đánh giấu xe đang sẵn sàng');
    } catch (error: any) {
      showErrorToast('Trả phương tiện thất bại', error?.message);
    }
  };

  const handleHandoff = async () => {
    if (!campaignId || !myVehicle) {
      showErrorToast(
        'Thiếu dữ liệu',
        'Không xác định được phương tiện đang nhận.',
      );
      return;
    }

    if (!selectedVolunteerProfileId) {
      showErrorToast(
        'Chưa chọn người nhận',
        'Vui lòng chọn thành viên để bàn giao phương tiện.',
      );
      return;
    }

    try {
      await handoffMutation.mutateAsync({
        campaignId,
        campaignVehicleId: myVehicle.campaignVehicleId,
        request: {
          toVolunteerProfileId: selectedVolunteerProfileId,
          note:
            handoffNote.trim() ||
            'Bàn giao phương tiện cho thành viên khác trong đội.',
        },
      });
      setHandoffNote('');
      setSelectedVolunteerProfileId(null);
      showSuccessToast('Đã bàn giao phương tiện');
    } catch (error: any) {
      showErrorToast('Bàn giao thất bại', error?.message);
    }
  };

  const handleReturnToCoordinator = async () => {
    if (!campaignId || !myVehicle) {
      showErrorToast(
        'Thiếu dữ liệu',
        'Không xác định được phương tiện đang nhận.',
      );
      return;
    }

    try {
      await returnToCoordinatorMutation.mutateAsync({
        campaignId,
        campaignVehicleId: myVehicle.campaignVehicleId,
        request: {
          note:
            returnCoordinatorNote.trim() ||
            'Trả hẳn phương tiện về điều phối trung tâm để phân công lại.',
        },
      });
      setReturnCoordinatorNote('');
      showSuccessToast('Đã trả phương tiện về điều phối trung tâm');
    } catch (error: any) {
      showErrorToast('Trả điều phối trung tâm thất bại', error?.message);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenHeader
        title="Phương tiện của tôi"
        subtitle={activeCampaign?.campaignName || 'Chiến dịch cứu trợ'}
        onBack={onBack}
      />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: bottom + 24 }}
      >
        {isTeamLoading || isVehicleLoading ? (
          <View className="items-center justify-center py-16">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text
              className="mt-3 text-sm"
              style={{ color: colors.textSecondary }}
            >
              Đang tải thông tin phương tiện...
            </Text>
          </View>
        ) : !myVehicle ? (
          <View
            className="rounded-2xl border border-dashed p-5"
            style={{ borderColor: colors.border }}
          >
            <Text
              className="text-base font-bold"
              style={{ color: colors.text }}
            >
              Bạn chưa được giao phương tiện
            </Text>
            <Text
              className="mt-2 text-sm"
              style={{ color: colors.textSecondary }}
            >
              Team Leader cần chỉ định bạn là người lái hoặc người giữ phương
              tiện trước khi bạn có thể release hay handoff.
            </Text>
          </View>
        ) : (
          <>
            <View
              className="rounded-2xl border p-4"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
            >
              <Text
                className="text-lg font-bold"
                style={{ color: colors.text }}
              >
                {myVehicle.licensePlate}
              </Text>
              <Text
                className="mt-1 text-sm"
                style={{ color: colors.textSecondary }}
              >
                {myVehicle.vehicleTypeName || 'Phương tiện cứu trợ'}
              </Text>
              <View className="mt-4 gap-1">
                <Text className="text-sm" style={{ color: colors.text }}>
                  Loại phương tiện: {myVehicle.vehicleTypeName || 'Chưa rõ loại xe'}
                </Text>
                <Text className="text-sm" style={{ color: colors.text }}>
                  Trạng thái điều phối:{' '}
                  {VehicleAssignmentStatusLabels[
                    myVehicle.status as VehicleAssignmentStatus
                  ] || 'Đang điều phối'}
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Trạng thái xe:{' '}
                  {VehicleStatusLabels[
                    myVehicle.currentVehicleStatus as VehicleStatus
                  ] || 'Chưa rõ'}
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Ghi chú:{' '}
                  {myVehicle.note?.trim() || 'Chưa có ghi chú từ Team Leader'}
                </Text>
              </View>
            </View>

            <View
              className="mt-4 rounded-2xl border p-4"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
            >
              <Text
                className="text-base font-bold"
                style={{ color: colors.text }}
              >
                Đánh giấu xe đang sẵn sàng
              </Text>
              <TextInput
                value={releaseNote}
                onChangeText={setReleaseNote}
                placeholder="Ghi chú khi trả xe (tùy chọn)"
                placeholderTextColor={colors.textSecondary}
                className="mt-3 rounded-xl border px-4 py-3 text-sm"
                style={{
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.background,
                }}
              />
              <TouchableOpacity
                onPress={handleRelease}
                disabled={releaseMutation.isPending}
                className="mt-3 flex-row items-center justify-center rounded-xl px-4 py-3"
                style={{
                  backgroundColor: colors.status.completed,
                  opacity: releaseMutation.isPending ? 0.7 : 1,
                }}
              >
                <Ionicons name="checkmark-done" size={18} color="#fff" />
                <Text className="ml-2 text-sm font-bold text-white">
                  {releaseMutation.isPending
                    ? 'Đang xử lý...'
                    : 'Đánh giấu xe đang sẵn sàng'}
                </Text>
              </TouchableOpacity>
            </View>

            <View
              className="mt-4 rounded-2xl border p-4"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
            >
              <Text
                className="text-base font-bold"
                style={{ color: colors.text }}
              >
                Trả hẳn xe về điều phối trung tâm
              </Text>
              <TextInput
                value={returnCoordinatorNote}
                onChangeText={setReturnCoordinatorNote}
                placeholder="Ghi chú khi trả điều phối trung tâm"
                placeholderTextColor={colors.textSecondary}
                className="mt-3 rounded-xl border px-4 py-3 text-sm"
                style={{
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.background,
                }}
              />
              <TouchableOpacity
                onPress={handleReturnToCoordinator}
                disabled={returnToCoordinatorMutation.isPending}
                className="mt-3 flex-row items-center justify-center rounded-xl px-4 py-3"
                style={{
                  backgroundColor: colors.error,
                  opacity: returnToCoordinatorMutation.isPending ? 0.7 : 1,
                }}
              >
                <Ionicons name="arrow-undo" size={18} color="#fff" />
                <Text className="ml-2 text-sm font-bold text-white">
                  {returnToCoordinatorMutation.isPending
                    ? 'Đang xử lý...'
                    : 'Trả điều phối trung tâm'}
                </Text>
              </TouchableOpacity>
            </View>

            <View
              className="mt-4 rounded-2xl border p-4"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
            >
              <Text
                className="text-base font-bold"
                style={{ color: colors.text }}
              >
                Bàn giao cho thành viên khác
              </Text>
              <View className="mt-3 gap-2">
                {teammates.length === 0 ? (
                  <Text
                    className="text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    Không có thành viên phù hợp để bàn giao trong đội hiện tại.
                  </Text>
                ) : (
                  teammates.map((member: TeamMemberSummary) => {
                    const selected =
                      selectedVolunteerProfileId === member.volunteerProfileId;
                    return (
                      <TouchableOpacity
                        key={member.userId}
                        onPress={() =>
                          setSelectedVolunteerProfileId(
                            member.volunteerProfileId || null,
                          )
                        }
                        className="rounded-xl border px-4 py-3"
                        style={{
                          borderColor: selected
                            ? colors.primary
                            : colors.border,
                          backgroundColor: selected
                            ? `${colors.primary}10`
                            : colors.background,
                        }}
                      >
                        <Text
                          className="text-sm font-semibold"
                          style={{ color: colors.text }}
                        >
                          {member.displayName}
                        </Text>
                        <Text
                          className="mt-1 text-xs"
                          style={{ color: colors.textSecondary }}
                        >
                          {member.role || 'Thành viên'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
              <TextInput
                value={handoffNote}
                onChangeText={setHandoffNote}
                placeholder="Lý do bàn giao (tùy chọn)"
                placeholderTextColor={colors.textSecondary}
                className="mt-3 rounded-xl border px-4 py-3 text-sm"
                style={{
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.background,
                }}
              />
              <TouchableOpacity
                onPress={handleHandoff}
                disabled={handoffMutation.isPending || teammates.length === 0}
                className="mt-3 flex-row items-center justify-center rounded-xl px-4 py-3"
                style={{
                  backgroundColor: colors.secondary,
                  opacity:
                    handoffMutation.isPending || teammates.length === 0
                      ? 0.6
                      : 1,
                }}
              >
                <Ionicons name="swap-horizontal" size={18} color="#fff" />
                <Text className="ml-2 text-sm font-bold text-white">
                  {handoffMutation.isPending
                    ? 'Đang xử lý...'
                    : 'Bàn giao phương tiện'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
