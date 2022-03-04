const path = require('path')
const dotenv = require('dotenv')
const { handleParams } = require('./utils')

const DEFAULT_ENVS = ['DOMAIN', 'API_HOST_SSR']
const env = dotenv.config()

handleParams()

for (const envName of DEFAULT_ENVS) {
  if (!(envName in env.parsed) && envName in process.env) {
    env.parsed[envName] = process.env[envName]
  }
  if (!(envName in env.parsed)) {
    throw new Error(`Environment variable ${ envName } is undefined`)
  }
}

const rootPath = process.cwd()
function resolveRoot(...args) {
  return path.resolve(rootPath, ...args)
}

globalThis._CONFIG_ = {
  options: {
    assetsDir: 'static',
    cssDir: 'css',
    jsDir: 'js',
    imgDir: 'images',
    fontsDir: 'fonts',
  },
  path: {
    get: resolveRoot,
    dist: resolveRoot('dist'),
    webpack: resolveRoot('webpack'),
    svgSprites: resolveRoot('src/client/assets/svg-sprites'),
    sprites: resolveRoot('src/client/assets/sprites'),
    images: resolveRoot('src/client/assets/images/'),
    styles: resolveRoot('src/client/assets/styles/'),
    pages: resolveRoot('src/client/pages/'),
    components: resolveRoot('src/client/components/'),
    containers: resolveRoot('src/client/containers/'),
    utils: resolveRoot('src/client/utils/'),
    api: resolveRoot('src/client/api/'),
    data: resolveRoot('data'),
  },
  env: env.parsed,
}

process.on('unhandledRejection', err => {
  throw err
})
