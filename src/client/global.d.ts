declare module '*.jpg'
declare module '*.png'
declare module '*.svg'
declare module '*.css'
declare module '*.scss'

type ObjectType = Record<string, unknown>
type Fn = (() => any) | ((...args: any[]) => any)
