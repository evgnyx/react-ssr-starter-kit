import * as React from 'react'
import * as qs from 'qs'
import { useHistory, useLocation } from 'react-router'

export function decoder(str: any, defaultEncoder: any, charset: any, type: any) {
  if (type === 'value') {
    if (str === 'true') return true
    if (str === 'false') return false
    if (str === 'null') return null
    if (str === 'undefined') return undefined
    if (/^-?(0{1}|[1-9]+0*)(\.[0-9]+)?$/.test(str)) return Number(str)
  }
  return defaultEncoder(str)
}

export function useUrlState<S>(initialState: S): [S, React.Dispatch<React.SetStateAction<S>>] {
  const history = useHistory()
  const location = useLocation()
  const [state, setState] = React.useState(() => {
    const params = { ...initialState } as any
    const currentParams = qs.parse(location.search, {
      ignoreQueryPrefix: true,
      decoder
    })
    for (const key in currentParams) {
      if (key in params) {
        params[key] = currentParams[key]
      }
    }
    return params
  })

  const conf = React.useRef<any>({
    timer: null,
    init: false,
  })

  React.useEffect(() => {
    if (!conf.current.init) return
    const search = qs.stringify(state)
    if (location.search !== `?${ search }`) {
      setState((prev: any) => ({
        ...prev,
        ...qs.parse(location.search, {
          ignoreQueryPrefix: true,
          decoder
        })
      }))
    }
  }, [location])

  React.useEffect(() => {
    if (!conf.current.init) {
      conf.current.init = true
      const search = qs.stringify(state)
      if (location.search !== `?${ search }`) {
        history.replace({
          pathname: location.pathname,
          search
        })
      }
    }
    else {
      clearTimeout(conf.current.timer)
      const search = qs.stringify(state)
      if (location.search !== `?${ search }`) {
        conf.current.timer = setTimeout(() => {
          history.push({
            pathname: location.pathname,
            search
          })
        }, 1000)
      }
    }
  }, [state])
  
  return [state, setState]
}
