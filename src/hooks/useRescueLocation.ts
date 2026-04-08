import { useEffect, useState } from 'react';
import { getCurrentLocation } from '../services/rescueService';

export function useCurrentRescueLocation() {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [address, setAddress] = useState('');
  const [locationLabel, setLocationLabel] = useState('Đang lấy vị trí…');
  const [locating, setLocating] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const loc = await getCurrentLocation();
        setLatitude(loc.latitude);
        setLongitude(loc.longitude);
        setAccuracy(loc.accuracy);
        setAddress(loc.address);
        setLocationLabel(loc.displayLabel);
      } catch (err: any) {
        setLocationLabel(err?.message ?? 'Không thể lấy vị trí.');
      } finally {
        setLocating(false);
      }
    })();
  }, []);

  return {
    latitude,
    longitude,
    accuracy,
    address,
    setAddress,
    locationLabel,
    locating,
  };
}
