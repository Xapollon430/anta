import type { BaseProps } from '../general_types'
import { Button } from './Button'

/** Convenience snapshot passed as the 2nd argument to `onAnyChange`. */
export interface InputChangeAttrs {
  /** Current value. */
  value: string
  /** The field's `name` — handy for keyed updates: `s => ({ ...s, [name]: value })`. */
  name?: string
  /** The field's `id`. */
  id?: string
  /** `'text'` (or the set single-line `type`); `'textarea'` when multiline. */
  type: string
  /** The field's class name. */
  className?: string
  /** `true` when the value is empty. */
  empty: boolean
  /** Whether the field currently passes validation (native + `error`). `undefined`
   *  where `ElementInternals` is unsupported. */
  valid?: boolean
  /** Current validation message (`''` when valid). */
  validationMessage: string
}

export interface InputProps extends Omit<BaseProps, 'children'> {
  /** Field label, shown above the control. A string is rendered with the
   *  label type scale; pass a node for full control. Associated with the
   *  control as its accessible name (the element mirrors the label text to
   *  `aria-label`, since `<label for>` can't cross the shadow boundary). */
  label?: React.ReactNode
  /** Helper text below the field (`--text-3`, no icon). Replaced by `error`
   *  when that's set. */
  hint?: React.ReactNode
  /** Error state. Truthy ⇒ the field is marked invalid (red border, warning
   *  glyph). A node/string is shown below in place of `hint`; `true` flags the
   *  border only. */
  error?: React.ReactNode | boolean
  /** Size variant. small=24px, medium=28px, large=32px tall; the font stays
   *  15px at every size.
   *  @defaultValue medium */
  size?: 'small' | 'medium' | 'large'
  /** Controlled value. Pair with `onChange` / `onInput`. */
  value?: string
  /** Initial value for the uncontrolled case. */
  defaultValue?: string
  /** Render a `<textarea>` instead of an `<input>`. Without `rows` it grows
   *  with its content (capped by `maxRows` if set). */
  multiline?: boolean
  /** Fixed visible row count — a constant-height `<textarea>` (implies
   *  `multiline`). */
  rows?: number
  /** Cap the autogrow height (in rows) of a `multiline` field with no `rows`.
   *  Omit for unbounded growth. */
  maxRows?: number
  /** Show a clear button as the first trailing item once the field has a
   *  value. */
  clearable?: boolean
  /** Content pinned to the start of the field (e.g. an icon). */
  leading?: React.ReactNode
  /** Content pinned to the end of the field (e.g. icons, buttons), after the
   *  clear button when `clearable`. */
  trailing?: React.ReactNode
  /** Single-line input type. Ignored when `multiline`. (`search` is omitted
   *  deliberately — it triggers browser-injected clear/search affordances.)
   *  @defaultValue text */
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number'
  /** Form field name — submitted with the form via ElementInternals. */
  name?: string
  /** Placeholder shown when empty. */
  placeholder?: string
  /** Disable the field. */
  disabled?: boolean
  /** Make the field read-only. */
  readOnly?: boolean
  /** Mark the field required (drives native validity). */
  required?: boolean
  /** Toggle native spell-checking. */
  spellCheck?: boolean
  /** Max input length. */
  maxLength?: number
  /** Min input length. */
  minLength?: number
  /** Validation pattern (single-line). */
  pattern?: string
  /** Min / max / step — for `type="number"`. */
  min?: number | string
  max?: number | string
  step?: number | string
  /** Fires on every keystroke. Read `e.target.value`. */
  onInput?: (e: any) => void
  /** Fires on commit (blur / Enter). Read `e.target.value`. */
  onChange?: (e: any) => void
  /** Unified value-change handler — the easy path for state. Fires on `input`
   *  *and* `change` (and on clear), with the native `event` plus a convenience
   *  `attrs` snapshot (`value`, `name`, `id`, `type`, `className`, `empty`,
   *  `valid`, `validationMessage`) so you can do `setForm(s => ({ ...s,
   *  [attrs.name]: attrs.value }))` without digging into the event. Use
   *  `event.type` to tell a live edit (`input`) from a commit (`change`). */
  onAnyChange?: (event: any, attrs: InputChangeAttrs) => void
  /** Fires when the built-in clear button (`clearable`) is activated. The field
   *  is cleared first — so `onInput` / `onChange` fire too — making this useful
   *  for reacting specifically to a clear. Backed by the element's bubbling
   *  `clearinput` event. */
  onClearInput?: (e: CustomEvent) => void
  /** Fires when the field gains focus. */
  onFocus?: (e: any) => void
  /** Fires when the field loses focus. */
  onBlur?: (e: any) => void
  /** Any other DOM event handler (`onKeyDown`, `onKeyUp`, `onPaste`, `onClick`,
   *  …) is forwarded to the field. Standard events bubble/compose to the host
   *  (and focus/blur reach it via `delegatesFocus`), so they fire as expected.
   *  (Variadic to admit multi-arg handlers like `onAnyChange`.) */
  [event: `on${string}`]: ((...args: any[]) => void) | undefined
}

const presence = (on: boolean | undefined) => (on ? '' : undefined)
const isStringish = (n: React.ReactNode) => typeof n === 'string' || typeof n === 'number'

// Build the `onAnyChange` attrs snapshot from the event target (the <a-input>
// host — events retarget to it, and id/name/value/class all live there).
const attrsOf = (e: any): InputChangeAttrs => {
  const el = e?.target ?? {}
  const value = el.value ?? ''
  const multiline = el.getAttribute?.('multiline') != null || el.getAttribute?.('rows') != null
  return {
    value,
    name: el.getAttribute?.('name') ?? undefined,
    id: el.id || undefined,
    type: multiline ? 'textarea' : el.getAttribute?.('type') ?? 'text',
    className: el.className || undefined,
    empty: !value,
    valid: el.validity ? el.validity.valid : undefined,
    validationMessage: el.validationMessage ?? '',
  }
}

// Autocomplete is derived from `type` (not a prop): the types that *are* valid
// autocomplete tokens map to themselves; the rest (text/password/number) have
// no standard token, so none is set — password managers still key off
// `type="password"`, the numeric keyboard off `type="number"`, etc.
const AUTOCOMPLETE_BY_TYPE: Record<string, string> = { email: 'email', tel: 'tel', url: 'url' }
// Virtual-keyboard hint derived from `type` (not a prop). `type` already drives
// the keyboard for these, so this is belt-and-suspenders; a raw <a-input> can
// still set `inputmode` directly to decouple keyboard from type (e.g. an OTP).
const INPUTMODE_BY_TYPE: Record<string, 'email' | 'tel' | 'url' | 'numeric'> = {
  email: 'email', tel: 'tel', url: 'url', number: 'numeric',
}

/**
 * `<Input>` — a text field. Renders an `<a-input>` web component whose real
 * `<input>` / `<textarea>` lives in shadow DOM, so it's self-contained: focus,
 * forms (via `ElementInternals`), IME, and autofill are all native, and the
 * control is reachable for styling through `::part(input)`.
 *
 * The wrapper is stateless — it maps props to attributes and slots. The clear
 * button is dropped into `slot="trailing"`; its click finds the host and calls
 * `clear()`, and its visibility is CSS off the element's `:state(filled)`.
 *
 * Requires `@antadesign/anta/elements` to be imported (client-side only).
 *
 * @example
 * ```tsx
 * <Input label="Email" type="email" placeholder="you@example.com" clearable />
 * ```
 */
export const Input = ({
  label,
  hint,
  error,
  size,
  value,
  defaultValue,
  multiline,
  rows,
  maxRows,
  clearable,
  leading,
  trailing,
  type,
  name,
  placeholder,
  disabled,
  readOnly,
  required,
  spellCheck,
  maxLength,
  minLength,
  pattern,
  min,
  max,
  step,
  onInput,
  onChange,
  onAnyChange,
  onClearInput,
  className,
  style,
  ...rest
}: InputProps) => {
  const invalid = !!error
  // error replaces hint as the message; a boolean `error` flags the border only.
  const message =
    error != null && typeof error !== 'boolean' ? error : invalid ? undefined : hint

  return (
    <a-input
      size={size && size !== 'medium' ? size : undefined}
      value={value}
      defaultvalue={value === undefined ? defaultValue : undefined}
      multiline={presence(multiline || rows != null)}
      rows={rows != null ? String(rows) : undefined}
      maxrows={maxRows != null ? String(maxRows) : undefined}
      invalid={presence(invalid)}
      type={!multiline && rows == null ? type : undefined}
      name={name}
      placeholder={placeholder}
      disabled={presence(disabled)}
      readonly={presence(readOnly)}
      required={presence(required)}
      autocomplete={!multiline && rows == null && type ? AUTOCOMPLETE_BY_TYPE[type] : undefined}
      inputmode={!multiline && rows == null && type ? INPUTMODE_BY_TYPE[type] : undefined}
      spellcheck={spellCheck != null ? (spellCheck ? 'true' : 'false') : undefined}
      maxlength={maxLength != null ? String(maxLength) : undefined}
      minlength={minLength != null ? String(minLength) : undefined}
      pattern={pattern}
      min={min}
      max={max}
      step={step}
      aria-invalid={invalid ? 'true' : undefined}
      oninput={onInput || onAnyChange ? (e: any) => { onInput?.(e); onAnyChange?.(e, attrsOf(e)) } : undefined}
      onchange={onChange || onAnyChange ? (e: any) => { onChange?.(e); onAnyChange?.(e, attrsOf(e)) } : undefined}
      onclearinput={onClearInput}
      class={className}
      style={style}
      {...rest}
    >
      {label != null &&
        (isStringish(label) ? (
          <span slot="label">{label}</span>
        ) : (
          <span slot="label" style={{ display: 'contents' }}>
            {label}
          </span>
        ))}

      {leading != null && (
        <span slot="leading" style={{ display: 'contents' }}>
          {leading}
        </span>
      )}

      {clearable && (
        // A real <a-button> (light DOM → fully styled, keyboard-focusable) in
        // the element's `clear` slot — the element owns its visibility (shown
        // only when filled + editable). It fires the bubbling `clearinput`
        // event via a-button's global listener, so clearing works even without
        // framework hydration; the element clears on that.
        <span slot="clear" style={{ display: 'contents' }}>
          <Button
            priority="tertiary"
            size={size}
            icon="x"
            aria-label="Clear"
            data-custom-event="clearinput"
          />
        </span>
      )}
      {trailing != null && (
        <span slot="trailing" style={{ display: 'contents' }}>
          {trailing}
        </span>
      )}

      {message != null && <span slot="hint">{message}</span>}
    </a-input>
  )
}
