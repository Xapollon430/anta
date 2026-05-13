/**
 * prop-read.ts — code → form-state direction of the sync. Scans the
 * bound target element's opening tag for each known prop and tries
 * to extract a literal value. Anything non-literal (function calls,
 * computed refs, ternaries) returns `undefined` for that prop —
 * caller leaves the form control at its last known value.
 */
import { findAttribute, locateOpeningTag } from './locate-tag.ts'
import type { PropDescriptor } from './prop-patch.ts'

export type ReadResult = { kind: 'literal'; value: string | number | boolean } | { kind: 'expression' } | undefined

/**
 * Read a single prop from the target element's opening tag.
 * Returns:
 *   - { kind: 'literal', value } if the attribute is a string literal,
 *     a number literal inside `{…}`, or a boolean literal / shorthand.
 *   - { kind: 'expression' } if the attribute is present but its value
 *     is some other JS expression — the form should disable its control
 *     and indicate "set by code".
 *   - undefined if the attribute isn't present at all — the form should
 *     show its default value.
 */
export function readProp(source: string, componentName: string, prop: PropDescriptor): ReadResult {
  const open = locateOpeningTag(source, componentName)
  if (!open) return undefined
  const attr = findAttribute(source, open, prop.name)
  if (!attr) return undefined

  // Boolean shorthand (`<Foo bar>`) — only valid when the prop is boolean.
  if (!attr.valueRange) {
    return prop.kind === 'boolean' ? { kind: 'literal', value: true } : { kind: 'expression' }
  }

  if (attr.valueRange.kind === 'string') {
    // Strip the surrounding quotes.
    const raw = attr.valueRange.text.slice(1, -1)
    if (prop.kind === 'string' || prop.kind === 'literal-union') {
      return { kind: 'literal', value: raw }
    }
    // String value supplied to a number / boolean prop — unusual; surface
    // as expression so the form doesn't pretend it understood it.
    return { kind: 'expression' }
  }

  // Expression container: strip the `{ … }`.
  const inner = attr.valueRange.text.slice(1, -1).trim()
  // Numeric literal.
  if (prop.kind === 'number') {
    if (/^-?\d+(\.\d+)?$/.test(inner)) return { kind: 'literal', value: Number(inner) }
    return { kind: 'expression' }
  }
  // Boolean literal.
  if (prop.kind === 'boolean') {
    if (inner === 'true') return { kind: 'literal', value: true }
    if (inner === 'false') return { kind: 'literal', value: false }
    return { kind: 'expression' }
  }
  // String literal inside braces, e.g. `tone={'info'}`.
  if (prop.kind === 'string' || prop.kind === 'literal-union') {
    const m = inner.match(/^(['"])(.*)\1$/)
    if (m) return { kind: 'literal', value: m[2] }
    return { kind: 'expression' }
  }
  return { kind: 'expression' }
}
