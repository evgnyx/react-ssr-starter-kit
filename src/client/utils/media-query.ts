import { isBrowser } from './env'
import vars from 'styles/variables.scss'

export function media(rule: string): boolean | null {
  if (!isBrowser) return null

  const [condition, key] = rule.split(/\b/)
  const breakpoint = +vars[key]
  if (!breakpoint || isNaN(breakpoint)) return null

  const { innerWidth } = window
  if (condition.includes('=') && innerWidth === breakpoint) return true
  if (condition.includes('<') && innerWidth < breakpoint) return true
  if (condition.includes('>') && innerWidth > breakpoint) return true

  return false
}
