import type { BaseProps } from "../general_types"
import type { IconShape } from '../elements/a-icon.shapes'


export interface ButtonProps extends BaseProps {
  /** Visual emphasis. Defaults to `primary` (saturated fill — the
   *  page's main call to action). Use `secondary` for background +
   *  border with no saturation, `tertiary` for de-emphasised actions,
   *  `quaternary` for text-only controls (no background, no border). */
  priority?: 'primary' | 'secondary' | 'tertiary' | 'quaternary'
  /** Semantic tone. Defaults to `brand` (the purple-violet brand
   *  scale). `neutral` falls back to the grayscale text/border tokens;
   *  `critical`/`info`/`success`/`warning` draw from the alert palette
   *  and the Figma `component/button/*` token set. Pass `custom` to
   *  bypass the tone resolver entirely and supply your own colours via
   *  `style={{ '--button-bg-color': ..., '--button-fg-color': ..., '--button-br-color': ... }}`
   *  (and the `-hover`/`-active` variants if you want state-driven shifts). */
  tone?: 'neutral' | 'brand' | 'critical' | 'info' | 'success' | 'warning' | 'custom'
  /** Underline style. Per the Figma spec underlines are only meaningful
   *  on `priority="quaternary"` (the link-like text-only variant), so
   *  the CSS rule that paints them is gated on quaternary — passing
   *  `underline` on another priority is a no-op visually. */
  underline?: 'solid' | 'dashed' | 'dotted'
  /** Size variant. Three heights (small = 24px, default = 28px,
   *  large = 32px) — only padding changes; font size stays 15px. */
  size?: 'small' | 'default' | 'large'
  /** Show a rotating loading indicator. Does NOT block clicks — pair
   *  with `disabled` if the action should be temporarily inert. */
  loading?: boolean
  /** Disable the button. Dims it, sets `pointer-events: none`, and
   *  removes it from the tab order. */
  disabled?: boolean
  /** Toggled-on / pressed state — e.g. for filter chips or icon
   *  toggles. Visually mirrors the `:active` rest-press feedback. */
  selected?: boolean
  /** Leading icon shape name. Renders as `<a-icon shape={…}>` before
   *  the label. See `src/elements/a-icon.shapes.ts` for the full set. */
  leadingIcon?: IconShape
  /** Trailing icon shape name. Renders as `<a-icon shape={…}>` after
   *  the label / children. */
  trailingIcon?: IconShape
  /** Icon-only button — collapses to a square, hides any label, applies
   *  the size-matched square padding. Pass exactly one of
   *  `leadingIcon` / `trailingIcon`. */
  iconButton?: boolean
  /** Drops the outer padding to zero so the button's edges sit flush
   *  with surrounding content. Useful for inline-link feel inside
   *  prose. Only takes effect with `priority="quaternary"`. */
  paddingless?: boolean
  /** Label text. Rendered inside an `<a-button-label>` tag (an
   *  unregistered, CSS-styled sub-element — same convention as
   *  `<a-progress-label>` / `<a-progress-text>`) so the icon-only
   *  padding rule only kicks in when this is omitted, without
   *  dragging in `<label>`'s form-association semantics or browser
   *  UA-stylesheet quirks. */
  label?: string
  /** When set, the component renders as `<a role="button">` rather
   *  than `<a-button>`. */
  href?: string
  /** Anchor target. Only meaningful in href mode. */
  target?: string
  /** Anchor rel. Only meaningful in href mode. */
  rel?: string
  /** Form submission type. Read by the element's global click
   *  delegate to call `form.requestSubmit()` or `form.reset()`. */
  type?: 'button' | 'submit' | 'reset'
  /** Form id to associate with, when the button isn't a descendant
   *  of its target `<form>`. */
  form?: string
  /** Click handler. */
  onClick?: (e: any) => void
  /** Catch-all for `data-*` attributes (e.g. `data-custom-event` or
   *  Playwright's `data-testid`) and `aria-*` overrides. */
  [key: `data-${string}`]: unknown
  [key: `aria-${string}`]: unknown
}

/**
 * Action button. Renders an `<a-button>` web component (or
 * `<a role="button">` when `href` is set) with the design system's
 * tone × priority matrix applied via CSS attributes.
 *
 * Requires `@antadesign/anta/elements` to be imported (client-side
 * only) to register the underlying custom element and document-level
 * keyboard/click delegates.
 *
 * @example Primary brand action
 * ```tsx
 * <Button priority="primary" tone="brand" label="Save" icon="check" onClick={save} />
 * ```
 *
 * @example Anchor styled as a button
 * ```tsx
 * <Button href="/docs" target="_blank" label="Read the docs" icon="external-link" />
 * ```
 *
 * @example Form-submitting button with a custom event
 * ```tsx
 * <Button type="submit" form="signup" tone="brand" priority="primary"
 *   label="Sign up" data-custom-event="signup-clicked" />
 * ```
 */
export const Button = ({
  priority,
  tone,
  underline,
  leadingIcon,
  trailingIcon,
  iconButton,
  paddingless,
  label,
  size,
  loading,
  disabled,
  selected,
  href,
  target,
  rel,
  type,
  form,
  className,
  style,
  children,
  ...rest
}: ButtonProps) => {
  // ARIA + tabindex live in the wrapper, not the element class. The
  // wrapper unconditionally sets tabindex from `disabled` (overriding
  // any caller-supplied value); the element stays declarative.
  const sharedAttrs = {
    priority,
    tone,
    underline,
    size,
    iconbutton: iconButton ? 'true' : undefined,
    paddingless: paddingless ? 'true' : undefined,
    loading: loading ? 'true' : undefined,
    disabled: disabled ? 'true' : undefined,
    selected: selected ? 'true' : undefined,
    tabindex: disabled ? -1 : 0,
    'aria-disabled': disabled ? 'true' : undefined,
    'aria-busy': loading ? 'true' : undefined,
    'aria-pressed': selected ? 'true' : undefined,
    class: className,
    style,
  } as const

  const inner = (
    <>
      {/* `<a-icon>` directly, not the `Icon` JSX wrapper — button icons
          are always decorative (the label / aria-label carries the
          meaning), so `aria-hidden="true"` is fixed; the wrapper's
          size + ARIA defaulting isn't needed inside the button. Keeps
          the rendered DOM as a clean tree of web-component primitives:
          `<a-button>` → `<a-icon>` + `<a-button-label>` + `<a-icon>`. */}
      {leadingIcon && <a-icon shape={leadingIcon} aria-hidden="true" />}
      {label != null && !iconButton && <a-button-label>{label}</a-button-label>}
      {children}
      {trailingIcon && <a-icon shape={trailingIcon} aria-hidden="true" />}
    </>
  )

  if (href != null) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        role="button"
        type={type}
        form={form}
        {...sharedAttrs as any}
        {...rest}
      >
        {inner}
      </a>
    )
  }

  return (
    <a-button
      type={type}
      form={form}
      {...sharedAttrs}
      {...rest}
    >
      {inner}
    </a-button>
  )
}
