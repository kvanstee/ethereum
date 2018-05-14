const WebpackMonitor = require('webpack-monitor');
const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    index: './app/javascripts/app.js',
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new WebpackMonitor({
      capture: true,
      launch: true,
    }),
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'app'),
//    publicPath: '/'
  },
  module: {
    rules: [{
      test: /\.css$/,
      use: [
	'style-loader',
	'css-loader'
      ]
    }]
  },
  mode: 'development'
}
