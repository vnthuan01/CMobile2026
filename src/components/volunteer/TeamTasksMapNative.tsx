import WebViewMap from '@/src/components/common/WebViewMap';
import { useTheme } from '@/src/context/ThemeContext';
import {
  RescueActiveBatchResponse,
  RescueBatchItem,
  rescueTeamService,
} from '@/src/services/rescueTeamService';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

declare const require: (moduleName: string) => any;

interface TeamTasksMapNativeProps {
  batch: RescueActiveBatchResponse | null;
  selectedMission: RescueBatchItem | null;
  currentMission: RescueBatchItem | null;
  teamCoordinate: [number, number] | null;
  routeCoordinates: [number, number][];
  mapStyle: string;
  onSelectMission: (mission: RescueBatchItem) => void;
}

interface FallbackMarker {
  id: string;
  coordinate: [number, number];
  color: string;
  size: number;
  icon: string;
}

export default function TeamTasksMapNative({
  batch,
  selectedMission,
  currentMission,
  teamCoordinate,
  routeCoordinates,
  mapStyle,
  onSelectMission,
}: TeamTasksMapNativeProps) {
  const { colors } = useTheme();
  const cameraRef = useRef<any>(null);
  const [zoomLevel, setZoomLevel] = useState(11);
  const [mapInstanceKey, setMapInstanceKey] = useState(0);
  const mapboxToken = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim();

  const mapboxState = useMemo(() => {
    try {
      const module = require('@rnmapbox/maps');

      if (!mapboxToken) {
        return {
          Mapbox: null,
          mapboxLoadError:
            'Thiếu EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN trong môi trường chạy.',
        };
      }

      module.setAccessToken(mapboxToken);
      return { Mapbox: module, mapboxLoadError: null as string | null };
    } catch (error: any) {
      return {
        Mapbox: null,
        mapboxLoadError:
          error?.message || 'Không thể load module native @rnmapbox/maps.',
      };
    }
  }, [mapboxToken]);

  const Mapbox = mapboxState.Mapbox;
  const mapboxLoadError = mapboxState.mapboxLoadError;
  const teamAutoZoomRef = useRef<string | null>(null);

  const fallbackMarkers = useMemo<FallbackMarker[]>(() => {
    const markers: FallbackMarker[] = [];

    if (teamCoordinate) {
      markers.push({
        id: 'team-location',
        coordinate: teamCoordinate,
        color: colors.success,
        size: 30,
        icon: '👥',
      });
    }

    for (const item of batch?.items || []) {
      const coordinate = rescueTeamService.toMapCoordinate(item);
      if (!coordinate) continue;

      const isSelected =
        item.rescueBatchItemId === selectedMission?.rescueBatchItemId;
      const emergency = item.rescueRequestType === 'Emergency';

      markers.push({
        id: item.rescueBatchItemId,
        coordinate,
        color: emergency
          ? colors.error
          : isSelected
            ? colors.warning
            : colors.info,
        size: isSelected ? 26 : 22,
        icon: emergency ? '⚠️' : '📍',
      });
    }

    return markers;
  }, [
    batch?.items,
    colors.error,
    colors.info,
    colors.success,
    colors.warning,
    teamCoordinate,
    selectedMission?.rescueBatchItemId,
  ]);

  const fallbackCenter = useMemo<[number, number]>(() => {
    if (teamCoordinate) return teamCoordinate;

    const selectedCoordinate = selectedMission
      ? rescueTeamService.toMapCoordinate(selectedMission)
      : null;
    if (selectedCoordinate) return selectedCoordinate;

    const currentCoordinate = currentMission
      ? rescueTeamService.toMapCoordinate(currentMission)
      : null;
    if (currentCoordinate) return currentCoordinate;

    return fallbackMarkers[0]?.coordinate || [106.629, 10.724];
  }, [currentMission, fallbackMarkers, selectedMission]);

  useEffect(() => {
    if (!Mapbox?.MapView) return;

    const timer = setTimeout(() => {
      if (teamCoordinate && cameraRef.current?.setCamera) {
        cameraRef.current.setCamera({
          centerCoordinate: teamCoordinate,
          zoomLevel,
          animationDuration: 500,
        });
        return;
      }

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
          zoomLevel: zoomLevel,
          animationDuration: 800,
        });
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [Mapbox, routeCoordinates, selectedMission, teamCoordinate, zoomLevel]);

  useEffect(() => {
    if (!Mapbox?.MapView || !cameraRef.current?.setCamera || !teamCoordinate) {
      return;
    }

    const teamKey = `${teamCoordinate[0].toFixed(6)}:${teamCoordinate[1].toFixed(6)}`;
    if (teamAutoZoomRef.current === teamKey) return;

    teamAutoZoomRef.current = teamKey;
    cameraRef.current.setCamera({
      centerCoordinate: teamCoordinate,
      zoomLevel,
      animationDuration: 500,
    });
  }, [Mapbox, teamCoordinate, zoomLevel]);

  useEffect(() => {
    if (!Mapbox?.MapView || !cameraRef.current?.setCamera) return;

    const coordinate = selectedMission
      ? teamCoordinate
        ? teamCoordinate
        : rescueTeamService.toMapCoordinate(selectedMission)
      : teamCoordinate
        ? teamCoordinate
        : currentMission
          ? rescueTeamService.toMapCoordinate(currentMission)
          : fallbackCenter;

    if (coordinate) {
      cameraRef.current.setCamera({
        centerCoordinate: coordinate,
        zoomLevel,
        animationDuration: 260,
      });
    }
  }, [
    Mapbox,
    fallbackCenter,
    currentMission,
    selectedMission,
    teamCoordinate,
    zoomLevel,
  ]);

  const handleZoom = (delta: number) => {
    setZoomLevel((current) => Math.max(4, Math.min(18, current + delta)));
  };

  const handleFocusTeam = () => {
    if (!teamCoordinate) return;

    const targetZoom = 15;
    setZoomLevel((current) => Math.max(targetZoom, current));

    if (Mapbox?.MapView && cameraRef.current?.setCamera) {
      cameraRef.current.setCamera({
        centerCoordinate: teamCoordinate,
        zoomLevel: targetZoom,
        animationDuration: 500,
      });
      return;
    }

    setMapInstanceKey((current) => current + 1);
  };

  const controlCluster = (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        top: 16,
        right: 14,
        gap: 10,
        zIndex: 999,
        elevation: 999,
      }}
    >
      <TouchableOpacity
        onPress={() => handleZoom(1)}
        activeOpacity={0.85}
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: '#000',
          shadowOpacity: 0.16,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <Ionicons name="add" size={24} color={colors.text} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleZoom(-1)}
        activeOpacity={0.85}
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: '#000',
          shadowOpacity: 0.16,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <Ionicons name="remove" size={24} color={colors.text} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleFocusTeam}
        activeOpacity={0.85}
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.primary,
          borderWidth: 1,
          borderColor: colors.primary,
          shadowColor: '#000',
          shadowOpacity: 0.16,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <Ionicons name="locate" size={22} color={colors.white} />
      </TouchableOpacity>
    </View>
  );

  if (!Mapbox?.MapView) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          position: 'relative',
        }}
      >
        <WebViewMap
          key={mapInstanceKey}
          center={fallbackCenter}
          zoom={15}
          markers={fallbackMarkers}
          routeCoordinates={routeCoordinates}
          routeColor={colors.info}
          style={{ flex: 1, height: '100%' }}
        />
        <View
          className="absolute left-4 right-4 top-4 rounded-2xl border px-4 py-3"
          style={{
            borderColor: colors.border,
            backgroundColor: `${colors.card}F2`,
          }}
        >
          <Text
            className="text-sm font-semibold"
            style={{ color: colors.text }}
          >
            Đang dùng bản đồ web dự phòng
          </Text>
          <Text
            className="mt-1 text-xs leading-5"
            style={{ color: colors.textSecondary }}
          >
            {mapboxLoadError ||
              'Mapbox native chưa sẵn sàng trong môi trường này, nên màn hình sẽ hiển thị bản đồ Goong thay thế.'}
          </Text>
        </View>
        {controlCluster}
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        position: 'relative',
      }}
    >
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
            teamCoordinate ||
            (selectedMission &&
            rescueTeamService.toMapCoordinate(selectedMission)
              ? rescueTeamService.toMapCoordinate(selectedMission)!
              : [106.629, 10.724])
          }
        />

        {teamCoordinate ? (
          <Mapbox.PointAnnotation
            id="team-location"
            coordinate={teamCoordinate}
          >
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: colors.success,
                borderWidth: 3,
                borderColor: colors.white,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOpacity: 0.24,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <Ionicons name="people" size={18} color={colors.white} />
              <View
                style={{
                  position: 'absolute',
                  bottom: -8,
                  paddingHorizontal: 6,
                  paddingVertical: 1,
                  borderRadius: 999,
                  backgroundColor: colors.success,
                }}
              >
                <Text
                  style={{
                    fontSize: 9,
                    fontWeight: '700',
                    color: colors.white,
                  }}
                >
                  Đội
                </Text>
              </View>
            </View>
          </Mapbox.PointAnnotation>
        ) : null}

        {batch?.items?.map((item) => {
          const coordinate = rescueTeamService.toMapCoordinate(item);
          if (!coordinate) return null;

          const isSelected =
            item.rescueBatchItemId === selectedMission?.rescueBatchItemId;
          const emergency = item.rescueRequestType === 'Emergency';
          const markerSize = isSelected ? 30 : 24;
          const markerIcon = emergency ? 'warning' : 'location';
          const markerColor = emergency ? colors.error : colors.info;

          return (
            <Mapbox.PointAnnotation
              key={item.rescueBatchItemId}
              id={item.rescueBatchItemId}
              coordinate={coordinate}
              onSelected={() => onSelectMission(item)}
            >
              <View
                style={{
                  width: markerSize,
                  height: markerSize,
                  borderRadius: markerSize / 2,
                  backgroundColor: markerColor,
                  borderWidth: isSelected ? 4 : 3,
                  borderColor: isSelected ? colors.warning : colors.white,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#000',
                  shadowOpacity: 0.22,
                  shadowOffset: { width: 0, height: 2 },
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                <Ionicons
                  name={markerIcon as any}
                  size={15}
                  color={colors.white}
                />
              </View>
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
      {controlCluster}
    </View>
  );
}
