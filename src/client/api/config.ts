import axios from 'axios'
import * as qs from 'qs'
import { isBrowser } from 'utils'

const DOMAIN = (isBrowser ? process.env.DOMAIN : process.env.API_HOST_SSR) || ''

const api = axios.create({
  baseURL: `${ DOMAIN }/api`,
  withCredentials: true,
  paramsSerializer: (params: any) => qs.stringify(params),
})

export default api
