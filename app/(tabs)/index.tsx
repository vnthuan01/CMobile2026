import '@/global.css';
import WebViewMap from '@/src/components/common/WebViewMap';
import { useTheme } from '@/src/context/ThemeContext';
import UserHomeContent from '@/src/features/rescue/containers/UserHomeContent';
import VolunteerHomeContent from '@/src/features/volunteer/containers/VolunteerHomeContent';
import { useCitizenProfile } from '@/src/hooks/useCitizenProfile';
import { useCurrentRescueLocation } from '@/src/hooks/useRescueLocation';
import { useAuthStore } from '@/src/store/authStore';
import {
    getTimeGreeting,
    resolveAvatarUrl,
    resolveDisplayName,
} from '@/src/utils/userPresentation';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function IndexScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const user = useAuthStore((s) => s.user);
  const role = (user?.role ?? '').toLowerCase();
  const isVolunteer = role === 'volunteer' || role === 'leader';
  const profileQuery = useCitizenProfile(Boolean(user));
  const profile = profileQuery.data?.profile ?? null;

  const { colors, isDark } = useTheme();
  const iconWrapperBg = isDark ? colors.border : colors.surface;
  const mapHeight = Math.max(220, Math.round((width - 32) * 0.78));
  const [mapReloadKey, setMapReloadKey] = useState(0);
  const previousLocationRef = useRef<string>('');

  const { latitude, longitude, locationLabel, locating } =
    useCurrentRescueLocation();

  const displayName = resolveDisplayName({
    profileDisplayName: profile?.displayName,
    authUserName: user?.user_name,
    email: user?.email,
  });
  const avatarUrl = resolveAvatarUrl({
    profilePictureUrl: profile?.pictureUrl,
    authPictureUrl: null,
  });
  const greetingText = useMemo(
    () => `${getTimeGreeting()}, ${displayName}`,
    [displayName],
  );

  useEffect(() => {
    if (latitude == null || longitude == null) return;

    const currentLocationKey = `${latitude.toFixed(5)},${longitude.toFixed(5)}`;

    if (
      previousLocationRef.current &&
      previousLocationRef.current !== currentLocationKey
    ) {
      setMapReloadKey((v) => v + 1);
    }

    previousLocationRef.current = currentLocationKey;
  }, [latitude, longitude]);

  return (
    <View
      className="relative flex-1 justify-center"
      style={{ backgroundColor: colors.background }}
    >
      {/* ===== CONTENT ===== */}
      <ScrollView
        style={{ paddingTop: top }}
        contentContainerStyle={{ paddingBottom: bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="bg-transparent px-4 py-6 shadow-sm">
          <View className="flex-row items-center justify-between">
            {/* Avatar + Text */}
            <View className="flex-row items-center gap-3">
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  className="rounded-full"
                  resizeMode="cover"
                  style={{ width: 48, height: 48 }}
                />
              ) : (
                <View
                  className="h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.card }}
                >
                  <Ionicons
                    name="person"
                    size={24}
                    color={colors.textSecondary}
                  />
                </View>
              )}

              <View>
                <Text
                  className="text-lg font-bold"
                  style={{ color: colors.text }}
                >
                  {greetingText}
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  {isVolunteer ? 'Tình nguyện viên' : 'Người dân'}
                </Text>
              </View>
            </View>

            {/* Icon */}
            <TouchableOpacity
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: iconWrapperBg }}
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Map */}
        <View className="mb-4 px-4">
          <View
            className="overflow-hidden rounded-xl"
            style={{
              height: mapHeight,
              backgroundColor: colors.surface,
            }}
          >
            {latitude !== null && longitude !== null ? (
              <WebViewMap
                key={`home-map-${mapReloadKey}`}
                center={[longitude, latitude]}
                zoom={15}
                markers={[
                  {
                    id: 'home-current-location',
                    coordinate: [longitude, latitude],
                    color: colors.status.error,
                    size: 18,
                  },
                ]}
                height={mapHeight}
                style={{ width: '100%', borderWidth: 0 }}
              />
            ) : (
              <View className="items-center px-5">
                {locating ? (
                  <>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text
                      className="mt-2 text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      Đang lấy vị trí hiện tại...
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons
                      name="location-outline"
                      size={40}
                      color={colors.textSecondary}
                    />
                    <Text
                      className="mt-2 text-center text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      {locationLabel || 'Không thể lấy vị trí hiện tại.'}
                    </Text>
                  </>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Role content */}
        {isVolunteer ? <VolunteerHomeContent /> : <UserHomeContent />}
      </ScrollView>
    </View>
  );
}
