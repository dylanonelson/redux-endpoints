var path = require('path');

var config = require('./webpack.config.js');

config.module.rules.unshift({
  test: /mocha.setup.js$/,
  use: [{
    loader: 'file-loader',
  }]
});

module.exports = Object.assign({}, config, {
  entry: './test/src/index.js',
  output: {
    filename: 'test.bundle.js',
    path: path.join(__dirname, 'test', 'dist'),
  },
  resolve: {
    modules: [
      '.',
      'node_modules',
    ],
  }
});
