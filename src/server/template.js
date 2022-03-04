const fs = require('fs')
const path = require('path')

const layout = fs.readFileSync(path.resolve('dist/index.html')).toString()

const headHTML = layout.replace(/<body>[\s\S]+/, '')
const bodyHTML = layout.replace(/[\s\S]+<\/head>/, '')

module.exports = {
  head(params) {
    let str = headHTML
    if (params?.title) {
      str = str.replace(/<title>[\s\S]+<\/title>/, `<title>${ params.title }</title>`)
    }
    if (params?.description) {
      str = str.replace('<meta name="description" content="">', `<meta name="description" content="${ params.description }">`)
    }
    if (params?.styles) {
      str = str.replace('</head>', `${ params.styles }</head>`)
    }
    return str
  },
  body(params) {
    let str = bodyHTML
    if (params?.root) {
      str = str.replace('<div id="root"></div>', `<div id="root">${ params.root }</div>`)
    }
    if (params?.preloaded) {
      str = str.replace('</body>', `${ params.preloaded }</body>`)
    }
    if (params?.scripts) {
      str = str.replace('</body>', `${ params.scripts }</body>`)
    }
    return str
  },
}
