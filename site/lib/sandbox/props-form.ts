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
}

/** Walk api.json for a component's prop schema. Returns `[]` if the
 *  component (or its `{Name}Props` interface) isn't in the doc set. */
export function controlsFor(componentName: string): PropEntry[] {
  const ifaceName = `${componentName}Props`
  const root: any = api as any
  const iface = root.children?.find((c: any) => c.name === ifaceName)
  if (!iface) return []

  const props = (iface.children ?? []).filter((p: any) => !p.inheritedFrom)

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

  const t = p.type
  if (!t) return null

  // `intrinsic` types: string / number / boolean.
  if (t.type === 'intrinsic') {
    if (t.name === 'number') {
      // Treat any number-prop named `value` as a slider 0..100.
      // We could read `max` sibling later to set the range; for v1 the
      // 0..100 default works for the existing components (Progress, ...).
      if (name === 'value') {
        return {
          prop: { name, kind: 'number' },
          control: { kind: 'slider', name, min: 0, max: 100, step: 1, description },
        }
      }
      return {
        prop: { name, kind: 'number' },
        control: { kind: 'number', name, description },
      }
    }
    if (t.name === 'string') {
      return {
        prop: { name, kind: 'string' },
        control: { kind: 'text', name, description },
      }
    }
    if (t.name === 'boolean') {
      return {
        prop: { name, kind: 'boolean' },
        control: { kind: 'boolean', name, description },
      }
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
      return {
        prop: { name, kind: 'literal-union', defaultValue },
        control: { kind: 'segmented', name, options, defaultValue, description },
      }
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
