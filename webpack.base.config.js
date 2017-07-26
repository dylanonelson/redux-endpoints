var path = require('path');
var webpack = require('webpack');

module.exports = {
  devServer: {
    contentBase: 'dist',
    historyApiFallback: true,
    inline: true,
    port: 1104
  },
  devtool: 'source-map',
  entry: {
    index: './src/index.js',
  },
  module: {
    rules: [{
      exclude: /node_modules/,
      test: /\.jsx?$/,
      use: ['babel-loader'],
    },{
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader',
      ],
    }, {
      test: /\.html/,
      use: [{
        loader: 'file-loader',
        options: {
          name: '[name].html',
        },
      }],
    }, {
      enforce: 'pre',
      include: /src/,
      use: [{
        loader: 'eslint-loader',
        options: {
          fix: true,
        },
      }],
      test: /\.js?$/,
    }],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      },
    }),
  ],
  resolve: {
    modules: [
      path.join(__dirname, 'src'),
      'node_modules'
    ],
  }
}
