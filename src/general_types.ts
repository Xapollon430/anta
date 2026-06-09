import type { IconShape } from './elements/a-icon.shapes'

/** Common props for JSX component wrappers. */
export interface BaseProps {
  /** CSS class name. Merged with any internal classes by the component. */
  className?: string
  /** Inline styles applied to the root element. */
  style?: React.CSSProperties
  /** Child elements. When provided, replaces the component's default label/content. */
  children?: React.ReactNode
  /** HTML `id` attribute. */
  id?: string
  /** HTML `title` attribute — native browser tooltip on hover. */
  title?: string
  /** Tab order. Set to `-1` to skip the element when tabbing. */
  tabIndex?: number
  /** Any `data-*` attribute is forwarded to the rendered element. */
  [key: `data-${string}`]: unknown
  /** Any `aria-*` attribute is forwarded to the rendered element. */
  [key: `aria-${string}`]: unknown
}

/** Attributes for intrinsic custom elements (`<a-*>` tags) in JSX. */
export interface BaseAttributes {
  /** React/Preact reconciliation key when rendered inside a list. */
  key?: string | number | null
  /** HTML `class` attribute (standard DOM). */
  class?: string
  /** React/Preact-style class name. Alias for `class`. */
  className?: string
  /** Inline styles applied to the element. */
  style?: React.CSSProperties
  children?: React.ReactNode
  /** Assigns the element to a named `<slot>` (e.g. `slot="title"`). */
  slot?: string
  /** Tab order. Set to `0` to make the element keyboard-focusable. */
  tabIndex?: number
  /** ARIA role override. */
  role?: string
  /** Keydown handler — used for keyboard-driven interactions. */
  onKeyDown?: (e: any) => void
  /** Click handler — used for mouse / tap activation. */
  onClick?: (e: any) => void
}

/**
 * Attributes for the `<a-progress>` custom element.
 *
 * These are the low-level web component attributes. For the JSX wrapper with
 * typed props and computed labels, use `Progress` from `@antadesign/anta`.
 */
export interface AProgressAttributes extends BaseAttributes {
  /** Current progress value. */
  value?: number | string
  /** Maximum value. Defaults to 100. */
  max?: number | string
  /** Color variant. `'neutral'` is the default gray; `'info'` is blue. */
  tone?: 'neutral' | 'info'
  /** ARIA role — the JSX wrapper sets this to `'progressbar'`. */
  role?: string
  /** ARIA value-now (current). */
  'aria-valuenow'?: number | string
  /** ARIA value-max. */
  'aria-valuemax'?: number | string
  /** ARIA value-min (defaults to 0). */
  'aria-valuemin'?: number | string
  /** ARIA accessible name. */
  'aria-label'?: string
}

/**
 * Attributes for the `<a-text>` custom element.
 *
 * Low-level web component attributes; for the JSX wrapper use `Text`
 * from `@antadesign/anta`.
 */
export interface ATextAttributes extends BaseAttributes {
  /** Visual priority. Maps to text-1..text-5. */
  priority?: 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'quinary'
  /** Color tint. Applies the matching `--text-{N}-{tone}` palette. */
  tone?: 'brand' | 'success' | 'critical' | 'warning' | 'info'
  /** Type scale. `small` = 13/16, `medium` (default) = 15/20, `large` = 17/24. */
  size?: 'small' | 'medium' | 'large'
  /** Render as inline-block instead of the default block. */
  inline?: boolean | ''
  /** Truncate to N lines with a trailing ellipsis. The attribute value
   *  carries the line count (e.g. `"1"`, `"3"`); the count is also
   *  available via the `--line-clamp` CSS custom property set inline. */
  truncate?: boolean | string | number
  /** Marks the host as expandable when paired with `truncate`. Adds
   *  the fade-out mask; the JSX wrapper renders the chevron and owns
   *  the click/keyboard expansion logic. */
  expandable?: boolean | ''
  /** ARIA disclosure state, mirrors the JSX wrapper's `expanded` flag. */
  'aria-expanded'?: boolean | 'true' | 'false'
}

/**
 * Attributes for the `<a-title>` styled tag.
 *
 * `<a-title>` has no JS — it's a CSS-only styled element. Low-level
 * attributes; for the JSX wrapper with typed `level` numbers and ARIA
 * use `Title` from `@antadesign/anta`.
 */
export interface ATitleAttributes extends BaseAttributes {
  /** Heading level as a string attribute, '1'-'6'. */
  level?: string
  /** Visual priority. Maps to text-1..text-5. */
  priority?: 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'quinary'
  /** Color tint. Applies the matching `--text-{N}-{tone}` palette. */
  tone?: 'brand' | 'success' | 'critical' | 'warning' | 'info'
  /** ARIA role — the JSX wrapper sets this to `'heading'`. */
  role?: string
  /** ARIA heading level — the JSX wrapper sets this to match `level`. */
  'aria-level'?: number | string
}

/**
 * Attributes for the `<a-tag>` styled tag.
 *
 * `<a-tag>` has no JS — it's a CSS-only styled element. Low-level
 * attributes; for the JSX wrapper use `Tag` from `@antadesign/anta`.
 */
export interface ATagAttributes extends BaseAttributes {
  /** Semantic tone, or any literal CSS color for a one-off custom tone.
   *  Named tones map to the `--text-2-{tone}` / `--bg-4-{tone}` palette;
   *  a custom color keeps its hue with lightness/chroma pinned.
   *  `'neutral'` is the default gray (same as omitting it). */
  tone?: 'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'critical' | (string & {})
  /** Size variant. `small` = 16px tall, `medium` (default) = 20px,
   *  `large` = 24px. */
  size?: 'small' | 'medium' | 'large'
  /** Render in normal case instead of the default uppercase.
   *  Presence-based (`''` on, omit off). */
  nocaps?: boolean | ''
}

/**
 * Attributes for the `<a-expander>` collapsible disclosure.
 *
 * The element wraps a native `<details>`/`<summary>` in its shadow DOM.
 * The title is projected via a `slot="title"`; the body is the default
 * slot. Low-level attributes; for the JSX wrapper use `Expander` from
 * `@antadesign/anta`.
 */
export interface AExpanderAttributes extends BaseAttributes {
  /** Open state. Presence-based (`''` open, omit closed). The element
   *  reflects this onto the shadow `<details>`. */
  open?: boolean | ''
  /** Surface emphasis. `secondary` (default) is a subtle fill; `primary`
   *  is a stronger raised fill; `tertiary` is transparent. */
  priority?: 'primary' | 'secondary' | 'tertiary'
  /** Chevron position. `inside` (default) keeps it in the header row;
   *  `outside` hangs it in the left gutter so the title sits flush with
   *  surrounding content (docs-header style). Only takes effect with
   *  `priority="tertiary"`. */
  marker?: 'inside' | 'outside'
  /** Semantic tone, or any literal CSS color for a one-off custom tone.
   *  Named tones re-point the text + filled surface palette; a custom
   *  color keeps its hue with lightness/chroma pinned. `'neutral'` is the
   *  default (same as omitting it). */
  tone?: 'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'critical' | (string & {})
  /** Heading type scale for the summary, `'1'`–`'6'` (mirrors `<a-title>`
   *  levels). Default (omitted) ≈ level 5. */
  level?: '1' | '2' | '3' | '4' | '5' | '6'
  /** Fires on open/close. The element dispatches a `toggle` `CustomEvent`
   *  whose `detail.open` carries the new state — bound like any DOM event
   *  by the renderer (no ref needed). */
  onToggle?: (e: any) => void
}

/**
 * Attributes for the `<a-sticker>` static sticker carrier.
 *
 * The SVG payload is passed as the `svg` attribute — a markup string.
 * On change, the element writes it into its shadow DOM (no light-DOM
 * `<slot>`, so children aren't rendered). The JSX wrapper
 * (`Sticker{Name}`) sets it from the per-sticker module's inlined SVG.
 * Sizing comes from `--sticker-size`.
 */
export interface AStickerAttributes extends BaseAttributes {
  /** SVG markup string. On change the element drops it into its shadow
   *  DOM (`innerHTML`). */
  svg?: string
  role?: string
  'aria-label'?: string
  'aria-hidden'?: 'true' | 'false' | boolean
}

/**
 * Attributes for the `<a-sticker-animated>` Lottie sticker carrier.
 *
 * The Lottie payload is passed as the `animation` attribute — a JSON
 * string. On change the element `JSON.parse`s it once and drives a
 * `lottie-web` player (SVG renderer) inside its shadow DOM. The JSX
 * wrapper (`Sticker{Name}Animated`) sets it from the per-sticker
 * module's inlined JSON. Sizing comes from the `--sticker-size` CSS
 * variable; `paused` controls playback.
 */
export interface AStickerAnimatedAttributes extends BaseAttributes {
  /** Lottie payload as a JSON string. The element parses it once on
   *  change. */
  animation?: string
  /** Present (any string value, including `""`) freezes the animation.
   *  A numeric string is parsed as seconds and the player seeks to
   *  that time before pausing. Omit to play. */
  paused?: string | boolean | number
  role?: string
  'aria-label'?: string
  'aria-hidden'?: 'true' | 'false' | boolean
}

/**
 * Attributes for the `<a-icon>` custom element. `shape` is typed as
 * `IconShape` (`keyof IconShapes`); the `IconShapes` interface is
 * module-augmentable, so consumers who generate their own shape sets
 * via `declare module '@antadesign/anta' { interface IconShapes { … } }`
 * get those keys accepted automatically.
 */
export interface AIconAttributes extends BaseAttributes {
  /** Which icon to render. */
  shape?: IconShape
  /** Width and height in pixels. Mapped to the `--icon-size` custom
   *  property via the CSS Values 5 typed `attr()` function — Chrome
   *  133+ and Safari 18.2+ only. Firefox hasn't shipped typed
   *  `attr()` yet, so on raw `<a-icon size="N">` the attribute is
   *  silently ignored there and the icon stays at the default 16 ×
   *  16. For cross-browser sizing in pure-HTML usage, set the
   *  variable inline: `<a-icon style="--icon-size: 24px">`. The JSX
   *  `<Icon size={N}>` wrapper already does that under the hood and
   *  is the recommended path. */
  size?: number | string
  /** ARIA role — the JSX wrapper sets `'img'` when a label is provided. */
  role?: string
  /** ARIA accessible name when the icon carries meaning. */
  'aria-label'?: string
  /** Hides decorative icons from screen readers. */
  'aria-hidden'?: 'true' | 'false' | boolean
}

/**
 * Attributes for the `<a-tooltip>` custom element. Placed as a child of the
 * element it annotates (content as children). For the typed JSX wrapper use
 * `Tooltip` from `@antadesign/anta`.
 */
export interface ATooltipAttributes extends BaseAttributes {
  /** Show delay in milliseconds. Never use `0` — use ~`50`. Defaults to 250. */
  delay?: number | string
  /** Preferred side; auto-flips when there's no room. Defaults to `'bottom'`. */
  placement?: 'top' | 'bottom'
  /** Pin under the anchor instead of following the cursor. Presence-based
   *  (`''` on, omit off). */
  static?: boolean | ''
  /** Make the bubble hoverable/clickable (pointer events on, stays open while
   *  hovered). Implies `static`. Presence-based (`''` on, omit off). */
  interactive?: boolean | ''
  /** HTML `id`. */
  id?: string
}

/**
 * Attributes for the `<a-button>` custom element. For the typed JSX
 * wrapper use `Button` from `@antadesign/anta`.
 */
export interface AButtonAttributes extends BaseAttributes {
  /** Visual emphasis. */
  priority?: 'primary' | 'secondary' | 'tertiary' | 'quaternary'
  /** Semantic tone, or any literal CSS color for a one-off custom tone. */
  tone?:
    | 'neutral'
    | 'brand'
    | 'critical'
    | 'info'
    | 'success'
    | 'warning'
    | (string & {})
  /** Underline style. Only renders on `priority="tertiary" | "quaternary"`. */
  underline?: 'solid' | 'dashed' | 'dotted'
  /** Size variant. small=22px, medium=26px, large=30px. */
  size?: 'small' | 'medium' | 'large'
  /** Drop outer padding to zero. Only takes effect on `priority="quaternary"`.
   *  Presence-based: `''` (or any value) turns it on; omit to turn off. */
  paddingless?: boolean | ''
  /** Loading state. Presence-based (`''` on, omit off). */
  loading?: boolean | ''
  /** Disabled state. Presence-based (`''` on, omit off). */
  disabled?: boolean | ''
  /** Toggled-on / pressed state. Presence-based (`''` on, omit off). */
  selected?: boolean | ''
  /** Submit/reset semantics. */
  type?: 'button' | 'submit' | 'reset'
  /** Associate with a form by id when not nested inside it. */
  form?: string
  /** Custom event name dispatched (bubbling) on click. */
  'data-custom-event'?: string
  'aria-disabled'?: 'true' | 'false' | boolean
  'aria-busy'?: 'true' | 'false' | boolean
}
