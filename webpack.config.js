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
};
