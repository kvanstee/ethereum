const WebpackMonitor = require('webpack-monitor');
const path = require('path');
const webpack = require('webpack');
const fs = require('fs');

var nodeModules = {};
fs.readdirSync('node_modules').filter(function(x) {
  return ['.bin'].indexOf(x) === -1;
}).forEach(function(mod) {
  nodeModules[mod] = 'commonjs ' + mod;
});

module.exports = [
  {
    name: "client",
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
  },
  {
    name: 'server',
    entry: './app/javascripts/server.js',
    target: 'node',
    output: {
      filename: 'backend.js',
      path: path.resolve(__dirname, 'app'),
    },
    node: {
    __dirname: true,
    __filename: true
    },
    externals: nodeModules,
    mode: 'development',
    plugins: [
      new webpack.IgnorePlugin(/\.(css|less)$/),
      new webpack.BannerPlugin('require("source-map-support").install();')//, { raw: true, entryOnly: false })
    ]
  }
]

