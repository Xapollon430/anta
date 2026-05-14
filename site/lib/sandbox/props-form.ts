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
import { findAttribute, listAttributes, locateOpeningTag } from './locate-tag.ts'

/** Framework-internal props that have no place on a documentation
 *  surface — they're plumbing for the renderer, not part of the
 *  component's authored API. */
const EXCLUDED_PROP_NAMES = new Set(['key', 'ref'])

export type Control =
  | { kind: 'slider'; name: string; min: number; max: number; step: number; defaultValue?: number; description?: string }
  | { kind: 'number'; name: string; defaultValue?: number; description?: string }
  | { kind: 'text'; name: string; defaultValue?: string; description?: string }
  | { kind: 'boolean'; name: string; defaultValue?: boolean; description?: string }
  | { kind: 'segmented'; name: string; options: string[]; defaultValue?: string; description?: string }
  /** Read-only entry for props we can't drive with a generic input
   *  — `children`, `style`, `ReactNode`, named references, etc. The
   *  form renders the name + type + description so the prop is
   *  documented in place, without offering an edit affordance. */
  | { kind: 'documentation'; name: string; type: string; description?: string }

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

  // Include component-own props plus inherited props from BaseProps
  // (`className`, `style`, `children`). The former get full editors;
  // the latter typically render as `documentation` rows so the form
  // doubles as a complete prop reference — that's why a separate
  // static Props table isn't needed on the docs page. Framework
  // plumbing (`key`, `ref`) stays out.
  const props = (iface.children ?? []).filter(
    (p: any) => !EXCLUDED_PROP_NAMES.has(p.name),
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
    // Fall through to the documentation row for anything else.
  }

  // `union` of all `literal` members → segmented buttons.
  if (t.type === 'union' && Array.isArray(t.types)) {
    const literals = t.types.filter((x: any) => x.type === 'literal' && typeof x.value === 'string')
    if (literals.length === t.types.length && literals.length > 0) {
      const options = literals.map((x: any) => String(x.value))
      const defaultValue = options[0]
      return wrap(
        { kind: 'segmented', name, options, defaultValue, description },
        { name, kind: 'literal-union', defaultValue },
      )
    }
    // Fall through.
  }

  // Anything else — `ReactNode`, `CSSProperties`, named references,
  // intersection / mapped types, etc. Surface as a documentation
  // row: name + rendered type + description, no input. Lets the
  // panel double as the prop reference, eliminating the need for a
  // separate Props table beneath the playground.
  return wrap(
    { kind: 'documentation', name, type: renderType(t), description },
    // PropDescriptor isn't meaningful for read-only docs; use a
    // placeholder that the form's onChange path never references.
    { name, kind: 'string' },
  )
}

/** Render a TypeDoc type node as a short, human-readable string —
 *  shared format with `PropsTable.astro` so the playground reads
 *  the same way as the static reference table did. */
function renderType(type: any): string {
  if (!type) return '—'
  switch (type.type) {
    case 'intrinsic':
      return type.name
    case 'literal':
      return typeof type.value === 'string' ? `'${type.value}'` : String(type.value)
    case 'union':
      return type.types.map(renderType).join(' | ')
    case 'reference':
      if (type.name) return type.name
      return '—'
    case 'array':
      return `${renderType(type.elementType)}[]`
    case 'typeOperator':
      if (type.operator === 'keyof' && type.target?.name === 'IconShapes') return 'IconShape'
      return `${type.operator} ${renderType(type.target)}`
    default:
      return type.name || '—'
  }
}

function renderComment(comment: any): string | undefined {
  if (!comment?.summary) return undefined
  const text = comment.summary
    .map((part: any) => (part.kind === 'code' ? part.text : part.text))
    .join('')
    .trim()
  return text || undefined
}

/** Derive a Control schema for a JSX example by introspecting the
 *  tag in the source. Two paths:
 *
 *  1. If `tagName` is documented in `api.json` (e.g. `Progress`),
 *     return its full schema via `controlsFor`.
 *  2. Otherwise, walk the opening tag's attributes and emit a
 *     control per attribute whose value we can infer a kind from
 *     (string / number / boolean). Useful when the example uses a
 *     local helper component (`AnimatedProgress`) defined in the
 *     preamble — we can't know its full prop surface, but we can
 *     surface whatever the JSX is currently passing.
 *
 *  Both paths filter out `children`, `style`, `key`, `ref`. */
export function controlsForExample(
  tagName: string,
  source: string,
  range: { start: number; end: number },
): PropEntry[] {
  const known = controlsFor(tagName)
  if (known.length > 0) {
    return known.filter((e) => !EXCLUDED_PROP_NAMES.has(e.control.name))
  }
  return controlsFromJsxAttributes(tagName, source, range)
}

function controlsFromJsxAttributes(
  tagName: string,
  source: string,
  range: { start: number; end: number },
): PropEntry[] {
  const slice = source.slice(range.start, range.end)
  const open = locateOpeningTag(slice, tagName)
  if (!open) return []
  // Translate slice-local OpenTagRange back to absolute coordinates
  // so findAttribute matches `source` indexes.
  const absOpen = {
    start: open.start + range.start,
    end: open.end + range.start,
    selfClosing: open.selfClosing,
    text: open.text,
    attrsStart: open.attrsStart + range.start,
    attrsEnd: open.attrsEnd + range.start,
  }
  const names = listAttributes(source, absOpen)
  const entries: PropEntry[] = []
  const seen = new Set<string>()
  for (const name of names) {
    if (EXCLUDED_PROP_NAMES.has(name) || seen.has(name)) continue
    seen.add(name)
    const attr = findAttribute(source, absOpen, name)
    if (!attr) continue
    const kind = inferAttributeKind(attr)
    if (!kind) continue
    if (kind === 'number') {
      entries.push({
        prop: { name, kind: 'number' },
        control: { kind: 'number', name },
        optional: true,
      })
    } else if (kind === 'boolean') {
      entries.push({
        prop: { name, kind: 'boolean' },
        control: { kind: 'boolean', name },
        optional: true,
      })
    } else {
      entries.push({
        prop: { name, kind: 'string' },
        control: { kind: 'text', name },
        optional: true,
      })
    }
  }
  return entries
}

/** Infer a kind for an attribute by sniffing its value text.
 *  Returns null if we don't recognise the value at all (e.g. spread
 *  or unparseable expression). */
function inferAttributeKind(
  attr: { valueRange: { kind: 'string' | 'expression'; text: string } | null },
): 'string' | 'number' | 'boolean' | null {
  if (!attr.valueRange) return 'boolean'
  if (attr.valueRange.kind === 'string') return 'string'
  const inner = attr.valueRange.text.slice(1, -1).trim()
  if (/^-?\d+(\.\d+)?$/.test(inner)) return 'number'
  if (inner === 'true' || inner === 'false') return 'boolean'
  // String wrapped in `{'…'}` or `{"…"}` literal.
  if (/^(['"`]).*\1$/.test(inner)) return 'string'
  // Unrecognised expression — show as text so the user can still see it
  // (and the field will read as "set by code" via readProp's expression path).
  return 'string'
}
