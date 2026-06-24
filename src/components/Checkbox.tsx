import type { BaseProps } from "../general_types"

/** The wrapper-level checked value: a boolean for the binary axis, the string
 *  `'indeterminate'` for the third state. Mirrors Radix's `Checkbox.Root`. */
export type CheckboxValue = boolean | 'indeterminate'

/** The element-level state enum (the string vocabulary on `<a-checkbox>`'s
 *  `state` / `default-state` attributes and its `statechange` event detail). */
type CheckboxState = 'checked' | 'unchecked' | 'indeterminate'

const valueToState = (v: CheckboxValue): CheckboxState =>
  v === 'indeterminate' ? 'indeterminate' : v ? 'checked' : 'unchecked'

const stateToValue = (s: CheckboxState): CheckboxValue =>
  s === 'indeterminate' ? 'indeterminate' : s === 'checked'

const ariaForValue = (v: CheckboxValue): 'true' | 'false' | 'mixed' =>
  v === 'indeterminate' ? 'mixed' : v ? 'true' : 'false'

/** The element's `statechange` event payload. */
type StateDetail = { next: CheckboxState; prev: CheckboxState }
type StateChangeEvent = CustomEvent<StateDetail>

/** Pull the `{ next, prev }` payload out of the element's `statechange` event,
 *  across renderers: a raw `CustomEvent` carries `detail` directly; React's
 *  synthetic wrapper carries the original on `nativeEvent`. */
function readDetail(
  e: StateChangeEvent | { nativeEvent: StateChangeEvent },
): StateDetail | undefined {
  return 'nativeEvent' in e ? e.nativeEvent?.detail : e.detail
}

export interface CheckboxProps extends BaseProps {
  /** Visible label — the *value* of the checkbox (clicked along with the box).
   *  Convenience for the common single-string case; for richer content (markup,
   *  a link, an info icon) use `children`. When both are supplied, `label`
   *  renders first. Required unless `children` or `aria-label` is provided
   *  (a `role="checkbox"` takes its name from the author, not the markup). */
  label?: string
  /** Secondary text rendered under the label — explanatory copy, like
   *  Input's hint. Not part of the accessible name. */
  hint?: React.ReactNode
  /** Controlled checked state. When provided the checkbox is controlled — it
   *  renders exactly this and never self-applies; `onStateChange` is a *request*
   *  the consumer accepts by updating this prop. Use `defaultChecked` for an
   *  uncontrolled checkbox. `'indeterminate'` shows the minus glyph and takes
   *  visual precedence; clicking it requests `true`. */
  checked?: CheckboxValue
  /** Initial checked state for an uncontrolled checkbox. Read once; later
   *  changes ignored (the element then owns the state).
   *  @defaultValue false */
  defaultChecked?: CheckboxValue
  /** Disable the checkbox (no interaction, dropped from the tab order). */
  disabled?: boolean
  /** Form field name. Inside a `<form>` the checkbox submits under this name,
   *  contributing `value` when checked — like a native checkbox. */
  name?: string
  /** Value submitted with the form when checked — like a native checkbox.
   *  @defaultValue "on" */
  value?: string
  /** Colour variant, or any literal CSS color (`'#ff1493'`, `'rebeccapurple'`)
   *  for a one-off custom tone. Tints fill, label, hint, and the unselected box
   *  border. Named tones track light/dark mode automatically via the theme-aware
   *  role tokens; a custom colour keeps its hue + chroma and pins lightness to the
   *  fill curve.
   *  @defaultValue 'neutral' */
  tone?: 'brand' | 'neutral' | 'info' | 'success' | 'warning' | 'critical' | (string & {})
  /** Size variant. small=14px, medium=16px, large=18px box.
   *  @defaultValue 'medium' */
  size?: 'small' | 'medium' | 'large'
  /** Fired on click / Space *before* the element applies any change. Event-first
   *  so `event.preventDefault()` is the synchronous veto (uncontrolled mode);
   *  `detail` carries `{ next, prev }`. In controlled mode the element never
   *  self-applies — answer by updating `checked`, reject by doing nothing. */
  onStateChange?: (
    event: StateChangeEvent,
    detail: { next: CheckboxValue; prev: CheckboxValue },
  ) => void
}

const NAMED_TONES = new Set(['brand', 'neutral', 'info', 'success', 'warning', 'critical'])

/**
 * Checkbox. Renders an `<a-checkbox>` web component that owns the visual
 * state; controlled via `checked` + `onStateChange`, or uncontrolled via
 * `defaultChecked`. Label is `label` (or `children`); `hint` adds secondary
 * text under the label. Requires `@antadesign/anta/elements`.
 *
 * ```tsx
 * <Checkbox checked={agreed} onStateChange={(e, { next }) => setAgreed(next)}>
 *   I agree
 * </Checkbox>
 * <Checkbox defaultChecked label="Remember me" hint="On this device" />
 * ```
 */
export const Checkbox = ({
  checked,
  defaultChecked,
  disabled,
  tone,
  size,
  onStateChange,
  label,
  hint,
  className,
  style,
  children,
  tabIndex,
  ...rest
}: CheckboxProps) => {
  // The wrapper is stateless on purpose (matches every other Anta wrapper;
  // keeps `configure()` portability). `aria-checked` is the live value for
  // controlled, the seed for uncontrolled — which then goes stale on
  // self-toggles; prefer controlled when a screen reader must track every
  // toggle.
  const liveValue: CheckboxValue = checked ?? defaultChecked ?? false

  // A non-named tone is a custom CSS color — hand it to the element via
  // `--checkbox-tone-source` inline; the CSS resolver derives the fill curve.
  const isCustomTone = tone != null && !NAMED_TONES.has(tone)
  const computedStyle = isCustomTone
    ? { ...style, ['--checkbox-tone-source']: tone }
    : style

  // The accessible name is wrapper-derived (matches `Input` and the "ARIA lives
  // in the wrapper" rule): a string label / children becomes the box's
  // `aria-label` automatically, so consumers don't hand-write it. An explicit
  // `aria-label` in `...rest` still wins.
  const explicitAriaLabel = rest['aria-label']
  const ariaLabel =
    (typeof explicitAriaLabel === 'string' ? explicitAriaLabel : undefined) ??
    label ??
    (typeof children === 'string' ? children : undefined)

  const onstatechange = onStateChange
    ? (e: StateChangeEvent) => {
        const detail = readDetail(e)
        if (!detail) return
        onStateChange(e, {
          next: stateToValue(detail.next),
          prev: stateToValue(detail.prev),
        })
      }
    : undefined

  // Emit `state` or `default-state`, never both — the DOM never carries a
  // stale state attribute, and TS narrows `checked` / `defaultChecked` to
  // non-undefined inside each branch (no casts needed).
  const stateAttr = checked !== undefined ? valueToState(checked) : undefined
  const defaultStateAttr =
    checked === undefined && defaultChecked !== undefined
      ? valueToState(defaultChecked)
      : undefined

  const hasLabel = label != null || children != null

  return (
    <a-checkbox
      role="checkbox"
      aria-checked={ariaForValue(liveValue)}
      aria-disabled={disabled ? 'true' : undefined}
      aria-label={ariaLabel}
      {...rest}
      state={stateAttr}
      default-state={defaultStateAttr}
      disabled={disabled ? '' : undefined}
      tone={tone && tone !== 'neutral' ? tone : undefined}
      size={size && size !== 'medium' ? size : undefined}
      tabIndex={disabled ? -1 : (tabIndex ?? 0)}
      // All-lowercase `onstatechange` is the one event-prop spelling both
      // renderers bind to our custom `statechange` event: React 19 keeps the
      // case of whatever follows `on`, Preact lowercases. The native-listener
      // path is what lets `event.preventDefault()` reach the element's
      // `dispatchEvent()` return.
      onstatechange={onstatechange}
      class={className}
      style={computedStyle}
    >
      {hasLabel && (
        <a-checkbox-label>
          {label}
          {children}
        </a-checkbox-label>
      )}
      {hint != null && <a-checkbox-hint>{hint}</a-checkbox-hint>}
    </a-checkbox>
  )
}
