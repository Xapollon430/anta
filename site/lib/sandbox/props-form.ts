/**
 * props-form.ts — walks the build-time typedoc output (`site/src/api.json`)
 * to derive a control schema for a component's props. The same JSON drives
 * `PropsTable.astro` (the static reference table); reusing it here keeps
 * the playground form in lockstep with the documented prop set.
 *
 * Walk: `api.children` → find the `{ComponentName}Props` interface → take
 * its `children` (the props), drop inherited ones (the `BaseProps` grab
 * bag — `className`, `style`, `children` are out of scope for v1's form),
 * and map each remaining prop's type into a `Control` descriptor.
 */
import api from '../../src/api.json'
import type { PropDescriptor } from './prop-patch.ts'

export type Control =
  | { kind: 'slider'; name: string; min: number; max: number; step: number; defaultValue?: number; description?: string }
  | { kind: 'number'; name: string; defaultValue?: number; description?: string }
  | { kind: 'text'; name: string; defaultValue?: string; description?: string }
  | { kind: 'boolean'; name: string; defaultValue?: boolean; description?: string }
  | { kind: 'segmented'; name: string; options: string[]; defaultValue?: string; description?: string }

export interface PropEntry {
  control: Control
  prop: PropDescriptor
  /** TypeScript-style optional flag — surfaced in the form label as
   *  `name?` so users see at a glance which props can be omitted. */
  optional: boolean
}

/** Walk api.json for a component's prop schema. Returns `[]` if the
 *  component (or its `{Name}Props` interface) isn't in the doc set. */
export function controlsFor(componentName: string): PropEntry[] {
  const ifaceName = `${componentName}Props`
  const root: any = api as any
  const iface = root.children?.find((c: any) => c.name === ifaceName)
  if (!iface) return []

  // Component-own props come first; `className` rides along even
  // though it's inherited from BaseProps, because typing into it is
  // how the playground unlocks the CSS tab.
  const props = (iface.children ?? []).filter(
    (p: any) => !p.inheritedFrom || p.name === 'className',
  )

  const entries: PropEntry[] = []
  for (const p of props) {
    const ctl = controlFor(p)
    if (!ctl) continue
    entries.push(ctl)
  }
  return entries
}

function controlFor(p: any): PropEntry | null {
  const name: string = p.name
  const description = renderComment(p.comment)
  const optional = !!p.flags?.isOptional

  const t = p.type
  if (!t) return null

  const wrap = (control: Control, prop: PropDescriptor): PropEntry => ({
    control, prop, optional,
  })

  // `intrinsic` types: string / number / boolean.
  if (t.type === 'intrinsic') {
    if (t.name === 'number') {
      // All numeric props render as a plain number input. A slider
      // variant lived here for `value`-style props, but we can't yet
      // infer min/max from sibling props (e.g. Progress's `max`), and
      // a slider with hardcoded 0..100 misled users on other ranges.
      return wrap(
        { kind: 'number', name, description },
        { name, kind: 'number' },
      )
    }
    if (t.name === 'string') {
      return wrap(
        { kind: 'text', name, description },
        { name, kind: 'string' },
      )
    }
    if (t.name === 'boolean') {
      return wrap(
        { kind: 'boolean', name, description },
        { name, kind: 'boolean' },
      )
    }
    return null
  }

  // `union` of all `literal` members → segmented buttons.
  if (t.type === 'union' && Array.isArray(t.types)) {
    const literals = t.types.filter((x: any) => x.type === 'literal' && typeof x.value === 'string')
    if (literals.length === t.types.length && literals.length > 0) {
      const options = literals.map((x: any) => String(x.value))
      // Heuristic: first option is typically the default (matches Anta's
      // pattern of `tone?: 'neutral' | 'info'` — neutral first).
      const defaultValue = options[0]
      return wrap(
        { kind: 'segmented', name, options, defaultValue, description },
        { name, kind: 'literal-union', defaultValue },
      )
    }
    return null
  }

  // Anything else (ReactNode, CSSProperties, named references) — v1 skip.
  return null
}

function renderComment(comment: any): string | undefined {
  if (!comment?.summary) return undefined
  const text = comment.summary
    .map((part: any) => (part.kind === 'code' ? part.text : part.text))
    .join('')
    .trim()
  return text || undefined
}
