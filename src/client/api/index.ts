import { AxiosResponse } from 'axios'
import api from './config'

export function getMainPage(params: ObjectType): Promise<AxiosResponse<unknown>> {
  return api.get(`/something`, { params })
}
