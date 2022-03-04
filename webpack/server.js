const nodeExternals = require('webpack-node-externals')
const { merge, getConfig } = require('./utils')

const config = getConfig({ isServer: true })

const server = {
  target: 'node',
  entry: ['./src/server/index.js'],
  output: {
    filename: 'index.js',
  },
  module: {
    rules: require('./rules')(config),
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  externals: [nodeExternals()],
}

module.exports = merge(server, require('./common')(config))
