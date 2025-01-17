import VCF from './parse'

export interface Breakend {
  Join: string
  Replacement: string
  MatePosition?: string
  MateDirection?: string
  SingleBreakend?: boolean
}

export function parseBreakend(breakendString: string): Breakend | undefined {
  const tokens = breakendString.split(/[[\]]/)
  if (tokens.length > 1) {
    const MateDirection = breakendString.includes('[') ? 'right' : 'left'
    let Join
    let Replacement
    let MatePosition
    for (let i = 0; i < tokens.length; i += 1) {
      const tok = tokens[i]
      if (tok) {
        if (tok.includes(':')) {
          // this is the remote location
          MatePosition = tok
          Join = Replacement ? 'right' : 'left'
        } else {
          // this is the local alteration
          Replacement = tok
        }
      }
    }
    if (!(MatePosition && Join && Replacement)) {
      throw new Error(`Invalid breakend: ${breakendString}`)
    }
    return { MatePosition, Join, Replacement, MateDirection }
  } else {
    if (breakendString.startsWith('.')) {
      return {
        Join: 'left',
        SingleBreakend: true,
        Replacement: breakendString.slice(1),
      }
    } else if (breakendString.endsWith('.')) {
      return {
        Join: 'right',
        SingleBreakend: true,
        Replacement: breakendString.slice(0, breakendString.length - 1),
      }
    } else if (breakendString[0] === '<') {
      const res = breakendString.match('<(.*)>(.*)')
      if (!res) {
        throw new Error(`failed to parse ${breakendString}`)
      }
      return {
        Join: 'left',
        Replacement: res?.[2],
        MateDirection: 'right',
        MatePosition: `<${res?.[1]}>:1`,
      }
    } else if (breakendString.includes('<')) {
      const res = breakendString.match('(.*)<(.*)>')
      if (!res) {
        throw new Error(`failed to parse ${breakendString}`)
      }
      return {
        Join: 'right',
        Replacement: res?.[1],
        MateDirection: 'right',
        MatePosition: `<${res?.[2]}>:1`,
      }
    }
  }
  return undefined
}

export default VCF
