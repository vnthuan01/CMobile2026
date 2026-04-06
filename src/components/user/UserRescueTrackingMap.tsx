import WebViewMap from '@/src/components/common/WebViewMap';

interface UserRescueTrackingMapProps {
  victimCoordinate: [number, number] | null;
  teamCoordinate: [number, number] | null;
  routeCoordinates: [number, number][];
  mapStyle: string;
}

export default function UserRescueTrackingMap(
  props: UserRescueTrackingMapProps,
) {
  const center =
    props.teamCoordinate || props.victimCoordinate || ([106.629, 10.724] as const)

  const markers = [
    props.victimCoordinate
      ? {
          id: 'victim',
          coordinate: props.victimCoordinate,
          color: '#DC2626',
          size: 18,
        }
      : null,
    props.teamCoordinate
      ? {
          id: 'team',
          coordinate: props.teamCoordinate,
          color: '#1565C0',
          size: 18,
        }
      : null,
  ].filter(Boolean) as Array<{
    id: string
    coordinate: [number, number]
    color: string
    size?: number
  }>

  return (
    <WebViewMap
      center={center}
      zoom={13}
      markers={markers}
      routeCoordinates={props.routeCoordinates}
      routeColor="#2E64FE"
      style={{ flex: 1 }}
    />
  )
}
