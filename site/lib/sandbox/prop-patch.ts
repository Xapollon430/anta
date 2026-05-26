/**
 * prop-patch.ts — form-control → code edits via targeted string
 * replacement inside the opening tag of a bound JSX element.
 *
 * The InteractiveDemo binds to a target component (e.g. `Progress`).
 * Every form change calls `replaceProp(code, target, name, value)`:
 * we find `<Target` in the source, locate the named attribute inside
 * the opening tag, and either replace its value, insert it, or remove
 * it (when the value matches the prop's default). Everything outside
 * the opening tag — sibling `<style>` blocks, wrapping fragments,
 * helper functions, the user's imports — is left untouched.
 */
import { findAttribute, locateOpeningTag } from './locate-tag.ts'

export interface PropDescriptor {
  /** Prop name as it appears in JSX. */
  name: string
  /** What to render the value as in JSX. Determines whether we emit
   *  `value="abc"` (string) or `value={42}` (expression). */
  kind: 'string' | 'number' | 'boolean' | 'literal-union'
  /** Default value — if `next === defaultValue` we omit the attribute. */
  defaultValue?: string | number | boolean | null
}

/**
 * Replace (or insert or remove) a single attribute of the target
 * element. Returns the new source. If the target element can't be
 * located the original source is returned unchanged.
 *
 * When `range` is supplied, the locator is constrained to that slice
 * of the source — used by the multi-example playground so a form
 * tied to one example only edits that example's JSX.
 */
export function replaceProp(
  source: string,
  componentName: string,
  prop: PropDescriptor,
  nextValue: string | number | boolean | null | undefined,
  range?: { start: number; end: number },
): string {
  if (range) {
    const slice = source.slice(range.start, range.end)
    const open = locateOpeningTag(slice, componentName)
    if (!open) return source
    const offsetOpen = shiftOpenTag(open, range.start)
    const existing = findAttribute(source, offsetOpen, prop.name)
    return applyEdit(source, prop, nextValue, offsetOpen, existing)
  }
  const open = locateOpeningTag(source, componentName)
  if (!open) return source
  const existing = findAttribute(source, open, prop.name)
  return applyEdit(source, prop, nextValue, open, existing)
}

function applyEdit(
  source: string,
  prop: PropDescriptor,
  nextValue: string | number | boolean | null | undefined,
  open: ReturnType<typeof locateOpeningTag> & object,
  existing: ReturnType<typeof findAttribute>,
): string {
  const shouldRemove = isAtDefault(nextValue, prop) || nextValue === '' || nextValue == null
  if (shouldRemove) {
    if (!existing) return source
    return removeAttribute(source, existing.start, existing.end)
  }
  const serialized = serializeAttribute(prop, nextValue!)
  if (existing) {
    return source.slice(0, existing.start) + serialized + source.slice(existing.end)
  }
  return insertAttribute(source, open, serialized)
}

function shiftOpenTag(
  open: NonNullable<ReturnType<typeof locateOpeningTag>>,
  delta: number,
): NonNullable<ReturnType<typeof locateOpeningTag>> {
  return {
    start: open.start + delta,
    end: open.end + delta,
    selfClosing: open.selfClosing,
    text: open.text,
    attrsStart: open.attrsStart + delta,
    attrsEnd: open.attrsEnd + delta,
  }
}

function isAtDefault(value: unknown, prop: PropDescriptor): boolean {
  if (prop.defaultValue === undefined) return false
  return value === prop.defaultValue
}

function serializeAttribute(prop: PropDescriptor, value: string | number | boolean): string {
  switch (prop.kind) {
    case 'string':
      // Use double quotes; escape any embedded double quotes.
      return `${prop.name}="${String(value).replace(/"/g, '&quot;')}"`
    case 'literal-union':
      return `${prop.name}="${String(value)}"`
    case 'boolean':
      return value ? `${prop.name}` : `${prop.name}={false}`
    case 'number':
      return `${prop.name}={${Number(value)}}`
  }
}

function removeAttribute(source: string, attrStart: number, attrEnd: number): string {
  // Also eat the leading whitespace that separated this attribute from
  // its predecessor, so we don't leave a double space behind.
  let cleanStart = attrStart
  while (cleanStart > 0 && /[ \t]/.test(source[cleanStart - 1])) cleanStart--
  // If the previous character is a newline we keep one space — don't
  // collapse the indented line entirely.
  if (cleanStart > 0 && source[cleanStart - 1] === '\n') {
    // Remove the whole now-empty line.
    let lineEnd = attrEnd
    while (lineEnd < source.length && /[ \t]/.test(source[lineEnd])) lineEnd++
    if (source[lineEnd] === '\n') lineEnd++
    return source.slice(0, cleanStart) + source.slice(lineEnd)
  }
  return source.slice(0, cleanStart) + source.slice(attrEnd)
}

function insertAttribute(
  source: string,
  open: { attrsEnd: number; selfClosing: boolean; start: number },
  serialized: string,
): string {
  // `attrsEnd` is the index of the `/>` or `>` marker that closes
  // the opening tag. Insert just before it, separated by a space (or
  // a newline + matching indent if the existing attributes are
  // multi-line).
  const insertAt = open.attrsEnd
  const segment = source.slice(open.start, insertAt)
  const lastNewlineIdx = segment.lastIndexOf('\n')
  if (lastNewlineIdx === -1) {
    // Single-line opening tag — insert with a leading space.
    return source.slice(0, insertAt) + ' ' + serialized + source.slice(insertAt)
  }
  // Multi-line opening tag — match the existing indent of the last
  // attribute line.
  const lastLine = segment.slice(lastNewlineIdx + 1)
  const indentMatch = lastLine.match(/^[ \t]*/)
  const indent = indentMatch ? indentMatch[0] : ''
  // Trim any trailing whitespace on the existing last line, then add
  // a newline + indent + new attribute.
  let trimEnd = insertAt
  while (trimEnd > 0 && /[ \t]/.test(source[trimEnd - 1])) trimEnd--
  return source.slice(0, trimEnd) + '\n' + indent + serialized + source.slice(insertAt)
}
