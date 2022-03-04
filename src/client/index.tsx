import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { loadableReady } from '@loadable/component'
import App from './app-client'

loadableReady(() => {
  if (process.env.NODE_ENV === 'development') {
    ReactDOM.render(<App />, document.getElementById('root'))
  }
  else {
    ReactDOM.hydrate(<App />, document.getElementById('root'))
  }
})

if (module.hot) {
  module.hot.accept()
}
