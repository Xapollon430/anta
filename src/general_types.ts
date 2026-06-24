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
  /** HTML `id` attribute. */
  id?: string
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
  tone?: 'brand' | 'info' | 'success' | 'warning' | 'critical'
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
  tone?: 'brand' | 'info' | 'success' | 'warning' | 'critical'
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
   *  Tones tint a per-tone hue; a custom color keeps its hue with
   *  lightness/chroma pinned. `'neutral'` is the default gray (same as
   *  omitting it). */
  tone?: 'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'critical' | (string & {})
  /** Emphasis level. `secondary` (default) is the subtle alpha-tint fill;
   *  `primary` is a solid fill with white text; `tertiary` is a transparent
   *  outline. */
  priority?: 'primary' | 'secondary' | 'tertiary'
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
 * The element builds its own shadow DOM (no native `<details>`): a
 * `<button>` summary carrying `aria-expanded` plus an animated content
 * region. The title is projected via `slot="title"`; header actions
 * (rendered next to the trigger, outside it) via `slot="actions"`; the
 * body is the default slot. Low-level attributes; for the JSX wrapper
 * use `Expander` from `@antadesign/anta`.
 */
export interface AExpanderAttributes extends BaseAttributes {
  /** Controlled open state (`'open'` / `'closed'`). Present → controlled: the
   *  attribute is the source of truth, clicks only dispatch the cancelable
   *  `statechange` event, and the consumer answers by updating it. Absent →
   *  uncontrolled (use `default-state`). See STATEFUL-COMPONENTS.md. */
  state?: 'open' | 'closed'
  /** Initial open state for the uncontrolled mode (`'open'` / `'closed'`);
   *  read once when the element connects. */
  'default-state'?: 'open' | 'closed'
  /** Surface emphasis. `secondary` (default) is a subtle fill; `primary`
   *  is a stronger raised fill; `tertiary` is transparent. */
  priority?: 'primary' | 'secondary' | 'tertiary'
  /** Outdent the chevron into the left gutter so the title + body sit
   *  flush with surrounding content (the docs-header layout). Tertiary
   *  only — a no-op on the filled priorities, where the container edge
   *  has to bound the chevron. Presence-based. */
  outdent?: boolean | ''
  /** Disables the header: not clickable or focusable, hover affordance
   *  off, text dimmed. The open state freezes as-is. Presence-based. */
  disabled?: boolean | ''
  /** Semantic tone, or any literal CSS color for a one-off custom tone.
   *  Named tones re-point the text + filled surface palette; a custom
   *  color keeps its hue with lightness/chroma pinned. `'neutral'` is the
   *  default (same as omitting it). */
  tone?: 'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'critical' | (string & {})
  /** Heading type scale for the summary, `'1'`–`'6'` (mirrors `<a-title>`
   *  levels). Default (omitted) ≈ level 5. */
  level?: '1' | '2' | '3' | '4' | '5' | '6'
  /** Fires before the open state changes — the element dispatches a
   *  `cancelable` `statechange` `CustomEvent` whose `detail` is
   *  `{ next, prev }` in the `'open'|'closed'` vocabulary. Uncontrolled,
   *  `preventDefault()` vetoes the transition. The all-lowercase spelling is
   *  deliberate — it's the one form both renderers bind to the `statechange`
   *  event (React 19 keeps the case after `on`, so `onStateChange` would
   *  listen for "StateChange"; Preact lowercases). */
  onstatechange?: (
    e: CustomEvent<{ next: 'open' | 'closed'; prev: 'open' | 'closed' }>,
  ) => void
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
  /** Follow the cursor instead of pinning under the anchor (pinned is the
   *  default). Presence-based (`''` on, omit off). */
  follow?: boolean | ''
  /** Make the bubble hoverable/clickable (pointer events on, stays open while
   *  hovered). Always pinned. Presence-based (`''` on, omit off). */
  interactive?: boolean | ''
  /** HTML `id`. */
  id?: string
}

/**
 * Attributes for the `<a-checkbox>` custom element. `<a-checkbox>` is a light-DOM
 * interactive element: its visual state lives on `ElementInternals` (styled via
 * the `:state(checked)` / `:state(indeterminate)` pseudo-class, not host
 * attributes), driven by the `state` attribute (controlled) or `default-state`
 * (uncontrolled seed). It sets no ARIA itself — `role` / `aria-*` are the
 * consumer's job (the wrapper supplies them). The label is its children.
 * Low-level attributes — for the typed JSX wrapper use `Checkbox` from
 * `@antadesign/anta`.
 */
export interface ACheckboxAttributes extends BaseAttributes {
  /** Colour variant, or any literal CSS color for a one-off custom tone.
   *  Named tones track light/dark mode automatically via the theme-aware role
   *  tokens. `'brand'` is the default (same as omitting it). */
  tone?: 'brand' | 'neutral' | 'info' | 'success' | 'warning' | 'critical' | (string & {})
  /** Size variant. `small` = 16px, `medium` (default) = 18px, `large` = 20px box. */
  size?: 'small' | 'medium' | 'large'
  /** Controlled state — the element reflects changes to this attribute. Use this
   *  (driven from your store) for a controlled checkbox; use `default-state` for
   *  an uncontrolled one. */
  state?: 'checked' | 'unchecked' | 'indeterminate'
  /** Uncontrolled initial state — read once at connect / form-reset, then the
   *  element self-manages. */
  'default-state'?: 'checked' | 'unchecked' | 'indeterminate'
  /** Disabled state. Presence-based (`''` on, omit off). */
  disabled?: boolean | ''
  /** Form field name — the key this checkbox submits under inside a `<form>`. */
  name?: string
  /** Value submitted when checked. Defaults to `"on"`. */
  value?: string
  /** Fires before the element applies any change. The element dispatches a
   *  cancelable `statechange` `CustomEvent` whose `detail` carries
   *  `{ next, prev }` (the same string enum as `state`); a synchronous
   *  `preventDefault()` vetoes the transition. The all-lowercase spelling is
   *  deliberate — it's the one form both renderers bind to a custom event
   *  (React 19 keeps the case of whatever follows `on`; Preact lowercases). */
  onstatechange?: (
    e: CustomEvent<{ next: 'checked' | 'unchecked' | 'indeterminate'; prev: 'checked' | 'unchecked' | 'indeterminate' }>,
  ) => void
  /** ARIA — set by the consumer / the `Checkbox` wrapper (the element never
   *  touches these itself). */
  'aria-checked'?: 'true' | 'false' | 'mixed'
  'aria-disabled'?: 'true' | 'false'
  'aria-label'?: string
}

/**
 * Attributes for the `<a-menu>` custom element. Placed immediately after the
 * trigger it anchors to (root menu), or nested inside an `<a-menu-item>`
 * (submenu). For the typed JSX wrapper use `Menu` from `@antadesign/anta`.
 */
export interface AMenuAttributes extends BaseAttributes {
  /** Preferred placement relative to the trigger; auto-flips / clamps.
   *  Defaults to `'bottom-start'`. */
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'
  /** Open on right-click of the trigger region, positioned at the pointer.
   *  Presence-based (`''` on, omit off). */
  context?: boolean | ''
  /** Open at the pointer coordinates instead of aligned to the trigger box.
   *  Presence-based (`''` on, omit off). */
  coord?: boolean | ''
  /** Marks this menu as a submenu of the enclosing `<a-menu-item>`.
   *  Presence-based (`''` on, omit off). */
  submenu?: boolean | ''
  /** For a submenu: also open on hover. Presence-based (`''` on, omit off). */
  hover?: boolean | ''
  /** Gap in pixels between the trigger and the menu. Defaults to 4. */
  offset?: number | string
  /** Controlled open state (`'open'` / `'closed'`). Omit for uncontrolled;
   *  present → visibility follows this value, and the element never writes it
   *  (the consumer owns it). Listen to `statechange` to keep it in sync. See
   *  STATEFUL-COMPONENTS.md. */
  state?: 'open' | 'closed'
  /** State-change event — `cancelable`, fired before applying, with
   *  `detail: { next, prev }` in the `'open'|'closed'` vocabulary (plus optional
   *  `coord` / `originEvent`). All-lowercase so React/Preact bind it to the
   *  element's `statechange` CustomEvent. The `Menu` wrapper exposes this as the
   *  `onStateChange` prop. */
  onstatechange?: (
    e: CustomEvent<{ next: 'open' | 'closed'; prev: 'open' | 'closed' }>,
  ) => void
  /** ARIA role — the JSX wrapper sets this to `'menu'`. */
  role?: string
  'aria-orientation'?: 'vertical' | 'horizontal'
}

/**
 * Attributes for the `<a-menu-item>` custom element. For the typed JSX
 * wrapper use `MenuItem` from `@antadesign/anta`.
 */
export interface AMenuItemAttributes extends BaseAttributes {
  /** Disabled state. Presence-based (`''` on, omit off). */
  disabled?: boolean | ''
  /** Semantic tone. Colors the label, icon, and hover tint. `'neutral'`
   *  (the default) is the same as omitting it. */
  tone?: 'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'critical'
  /** Keep the menu open after this item is chosen (toggles / multi-select),
   *  instead of the default close-on-select. Presence-based (`''` on, omit
   *  off). The universal form is `data-menu-open` (works on any element). */
  'data-menu-open'?: boolean | ''
  /** Marks this item as a submenu parent (renders a chevron, opens a nested
   *  `<a-menu submenu>`). Presence-based (`''` on, omit off). */
  submenu?: boolean | ''
  /** ARIA role — `'menuitem'`. */
  role?: string
  'aria-haspopup'?: 'menu' | 'true' | 'false' | boolean
  /** Submenu-parent expanded state. Render `'false'` as the resting baseline;
   *  the nested `<a-menu submenu>` element reflects the live open state. */
  'aria-expanded'?: 'true' | 'false' | boolean
  'aria-disabled'?: 'true' | 'false' | boolean
}

/**
 * Attributes for the `<a-menu-group>` styled element. For the typed JSX
 * wrapper use `MenuGroup` from `@antadesign/anta`.
 */
export interface AMenuGroupAttributes extends BaseAttributes {
  /** Keep the menu open after any item in this group is chosen. Presence-based
   *  (`''` on, omit off). The universal form is `data-menu-open`. */
  'data-menu-open'?: boolean | ''
  role?: string
  'aria-label'?: string
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
    | 'info'
    | 'success'
    | 'warning'
    | 'critical'
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

/**
 * Attributes for the `<a-radio>` custom element — one option in a radio set.
 * Presentational: a parent `<a-radio-group>` owns selection, keyboard, and form
 * value. The selected look comes from the element's `:state(selected)` (set by
 * the group), not a host attribute. For the typed JSX wrapper use `Radio` from
 * `@antadesign/anta`.
 */
export interface ARadioAttributes extends BaseAttributes {
  /** This option's identity / submitted value. */
  value?: string
  /** Colour variant, or any literal CSS color for a one-off custom tone.
   *  Named tones track light/dark mode automatically via the theme-aware role
   *  tokens. `'brand'` is the default (same as omitting it). */
  tone?: 'brand' | 'neutral' | 'info' | 'success' | 'warning' | 'critical' | (string & {})
  /** Size variant. small=16px, medium=18px, large=20px control. */
  size?: 'small' | 'medium' | 'large'
  /** Disabled state. Presence-based (`''` on, omit off). */
  disabled?: boolean | ''
  /** Selected state — connect-time seed for the standalone render path (no
   *  group). In a group, the group drives `:state(selected)` directly and this
   *  attribute is ignored. Presence-based. */
  selected?: boolean | ''
  /** ARIA — `role="radio"` is set by the `Radio` wrapper. `aria-checked` is
   *  published by the element through `ElementInternals` (off the DOM), driven
   *  by the `selected` property the group sets — not a DOM attribute. */
  role?: 'radio'
  'aria-disabled'?: 'true' | 'false'
}

/**
 * Attributes for the `<a-radio-group>` custom element — the single-select
 * coordinator. It is the form-associated element (submits one `name=value`).
 * It uses a minimal shadow root with three slots: an optional `<a-radio-label
 * slot="label">`, the `<a-radio>` options (default slot), and an optional
 * `<a-radio-hint slot="hint">`. The default slot's `slotchange` is how the group
 * tracks its option set. The `RadioGroup` wrapper composes these from `label` /
 * `hint`; hand-authors write the slotted children directly. For the typed JSX
 * wrapper use `RadioGroup` from `@antadesign/anta`.
 */
export interface ARadioGroupAttributes extends BaseAttributes {
  /** Controlled selected value (the chosen radio's `value`). Present → controlled:
   *  the element reflects changes to this attribute and a pick only dispatches
   *  `statechange`. Absent → uncontrolled (seed with `default-state`). */
  state?: string
  /** Uncontrolled initial selected value — read once on connect / form-reset. */
  'default-state'?: string
  /** Form field name — the group submits `name=value`. */
  name?: string
  /** Tone cascaded to children that don't set their own, or any literal CSS
   *  color for a one-off custom tone. Inherits through CSS so every child
   *  `<a-radio>` picks up the same fill curve. */
  tone?: 'brand' | 'neutral' | 'info' | 'success' | 'warning' | 'critical' | (string & {})
  /** Size cascaded to children that don't set their own. */
  size?: 'small' | 'medium' | 'large'
  /** Disable the whole group. Presence-based. */
  disabled?: boolean | ''
  /** Layout + arrow-key axis. `'vertical'` is the default. */
  orientation?: 'vertical' | 'horizontal'
  /** Fires on a pick *before* the group applies it. Cancelable `statechange`
   *  `CustomEvent` whose `detail` carries `{ next, prev }` (selected values); a
   *  synchronous `preventDefault()` vetoes the transition (uncontrolled mode).
   *  All-lowercase to bind across both renderers (like `<a-checkbox>`). */
  onstatechange?: (e: CustomEvent<{ next: string; prev: string | null }>) => void
  /** ARIA — set by the `RadioGroup` wrapper (the element never touches these). */
  role?: 'radiogroup'
  'aria-disabled'?: 'true' | 'false'
  'aria-label'?: string
  'aria-labelledby'?: string
}
