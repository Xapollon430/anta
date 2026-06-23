import type { BaseProps } from "../general_types"

/** Public props for a single `<Radio>` option. */
export interface RadioProps extends BaseProps {
  /** This option's value — its identity within the group and the value
   *  submitted when it's selected. */
  value: string
  /** Disable just this option. */
  disabled?: boolean
  /** Semantic tone. Defaults to the group's tone (or `brand`); set it here to
   *  override a single option.
   *  @defaultValue 'brand' */
  tone?: "brand" | "neutral"
  /** Size variant. Defaults to the group's size (or `medium`); set it here to
   *  override a single option.
   *  @defaultValue 'medium' */
  size?: "small" | "medium" | "large"
  /** The label. Plain text, or any nodes (e.g. text + an info `<Icon>`). */
  children?: React.ReactNode
}

/**
 * `<Radio>` — one option in a `<RadioGroup>`.
 *
 * A pure, stateless pass-through to `<a-radio>`: selection, keyboard, roving
 * tabindex, and form value are all owned by the enclosing `<a-radio-group>`
 * (see `<RadioGroup>`), so this wrapper only maps props to attributes and
 * projects the label. Renders nothing interactive on its own — use it inside a
 * `<RadioGroup>`.
 *
 * Requires `@antadesign/anta/elements` to be imported (client-side only).
 */
export const Radio = ({
  value,
  disabled,
  tone,
  size,
  className,
  style,
  children,
  ...rest
}: RadioProps) => (
  <a-radio
    value={value}
    // 'brand' / 'medium' are the implicit defaults — emit no DOM attribute.
    tone={tone && tone !== "brand" ? tone : undefined}
    size={size && size !== "medium" ? size : undefined}
    disabled={disabled ? "" : undefined}
    class={className}
    style={style}
    {...rest}
  >
    {children}
  </a-radio>
)
