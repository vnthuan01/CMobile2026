import { Image, type ImageStyle, type StyleProp } from 'react-native';

interface QuickActionIconProps {
  size?: number;
  style?: StyleProp<ImageStyle>;
}

export function VolunteerQuickActionIcon({
  size = 72,
  style,
}: QuickActionIconProps) {
  return (
    <Image
      source={require('./generated/tinhnguyen.png')}
      style={[{ width: size, height: size, resizeMode: 'contain' }, style]}
    />
  );
}

export function TrackingQuickActionIcon({
  size = 72,
  style,
}: QuickActionIconProps) {
  return (
    <Image
      source={require('./generated/theodoi.png')}
      style={[{ width: size, height: size, resizeMode: 'contain' }, style]}
    />
  );
}

export function DonateQuickActionIcon({
  size = 72,
  style,
}: QuickActionIconProps) {
  return (
    <Image
      source={require('./generated/donate.png')}
      style={[{ width: size, height: size, resizeMode: 'contain' }, style]}
    />
  );
}
