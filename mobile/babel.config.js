module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@api': './src/api',
            '@screens': './src/screens',
            '@components': './src/components',
            '@store': './src/store',
            '@hooks': './src/hooks',
            '@utils': './src/utils',
            '@theme': './src/theme',
            '@navigation': './src/navigation',
          },
        },
      ],
    ],
  }
}
