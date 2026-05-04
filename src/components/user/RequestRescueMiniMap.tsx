import WebViewMap from '@/src/components/common/WebViewMap';

// getGoongWebStyleUrl drives the tile URL used by WebViewMap internally;
// the mapStyle prop carries the native Mapbox URL which is not used on web.

interface RequestRescueMiniMapProps {
  coordinate: [number, number];
}

export default function RequestRescueMiniMap({
  coordinate,
}: RequestRescueMiniMapProps) {
  return (
    <WebViewMap
      center={coordinate}
      zoom={15}
      markers={[
        {
          id: 'rescue-location',
          coordinate,
          color: '#DC2626',
          size: 18,
        },
      ]}
      style={{ flex: 1 }}
    />
  );
}
