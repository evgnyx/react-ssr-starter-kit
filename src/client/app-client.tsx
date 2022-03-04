import 'core-js/stable'
import 'regenerator-runtime/runtime'
import 'normalize.css'
import './assets/svg-sprites'
import * as React from 'react'
import { BrowserRouter } from 'react-router-dom'
import App from './app'
// import smoothscroll from 'smoothscroll-polyfill'

// smoothscroll.polyfill()

function AppClient() {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  )
}

export default AppClient
