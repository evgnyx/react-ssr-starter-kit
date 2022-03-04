const path = require('path')
const webpack = require('webpack')
const ImageMinimizerPlugin  = require('image-minimizer-webpack-plugin')
const ImageToWebp = require('./image-minimizer-webpack-plugin/lib').default
// const SpritesmithPlugin = require('webpack-spritesmith')
const { getEnvs } = require('./utils')

module.exports = (config) => ({
  mode: config.isDev ? 'development' : 'production',
  devtool: config.isDev ? 'source-map' : false,
  bail: !config.isDev,

  performance: {
    hints: false,
  },

  output: {
    path: _CONFIG_.path.dist,
    publicPath: '/',
    pathinfo: false,
  },
  resolve: {
    alias: {
      images: _CONFIG_.path.images,
      styles: _CONFIG_.path.styles,
      sprites: _CONFIG_.path.sprites,
      pages: _CONFIG_.path.pages,
      components: _CONFIG_.path.components,
      containers: _CONFIG_.path.containers,
      utils: _CONFIG_.path.utils,
      api: _CONFIG_.path.api,
      data: _CONFIG_.path.data,
    },
    extensions: [
      '.ts',
      '.tsx',
      '.js',
      '.jsx',
    ]
  },
  module: {
    strictExportPresence: true,
  },
  plugins: [
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.DefinePlugin(getEnvs()),

    new ImageToWebp({
      exclude: /.svg$/,
      deleteOriginalAssets: false,
      filename: path.posix.join(_CONFIG_.options.assetsDir, _CONFIG_.options.imgDir, '[name][ext].webp'),
      minimizerOptions: {
        plugins: [['imagemin-webp', { quality: 95 }]],
      },
    }),
    new ImageMinimizerPlugin({
      minimizerOptions: {
        plugins: [
          ['gifsicle', { interlaced: true }],
          ['jpegtran', { progressive: true }],
          ['optipng', { optimizationLevel: 5 }],
        ],
      },
    }),

    // new SpritesmithPlugin({
    //   src: {
    //     cwd: _CONFIG_.path.sprites,
    //     glob: '*.png',
    //   },
    //   target: {
    //     image: `${ _CONFIG_.path.images }/sprite.png`,
    //     css: `${ _CONFIG_.path.styles }/sprite.scss`,
    //   },
    //   apiOptions: {
    //     cssImageRef: `images/sprite.png`,
    //   }
    // })
  ]
})
