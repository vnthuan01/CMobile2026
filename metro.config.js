const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = config.resolver;

// Work around Metro package exports resolution issues with
// @tanstack/react-query in this Expo/React Native setup.
config.resolver.unstable_enablePackageExports = false;
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts = [...sourceExts, 'svg'];

module.exports = withNativeWind(config, { input: './global.css' });
