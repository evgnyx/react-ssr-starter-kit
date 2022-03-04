import * as React from 'react'
import * as qs from 'qs'

type ReqParams<T = { [key: string]: string | number }> = {
  url: string
  params: T
  query: ObjectType
}
type LoaderFn<T> = (data: ReqParams<T>) => Promise<any> | undefined
type LoaderObject<T> = { [key: string]: LoaderFn<T> }
type ExtractorType = (names: string[]) => any[]
type ComponentType = React.ComponentType<any>
type RouteParams = {
  params: Record<string, string>
  component: ComponentType
}
type ConfigType = {
  global?: LoaderObject<any>
  handleRoute: (...args: any) => RouteParams | null
  handleMeta?: (...args: any) => any
}

const PRELOADED_ID = '__PRELOADED__'
const isServer = typeof window === 'undefined'
const Local = isServer ? new WeakMap<ComponentType, LoaderObject<any>>() : null
let Results: any = isServer ? {} : null
const config = {} as ConfigType

export function configurePreloader(params: ConfigType) {
  if (params.handleRoute) config.handleRoute = params.handleRoute
  if (params.handleMeta) config.handleMeta = params.handleMeta
  if (params.global) {
    config.global = {}
    for (const key in params.global) {
      config.global[key] = params.global[key]
    }
  }
}

function defineLocal(Component: ComponentType, loadersMap: LoaderObject<any>) {
  if (Local) Local.set(Component, loadersMap)
}

export function withPreloader<T>(Component: ComponentType, loadersMap: LoaderObject<T>) {
  defineLocal(Component, loadersMap)
  return Component
}

function stringifyResults(result: any) {
  let html = ''
  if (result) {
    html += `<script id="${ PRELOADED_ID }RES">(function(){ window.${ PRELOADED_ID } = ${ JSON.stringify(result) }; document.getElementById("${ PRELOADED_ID }RES").remove(); })()</script>`
  }
  return () => html
}

export async function preload(
  urlData: { pathname: string, search: string },
  handleRoute?: ConfigType['handleRoute'],
) {
  Results = {}

  const handler = handleRoute || config.handleRoute

  const route = handler(urlData.pathname)
  const loaders = {
    ...(config.global || {}),
    ...(Local!.get(route!.component) || {}),
  }

  if (loaders) {
    for (const key in loaders) {
      try {
        if (key in Results) continue

        const response = await loaders[key]({
          url: urlData.pathname,
          params: route!.params,
          query: qs.parse(urlData.search, { ignoreQueryPrefix: true }),
        })

        Results[key] = response
        if (config.handleMeta) {
          const meta = config.handleMeta(response)
          Results.meta = meta ? meta : null
        }
      }
      catch (e) {
        Results[key] = null
      }
    }
  }

  return Promise.resolve({
    data: { ...Results },
    toString: stringifyResults(Results),
  })
}

const Context = React.createContext(null as unknown as ExtractorType)

export function PreloadedProvider({ children }: React.PropsWithChildren<any>) {
  const extractor = React.useMemo(() => {
    let preloaded = Results
    if (!isServer) {
      preloaded = window[PRELOADED_ID as any]
      delete window[PRELOADED_ID as any]
    }
    return (names: string[]) => {
      const arr = [] as any
      if (preloaded) {
        for (const name of names) {
          arr.push(preloaded[name])
          delete preloaded[name]
        }
      }
      return arr
    }
  }, [])

  return (
    <Context.Provider value={ extractor }>
      { children }
    </Context.Provider>
  )
}

export function usePreloaded<T>(...names: string[]): T {
  const extract = React.useContext(Context as any) as any
  return extract(names)
}
