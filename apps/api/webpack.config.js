const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = function (options, webpack) {
  return {
    ...options,
    externals: [
      nodeExternals({
        allowlist: [/^@viztechstack/],
      }),
    ],
    resolve: {
      ...options.resolve,
      alias: {
        '@viztechstack/env': path.resolve(__dirname, '../../tooling/env/dist'),
        '@viztechstack/convex': path.resolve(
          __dirname,
          '../../convex/_generated',
        ),
      },
      extensions: ['.js', '.json', '.ts'],
    },
  };
};
