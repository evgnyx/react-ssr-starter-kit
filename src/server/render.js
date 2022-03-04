import path from 'path'
import url from 'url'
import React from 'react'
import ReactDOM from 'react-dom/server'
import { ChunkExtractor } from '@loadable/server'
import AppServer from '../client/app-server'
import template from './template'
import { preload } from 'utils/preloader'

export default (req, res, next) => {
  if (/favicon|^\/api/.test(req.path)) return next()

  preload(url.parse(req.originalUrl))
    .then((preloaded) => {
      const context = {}
      const extractor = new ChunkExtractor({
        statsFile: path.resolve('dist/loadable-stats.json')
      })
      const jsx = extractor.collectChunks(
        <AppServer
          location={ req.originalUrl }
          context={ context }
        />
      )

      res.setHeader('Content-Type', 'text/html')
      res.write(template.head({
        title: preloaded.data?.meta?.title,
        description: preloaded.data?.meta?.description,
        styles: extractor.getStyleTags({ rel: 'preload', as: 'style' }),
      }))

      let renderedApp = ''
      const stream = ReactDOM.renderToNodeStream(jsx)

      stream.on('data', (chunk) => {
        renderedApp += chunk.toString()
      })

      stream.on('error', (error) => {
        res.status(error)
        res.end()
      })

      stream.on('end', () => {
        if (context.url) {
          res.writeHead(302, { location: context.url })
          res.end()
        }
        else {
          res.write(template.body({
            root: renderedApp,
            preloaded: preloaded.toString(),
            scripts: extractor.getScriptTags()
          }))
          res.end()
        }
      })
    })
}
