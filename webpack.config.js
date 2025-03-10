module.exports = {
  // ...existing code...
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /my-hrm-infra/,
        use: {
          loader: 'babel-loader',
          options: {}
        }
      }
    ]
  }
};