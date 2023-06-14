const path = require('path');

module.exports = {
  entry: './src/frontEndV1.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  externals: {
      'https://code.jquery.com/jquery-3.7.0.min.js': '$' 
  },
};