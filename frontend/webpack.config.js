const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
        favicon: "./src/icons/favicon.ico"
    })
  ]
}