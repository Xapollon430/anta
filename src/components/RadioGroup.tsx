import type { BaseProps } from "../general_types"

/** Public props for `<RadioGroup>` — the single-select container. */
export interface RadioGroupProps extends Omit<BaseProps, "onChange"> {
  /** Controlled selected value. When provided, the consumer owns selection:
   *  the group follows this prop, and a click/key only requests a change via
   *  `onChange` (so it can be rejected by not updating). Leave undefined for
   *  uncontrolled. */
  value?: string
  /** Initial selected value for the uncontrolled case. */
  defaultValue?: string
  /** Fired with the requested value whenever the user picks an option (in
   *  controlled mode, apply it to `value` to accept). */
  onChange?: (value: string) => void
  /** Form field name — the group submits one `name=value` (it's the
   *  form-associated element). */
  name?: string
  /** Plain-text label rendered above the radios. */
  label?: string
  /** Plain-text hint rendered below the radios — typically helper or instructional copy. */
  hint?: string
  /** Tone applied to every option (a `<Radio>` can override its own).
   *  @defaultValue 'brand' */
  tone?: "brand" | "neutral"
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

/** The element's `change` event payload. */
type ChangeEvent = CustomEvent<{ value: string }>

/** Pull the requested value out of the element's `change` event, across
 *  renderers: a raw `CustomEvent` carries `detail` directly; a synthetic
 *  wrapper carries it on `nativeEvent.detail`. */
function changedValue(e: ChangeEvent | { nativeEvent: ChangeEvent }): string {
  const detail =
    ("nativeEvent" in e ? e.nativeEvent?.detail : undefined) ??
    ("detail" in e ? e.detail : undefined)
  return detail?.value ?? ""
}

export const RadioGroup = ({
  value,
  defaultValue,
  onChange,
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

  return (
    <a-radio-group
      value={controlled ? value : undefined}
      defaultvalue={!controlled ? defaultValue : undefined}
      name={name}
      label={label}
      hint={hint}
      tone={tone && tone !== "brand" ? tone : undefined}
      size={size && size !== "medium" ? size : undefined}
      disabled={disabled ? "" : undefined}
      orientation={orientation && orientation !== "vertical" ? orientation : undefined}
      onchange={onChange ? (e: ChangeEvent) => onChange(changedValue(e)) : undefined}
      class={className}
      style={style}
      {...rest}
    >
      {children}
    </a-radio-group>
  )
}
