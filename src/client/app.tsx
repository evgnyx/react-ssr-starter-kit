import './theme'
import 'styles/global.scss'
import * as React from 'react'
import { Switch, Route, matchPath } from 'react-router-dom'
import MainPage from 'pages/main'
import { configurePreloader, PreloadedProvider } from 'utils'

const Routes = [
  { path: '/', exact: true, component: MainPage },
  // { path: '*', component: NotFound }
]

configurePreloader({
  // global: {
  //   menu: () => getMenu().then((res) => res.data)
  // },
  handleMeta: (data: any) => {
    if (!data || !data.meta) return null
    return data.meta
  },
  handleRoute: (url: string) => {
    for (const key in Routes) {
      const found = matchPath(url, Routes[key])
      if (found && Routes[key].component) return {
        params: found.params,
        component: Routes[key].component,
      }
    }
    return null
  }
})

function App() {
  // React.useEffect(() => {
  //   getMenu()
  //     .then((res) => {
  //       globalState.set({ menu: res.data })
  //     })
  // }, [])

  return (
    <PreloadedProvider>
      {/* <Header /> */}
      <Switch>
        { Routes.map((route) => (
          <Route
            path={ route.path }
            exact={ route.exact }
            component={ route.component }
            key={ route.path }
          />
        ))
        }
      </Switch>
      {/* <Modals
        onOpen={ handleModalOpen }
        onClose={ handleModalClose }
      /> */}
    </PreloadedProvider>
  )
}

export default App
