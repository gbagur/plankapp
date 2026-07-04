const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Firebase's package.json "exports" map doesn't resolve cleanly under Metro's
// package-exports resolution (https://github.com/firebase/firebase-js-sdk/issues/6873).
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
