const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { resolve } = require('metro-resolver');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    ...defaultConfig.resolver,
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName.startsWith('@/')) {
        const newModuleName = path.resolve(
          __dirname,
          'src',
          moduleName.slice(2),
        );
        return resolve(context, newModuleName, platform);
      }

      return resolve(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
