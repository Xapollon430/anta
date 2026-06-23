import type { BaseProps } from "../general_types"

export interface TitleProps extends BaseProps {
  /** Heading level, 1-6. Drives font-size, line-height, and vertical
   *  rhythm. Also surfaced to assistive tech via `aria-level`
   *  (h1 is typically reserved for the page title).
   *  @defaultValue 2 */
  level?: 1 | 2 | 3 | 4 | 5 | 6
  /** Visual priority. Maps to text-1..text-5 (`primary` = text-1).
   *  @defaultValue primary */
  priority?: 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'quinary'
  /** Color tint. Applies the matching `--text-{N}-{tone}` palette. */
  tone?: 'brand' | 'info' | 'success' | 'warning' | 'critical'
}

/**
 * Block-level heading with level 1-6, priority, and tone.
 *
 * Renders an `<a-title>` styled tag (no JS, no shadow DOM) with
 * `role="heading"` and `aria-level={level}` set by this wrapper for
 * accessibility. Children can be anything — text, icons, badges, links
 * — so there are no `icon` / `iconTrailing` props; just compose
 * inside.
 *
 * Raw `<h1>`-`<h6>` get the same visual styling via `src/reset.css`,
 * so use a real heading tag if SEO matters and you don't need the
 * `tone` / `priority` props.
 *
 * Requires `@antadesign/anta/elements` to be imported (client-side only)
 * so the CSS ships with the page.
 *
 * @example Basic usage
 * ```tsx
 * <Title level={1}>Page title</Title>
 * <Title level={2} tone="brand">Section</Title>
 * ```
 *
 * @example With children beyond text
 * ```tsx
 * <Title level={3}>
 *   <Icon shape="bookmark" /> Saved items
 * </Title>
 * ```
 */
export const Title = ({ level = 2, priority, tone, className, style, children, ...rest }: TitleProps) => {
  return (
    <a-title
      level={String(level)}
      priority={priority}
      tone={tone}
      role="heading"
      aria-level={level}
      class={className}
      style={style}
      {...rest}
    >
      {children}
    </a-title>
  )
}
