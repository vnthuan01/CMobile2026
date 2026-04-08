module.exports = function (api) {
  api.cache(true);
  const isWeb = process.env.EXPO_OS === 'web';

  return {
    presets: ['babel-preset-expo', 'nativewind/babel'],

    plugins: [
      // alias path
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            'tailwind.config': './tailwind.config.js',
          },
        },
      ],

      ...(!isWeb ? ['react-native-worklets/plugin'] : []),

      // Inline plugin to strip import.meta
      function ({ types: t }) {
        return {
          visitor: {
            MetaProperty(path) {
              if (
                path.node.meta.name === 'import' &&
                path.node.property.name === 'meta'
              ) {
                path.replaceWith(t.objectExpression([]));
              }
            },
          },
        };
      },
    ],
  };
};
