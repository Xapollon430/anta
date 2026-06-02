import { useMemo, useState } from 'preact/hooks'
import * as Stickers from '@antadesign/anta/stickers'

// Pull the bare names from the barrel by stripping the `Sticker` prefix
// from each `Sticker{Name}` export. Filter out the `Sticker{Name}Animated`
// variants — they're separate exports referencing the same name.
const NAMES = Object.keys(Stickers)
  .filter((k) => k.startsWith('Sticker') && !k.endsWith('Animated'))
  .map((k) => k.slice('Sticker'.length))
  .sort()

function exportKey(pascal: string, animated: boolean) {
  return animated ? `Sticker${pascal}Animated` : `Sticker${pascal}`
}

export default function StickerDemo() {
  const [mode, setMode] = useState<'animated' | 'static'>('static')
  const [paused, setPaused] = useState<boolean | number>(false)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return NAMES
    return NAMES.filter((n) => n.toLowerCase().includes(q))
  }, [query])

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          type="search"
          value={query}
          onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
          placeholder={`Search ${NAMES.length} stickers…`}
          class="iconFilter"
        />
        <button onClick={() => setMode(mode === 'animated' ? 'static' : 'animated')}>
          {mode === 'animated' ? 'Show static' : 'Show animated'}
        </button>
        {mode === 'animated' && (
          <>
            <button onClick={() => setPaused(false)}>Play all</button>
            <button onClick={() => setPaused(true)}>Pause all</button>
            <button onClick={() => setPaused(1)}>Freeze at 1s</button>
          </>
        )}
      </div>
      {filtered.length === 0 ? (
        <p class="demoLabel" style={{ padding: '24px 0' }}>No stickers match “{query}”.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 16,
          }}
        >
          {filtered.map((pascal) => {
            const Cmp = (Stickers as Record<string, (p: any) => any>)[exportKey(pascal, mode === 'animated')]
            if (!Cmp) return null
            const props = mode === 'animated'
              ? { size: 128, paused, label: pascal }
              : { size: 128, label: pascal }
            return (
              <div key={pascal} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <Cmp {...props} />
                <span class="demoLabel">{pascal}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
