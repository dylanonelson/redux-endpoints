var path = require('path');

var config = require('./webpack.base.config.js');

config.output = {
  filename: 'index.bundle.js',
  libraryTarget: 'umd',
  library: 'redux-endpoints',
  path: path.join(__dirname, 'dist'),
};

module.exports = config;
