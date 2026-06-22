import type { BaseProps } from "../general_types"

/** The three visual states of a checkbox. */
export type CheckboxState = 'checked' | 'unchecked' | 'indeterminate'

const readState = (el: any): CheckboxState =>
  el?.matches?.(':state(indeterminate)') ? 'indeterminate'
    : el?.matches?.(':state(checked)') ? 'checked'
    : 'unchecked'

export interface CheckboxProps extends BaseProps {
  /** Label text — a convenience for the common single-string case. Renders before
   *  `children`; for richer content (markup, a link, an info icon) use `children`.
   *  Both show when supplied, like `Button`. */
  label?: string
  /** Controlled state. When provided the checkbox is controlled — it renders
   *  exactly this and you update it from `onChange`. Omit for an uncontrolled
   *  checkbox (use `defaultState`). `indeterminate` shows the minus glyph and
   *  takes visual precedence; clicking it resolves to `checked`. */
  state?: CheckboxState
  /** Initial state for an uncontrolled checkbox (when `state` is not provided).
   *  The element then manages its own state; this value is read once.
   *  @defaultValue unchecked */
  defaultState?: CheckboxState
  /** Disable the checkbox (no interaction, dropped from the tab order). */
  disabled?: boolean
  /** Form field name. Inside a `<form>` the checkbox submits under this name,
   *  contributing `value` when checked — like a native checkbox. */
  name?: string
  /** Value submitted with the form when checked — like a native checkbox.
   *  @defaultValue "on" */
  value?: string
  /** Colour variant, or any literal CSS color (`'#ff1493'`, `'rebeccapurple'`)
   *  for a one-off custom tone. `brand` is purple, `neutral` a quieter gray; a
   *  custom colour keeps its hue + chroma and pins lightness to the brand fill
   *  curve so it stays legible in light and dark.
   *  @defaultValue brand */
  tone?: 'brand' | 'neutral' | (string & {})
  /** Size variant. small=16px, medium=18px, large=20px box.
   *  @defaultValue medium */
  size?: 'small' | 'medium' | 'large'
  /** Fires on click / Space with the new state, in both controlled and
   *  uncontrolled mode. (A controlled checkbox with no `onChange` is read-only —
   *  it reflects `state` and ignores clicks.) */
  onChange?: (state: CheckboxState, e: any) => void
}

/**
 * Checkbox. Renders an `<a-checkbox>` web component that owns its state —
 * controlled via `state` + `onChange`, or uncontrolled via `defaultState`. Label
 * is `children` (or the `label` prop); omit both for a box-only checkbox with an
 * `aria-label`. Requires `@antadesign/anta/elements`.
 *
 * ```tsx
 * <Checkbox state={agreed} onChange={setAgreed}>I agree</Checkbox> // controlled
 * <Checkbox defaultState="checked">Remember me</Checkbox>          // uncontrolled
 * ```
 */
export const Checkbox = ({
  state,
  defaultState,
  disabled,
  tone,
  size,
  onChange,
  label,
  className,
  style,
  children,
  tabIndex,
  ...rest
}: CheckboxProps) => {
  const isControlled = state !== undefined

  // A non-named tone is a custom CSS color — hand it to the element via
  // `--checkbox-tone-source` inline; the CSS resolver derives the fill curve.
  const toneAttr = tone && tone !== 'brand' ? tone : undefined
  const isCustomTone = toneAttr != null && toneAttr !== 'neutral'
  const computedStyle = isCustomTone
    ? { ...style, ['--checkbox-tone-source']: toneAttr }
    : style

  // The element self-toggles before this delegated handler runs, so just report
  // its resulting :state() — same path for controlled and uncontrolled. (Keyboard
  // routes through .click() too.)
  const onClick = (e: any) => {
    if (disabled || !onChange) return
    if (e.currentTarget?.matches?.(':disabled')) return
    onChange(readState(e.currentTarget), e)
  }

  // ARIA lives in the wrapper, not the element (Anta convention). `aria-checked`
  // is derived from the state the wrapper knows — live for controlled; the seed
  // for uncontrolled (it can't see later self-toggles, so prefer controlled when
  // a screen reader must track the value). A consumer's own role / aria-* via
  // `...rest` wins (spread first).
  const ariaState = state ?? defaultState ?? 'unchecked'

  return (
    <a-checkbox
      role="checkbox"
      aria-checked={ariaState === 'indeterminate' ? 'mixed' : ariaState === 'checked' ? 'true' : 'false'}
      aria-disabled={disabled ? 'true' : undefined}
      {...rest}
      // Controlled → drive `state` (the element reflects it); uncontrolled →
      // seed once via `default-state`.
      state={state}
      default-state={isControlled ? undefined : defaultState}
      disabled={disabled ? '' : undefined}
      tone={toneAttr}
      size={size && size !== 'medium' ? size : undefined}
      tabIndex={disabled ? -1 : (tabIndex ?? 0)}
      onClick={onClick}
      class={className}
      style={computedStyle}
    >
      {label}
      {children}
    </a-checkbox>
  )
}
