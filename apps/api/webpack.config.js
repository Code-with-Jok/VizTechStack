const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = function (options) {
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
        "@viztechstack/env": path.resolve(__dirname, "../../tooling/env/dist"),
      },
      extensions: [".js", ".json", ".ts"],
    },
  };
};
