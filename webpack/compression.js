const path = require('path')
const CompressionPlugin = require('compression-webpack-plugin')

const ARR = [
  { test: /\.js$/,
    path: [_CONFIG_.options.assetsDir, _CONFIG_.options.jsDir]
  },
  { test: /\.css$/,
    path: [_CONFIG_.options.assetsDir, _CONFIG_.options.cssDir]
  },
  { test: /\.svg$/,
    path: [_CONFIG_.options.assetsDir, _CONFIG_.options.imgDir]
  },
]

function gzip(rule) {
  return new CompressionPlugin({
    filename: path.posix.join(...rule.path, '[base].gz'),
    algorithm: 'gzip',
    test: rule.test,
  })
}

function brotli(rule) {
  return new CompressionPlugin({
    filename: path.posix.join(...rule.path, '[base].br'),
    algorithm: 'brotliCompress',
    test: rule.test,
    compressionOptions: {
      level: 11
    },
    threshold: 10240,
    minRatio: 0.8,
  })
}

module.exports = (config) => {
  if (config.isDev) return []
  return ARR.reduce((acc, rule) => {
    acc.push(gzip(rule), brotli(rule))
    return acc
  }, [])
}
