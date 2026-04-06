import { View } from 'react-native';

interface UserRescueTrackingMapProps {
  victimCoordinate: [number, number] | null;
  teamCoordinate: [number, number] | null;
  routeCoordinates: [number, number][];
  mapStyle: string;
}

export default function UserRescueTrackingMap(
  _props: UserRescueTrackingMapProps,
) {
  return <View style={{ flex: 1 }} />;
}
