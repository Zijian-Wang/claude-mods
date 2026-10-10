import { test, expect } from 'claude-code/testing'

test('SessionMode draws the ring and a hover card', async ($: any, on: any) => {
  on('ui.render', async ($$: any, e: any) => {
    const { Text } = $$.ui.resolve(e)
    return (globalThis as any).h(Text, null, 'engine-mode')
  })
  const m = await $.ui.mount({ plugin: 'cache-timer', surface: 'desktop', component: 'SessionMode', props: {} })
  expect(await m.find({ type: 'Svg' })).toBeDefined()
  expect(await m.find({ type: 'Text', text: /No cache yet/ })).toBeDefined()
  expect(await m.find({ type: 'Text', text: /engine-mode/ })).toBeDefined()
})
