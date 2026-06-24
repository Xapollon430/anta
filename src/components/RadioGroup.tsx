import { useId, useState } from "react"
import type { BaseProps } from "../general_types"

/** The element's `statechange` event payload — the requested and prior values. */
type StateDetail = { next: string; prev: string | null }
type StateChangeEvent = CustomEvent<StateDetail>

/** One option in a `<RadioGroup>`. The wrapper renders an `<a-radio>` per entry. */
export interface RadioOption {
  /** This option's identity and the value submitted when it's selected.
   *  Must be unique within the group (a dev-only warning fires on duplicates). */
  value: string
  /** The visible label. */
  label?: React.ReactNode
  /** Secondary text under the label — explanatory copy, like `Input`'s hint. */
  hint?: React.ReactNode
  /** Disable just this option (skipped by keyboard, dropped from the tab order). */
  disabled?: boolean
  /** Override this one option's tone (defaults to the group's `tone`). */
  tone?: "brand" | "neutral" | "info" | "success" | "warning" | "critical" | (string & {})
  /** Override this one option's size (defaults to the group's `size`). */
  size?: "small" | "medium" | "large"
}

/** Public props for `<RadioGroup>` — the single-select container. */
export interface RadioGroupProps extends Omit<BaseProps, "children" | "onChange"> {
  /** The options. The wrapper renders one `<a-radio>` per entry and computes its
   *  `selected` / roving `tabindex` / `role` declaratively. */
  options: RadioOption[]
  /** Controlled selected value. When provided, the consumer owns selection: the
   *  group follows this prop and a pick only *requests* a change via
   *  `onStateChange` (reject by not updating). Leave undefined for uncontrolled. */
  value?: string
  /** Initial selected value for the uncontrolled case (the wrapper then owns the
   *  selection in local state). */
  defaultValue?: string
  /** Fired on a pick *before* selection is applied. Event-first so
   *  `event.preventDefault()` is the synchronous veto (uncontrolled mode); `detail`
   *  carries `{ next, prev }` values. In controlled mode answer by updating
   *  `value`, reject by doing nothing. */
  onStateChange?: (event: StateChangeEvent, detail: StateDetail) => void
  /** Form field name — the group submits one `name=value` (it's the
   *  form-associated element). */
  name?: string
  /** Plain-text label for the whole group, rendered above the options. */
  label?: string
  /** Plain-text description for the group, rendered directly under `label` (above
   *  the options) — typically instructional copy. Per-option helper text goes on
   *  the option's own `hint` instead. */
  hint?: string
  /** Validation/feedback tone for the group `hint` — recolours it (same tone set
   *  as `Input`'s `status`). Use `critical` for an error message, etc.; omit for
   *  the neutral default.
   *  @defaultValue 'neutral' */
  status?: "neutral" | "brand" | "info" | "success" | "warning" | "critical"
  /** Tone applied to every option (an option's own `tone` wins), or any literal
   *  CSS color for a one-off custom tone. Tints fill, label, hint, and the
   *  unselected ring border. Named tones track light/dark mode.
   *  @defaultValue 'neutral' */
  tone?: "brand" | "neutral" | "info" | "success" | "warning" | "critical" | (string & {})
  /** Size applied to every option (an option's own `size` wins).
   *  @defaultValue 'medium' */
  size?: "small" | "medium" | "large"
  /** Disable the whole group. */
  disabled?: boolean
  /** Layout + arrow-key axis.
   *  @defaultValue 'vertical' */
  orientation?: "vertical" | "horizontal"
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

/** A non-named tone is a custom CSS color — hand it to the element via
 *  `--radio-tone-source` inline; the element's CSS derives the fill curve. */
const toneStyle = (
  tone: string | undefined,
  base?: React.CSSProperties,
): React.CSSProperties | undefined =>
  tone != null && !NAMED_TONES.has(tone)
    ? { ...base, ["--radio-tone-source" as string]: tone }
    : base

/**
 * `<RadioGroup>` — a single-select radio control, rendered from `options`.
 *
 * This wrapper is convenience over the web components: it renders an `<a-radio>`
 * per option and, crucially, owns the two **declarative** DOM concerns the
 * elements deliberately don't touch — the roving **`tabindex`** (so keyboard Tab
 * lands on the right option) and each radio's **`role`**. Selection itself lives
 * in `<a-radio-group>` off-DOM (it sets each radio's `selected` property), so the
 * elements never mutate the DOM; this wrapper just reflects the current value into
 * `tabindex` on re-render. (Hand-assembling raw `<a-radio-group>` / `<a-radio>`
 * also works — see the element docs — this wrapper is the ergonomic path.)
 *
 * Controlled (`value` + `onStateChange`) or uncontrolled (`defaultValue`); either
 * way the wrapper holds the value so it can compute the roving `tabindex`.
 *
 * Requires `@antadesign/anta/elements` (client-side only).
 */
export const RadioGroup = ({
  options,
  value,
  defaultValue,
  onStateChange,
  name,
  label,
  hint,
  status,
  tone,
  size,
  disabled,
  orientation,
  className,
  style,
  ...rest
}: RadioGroupProps) => {
  const controlled = value !== undefined
  // Uncontrolled selection lives here (re-renders declaratively) rather than in
  // the element — the wrapper needs the value to compute the roving tabindex, and
  // component state re-rendering is allowed where element DOM mutation isn't.
  const [internalValue, setInternalValue] = useState(defaultValue ?? "")
  const currentValue = controlled ? value : internalValue

  // Values are an option's identity — duplicates make selection ambiguous. Warn
  // (only ever fires on the bug itself), matching a-input's bare console.warn.
  const seen = new Set<string>()
  for (const o of options) {
    if (seen.has(o.value))
      console.warn(`[anta] <RadioGroup> duplicate option value ${JSON.stringify(o.value)} — values must be unique.`)
    seen.add(o.value)
  }

  // aria-labelledby points the radiogroup's accessible name at the visible label;
  // aria-describedby points its description at the group hint.
  const labelId = useId()
  const hintId = useId()

  // The single roving tab stop: the selected option if it's enabled, else the
  // first enabled option. Every other (and every disabled) radio gets tabindex -1.
  const isEnabled = (o: RadioOption) => !disabled && !o.disabled
  const tabStopValue =
    options.find((o) => isEnabled(o) && o.value === currentValue)?.value ??
    options.find(isEnabled)?.value

  const onstatechange = (e: StateChangeEvent) => {
    const detail = readDetail(e)
    if (!detail) return
    onStateChange?.(e, detail)
    // Uncontrolled: mirror the element's pick so the roving tabindex follows.
    // (`preventDefault()` in the consumer's handler vetoes — honor it.)
    if (!controlled && !e.defaultPrevented) setInternalValue(detail.next ?? "")
  }

  return (
    <a-radio-group
      role="radiogroup"
      aria-disabled={disabled ? "true" : undefined}
      aria-labelledby={label ? labelId : undefined}
      aria-describedby={hint ? hintId : undefined}
      {...rest}
      // Controlled → drive the element's `state`. Uncontrolled → seed `default-state`
      // and let the ELEMENT own selection (it self-applies on pick, off-DOM via each
      // radio's `selected` property) — so a radio works even unhydrated (static docs
      // preview) or hand-assembled. Either way the wrapper's `useState` mirror (kept
      // current via `onstatechange`) is what feeds the roving `tabindex` below.
      state={controlled ? value : undefined}
      default-state={!controlled ? defaultValue : undefined}
      name={name}
      status={status && status !== "neutral" ? status : undefined}
      tone={tone && tone !== "neutral" ? tone : undefined}
      size={size && size !== "medium" ? size : undefined}
      disabled={disabled ? "" : undefined}
      orientation={orientation && orientation !== "vertical" ? orientation : undefined}
      onstatechange={onstatechange}
      class={className}
      style={toneStyle(tone, style)}
    >
      {label && <a-radio-group-label id={labelId}>{label}</a-radio-group-label>}
      {hint && <a-radio-group-hint id={hintId}>{hint}</a-radio-group-hint>}
      <a-radio-list>
        {options.map((o) => {
          const optDisabled = disabled || o.disabled
          return (
            <a-radio
              key={o.value}
              role="radio"
              value={o.value}
              aria-disabled={optDisabled ? "true" : undefined}
              // Roving tabindex — the wrapper's job (declarative DOM). Disabled or
              // non-tab-stop options are -1; the one tab stop is 0. `aria-checked`
              // is NOT set here — the element publishes it off-DOM via internals.
              tabIndex={optDisabled ? -1 : o.value === tabStopValue ? 0 : -1}
              tone={o.tone && o.tone !== "neutral" ? o.tone : undefined}
              size={o.size && o.size !== "medium" ? o.size : undefined}
              disabled={o.disabled ? "" : undefined}
              style={toneStyle(o.tone)}
            >
              <a-radio-label>{o.label}</a-radio-label>
              {o.hint != null && <a-radio-hint>{o.hint}</a-radio-hint>}
            </a-radio>
          )
        })}
      </a-radio-list>
    </a-radio-group>
  )
}
