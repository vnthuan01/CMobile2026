import { useTheme } from '@/src/context/ThemeContext';
import type {
  RescueActiveBatchResponse,
  RescueBatchItem,
} from '@/src/services/rescueTeamService';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

interface TeamTasksMapProps {
  batch: RescueActiveBatchResponse | null;
  selectedMission: RescueBatchItem | null;
  currentMission: RescueBatchItem | null;
  routeCoordinates: [number, number][];
  mapStyle: string;
  onSelectMission: (mission: RescueBatchItem) => void;
}

export default function TeamTasksMap(props: TeamTasksMapProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.surface, padding: 16 }}
      className="items-center justify-center"
    >
      <View
        className="w-full max-w-[420px] rounded-3xl border p-5"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
      >
        <View className="flex-row items-center gap-2">
          <Ionicons name="map-outline" size={22} color={colors.primary} />
          <Text className="text-lg font-bold" style={{ color: colors.text }}>
            Bản xem trước bản đồ
          </Text>
        </View>

        <Text
          className="mt-3 text-sm leading-6"
          style={{ color: colors.textSecondary }}
        >
          Web hiện không hỗ trợ module bản đồ native này. Hãy mở trên
          Android/iOS dev build để xem bản đồ Goong đầy đủ.
        </Text>

        <View
          className="mt-4 rounded-2xl p-4"
          style={{ backgroundColor: colors.surface }}
        >
          <Text
            className="text-sm font-semibold"
            style={{ color: colors.text }}
          >
            {props.selectedMission?.description || 'Chưa chọn nhiệm vụ'}
          </Text>
          <Text
            className="mt-2 text-sm"
            style={{ color: colors.textSecondary }}
          >
            Số điểm nhiệm vụ: {props.batch?.items?.length || 0}
          </Text>
          <Text
            className="mt-1 text-sm"
            style={{ color: colors.textSecondary }}
          >
            Số điểm tuyến đường: {props.routeCoordinates.length}
          </Text>
          <Text
            className="mt-1 text-sm"
            style={{ color: colors.textSecondary }}
          >
            Địa chỉ: {props.selectedMission?.address || '---'}
          </Text>
        </View>
      </View>
    </View>
  );
}
