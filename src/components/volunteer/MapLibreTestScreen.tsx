import '@/global.css';
import ScreenHeader from '@/src/components/common/ScreenHeader';
import { useTheme } from '@/src/context/ThemeContext';
import Constants from 'expo-constants';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

const supportsNativeMap = Constants.appOwnership !== 'expo';

let MapLibreGL: any = null;
let nativeLoadError: string | null = null;

if (supportsNativeMap) {
  try {
    MapLibreGL = require('@maplibre/maplibre-react-native').default;
    MapLibreGL?.setAccessToken?.(null);
  } catch (error: any) {
    nativeLoadError =
      error?.message || 'Không thể load MapLibre native module.';
    MapLibreGL = null;
  }
}

interface MapLibreTestScreenProps {
  onBack?: () => void;
}

export default function MapLibreTestScreen({
  onBack,
}: MapLibreTestScreenProps) {
  const { colors } = useTheme();

  const mapStyle = useMemo(() => {
    const key = process.env.EXPO_PUBLIC_GOONG_MAP_KEY;
    if (!key) return null;
    return `https://tiles.goong.io/assets/goong_map_web.json?api_key=${key}`;
  }, []);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScreenHeader title="MapLibre Test" onBack={onBack} />

      {!supportsNativeMap ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text
            className="text-center text-base"
            style={{ color: colors.textSecondary }}
          >
            Bạn đang chạy Expo Go. Hãy mở bằng development build để test native
            map.
          </Text>
        </View>
      ) : nativeLoadError ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text
            className="text-center text-lg font-bold"
            style={{ color: colors.error }}
          >
            MapLibre native load failed
          </Text>
          <Text
            className="mt-3 text-center text-base"
            style={{ color: colors.textSecondary }}
          >
            {nativeLoadError}
          </Text>
        </View>
      ) : !mapStyle ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text
            className="text-center text-base"
            style={{ color: colors.textSecondary }}
          >
            Thiếu EXPO_PUBLIC_GOONG_MAP_KEY.
          </Text>
        </View>
      ) : (
        <MapLibreGL.MapView
          style={{ flex: 1 }}
          styleURL={mapStyle}
          zoomEnabled
          scrollEnabled
          rotateEnabled
          pitchEnabled
          attributionEnabled={false}
          logoEnabled={false}
        >
          <MapLibreGL.Camera
            zoomLevel={12}
            centerCoordinate={[105.83991, 21.028]}
          />

          <MapLibreGL.PointAnnotation
            id="test-marker"
            coordinate={[105.83991, 21.028]}
          />
        </MapLibreGL.MapView>
      )}
    </View>
  );
}
