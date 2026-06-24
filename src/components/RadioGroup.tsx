import { useId } from "react"
import type { BaseProps } from "../general_types"

/** The element's `statechange` event payload — the requested and prior values. */
type StateDetail = { next: string; prev: string | null }
type StateChangeEvent = CustomEvent<StateDetail>

/** Public props for `<RadioGroup>` — the single-select container. */
export interface RadioGroupProps extends Omit<BaseProps, "onChange"> {
  /** Controlled selected value. When provided, the consumer owns selection:
   *  the group follows this prop and a pick only *requests* a change via
   *  `onStateChange` (reject by not updating). Leave undefined for uncontrolled. */
  value?: string
  /** Initial selected value for the uncontrolled case. */
  defaultValue?: string
  /** Fired on a pick *before* the group applies it. Event-first so
   *  `event.preventDefault()` is the synchronous veto (uncontrolled mode);
   *  `detail` carries `{ next, prev }` values. In controlled mode the group never
   *  self-applies — answer by updating `value`, reject by doing nothing. */
  onStateChange?: (event: StateChangeEvent, detail: StateDetail) => void
  /** Form field name — the group submits one `name=value` (it's the
   *  form-associated element). */
  name?: string
  /** Plain-text label rendered above the radios. */
  label?: string
  /** Plain-text hint rendered below the radios — typically helper or instructional copy. */
  hint?: string
  /** Tone applied to every option (a `<Radio>` can override its own), or any
   *  literal CSS color (`'#ff1493'`, `'rebeccapurple'`) for a one-off custom
   *  tone. Named tones track light/dark mode; a custom colour pins lightness
   *  to the brand fill curve.
   *  @defaultValue 'brand' */
  tone?: "brand" | "neutral" | "info" | "success" | "warning" | "critical" | (string & {})
  /** Size applied to every option (a `<Radio>` can override its own).
   *  @defaultValue 'medium' */
  size?: "small" | "medium" | "large"
  /** Disable the whole group. */
  disabled?: boolean
  /** Layout + arrow-key axis.
   *  @defaultValue 'vertical' */
  orientation?: "vertical" | "horizontal"
  /** The `<Radio>` options. */
  children: React.ReactNode
}

/** Pull the `{ next, prev }` payload out of the element's `statechange` event,
 *  across renderers: a raw `CustomEvent` carries `detail` directly; React's
 *  synthetic wrapper carries the original on `nativeEvent`. */
function readDetail(
  e: StateChangeEvent | { nativeEvent: StateChangeEvent },
): StateDetail | undefined {
  return "nativeEvent" in e ? e.nativeEvent?.detail : e.detail
}

const NAMED_TONES = new Set(["brand", "neutral", "info", "success", "warning", "critical"])

export const RadioGroup = ({
  value,
  defaultValue,
  onStateChange,
  name,
  label,
  hint,
  tone,
  size,
  disabled,
  orientation,
  className,
  style,
  children,
  ...rest
}: RadioGroupProps) => {
  const controlled = value !== undefined

  // aria-labelledby points the radiogroup's accessible name at the visible
  // label element, so there's no duplicated string for a screen reader.
  const labelId = useId()

  const onstatechange = onStateChange
    ? (e: StateChangeEvent) => {
        const detail = readDetail(e)
        if (!detail) return
        onStateChange(e, detail)
      }
    : undefined

  // A non-named tone is a custom CSS color — hand it to the element via
  // `--radio-tone-source` inline; CSS inheritance carries it onto each child
  // <a-radio> so the same derivation rule fires per option without per-radio
  // plumbing. (A child <Radio tone="..."> override wins because its rule sets
  // --radio-tone-source on its own host.)
  const isCustomTone = tone != null && !NAMED_TONES.has(tone)
  const computedStyle = isCustomTone
    ? { ...style, ["--radio-tone-source"]: tone }
    : style

  return (
    <a-radio-group
      role="radiogroup"
      aria-disabled={disabled ? "true" : undefined}
      aria-labelledby={label ? labelId : undefined}
      {...rest}
      state={controlled ? value : undefined}
      default-state={!controlled ? defaultValue : undefined}
      name={name}
      tone={tone && tone !== "brand" ? tone : undefined}
      size={size && size !== "medium" ? size : undefined}
      disabled={disabled ? "" : undefined}
      orientation={orientation && orientation !== "vertical" ? orientation : undefined}
      onstatechange={onstatechange}
      class={className}
      style={computedStyle}
    >
      {label && <a-radio-label id={labelId}>{label}</a-radio-label>}
      <a-radio-list>{children}</a-radio-list>
      {hint && <a-radio-hint>{hint}</a-radio-hint>}
    </a-radio-group>
  )
}
