const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = (config) => {
  const babelLoader = {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      cacheCompression: !config.isDev,
      compact: !config.isDev,
    }
  }

  const cssExtract = {
    loader: MiniCssExtractPlugin.loader,
    options: {
      publicPath: '/',
    }
  }

  const fileLoader = (dir) => ({
    loader: 'file-loader',
    options: {
      outputPath: path.posix.join(_CONFIG_.options.assetsDir, dir),
      emitFile: !config.isServer,
    }
  })

  return [
    { test: /\.jsx?$/i,
      use: [
        babelLoader
      ],
    },

    { test: /\.tsx?$/i,
      use: [
        babelLoader,
        { loader: 'ts-loader',
          options: {
            transpileOnly: true,
            experimentalWatchApi: config.isDev,
          }
        },
      ],
    },

    { test: /(node_modules.+\.css|global\.s?css)$/i,
      sideEffects: true,
      use: [
        !config.isServer && cssExtract,
        'css-loader',
        'postcss-loader',
        'sass-loader',
      ].filter(Boolean)
    },

    { test: /\.scss$/i,
      include: /node_modules/,
      sideEffects: true,
      use: [
        !config.isServer && cssExtract,
        { loader: 'css-loader',
          options: {
            importLoaders: 2,
            modules: config.isModules
              ? {
                  exportOnlyLocals: config.isServer,
                  exportLocalsConvention: 'camelCaseOnly',
                  localIdentName: config.isDev
                    ? '[local]-[hash:base64:5]'
                    : '[hash:base64:5]',
                }
              : false
          }
        },
        'postcss-loader',
        'sass-loader'
      ].filter(Boolean)
    },

    { test: /\.scss$/i,
      exclude: [/global\.scss$/i, /node_modules/],
      sideEffects: true,
      use: [
        !config.isServer && cssExtract,
        { loader: 'css-loader',
          options: {
            importLoaders: 2,
            modules: config.isModules
              ? {
                  exportOnlyLocals: config.isServer,
                  exportLocalsConvention: 'camelCaseOnly',
                  localIdentName: config.isDev
                    ? '[local]-[hash:base64:5]'
                    : '[hash:base64:5]',
                }
              : false
          }
        },
        'postcss-loader',
        'sass-loader'
      ].filter(Boolean)
    },

    { test: /\.svg$/,
      include: _CONFIG_.path.svgSprites,
      use: config.isServer
        ? 'ignore-loader'
        : [
            { loader: 'svg-sprite-loader',
              options: {
                extract: true,
                outputPath: path.posix.join(_CONFIG_.options.assetsDir, '/'),
                spriteFilename: 'sprite.svg',
              }
            },
            'svg-transform-loader',
            { loader: 'svgo-loader',
              options: {
                pretty: true,
                externalConfig: 'svgo.config.yml',
              }
            }
          ]
    },

    { test: /\.(jpe?g|png|gif|svg)$/i,
      exclude: _CONFIG_.path.svgSprites,
      use: [fileLoader(_CONFIG_.options.imgDir)],
    },

    { test: /\.(woff2?|eot|ttf)$/i,
      use: [fileLoader(_CONFIG_.options.fontsDir)],
    },

    { test: /\.pug$/,
      use: ['pug-loader']
    },
  ]
}
