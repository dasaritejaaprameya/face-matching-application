const webpack = require('webpack');

module.exports = {
  resolve: {
    fallback: {
      fs: false // Disable 'fs' for frontend builds
    }
  }
};
