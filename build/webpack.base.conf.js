const { VueLoaderPlugin } = require('vue-loader')
const path = require("path");

const isProd = (process.env.NODE_ENV === 'production');
const resolve = filePath => path.resolve(__dirname, '../', filePath);
const ServerMiniCssExtractPlugin = require('./miniCssExtractPlugin');
const generateStyleLoader = require('./generateStyleLoader');

module.exports = {
  mode: isProd ? 'production' : 'development',
  output: {
    path: resolve('./dist'),
    publicPath: '/dist/',
    filename: '[name].[hash].js'
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      '@': resolve('./src')
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },

      generateStyleLoader('css', {
        isProd,
        publicPath: '/'
      }),
      generateStyleLoader('stylus', {
        isProd,
        publicPath: '/'
      }),

      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'url-loader',
        options: {
          limit: 3000,
          name: 'static/img/[name].[ext]?[hash]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 3000,
          name: 'static/fonts/[name].[hash].[ext]'
        }
      }
    ]
  },
  plugins: isProd
    ? [
        new VueLoaderPlugin(),
        new ServerMiniCssExtractPlugin({
          filename: 'static/css/[name].[chunkhash].css'
        })
      ]
    : [new VueLoaderPlugin()]
}
