const { composePlugins, withNx } = require('@nx/webpack');
const swcDefaultConfig =
  require('@nestjs/cli/lib/compiler/defaults/swc-defaults').swcDefaultsFactory()
    .swcOptions;

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), (config) => {
  const combinedConfig = Object.assign(config);

  const {
    module: { rules },
  } = config;
  combinedConfig.module.rules = rules
    .filter((r) => !r.loader?.match(/(ts-loader)/))
    .concat([
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'swc-loader',
          options: swcDefaultConfig,
        },
      },
    ]);

  return combinedConfig;
});
