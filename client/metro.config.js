const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Fix for ESM resolution in dependencies like @iabtcf/core
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];
config.resolver.unstable_enablePackageExports = true;
config.resolver.resolverMainFields = ['sbmodern', 'browser', 'main', 'module'];

module.exports = withNativeWind(config, { input: "./src/theme/global.css" });
