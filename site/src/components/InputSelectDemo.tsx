import { useEffect, useRef, useState } from 'preact/hooks'
import { Input, Button } from '@antadesign/anta'
import styles from './InputSelectDemo.module.css'

/**
 * A *composition* demo: how to build a select-like "dropdown input" today out
 * of <Input> + a trailing chevron <Button> + a small menu. This is intentionally
 * lightweight (a proper <Select> with full keyboard/ARIA is coming later) — it
 * shows the field wiring: not clearable, read-only, a chevron trailing button,
 * and options that fill the value.
 */
const OPTIONS = ['Brand', 'Critical', 'Info', 'Success', 'Warning']

export default function InputSelectDemo() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    import('@antadesign/anta/elements')
  }, [])

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative', width: '280px' }}>
      <Input
        label="Tone"
        placeholder="Select a tone…"
        value={value}
        readOnly
        trailing={
          <Button
            priority="tertiary"
            icon="chevron-down"
            aria-label="Toggle options"
            aria-expanded={open ? 'true' : 'false'}
            className={open ? `${styles.chevron} ${styles.open}` : styles.chevron}
            onClick={() => setOpen((o) => !o)}
          />
        }
      />

      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            insetInlineStart: 0,
            insetInlineEnd: 0,
            marginTop: '4px',
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            padding: '4px',
            background: 'var(--bg-1)',
            border: '1px solid var(--border-3)',
            borderRadius: '6px',
            boxShadow: '0 6px 20px color-mix(in oklch, var(--text-1) 12%, transparent)',
          }}
        >
          {OPTIONS.map((o) => (
            <Button
              key={o}
              role="option"
              aria-selected={o === value ? 'true' : 'false'}
              priority="quaternary"
              selected={o === value}
              label={o}
              style={{ width: '100%', justifyContent: 'flex-start' }}
              onClick={() => {
                setValue(o)
                setOpen(false)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
