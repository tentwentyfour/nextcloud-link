const path = require("path");

module.exports = {
  target:  "node",
  resolve: { extensions: [".ts", ".js"] },
  entry:   { client: "./source/client.ts" },
  output:  { path: path.resolve("./compiled"), filename: "[name].js" },

  module: {
    rules: [
      {
        enforce: "pre",
        test:    /\.ts$/,
        include: ["source"],
        loader:  "tslint-loader",
        options: { typeCheck: true }
      },

      {
        test:    /\.ts$/,
        loader:  "ts-loader",
        exclude: /node_modules/
      }
    ]
  }
};
