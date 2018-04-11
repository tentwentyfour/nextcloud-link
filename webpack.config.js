const path = require("path");

const tsConfigFile = "tsconfig.json";

module.exports = {
  entry:  { client: "./source/client.ts" },
  output: { path: path.resolve("./compiled"), filename: "[name].js" },

  module: {
    rules: [
      {
        enforce: "pre",
        test:    /\.ts$/,
        include: ["source"],
        loader:  "tslint-loader",
        options: { typeCheck: true, tsConfigFile }
      },

      {
        test:    /\.ts$/,
        loader:  "ts-loader",
        exclude: /node_modules/,
        options: { configFile: tsConfigFile }
      }
    ]
  }
};
