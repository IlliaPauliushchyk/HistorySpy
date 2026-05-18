module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      [
        'module-resolver',
        {
          extensions: [
            '.js',
            '.jsx',
            '.ts',
            '.tsx',
            '.ios.js',
            '.android.js',
            '.ios.tsx',
            '.android.tsx',
          ],
          root: ['./'],
          alias: {
            '@': './src',
            '@/': './src/',
          },
        },
      ],
    ],
    env: {
      production: {
        plugins: ['react-native-paper/babel'],
      },
    },
  };
};
