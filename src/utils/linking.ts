import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

export async function openExternalNavigation(item: {
  latitude: number | null;
  longitude: number | null;
}): Promise<boolean> {
  if (item.latitude == null || item.longitude == null) return false;

  const lat = item.latitude;
  const lng = item.longitude;

  const googleNative = `google.navigation:q=${lat},${lng}`;
  const googleWeb = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const appleMaps = `http://maps.apple.com/?daddr=${lat},${lng}`;

  try {
    if (
      Platform.OS === 'android' &&
      (await Linking.canOpenURL(googleNative))
    ) {
      await Linking.openURL(googleNative);
      return true;
    }

    if (Platform.OS === 'ios' && (await Linking.canOpenURL(appleMaps))) {
      await Linking.openURL(appleMaps);
      return true;
    }

    await Linking.openURL(googleWeb);
    return true;
  } catch {
    return false;
  }
}

export async function openCallReporter(phone?: string | null): Promise<boolean> {
  if (!phone) return false;
  try {
    await Linking.openURL(`tel:${phone}`);
    return true;
  } catch {
    return false;
  }
}
