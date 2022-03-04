const fs = require('fs')
const path = require('path')
const webpack = require('webpack')

module.exports.handleParams = function() {
  for (param of process.argv.slice(2)) {
    if (param === '-d') process.env.NODE_ENV = 'development'
  }
}

module.exports.compile = function compile(config) {
  return new Promise((resolve, reject) => {
    webpack(config).run((err, stats) => {
      if (err) {
        console.error('\n', 'ERROR')
        console.error(err.stack || err)
        if (err.details) console.error('\n', err.details)
        return reject()
      }

      // const info = stats.toJson()
      if (stats && stats.hasErrors()) {
        console.error('\n', 'STATS:')
        // console.error(info.errors)
        console.error(stats.toString())
        return reject()
      }

      console.log(stats.toString({
        chunks: false,
        colors: true,
      }))

      resolve()
    })
  })
}

module.exports.emptyDir = function emptyDir(dir) {
  return new Promise(async (resolve) => {
    if (!fs.existsSync(dir)) return resolve()

    const list = fs.readdirSync(dir)
    if (list && list.length) {
      for (const name of list) {
        const _p = path.resolve(dir, name)
        const stats = fs.statSync(_p)
        if (stats.isDirectory()) {
          await emptyDir(_p)
          fs.rmdirSync(_p)
        }
        else {
          fs.unlinkSync(_p)
        }
      }
    }
    resolve()
  })
}
