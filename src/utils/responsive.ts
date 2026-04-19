const BASE_WIDTH = 412;
const BASE_HEIGHT = 915;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export interface ScreenScaleConfig {
  scale: number;
  verticalScale: number;
  fontScale: number;
  fontSizeScale: number;
  horizontalPadding: number;
  contentMaxWidth: number;
  isCompactHeight: boolean;
  profile: 'compact' | 'regular' | 'large' | 'xlarge';
}

export const getScreenScaleConfig = (
  width: number,
  height: number,
  fontScale = 1,
): ScreenScaleConfig => {
  const widthRatio = width / BASE_WIDTH;
  const heightRatio = height / BASE_HEIGHT;
  const scale = clamp(Math.min(widthRatio, heightRatio), 0.9, 1.12);
  const verticalScale = clamp(heightRatio, 0.9, 1.12);
  const normalizedFontScale = clamp(fontScale || 1, 0.95, 1.3);
  const fontSizeScale = clamp(scale / normalizedFontScale, 0.9, 1.1);

  const shortestSide = Math.min(width, height);
  const profile: ScreenScaleConfig['profile'] =
    shortestSide < 360
      ? 'compact'
      : shortestSide < 400
        ? 'regular'
        : shortestSide < 480
          ? 'large'
          : 'xlarge';

  return {
    scale,
    verticalScale,
    fontScale: normalizedFontScale,
    fontSizeScale,
    horizontalPadding: Math.round(clamp(20 * widthRatio, 16, 24)),
    contentMaxWidth: width >= 430 ? 440 : 412,
    isCompactHeight: height < 780,
    profile,
  };
};

export const scaleSize = (value: number, config: ScreenScaleConfig) =>
  Math.round(value * config.scale);

export const scaleFont = (value: number, config: ScreenScaleConfig) =>
  Math.round(value * config.fontSizeScale);
