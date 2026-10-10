import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

const TTL_MS = 3600_000
const lastAt = atom({ plugin: 'cache-timer', key: 'lastAt' } as const, null)
const now = atom({ plugin: 'cache-timer', key: 'now' } as const, 0)

const WARM = '#EE8F55' // Claude orange, a touch brighter
const LOW = '#E5583F' // last stretch
const COLD = '#7CC6F0' // ice blue
const TRACK = '#8886'

const fmt = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// 26px ring that drains clockwise, hourglass drawn in the middle
const ringSvg = (frac: number, color: string, sand: boolean, tip: string) => {
  const r = 11
  const c = 2 * Math.PI * r
  const arc = (c * frac).toFixed(2)
  const sandTop = sand
    ? `<path d="M-2.2 -4 H2.2 L0 -0.6 Z" fill="${color}" fill-opacity="${(0.35 + 0.65 * frac).toFixed(2)}"/>`
    : ''
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="-13 -13 26 26"><title>${tip}</title>` +
    `<circle r="${r}" fill="none" stroke="${TRACK}" stroke-width="2.4"/>` +
    `<circle r="${r}" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round" ` +
    `stroke-dasharray="${arc} ${c.toFixed(2)}" transform="rotate(-90)"/>` +
    sandTop +
    `<path d="M-3.4 -5 H3.4 M-3.4 5 H3.4 M-2.6 -5 V-2.6 L0 0 L-2.6 2.6 V5 M2.6 -5 V-2.6 L0 0 L2.6 2.6 V5" ` +
    `fill="none" stroke="${color}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>` +
    `</svg>`
  )
}

const HOURGLASS = '\u{F051F}' // nf-md-timer_sand
const SNOW = '\u{F0717}' // nf-md-snowflake

export const register: Register = (on) => {
  on('session.start', async ($, e, next) => {
    $.clock.every(1000, () => update($, now, () => Date.now()))
    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    await update($, lastAt, () => Date.now())
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    await update($, lastAt, () => Date.now())
    return next(e)
  })

  // lives in the mode row next to the model picker; hover shows the time left
  on('ui.render', { component: 'SessionMode' }, async ($, e, next) => {
    const below = await next(e)
    const last = await read($, lastAt)
    if (last === null) return below

    const t = (await read($, now)) || Date.now()
    const left = last + TTL_MS - t
    const { Box, Text } = $.ui.resolve(e)
    const Svg = ($.ui.resolve(e) as any).Svg

    const isCold = left <= 0
    const frac = isCold ? 0 : left / TTL_MS
    const color = isCold ? COLD : frac > 0.2 ? WARM : LOW
    const tip = isCold
      ? 'Cache cold · next message re-caches the whole prefix'
      : `${fmt(left)} left · cache warm`

    return (
      <Box flexDirection="row" alignItems="center" gap={1}>
        {Svg ? (
          <Svg
            source={ringSvg(isCold ? 1 : frac, color, !isCold, tip)}
            alt={tip}
            width={22}
            height={22}
            isInteractive
          />
        ) : (
          <Text color={color}>{isCold ? SNOW : HOURGLASS}</Text>
        )}
        {below}
      </Box>
    )
  })
}
