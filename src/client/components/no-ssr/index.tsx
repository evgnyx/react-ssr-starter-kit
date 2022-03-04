import * as React from 'react'
import { isBrowser } from 'utils'

function NoSSR({
  children
}: React.PropsWithChildren<any>) {
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    if (isBrowser) setReady(true)
  }, [])

  if (!ready) return null

  return children
}

export default NoSSR
