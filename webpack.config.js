const path = require("path");

module.exports = {
  target:  "node",
  mode:    "production",
  resolve: { extensions: [".ts", ".js"] },
  entry:   {
    client: "./source/client.ts",
    helper: "./source/helper.ts",
    types: "./source/types.ts"
  },

  output: {
    path:          path.resolve("./compiled"),
    library:       "",
    filename:      "[name].js",
    libraryTarget: "commonjs2"
  },

  module: {
    rules: [{
      test:    /\.ts$/,
      loader:  "ts-loader",
      exclude: /node_modules/
    }]
  }
};
