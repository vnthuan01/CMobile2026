const GOONG_API_KEY = process.env.EXPO_PUBLIC_GOONG_API_KEY ?? '';

export function getMapStyleUrl(): string | null {
  const token = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!token) return null;
  return 'mapbox://styles/mapbox/streets-v12';
}

export function decodePolyline(encoded: string): [number, number][] {
  let index = 0;
  let lat = 0;
  let lng = 0;
  const coordinates: [number, number][] = [];

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    coordinates.push([lng / 1e5, lat / 1e5]);
  }

  return coordinates;
}

export function toMapCoordinate(item: {
  longitude: number | null;
  latitude: number | null;
}): [number, number] | null {
  if (item.longitude == null || item.latitude == null) return null;
  return [item.longitude, item.latitude];
}

export function getGoongWebStyleUrl(): string {
  return `https://tiles.goong.io/assets/goong_map_web.json?api_key=${process.env.EXPO_PUBLIC_GOONG_MAP_KEY ?? ''}`;
}

export async function fetchDirectionsPolyline(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number },
): Promise<{
  success: boolean;
  polyline: string | null;
  distanceMeters: number | null;
  durationSeconds: number | null;
}> {
  if (!GOONG_API_KEY) {
    return {
      success: false,
      polyline: null,
      distanceMeters: null,
      durationSeconds: null,
    };
  }

  try {
    const url = `https://rsapi.goong.io/Direction?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&vehicle=car&api_key=${GOONG_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    const route = data?.routes?.[0];
    const polyline = route?.overview_polyline?.points ?? null;
    const distanceMeters = route?.legs?.[0]?.distance?.value ?? null;
    const durationSeconds = route?.legs?.[0]?.duration?.value ?? null;

    return {
      success: !!polyline,
      polyline,
      distanceMeters,
      durationSeconds,
    };
  } catch {
    return {
      success: false,
      polyline: null,
      distanceMeters: null,
      durationSeconds: null,
    };
  }
}
