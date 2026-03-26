const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Fix for ESM resolution in dependencies like @iabtcf/core
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];
config.resolver.unstable_enablePackageExports = true;
config.resolver.resolverMainFields = ['react-native', 'sbmodern', 'browser', 'main', 'module'];


// Optional: Hash assets for production stability
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

module.exports = withNativeWind(config, { input: "./src/theme/global.css" });
