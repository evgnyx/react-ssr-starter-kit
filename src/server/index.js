import express from 'express'
import favicon from 'serve-favicon'
import cookieParser from 'cookie-parser'
import expressStaticGzip from 'express-static-gzip'
import compression from 'compression'
import renderMiddleware from './render'
import path from 'path'

const app = express()

app.disable('x-powered-by')
app.use(cookieParser())
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false
    return compression.filter(req, res)
  },
  threshold: 0,
}))

app.use(favicon(path.resolve('dist/static/images/favicon.ico')))
app.use('/static', expressStaticGzip('dist/static', {
  enableBrotli: true,
  orderPreference: ['br']
}))
app.use('/', renderMiddleware)

const listener = app.listen(process.env.PORT || 8000, () => {
  console.log(`\nRunning on port: ${ listener.address().port }\n`)
})
