const webpack = require('webpack')
const wds = require('webpack-dev-server')

process.env.NODE_ENV = 'development'

require('./config')

const compiler = webpack(require(_CONFIG_.path.webpack).client)
const server = new wds(compiler, {
  contentBase: _CONFIG_.path.dist,
  publicPath: '/',
  historyApiFallback: true,
  useLocalIp: true,
  hot: true,
  // proxy: {
  //   '/api/**': {
  //     target: 'http://somesite',
  //     secure: false,
  //     changeOrigin: true,
  //   }
  // },
  overlay: {
    warnings: true,
    errors: true,
  },
  stats: {
    colors: true,
    all: false,
    errors: true,
    warnings: true,
  }
})

server.listen(8000)
