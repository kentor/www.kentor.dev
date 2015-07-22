const data = require('./data');
const StaticSiteGenerator = require('static-site-generator-webpack-plugin');
const routes = require('./routes');

module.exports = {
  entry: './src/js/index.js',
  output: {
    filename: 'bundle.js',
    path: 'public',
    libraryTarget: 'umd',
  },
  module: {
    loaders: [
      { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel' },
    ],
  },
  plugins: [
    new StaticSiteGenerator('bundle.js', routes, data),
  ],
};
