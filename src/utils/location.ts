import * as Location from 'expo-location';
import type { LocationResult } from '../types/rescue';

const GOONG_API_KEY = process.env.EXPO_PUBLIC_GOONG_API_KEY ?? '';
const GOONG_REVERSE_GEOCODE = 'https://rsapi.goong.io/Geocode';

/**
 * Requests permission and gets the current GPS location, then reverse-geocodes
 * the coordinates using Goong Maps API (preferred) or expo-location fallback.
 */
export async function getCurrentLocation(): Promise<LocationResult> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Không có quyền truy cập vị trí.');
  }

  const loc = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  const { latitude, longitude } = loc.coords;
  const accuracy = Math.round(loc.coords.accuracy ?? 0);

  // ── Try Goong Maps first ──────────────────────────────────────────────────
  if (GOONG_API_KEY) {
    try {
      const url = `${GOONG_REVERSE_GEOCODE}?latlng=${latitude},${longitude}&api_key=${GOONG_API_KEY}`;
      const resp = await fetch(url);
      const json = await resp.json();
      const result = json?.results?.[0];
      if (result) {
        const address: string = result.formatted_address ?? '';
        return {
          latitude,
          longitude,
          accuracy,
          address,
          displayLabel: `${address} (±${accuracy}m)`,
        };
      }
    } catch {
      // fall through to expo-location
    }
  }

  // ── Fallback: expo-location reverse geocode ───────────────────────────────
  const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
  if (geo.length > 0) {
    const g = geo[0];
    const parts = [g.street, g.district, g.city].filter(Boolean);
    const address = parts.join(', ');
    return {
      latitude,
      longitude,
      accuracy,
      address,
      displayLabel: `${address} (±${accuracy}m)`,
    };
  }

  return {
    latitude,
    longitude,
    accuracy,
    address: '',
    displayLabel: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
  };
}
