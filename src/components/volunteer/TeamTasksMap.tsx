import { View } from 'react-native';
import type {
  RescueActiveBatchResponse,
  RescueBatchItem,
} from '@/src/services/rescueTeamService';

interface TeamTasksMapProps {
  batch: RescueActiveBatchResponse | null;
  selectedMission: RescueBatchItem | null;
  currentMission: RescueBatchItem | null;
  routeCoordinates: [number, number][];
  mapStyle: string;
  onSelectMission: (mission: RescueBatchItem) => void;
}

export default function TeamTasksMap(_props: TeamTasksMapProps) {
  return <View style={{ flex: 1 }} />;
}
