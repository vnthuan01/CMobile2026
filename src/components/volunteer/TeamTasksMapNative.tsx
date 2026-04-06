import {
  rescueTeamService,
  RescueActiveBatchResponse,
  RescueBatchItem,
} from '@/src/services/rescueTeamService';
import { useTheme } from '@/src/context/ThemeContext';
import Mapbox from '@rnmapbox/maps';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '');

interface TeamTasksMapNativeProps {
  batch: RescueActiveBatchResponse | null;
  selectedMission: RescueBatchItem | null;
  currentMission: RescueBatchItem | null;
  routeCoordinates: [number, number][];
  mapStyle: string;
  onSelectMission: (mission: RescueBatchItem) => void;
}

export default function TeamTasksMapNative({
  batch,
  selectedMission,
  currentMission,
  routeCoordinates,
  mapStyle,
  onSelectMission,
}: TeamTasksMapNativeProps) {
  const { colors } = useTheme();
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (routeCoordinates.length >= 2 && cameraRef.current?.fitBounds) {
        const lngs = routeCoordinates.map((coord) => coord[0]);
        const lats = routeCoordinates.map((coord) => coord[1]);

        const ne: [number, number] = [Math.max(...lngs), Math.max(...lats)];
        const sw: [number, number] = [Math.min(...lngs), Math.min(...lats)];

        cameraRef.current.fitBounds(ne, sw, [60, 40, 280, 40], 800);
        return;
      }

      const coordinate = selectedMission
        ? rescueTeamService.toMapCoordinate(selectedMission)
        : null;

      if (coordinate && cameraRef.current?.setCamera) {
        cameraRef.current.setCamera({
          centerCoordinate: coordinate,
          zoomLevel: 13,
          animationDuration: 800,
        });
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [routeCoordinates, selectedMission]);

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
          selectedMission && rescueTeamService.toMapCoordinate(selectedMission)
            ? rescueTeamService.toMapCoordinate(selectedMission)!
            : [106.629, 10.724]
        }
      />

      {batch?.items?.map((item) => {
        const coordinate = rescueTeamService.toMapCoordinate(item);
        if (!coordinate) return null;

        const isSelected =
          item.rescueBatchItemId === selectedMission?.rescueBatchItemId;
        const isCurrent =
          item.rescueBatchItemId === currentMission?.rescueBatchItemId;
        const emergency = item.rescueRequestType === 'Emergency';

        return (
          <Mapbox.PointAnnotation
            key={item.rescueBatchItemId}
            id={item.rescueBatchItemId}
            coordinate={coordinate}
            onSelected={() => onSelectMission(item)}
          >
            <View
              style={{
                width: isSelected ? 26 : isCurrent ? 24 : 18,
                height: isSelected ? 26 : isCurrent ? 24 : 18,
                borderRadius: 14,
                backgroundColor: emergency ? colors.error : colors.info,
                borderWidth: isSelected ? 4 : 3,
                borderColor: isSelected
                  ? colors.warning
                  : isCurrent
                    ? colors.success
                    : colors.white,
              }}
            />
          </Mapbox.PointAnnotation>
        );
      })}

      {routeCoordinates.length > 1 ? (
        <Mapbox.ShapeSource
          id="lineSource"
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
            id="lineLayer"
            style={{
              lineColor: colors.info,
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
