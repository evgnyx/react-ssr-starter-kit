import * as React from 'react'
import { StaticRouter } from 'react-router-dom'
import App from './app'

function AppServer({ location, context }: any) {
  return (
    <StaticRouter location={ location } context={ context }>
      <App />
    </StaticRouter>
  )
}

export default AppServer
