// Hooks come from the jsx-runtime indirection (configurable via `configure()`), not a
// hard `react` import — so a custom runtime resolves them. Fragment too, so the child
// scan can descend a `<>…</>` the consumer wrapped its tabs/panels in. See CLAUDE.md
// (stateless-wrapper exception — Tabs holds the active value to render the roving
// tabindex + decide which panel shows, exactly like RadioGroup).
import { useId, useState, Fragment } from "../jsx-runtime"
import { nativeStateChange, toneStyle } from "../anta_helpers"
import type { BaseProps } from "../general_types"
import { Tab } from "./Tab"
import type { TabProps } from "./Tab"
import { TabPanel } from "./TabPanel"
import type { TabPanelProps } from "./TabPanel"
import styles from "./Tabs.module.css"

/** The element's `statechange` payload — `next`/`prev` are tab values (`null` = none). */
type StateDetail = { next: string | null; prev: string | null }
type StateChangeEvent = CustomEvent<StateDetail>

/** Snapshot passed as the 2nd argument to `onAnyChange`. */
export interface TabsChangeAttrs {
  value: string | null
}

/**
 * How `<TabPanel>`s that aren't the active one are handled.
 * - `'display'` *(default)* — all panels mounted; inactive ones hidden via
 *   `display:none`. Preserves panel DOM/form state; correct a11y for free.
 * - `'visibility'` — all mounted; inactive hidden via `visibility:hidden`, so each
 *   panel keeps its layout box (useful to avoid reflow / for measuring).
 * - `'active'` — only the active panel is rendered; React unmounts the rest (state
 *   resets on switch; defers expensive subtrees).
 * - `'lazy'` — a panel mounts on first activation, then stays mounted+hidden.
 */
export type TabsMounting = "display" | "visibility" | "active" | "lazy"

/** Public props for `<Tabs>`. */
export interface TabsProps extends Omit<BaseProps, "onChange"> {
  /** `<Tab>` and `<TabPanel>` children (panels optional). */
  children?: React.ReactNode
  /** Controlled active value. When set, the consumer owns selection: the strip follows
   *  this and a pick only *requests* a change via `onStateChange` (reject by not
   *  updating). Leave undefined for uncontrolled. */
  value?: string
  /** Initial active value for the uncontrolled case. */
  defaultValue?: string
  /** Fired whenever the active tab changes — event-first. `detail` is
   *  `{ next, prev }` (values; `null` = none). Cancelable: `event.preventDefault()`
   *  vetoes it (uncontrolled), or in controlled mode answer by updating `value`. */
  onStateChange?: (event: StateChangeEvent, detail: StateDetail) => void
  /** Fired *after* the active tab changes — a native `change` event. */
  onChange?: (event: Event) => void
  /** Like `onChange`, but with a `{ value }` snapshot as the 2nd argument. */
  onAnyChange?: (event: Event, attrs: TabsChangeAttrs) => void
  /** Focus entered the strip (any tab) — wired to `focusin` (focus lands on a tab,
   *  not the tablist). */
  onFocus?: (event: FocusEvent) => void
  /** Focus left the strip entirely — wired to `focusout`. */
  onBlur?: (event: FocusEvent) => void
  /** Accessible name for the tablist (`aria-label`). */
  label?: string
  /** Visual priority. `secondary` (default) is the raised pill on a recessed track;
   *  `primary` fills the selected tab solid with the tone colour; `tertiary` drops the
   *  track for a border-bottom underline indicator.
   *  @defaultValue 'secondary' */
  priority?: "primary" | "secondary" | "tertiary"
  /** Tone applied to the selected indicator/label, or any literal CSS color for a
   *  one-off custom tone (derived in oklch). Named tones track light/dark.
   *  @defaultValue 'neutral' */
  tone?: "neutral" | "brand" | "info" | "success" | "warning" | "critical" | (string & {})
  /** Size — reuses Button's type scale (small 24px · medium 28px · large 32px tall).
   *  @defaultValue 'medium' */
  size?: "small" | "medium" | "large"
  /** Layout + arrow-key axis. Horizontal scrolls when tabs overflow.
   *  @defaultValue 'horizontal' */
  orientation?: "horizontal" | "vertical"
  /** How inactive panels are mounted/hidden. Per-panel `<TabPanel mounting>` overrides.
   *  @defaultValue 'display' */
  mounting?: TabsMounting
  /** Disable the whole strip. */
  disabled?: boolean
}

/** Flatten children one fragment/array level deep into a plain list, dropping nullish
 *  / boolean nodes — portable across React & Preact (no `Children` helpers). */
const flattenChildren = (nodes: React.ReactNode): any[] => {
  const out: any[] = []
  const visit = (n: any) => {
    if (n == null || typeof n === "boolean") return
    if (Array.isArray(n)) {
      n.forEach(visit)
      return
    }
    if (n && n.type === Fragment) {
      visit(n.props?.children)
      return
    }
    out.push(n)
  }
  visit(nodes)
  return out
}

/**
 * `<Tabs>` — a tablist with optional panels, rendered from `<Tab>` / `<TabPanel>`
 * children.
 *
 * Like `RadioGroup`, this wrapper owns the **declarative** DOM concerns the elements
 * deliberately don't touch — each tab's roving **`tabindex`**, `role`, the
 * `aria-controls`/`aria-labelledby` wiring, and which panel shows (per `mounting`).
 * Selection itself lives in `<a-tabs>` off-DOM (it sets each tab's `selected`
 * property), so the elements never mutate the DOM; this wrapper reflects the current
 * value into `tabindex` + panel visibility on re-render.
 *
 * Controlled (`value` + `onStateChange`) or uncontrolled (`defaultValue`). Drop the
 * `<TabPanel>`s and it's just a selectable strip emitting `statechange` / `change`.
 *
 * Requires `@antadesign/anta/elements` (client-side only).
 *
 * @example
 * ```tsx
 * <Tabs defaultValue="account" label="Settings">
 *   <Tab value="account" label="Account" icon="user" />
 *   <Tab value="security" label="Security" />
 *   <TabPanel value="account"><AccountForm /></TabPanel>
 *   <TabPanel value="security"><SecurityForm /></TabPanel>
 * </Tabs>
 * ```
 */
export const Tabs = ({
  children,
  value,
  defaultValue,
  onStateChange,
  onChange,
  onAnyChange,
  onFocus,
  onBlur,
  label,
  priority,
  tone,
  size,
  orientation,
  mounting = "display",
  disabled,
  className,
  style,
  id,
  ...rest
}: TabsProps) => {
  const controlled = value !== undefined
  // Uncontrolled selection lives here (re-renders declaratively) — the wrapper needs
  // the value to compute the roving tabindex + which panel shows.
  const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue)
  const currentValue = controlled ? value : internalValue

  // Lazy mounting: remember every value that has ever been active so its panel stays
  // mounted after the first visit. Seeded with the initial active value.
  const [mounted, setMounted] = useState<Set<string>>(
    () => new Set(currentValue != null ? [currentValue] : []),
  )

  const baseId = useId()
  const tabId = (v: string) => `${baseId}-tab-${v}`
  const panelId = (v: string) => `${baseId}-panel-${v}`

  const items = flattenChildren(children)
  const tabs = items.filter((c) => c?.type === Tab) as { props: TabProps }[]
  const panels = items.filter((c) => c?.type === TabPanel) as { props: TabPanelProps }[]

  // Values are a tab's identity — duplicates make selection ambiguous. Warn (only ever
  // fires on the bug itself), matching RadioGroup / a-input's bare console.warn.
  const seen = new Set<string>()
  for (const t of tabs) {
    if (seen.has(t.props.value))
      console.warn(`[anta] <Tabs> duplicate <Tab value=${JSON.stringify(t.props.value)}> — values must be unique.`)
    seen.add(t.props.value)
  }

  // The single roving tab stop. Prefer the *selected* tab — even when disabled
  // (focusable-disabled is ARIA-allowed, so Tab always reaches the visible selection)
  // — else the first enabled tab. None when the whole strip is disabled.
  const tabStopValue = disabled
    ? undefined
    : (tabs.find((t) => t.props.value === currentValue)?.props.value ??
       tabs.find((t) => !t.props.disabled)?.props.value)

  const onstatechange = (e: StateChangeEvent) => {
    const { event, detail } = nativeStateChange<StateDetail>(e)
    if (!detail) return
    onStateChange?.(event, detail)
    if (detail.next != null) setMounted((m) => (m.has(detail.next!) ? m : new Set(m).add(detail.next!)))
    if (controlled) return
    if (event.defaultPrevented) return
    setInternalValue(detail.next ?? undefined)
  }

  const onchange =
    onChange || onAnyChange
      ? (e: Event) => {
          onChange?.(e)
          onAnyChange?.(e, { value: (e.currentTarget as any)?.value ?? null })
        }
      : undefined

  const containerStyle = style
  const vertical = orientation === "vertical"

  return (
    <div
      className={className ? `${styles.container} ${className}` : styles.container}
      data-orientation={vertical ? "vertical" : undefined}
      style={containerStyle}
      id={id}
      {...rest}
    >
      <a-tabs
        role="tablist"
        aria-label={label}
        aria-orientation={vertical ? "vertical" : undefined}
        aria-disabled={disabled ? "true" : undefined}
        // Controlled → drive the element's `state`. Uncontrolled → seed `default-state`
        // and let the ELEMENT own selection (off-DOM via each tab's `selected`
        // property) — so the strip works even unhydrated (static docs preview) or
        // hand-assembled. Either way the wrapper's mirror (kept current via
        // `onstatechange`) feeds the roving `tabindex` + panel visibility.
        state={controlled ? value : undefined}
        default-state={!controlled ? defaultValue : undefined}
        priority={priority && priority !== "secondary" ? priority : undefined}
        tone={tone && tone !== "neutral" ? tone : undefined}
        size={size && size !== "medium" ? size : undefined}
        orientation={vertical ? "vertical" : undefined}
        disabled={disabled ? "" : undefined}
        onstatechange={onstatechange}
        onchange={onchange}
        // Focus lands on a tab, not the tablist — report via bubbling focusin/focusout.
        onfocusin={onFocus}
        onfocusout={onBlur}
        style={toneStyle(tone, "--tabs-tone-source")}
      >
        {tabs.map((t) => {
          const p = t.props
          const tabDisabled = disabled || p.disabled
          const hasPanel = panels.some((pan) => pan.props.value === p.value)
          return (
            <a-tab
              key={p.value}
              role="tab"
              value={p.value}
              id={tabId(p.value)}
              aria-controls={hasPanel ? panelId(p.value) : undefined}
              aria-disabled={tabDisabled ? "true" : undefined}
              // Roving tabindex — the wrapper's job. Exactly one tab is 0, the rest -1.
              // `aria-selected` is NOT set here — the element publishes it off-DOM.
              tabIndex={p.value === tabStopValue ? 0 : -1}
              disabled={tabDisabled ? "" : undefined}
            >
              {p.icon && <a-icon shape={p.icon} aria-hidden="true" />}
              {p.label != null ? p.label : p.children}
              {p.iconTrailing && <a-icon shape={p.iconTrailing} aria-hidden="true" />}
            </a-tab>
          )
        })}
      </a-tabs>

      {panels.map((pan) => {
        const p = pan.props
        const active = p.value === currentValue
        const mode: TabsMounting = p.mounting ?? mounting
        // Mount decision: 'active' renders only the active panel; 'lazy' keeps it once
        // seen; 'display'/'visibility' always render and hide inactive ones.
        if (mode === "active" && !active) return null
        if (mode === "lazy" && !active && !mounted.has(p.value)) return null

        const hidden = !active
        const hideByVisibility = hidden && mode === "visibility"
        return (
          <a-tabpanel
            key={p.value}
            role="tabpanel"
            id={panelId(p.value)}
            aria-labelledby={tabId(p.value)}
            tabIndex={active ? 0 : undefined}
            // display/lazy/active hide via the native `hidden` attribute (display:none);
            // visibility mode keeps the layout box and is hidden via data-hide + CSS.
            // `hidden` / `inert` are real IDL boolean props on every element, so they
            // must be passed as real booleans (not the `''` presence form used for our
            // custom attrs) — Preact runs IDL booleans through the property setter, where
            // `''` is falsy and the attribute is dropped.
            hidden={hidden && !hideByVisibility ? true : undefined}
            data-hide={hideByVisibility ? "visibility" : undefined}
            inert={hidden ? true : undefined}
            class={p.className}
            style={p.style}
          >
            {p.children}
          </a-tabpanel>
        )
      })}
    </div>
  )
}
