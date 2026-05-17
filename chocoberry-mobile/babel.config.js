module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@api': './src/api',
            '@screens': './src/screens',
            '@components': './src/components',
            '@store': './src/store',
            '@hooks': './src/hooks',
            '@i18n': './src/i18n',
            '@utils': './src/utils',
            '@theme': './src/theme',
            '@types': './src/types',
          },
        },
      ],
    ],
  };
};
