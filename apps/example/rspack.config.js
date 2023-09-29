const { composePlugins, withNx } = require('@nx/rspack');

module.exports = composePlugins(withNx(), (config) => {
  const { externals, devServer } = config;
  Object.assign(config, {
    externals: {
      ...externals,
      '@apollo/server/plugin/landingPage/default':
        '@apollo/server/plugin/landingPage/default',
    },
    devServer: {
      ...devServer,
      hot: false,
    },
  });

  return config;
});
