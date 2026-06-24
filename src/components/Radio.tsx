import type { BaseProps } from "../general_types"

/** Public props for a single `<Radio>` option. */
export interface RadioProps extends BaseProps {
  /** This option's value — its identity within the group and the value
   *  submitted when it's selected. */
  value: string
  /** Disable just this option. */
  disabled?: boolean
  /** Semantic tone, or any literal CSS color (`'#ff1493'`, `'rebeccapurple'`)
   *  for a one-off custom tone. Named tones track light/dark mode automatically;
   *  a custom colour keeps its hue + chroma and pins lightness to the brand
   *  fill curve. Defaults to the group's tone (or `brand`).
   *  @defaultValue 'brand' */
  tone?: "brand" | "neutral" | "info" | "success" | "warning" | "critical" | (string & {})
  /** Size variant. Defaults to the group's size (or `medium`); set it here to
   *  override a single option.
   *  @defaultValue 'medium' */
  size?: "small" | "medium" | "large"
  /** The label. Plain text, or any nodes (e.g. text + an info `<Icon>`). */
  children?: React.ReactNode
}

const NAMED_TONES = new Set(["brand", "neutral", "info", "success", "warning", "critical"])

/**
 * `<Radio>` — one option in a `<RadioGroup>`.
 *
 * A pure, stateless pass-through to `<a-radio>`: selection, keyboard, roving
 * tabindex, and form value are all owned by the enclosing `<a-radio-group>`
 * (see `<RadioGroup>`), so this wrapper only maps props to attributes and
 * projects the label. Renders nothing interactive on its own — use it inside a
 * `<RadioGroup>`.
 *
 * `role="radio"` and `aria-disabled` are set here. `aria-checked` is **not** —
 * `<a-radio>` publishes it through `ElementInternals` (off the DOM), driven by
 * the `selected` property the enclosing `<RadioGroup>` sets.
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
}: RadioProps) => {
  // A non-named tone is a custom CSS color — hand it to the element via
  // `--radio-tone-source` inline; the CSS resolver derives the fill curve.
  const isCustomTone = tone != null && !NAMED_TONES.has(tone)
  const computedStyle = isCustomTone
    ? { ...style, ["--radio-tone-source"]: tone }
    : style

  return (
    <a-radio
      role="radio"
      aria-disabled={disabled ? "true" : undefined}
      {...rest}
      value={value}
      // 'brand' / 'medium' are the implicit defaults — emit no DOM attribute.
      tone={tone && tone !== "brand" ? tone : undefined}
      size={size && size !== "medium" ? size : undefined}
      disabled={disabled ? "" : undefined}
      class={className}
      style={computedStyle}
    >
      {children}
    </a-radio>
  )
}
