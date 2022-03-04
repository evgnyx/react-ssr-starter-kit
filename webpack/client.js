const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const PostcssSafeParser = require('postcss-safe-parser');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const LoadablePlugin = require('@loadable/webpack-plugin')
const { merge, getConfig } = require('./utils')

const config = getConfig()

const client = {
  target: 'web',
  entry: ['./src/client/index.tsx'],
  output: {
    filename: config.isDev
      ? path.posix.join(_CONFIG_.options.assetsDir, _CONFIG_.options.jsDir, 'bundle.js')
      : path.posix.join(_CONFIG_.options.assetsDir, _CONFIG_.options.jsDir, '[name].[chunkhash:8].js'),
    chunkFilename: config.isDev
      ? path.posix.join(_CONFIG_.options.assetsDir, _CONFIG_.options.jsDir, '[name].chunk.js')
      : path.posix.join(_CONFIG_.options.assetsDir, _CONFIG_.options.jsDir, '[name].[chunkhash:8].chunk.js')
  },

  optimization: config.isDev
    ? {}
    : {
        usedExports: true,
        minimize: true,
        minimizer: [
          new TerserPlugin({
            terserOptions: {
              parse: {
                ecma: 8,
              },
              compress: {
                ecma: 5,
                warnings: false,
                comparisons: false,
                inline: 2,
              },
              mangle: {
                safari10: true,
              },
              output: {
                ecma: 5,
                comments: false,
                ascii_only: true,
              },
            },
            parallel: true,
            // cache: true,
            // sourceMap: false,
          }),
          new OptimizeCSSAssetsPlugin({
            cssProcessorOptions: {
              parser: PostcssSafeParser,
              map: false,
            },
          }),
        ],
        splitChunks: {
          chunks: 'all',
          name: false,
          cacheGroups: {
            styles: {
              name: 'styles',
              test: /\.s?css$/i,
              chunks: 'all',
              enforce: true,
            }
          }
        },
        runtimeChunk: {
          name: 'runtime'
        },
      },

  module: {
    rules: require('./rules')(config),
  },
  plugins: [
    ...require('./compression.js')(config),
    new LoadablePlugin(),
    new MiniCssExtractPlugin({
      filename: config.isDev
        ? path.posix.join(_CONFIG_.options.assetsDir, _CONFIG_.options.cssDir, '[name].css')
        : path.posix.join(_CONFIG_.options.assetsDir, _CONFIG_.options.cssDir, '[name].[contenthash:8].css'),
    }),
    new HtmlWebpackPlugin({
      template: 'src/client/template/index.pug',
      inject: config.isDev,
    }),
    new SpriteLoaderPlugin({
      plainSprite: true,
      spriteAttrs: {
        style: 'display: none; position: absolute; width: 0; height: 0',
        'aria-hidden': true,
      }
    }),
    !config.isDev && new FaviconsWebpackPlugin({
      logo: path.posix.join(_CONFIG_.path.images, 'favicon.png'),
      outputPath: path.posix.join(_CONFIG_.options.assetsDir, _CONFIG_.options.imgDir),
      inject: false,
    }),
  ].filter(Boolean),
}

module.exports = merge(client, require('./common')(config))
