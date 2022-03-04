import * as React from 'react'
import * as qs from 'qs'
import { RouteComponentProps } from 'react-router'
import { getMainPage } from 'api'
import { withPreloader, usePreloaded, isBrowser } from 'utils'

function MainPage({
  location
}: RouteComponentProps) {
  const [preloaded] = usePreloaded('main')

  const [state, setState] = React.useState(() => {
    return {
      data: preloaded?.data,
      ready: !!preloaded,
    }
  })

  React.useEffect(() => {
    if (state.ready) return
    getMainPage(qs.parse(location.search, {
      ignoreQueryPrefix: true
    }))
      .then((res) => {
        setState({
          data: res.data,
          ready: true,
        })
      })
  }, [location.search])

  if (!state.ready) return (
    <div>
      <p>
        Loading...
      </p>
    </div>
  )

  return (
    <div>
      <h1>Main Page</h1>
    </div>
  )
}

export default withPreloader(MainPage, {
  main: (data) => getMainPage(data.query)
    .then((res) => ({
      data: res.data,
    }))
})
