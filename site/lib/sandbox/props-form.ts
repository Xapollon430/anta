/**
 * props-form.ts — walks the build-time typedoc output (`site/src/api.json`)
 * to derive a control schema for a component's props. The same JSON drives
 * `PropsTable.astro` (the static reference table); reusing it here keeps
 * the playground form in lockstep with the documented prop set.
 *
 * Walk: `api.children` → find the `{ComponentName}Props` declaration →
 * collect its prop list (direct `children` for an `interface` declaration,
 * or `flattenType` over `decl.type` for a `type` alias built from
 * intersections / discriminated unions) → map each prop's type into a
 * `Control` descriptor.
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
 *  component (or its `{Name}Props` interface) isn't in the doc set.
 *
 *  Two declaration shapes are supported:
 *
 *    1. `interface FooProps extends BaseProps { … }` — typedoc emits
 *       the prop list as `decl.children`, including inherited members
 *       (with `flags.isInherited`). Read directly.
 *    2. `type FooProps = X & Y & Z` (intersection of named types and
 *       inline object literals) — typedoc emits `decl.type` describing
 *       the structure. `flattenType` walks it, recursing through
 *       intersections, unions of object literals (discriminated
 *       unions), reflections (`{ … }`), and named references back
 *       into `api.children`.
 *
 *  Both paths converge on a flat prop list, then map each prop to a
 *  `Control`. */
export function controlsFor(componentName: string): PropEntry[] {
  const ifaceName = `${componentName}Props`
  const root: any = api as any
  const decl = root.children?.find((c: any) => c.name === ifaceName)
  if (!decl) return []

  const props = decl.children
    ? (decl.children as any[])
    : flattenType(decl.type, root)

  const entries: PropEntry[] = []
  for (const p of props) {
    if (EXCLUDED_PROP_NAMES.has(p.name)) continue
    const ctl = controlFor(p)
    if (!ctl) continue
    entries.push(ctl)
  }
  return entries
}

/** Recursively flatten a typedoc type node into a list of prop
 *  declarations shaped like the `children` of an interface. Handles
 *  intersections (merge by name, first non-`never` wins), unions of
 *  object literals (merge by name, take the union of literal value
 *  spaces across branches — that's how `priority` ends up with all
 *  four values from the three `PriorityMode` branches), reflections
 *  (inline `{ … }` types — take their `children` verbatim), and
 *  references to other named types in `api.children` (recurse on
 *  their `type` if a type alias, or use their `children` if an
 *  interface). Anything else returns `[]`. */
function flattenType(type: any, root: any): any[] {
  if (!type) return []
  switch (type.type) {
    case 'intersection': {
      const seen = new Map<string, any>()
      for (const member of type.types ?? []) {
        for (const field of flattenType(member, root)) {
          const existing = seen.get(field.name)
          if (!existing || isNeverType(existing.type)) {
            seen.set(field.name, field)
          }
        }
      }
      return [...seen.values()].filter((f) => !isNeverType(f.type))
    }
    case 'union': {
      const byName = new Map<string, any[]>()
      for (const branch of type.types ?? []) {
        for (const field of flattenType(branch, root)) {
          if (!byName.has(field.name)) byName.set(field.name, [])
          byName.get(field.name)!.push(field)
        }
      }
      const merged: any[] = []
      for (const occurrences of byName.values()) {
        const m = mergeUnionField(occurrences)
        if (m) merged.push(m)
      }
      return merged
    }
    case 'reflection':
      return (type.declaration?.children ?? []) as any[]
    case 'reference': {
      const target = root.children?.find((c: any) => c.name === type.name)
      if (!target) return []
      if (target.children) return target.children as any[]
      return flattenType(target.type, root)
    }
    default:
      return []
  }
}

/** Merge multiple appearances of the same prop across union branches.
 *  `never` branches are dropped from the type merge — they're the
 *  discriminator pattern used to forbid a prop in one variant (e.g.
 *  `label?: never` on the `iconButton: true` branch). If every branch
 *  is `never`, the prop collapses to nothing and we return null. For
 *  literal / literal-union types we take the union of all values
 *  across branches; for any other shape we keep the first documented
 *  branch. The merged prop is marked optional whenever any branch
 *  marks it optional OR any branch types it as `never` — in the
 *  latter case the prop can be omitted by selecting that variant. */
function mergeUnionField(fields: any[]): any | null {
  const real = fields.filter((f) => !isNeverType(f.type))
  if (real.length === 0) return null
  const optional =
    fields.some((f) => f.flags?.isOptional) || real.length < fields.length

  if (real.length === 1) {
    return {
      ...real[0],
      flags: { ...real[0].flags, isOptional: optional },
    }
  }

  const allLiteralish = real.every((f) => isLiteralOrLiteralUnion(f.type))
  if (allLiteralish) {
    const collected: any[] = []
    for (const f of real) collectLiterals(f.type, collected)
    const seenValues = new Set<string>()
    const dedup: any[] = []
    for (const lit of collected) {
      const k = `${typeof lit.value}:${lit.value}`
      if (seenValues.has(k)) continue
      seenValues.add(k)
      dedup.push(lit)
    }
    const mergedType =
      dedup.length === 1 ? dedup[0] : { type: 'union', types: dedup }
    return {
      ...(real.find((f) => f.comment) ?? real[0]),
      type: mergedType,
      flags: { ...real[0].flags, isOptional: optional },
    }
  }
  return {
    ...(real.find((f) => f.comment) ?? real[0]),
    flags: { ...real[0].flags, isOptional: optional },
  }
}

function isNeverType(t: any): boolean {
  return t?.type === 'intrinsic' && t?.name === 'never'
}

function isLiteralOrLiteralUnion(t: any): boolean {
  if (!t) return false
  if (t.type === 'literal') return true
  if (t.type === 'union' && Array.isArray(t.types)) {
    return t.types.every((x: any) => x.type === 'literal')
  }
  return false
}

function collectLiterals(t: any, out: any[]): void {
  if (t.type === 'literal') out.push(t)
  else if (t.type === 'union') for (const x of t.types ?? []) collectLiterals(x, out)
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

  // `union` of all `literal` members → segmented buttons. Boolean-only
  // literal unions (`true | false`) reduce to a plain boolean control
  // — that's how discriminated-union booleans (e.g. Button's
  // `iconButton: true | iconButton?: false`) appear after merging.
  if (t.type === 'union' && Array.isArray(t.types)) {
    const allLiterals = t.types.every((x: any) => x.type === 'literal')
    if (allLiterals && t.types.length > 0) {
      const allBoolean = t.types.every((x: any) => typeof x.value === 'boolean')
      if (allBoolean) {
        return wrap(
          { kind: 'boolean', name, description },
          { name, kind: 'boolean' },
        )
      }
      const stringLiterals = t.types.filter((x: any) => typeof x.value === 'string')
      if (stringLiterals.length === t.types.length) {
        const options = stringLiterals.map((x: any) => String(x.value))
        const defaultValue = options[0]
        return wrap(
          { kind: 'segmented', name, options, defaultValue, description },
          { name, kind: 'literal-union', defaultValue },
        )
      }
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
