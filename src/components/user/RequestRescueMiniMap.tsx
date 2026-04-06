import { View } from 'react-native';

interface RequestRescueMiniMapProps {
  coordinate: [number, number];
  mapStyle: string;
}

export default function RequestRescueMiniMap(
  _props: RequestRescueMiniMapProps,
) {
  return <View style={{ flex: 1 }} />;
}
