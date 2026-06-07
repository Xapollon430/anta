import type { BaseProps } from "../general_types"

const NAMED_TONES = new Set(['brand', 'info', 'success', 'warning', 'critical'])

export interface TagProps extends BaseProps {
  /** Semantic tone, or any literal CSS color (`'#ff1493'`, `'rebeccapurple'`)
   *  for a one-off custom tone. Named tones map to the `--text-2-{tone}` /
   *  `--bg-4-{tone}` palette; a custom color keeps its hue while lightness
   *  and chroma are pinned so any input reads like a sibling of the named
   *  tones. Omit for the neutral gray tag. */
  tone?: 'brand' | 'info' | 'success' | 'warning' | 'critical' | (string & {})
  /** Size variant. `small` = 16px tall, `medium` = 20px. Omit the attribute
   *  or pass `'medium'` for the default — both render identically and emit
   *  no DOM attribute.
   *  @defaultValue medium */
  size?: 'small' | 'medium'
  /** Render in normal (mixed) case instead of the default uppercase, with
   *  proportional figures and no extra letter-spacing. */
  nocaps?: boolean
}

/**
 * Compact pill / chip for status, labels, and metadata.
 *
 * Renders an `<a-tag>` styled tag (no JS, no shadow DOM) — color and size
 * come entirely from attributes. Children are light-DOM, so a tag can be
 * *segmented*: pass multiple children and they render with `|` dividers
 * between them. A leading `<Icon>` sits flush against its label (no divider).
 *
 * Requires `@antadesign/anta/elements` to be imported (client-side only)
 * so the CSS ships with the page.
 *
 * @example Basic usage
 * ```tsx
 * <Tag tone="success">Running</Tag>
 * <Tag tone="#ff1493" size="small" nocaps>v2.1.0</Tag>
 * ```
 *
 * @example Segmented
 * ```tsx
 * <Tag tone="info">
 *   <Icon shape="play" />
 *   <span>Loading</span>
 *   <span>98%</span>
 * </Tag>
 * ```
 */
export const Tag = ({ tone, size, nocaps, className, style, children, ...rest }: TagProps) => {
  const isCustomTone = tone != null && !NAMED_TONES.has(tone)
  const computedStyle = isCustomTone
    ? { ...style, ['--tag-tone-source']: tone }
    : style

  return (
    <a-tag
      tone={tone}
      // 'medium' (and unset) is the implicit default — emit no DOM attr.
      size={size && size !== 'medium' ? size : undefined}
      // Boolean attribute: presence (empty string) on, omit off — the CSS
      // matches `[nocaps]` by presence, consistent across React / Preact.
      nocaps={nocaps ? '' : undefined}
      class={className}
      style={computedStyle}
      {...rest}
    >
      {children}
    </a-tag>
  )
}
