const path = require('path');
const webpack = require('webpack');
const backendNodeModules = path.resolve(__dirname, 'node_modules');
const rootNodeModules = path.resolve(__dirname, '../node_modules');
const sharedDist = path.resolve(__dirname, '../shared/dist');

module.exports = {
  entry: './src/main.ts',
  target: 'node',
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@backend': path.resolve(__dirname, 'src'),
      '@smartjob/shared': sharedDist,
    },
    modules: [backendNodeModules, rootNodeModules, 'node_modules'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            configFile: 'tsconfig.json',
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.html$/,
        loader: 'ignore-loader',
      },
    ],
  },
  plugins: [
    new webpack.IgnorePlugin({
      checkResource(resource) {
        if (resource.startsWith('@mapbox/node-pre-gyp')) {
          return true;
        }
        return false;
      },
    }),
  ],
  node: {
    __dirname: false,
    __filename: false,
  },
};