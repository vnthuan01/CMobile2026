import Mapbox from '@rnmapbox/maps';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '');

interface RequestRescueMiniMapNativeProps {
  coordinate: [number, number];
  mapStyle: string;
}

export default function RequestRescueMiniMapNative({
  coordinate,
  mapStyle,
}: RequestRescueMiniMapNativeProps) {
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      cameraRef.current?.setCamera?.({
        centerCoordinate: coordinate,
        zoomLevel: 15,
        animationDuration: 600,
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [coordinate]);

  return (
    <Mapbox.MapView
      style={{ flex: 1 }}
      styleURL={mapStyle}
      zoomEnabled
      scrollEnabled
      rotateEnabled={false}
      pitchEnabled={false}
      attributionEnabled={false}
      logoEnabled={false}
    >
      <Mapbox.Camera
        ref={cameraRef}
        zoomLevel={15}
        centerCoordinate={coordinate}
      />

      <Mapbox.PointAnnotation
        id="request-location-marker"
        coordinate={coordinate}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: '#DC2626',
            borderWidth: 3,
            borderColor: '#FFFFFF',
          }}
        />
      </Mapbox.PointAnnotation>
    </Mapbox.MapView>
  );
}
