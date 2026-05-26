/** Common props for JSX component wrappers. */
export interface BaseProps {
  /** CSS class name. Merged with any internal classes by the component. */
  className?: string
  /** Inline styles applied to the root element. */
  style?: React.CSSProperties
  /** Child elements. When provided, replaces the component's default label/content. */
  children?: React.ReactNode
}

/** Attributes for intrinsic custom elements (`<a-*>` tags) in JSX. */
export interface BaseAttributes {
  /** HTML `class` attribute (standard DOM). */
  class?: string
  /** React/Preact-style class name. Alias for `class`. */
  className?: string
  /** Inline styles applied to the element. */
  style?: React.CSSProperties
  children?: React.ReactNode
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
  /** Render as inline-block instead of the default block. */
  inline?: boolean | string
  /** Truncate to N lines with a trailing ellipsis. The attribute value
   *  carries the line count (e.g. `"1"`, `"3"`); the count is also
   *  available via the `--line-clamp` CSS custom property set inline. */
  truncate?: boolean | string | number
  /** Marks the host as expandable when paired with `truncate`. Adds
   *  the fade-out mask; the JSX wrapper renders the chevron and owns
   *  the click/keyboard expansion logic. */
  expandable?: boolean | string
  /** ARIA disclosure state, mirrors the JSX wrapper's `expanded` flag. */
  'aria-expanded'?: boolean | 'true' | 'false'
}

/**
 * Attributes for the `<a-icon>` custom element. The `shape` attribute
 * value is typed as `string` here so the element accepts any consumer's
 * generated shapes. The JSX wrapper (`Icon`) narrows it to `IconShape`.
 */
export interface AIconAttributes extends BaseAttributes {
  /** Which icon to render. */
  shape?: string
  /** ARIA role — the JSX wrapper sets `'img'` when a label is provided. */
  role?: string
  /** ARIA accessible name when the icon carries meaning. */
  'aria-label'?: string
  /** Hides decorative icons from screen readers. */
  'aria-hidden'?: 'true' | 'false' | boolean
}

/**
 * Attributes for the `<a-button>` custom element.
 *
 * Low-level web component attributes; for the JSX wrapper use `Button`
 * from `@antadesign/anta`.
 */
export interface AButtonAttributes extends BaseAttributes {
  /** Visual emphasis. */
  priority?: 'primary' | 'secondary' | 'tertiary' | 'quaternary'
  /** Semantic tone. In addition to the six named tones, accepts any
   *  literal CSS color (`tone="#ff1493"`, `tone="oklch(...)"`, ...);
   *  the hue is extracted and run through the brand L/C curve to fill
   *  the full priority × state matrix. Direct overrides of
   *  `--button-fg-color` / `--button-bg-color` / `--button-br-color`
   *  via `style` still take precedence over the resolver. */
  tone?:
    | 'neutral'
    | 'brand'
    | 'critical'
    | 'info'
    | 'success'
    | 'warning'
    | (string & {})
  /** Underline style — only takes effect on `priority="quaternary"`. */
  underline?: 'solid' | 'dashed' | 'dotted'
  /** Size variant. small=24px, default=28px, large=32px. */
  size?: 'small' | 'default' | 'large'
  /** Drop the outer padding to zero so the button sits flush with
   *  surrounding content. Only takes effect on `priority="quaternary"`. */
  paddingless?: 'true' | 'false' | boolean | string
  /** Loading state. The element's CSS matches `[loading="true"]`. */
  loading?: 'true' | 'false' | boolean | string
  /** Disabled state. */
  disabled?: 'true' | 'false' | boolean | string
  /** Toggled-on / pressed state. */
  selected?: 'true' | 'false' | boolean | string
  /** Force a visual state for the docs gallery (`hover` / `active` /
   *  `focus` / `disabled`). Pseudo-class behaviour still applies on
   *  real interaction; this is purely for static showcase rendering. */
  'data-state'?: 'hover' | 'active' | 'focus' | 'disabled' | 'loading' | 'selected'
  /** Submit/reset semantics handled by the element's global click delegate. */
  type?: 'button' | 'submit' | 'reset'
  /** Associate with a form by id when not nested inside it. */
  form?: string
  /** Custom event name dispatched (bubbling) on click. */
  'data-custom-event'?: string
  /** ARIA disabled — JSX wrapper sets this in lockstep with `disabled`. */
  'aria-disabled'?: 'true' | 'false' | boolean
  /** ARIA busy — JSX wrapper sets this when `loading` is true. */
  'aria-busy'?: 'true' | 'false' | boolean
  /** Standard tab order override. The JSX wrapper sets this from
   *  `disabled` (0 normally, -1 when disabled). */
  tabindex?: number | string
}
