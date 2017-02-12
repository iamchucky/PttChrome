const webpack = require('webpack');
const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');

const config = {
  entry: {
    // vender: './src/vendor',
    app: './src/app'
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  module: {
    rules: [
      { enforce: 'pre', test: /\.ts$/, exclude: /node_modules/, loader: 'tslint-loader' },
      { test: /\.ts$/, exclude: /node_modules/, loader: 'ts-loader' },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.html/, loader: 'html-loader?minimize=false' },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.(gif|png|jpe?g)$/i, loader: 'file-loader?name=dist/images/[name].[ext]' },
      { test: /\.woff2?$/, loader: 'url-loader?name=dist/fonts/[name].[ext]&limit=10000&mimetype=application/font-woff' },
      { test: /\.(ttf|eot|svg)$/, loader: 'file-loader?name=dist/fonts/[name].[ext]' }
    ]
  }
}

if (!(process.env.WEBPACK_ENV === 'production')) {
  config.devtool = 'source-map';
  config.plugins = [
    new webpack.DefinePlugin({
      'WEBPACK_ENV': '"dev"'
    })
  ]
} else {
  config.devtool = 'hidden-source-map';
  config.plugins = [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        screw_ie8: true,
        warnings: false
      },
      comments: false,
      sourceMap: true
    }),
    new webpack.DefinePlugin({
      'WEBPACK_ENV': '"production"'
    }),
    new CopyWebpackPlugin([{ from: './src/index.html' }], {})
  ];
}

module.exports = config;