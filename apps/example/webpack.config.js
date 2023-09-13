const { composePlugins, withNx } = require('@nx/webpack');
const swcDefaultConfig =
  require('@nestjs/cli/lib/compiler/defaults/swc-defaults').swcDefaultsFactory()
    .swcOptions;

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), (config) => {
  config.module.rules = [
    {
      test: /\.ts$/,
      exclude: /node_modules/,
      use: {
        loader: 'swc-loader',
        options: swcDefaultConfig,
      },
    },
  ];
  return config;
});
