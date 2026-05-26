import type { BaseProps } from "../general_types"
import type { IconShape } from '../elements/a-icon.shapes'

/** Tones with a built-in CSS resolver. Anything else passed to
 *  `tone` is treated as a literal CSS color and flows through
 *  `--button-tone-source` to the custom-tone resolver. */
const NAMED_TONES = new Set([
  'brand', 'neutral', 'critical', 'info', 'success', 'warning',
])


export interface ButtonProps extends BaseProps {
  /** Visual emphasis. Defaults to `primary` (saturated fill — the
   *  page's main call to action). Use `secondary` for background +
   *  border with no saturation, `tertiary` for de-emphasised actions,
   *  `quaternary` for text-only controls (no background, no border). */
  priority?: 'primary' | 'secondary' | 'tertiary' | 'quaternary'
  /** Semantic tone. Defaults to `brand` (the purple-violet brand
   *  scale). `neutral` falls back to the grayscale text/border tokens;
   *  `critical`/`info`/`success`/`warning` draw from the alert palette
   *  and the Figma `component/button/*` token set.
   *
   *  Pass any literal CSS color (hex, rgb, oklch, hsl, named) as a
   *  one-off custom tone — e.g. `tone="#ff1493"` or
   *  `tone="oklch(0.6 0.25 30)"`. The hue of that color is extracted
   *  and run through the brand L/C curve so every priority × state
   *  slot is populated automatically. Power users can still override
   *  individual tokens via `style={{ '--button-bg-color': '#…' }}` —
   *  inline-style overrides beat the resolver. */
  tone?:
    | 'neutral'
    | 'brand'
    | 'critical'
    | 'info'
    | 'success'
    | 'warning'
    | (string & {})
  /** Underline style. Available on the two background-less priorities,
   *  `tertiary` and `quaternary` — passing `underline` on `primary` or
   *  `secondary` is a no-op visually since the underline would clash
   *  with a filled chip. The treatment is subtler than the global
   *  `<a>` rule: the underline holds at a 0.5px hairline in every
   *  state and only the alpha lifts from 75% → 100% on hover / active
   *  (the button's own color shift carries most of the interaction
   *  cue). Hover and active share the same underline state so
   *  clicking doesn't kick it back to rest mid-press. */
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
   *  the size-matched square padding, and pins a min-width to the
   *  natural square so the icon can't get clipped by a shrinking
   *  parent. Accepts either:
   *  - `true` — opt in; pair with `leadingIcon` / `trailingIcon` to
   *    place the glyph.
   *  - an `IconShape` name (e.g. `iconButton="check"`) — opts in *and*
   *    sets the icon in one prop. Wins over `leadingIcon` if both are
   *    set. */
  iconButton?: boolean | IconShape
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
  // When `tone` is a literal CSS color (anything not in the named-tone
  // enum), feed it to the element as `--button-tone-source`. The CSS
  // resolver then derives every priority × state slot from that
  // single var via `oklch(from var(--button-tone-source) …)`. Doing
  // this in the wrapper (vs. `attr(tone color)` in CSS) keeps the
  // derivation off the cutting edge — works on every browser that
  // supports relative-color syntax, no typed-attr() dependency.
  const isCustomTone = tone != null && !NAMED_TONES.has(tone)
  const computedStyle = isCustomTone
    ? { ...style, ['--button-tone-source' as string]: tone }
    : style

  // `iconButton` is dual-typed (boolean | IconShape). A string value
  // both opts into icon-only mode AND names the icon, so callers can
  // skip a separate `leadingIcon`. If both are passed, the string
  // value wins — that's the more specific declaration.
  const isIconBtn = iconButton != null && iconButton !== false
  const iconBtnShape =
    typeof iconButton === 'string' ? (iconButton as IconShape) : undefined
  const resolvedLeadingIcon = iconBtnShape ?? leadingIcon

  // ARIA + tabindex live in the wrapper, not the element class. The
  // wrapper unconditionally sets tabindex from `disabled` (overriding
  // any caller-supplied value); the element stays declarative.
  const sharedAttrs = {
    priority,
    tone,
    underline,
    size,
    iconbutton: isIconBtn ? 'true' : undefined,
    paddingless: paddingless ? 'true' : undefined,
    loading: loading ? 'true' : undefined,
    disabled: disabled ? 'true' : undefined,
    selected: selected ? 'true' : undefined,
    tabindex: disabled ? -1 : 0,
    'aria-disabled': disabled ? 'true' : undefined,
    'aria-busy': loading ? 'true' : undefined,
    'aria-pressed': selected ? 'true' : undefined,
    class: className,
    style: computedStyle as React.CSSProperties,
  } as const

  const inner = (
    <>
      {/* `<a-icon>` directly, not the `Icon` JSX wrapper — button icons
          are always decorative (the label / aria-label carries the
          meaning), so `aria-hidden="true"` is fixed; the wrapper's
          size + ARIA defaulting isn't needed inside the button. Keeps
          the rendered DOM as a clean tree of web-component primitives:
          `<a-button>` → `<a-icon>` + `<a-button-label>` + `<a-icon>`. */}
      {resolvedLeadingIcon && <a-icon shape={resolvedLeadingIcon} aria-hidden="true" />}
      {label != null && !isIconBtn && <a-button-label>{label}</a-button-label>}
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
