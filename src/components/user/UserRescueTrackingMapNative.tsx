import { rescueTeamService } from '@/src/services/rescueTeamService';
import Mapbox from '@rnmapbox/maps';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '');

interface UserRescueTrackingMapNativeProps {
  victimCoordinate: [number, number] | null;
  teamCoordinate: [number, number] | null;
  routeCoordinates: [number, number][];
  mapStyle: string;
}

export default function UserRescueTrackingMapNative({
  victimCoordinate,
  teamCoordinate,
  routeCoordinates,
  mapStyle,
}: UserRescueTrackingMapNativeProps) {
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (routeCoordinates.length >= 2 && cameraRef.current?.fitBounds) {
        const lngs = routeCoordinates.map((coord) => coord[0]);
        const lats = routeCoordinates.map((coord) => coord[1]);
        const ne: [number, number] = [Math.max(...lngs), Math.max(...lats)];
        const sw: [number, number] = [Math.min(...lngs), Math.min(...lats)];
        cameraRef.current.fitBounds(ne, sw, [50, 40, 50, 40], 800);
        return;
      }

      const focus = teamCoordinate || victimCoordinate;
      if (focus && cameraRef.current?.setCamera) {
        cameraRef.current.setCamera({
          centerCoordinate: focus,
          zoomLevel: 13,
          animationDuration: 800,
        });
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [routeCoordinates, teamCoordinate, victimCoordinate]);

  return (
    <Mapbox.MapView
      style={{ flex: 1 }}
      styleURL={mapStyle}
      zoomEnabled
      scrollEnabled
      rotateEnabled
      pitchEnabled
      attributionEnabled={false}
      logoEnabled={false}
    >
      <Mapbox.Camera
        ref={cameraRef}
        zoomLevel={11}
        centerCoordinate={
          teamCoordinate || victimCoordinate || [106.629, 10.724]
        }
      />

      {victimCoordinate ? (
        <Mapbox.PointAnnotation
          id="victim-marker"
          coordinate={victimCoordinate}
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
      ) : null}

      {teamCoordinate ? (
        <Mapbox.PointAnnotation id="team-marker" coordinate={teamCoordinate}>
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: '#1565C0',
              borderWidth: 3,
              borderColor: '#FFFFFF',
            }}
          />
        </Mapbox.PointAnnotation>
      ) : null}

      {routeCoordinates.length > 1 ? (
        <Mapbox.ShapeSource
          id="user-rescue-line-source"
          shape={{
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: routeCoordinates,
            },
            properties: {},
          }}
        >
          <Mapbox.LineLayer
            id="user-rescue-line-layer"
            style={{
              lineColor: '#2E64FE',
              lineWidth: 6,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        </Mapbox.ShapeSource>
      ) : null}
    </Mapbox.MapView>
  );
}
