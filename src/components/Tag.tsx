import type { BaseProps } from "../general_types"
import type { IconShape } from '../elements/a-icon.shapes'

const NAMED_TONES = new Set(['neutral', 'brand', 'info', 'success', 'warning', 'critical'])

export interface TagProps extends BaseProps {
  /** A short "key" shown before the value. When paired with `value` it
   *  renders bold (weight 600), same color. On its own (no `value`) it's
   *  treated as the tag's primary text and keeps the default styling. */
  label?: string
  /** The tag's primary text — a status, count, version, duration, etc.
   *  Rendered in the default color and weight, with no divider from the
   *  label; the color + weight contrast does the separating. */
  value?: string
  /** Semantic tone, or any literal CSS color (`'#ff1493'`, `'rebeccapurple'`)
   *  for a one-off custom tone. Each tone renders the secondary tag style:
   *  `--text-3-{tone}` text over an alpha tint of the tone's hue (fill + a
   *  slightly stronger hairline border). A custom color is tinted the same
   *  way, with the text deepened to a readable foreground. `'neutral'` (the
   *  default) is the gray tag — the same as omitting `tone`.
   *  @defaultValue neutral */
  tone?: 'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'critical' | (string & {})
  /** Emphasis level. `secondary` (the default) is the subtle alpha-tint
   *  fill; `primary` is a solid fill with white text; `tertiary` is a
   *  transparent outline. Omitting it (or passing `'secondary'`) renders
   *  the default and emits no DOM attribute.
   *  @defaultValue secondary */
  priority?: 'primary' | 'secondary' | 'tertiary'
  /** Size variant. `small` = 16px tall, `medium` = 20px, `large` = 24px
   *  (matching `Button`). Omit the attribute or pass `'medium'` for the
   *  default — both render identically and emit no DOM attribute.
   *  @defaultValue medium */
  size?: 'small' | 'medium' | 'large'
  /** Render in normal (mixed) case instead of the default uppercase
   *  (keeps Anta's small body-text letter-spacing; uppercase tracks wider). */
  nocaps?: boolean
  /** Leading icon shape. Sits flush before the label, scaled to the pill. */
  icon?: IconShape
  /** Trailing icon shape. Renders last, after the value. */
  iconTrailing?: IconShape
}

/**
 * Compact pill / chip for status, labels, and metadata.
 *
 * Renders an `<a-tag>` styled tag (no JS, no shadow DOM) — color and size
 * come entirely from attributes. Content is composed from `icon`, `label`,
 * `value`, and `iconTrailing` (like `<Button>`): `value` is the primary
 * text (default styling) and `label`, when paired with a value, renders as
 * a bold "key" before it (same color, no divider). Tabular figures are
 * always on, so counts / versions / timers don't reflow. For an arbitrary
 * multi-part tag, pass `children` instead — each segment after the first
 * gets a hairline divider (the `label` + `value` pair is the no-divider
 * exception).
 *
 * Requires `@antadesign/anta/elements` to be imported (client-side only)
 * so the CSS ships with the page.
 *
 * @example Basic usage
 * ```tsx
 * <Tag tone="success" label="Running" />
 * <Tag tone="info" icon="hourglass" label="Build" value="2m 14s" />
 * <Tag tone="brand" size="small" nocaps value="v2.1.0" />
 * ```
 */
export const Tag = ({
  icon,
  iconTrailing,
  label,
  value,
  tone,
  priority,
  size,
  nocaps,
  className,
  style,
  children,
  ...rest
}: TagProps) => {
  const isCustomTone = tone != null && !NAMED_TONES.has(tone)
  const computedStyle = isCustomTone
    ? { ...style, ['--tag-tone-source']: tone }
    : style

  // `value` is the primary text. A label only becomes the dim/bold "key"
  // when it has a value to sit before; a lone label is the primary text,
  // so it goes into <a-tag-value> to keep the default styling.
  const hasValue = value != null

  return (
    <a-tag
      tone={tone}
      // 'secondary' (and unset) is the implicit default — emit no DOM attr.
      priority={priority && priority !== 'secondary' ? priority : undefined}
      // 'medium' (and unset) is the implicit default — emit no DOM attr.
      size={size && size !== 'medium' ? size : undefined}
      // Boolean attribute: presence (empty string) on, omit off — the CSS
      // matches `[nocaps]` by presence, consistent across React / Preact.
      nocaps={nocaps ? '' : undefined}
      class={className}
      style={computedStyle}
      {...rest}
    >
      {icon && <a-icon shape={icon} aria-hidden="true" />}
      {label != null &&
        (hasValue
          ? <a-tag-label>{label}</a-tag-label>
          : <a-tag-value>{label}</a-tag-value>)}
      {hasValue && <a-tag-value>{value}</a-tag-value>}
      {children}
      {iconTrailing && <a-icon shape={iconTrailing} aria-hidden="true" />}
    </a-tag>
  )
}
