import type { BaseProps } from "../general_types";

const NAMED_TONES = new Set([
  "neutral",
  "brand",
  "info",
  "success",
  "warning",
  "critical",
]);

/** Public props for the `<Expander>` disclosure. `title` is the always-
 *  visible summary; `children` is the collapsible body. */
export interface ExpanderProps extends Omit<BaseProps, "title"> {
  /** Summary (header) content. A string is rendered with the `level`
   *  type scale; pass a node (e.g. a `<Title>`) for full control or real
   *  heading semantics in the document outline. */
  title: React.ReactNode;
  /** Heading type scale applied to a string `title` (mirrors `<Title>`'s
   *  levels). Visual only — for outline semantics, pass a `<Title>` as
   *  the title.
   *  @defaultValue 5 */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Semantic tone, or any literal CSS color (`'#ff1493'`, `'rebeccapurple'`)
   *  for a one-off custom tone. Named tones re-point the text and (on filled
   *  priorities) the surface to the matching palette; a custom color keeps
   *  its hue while lightness/chroma are pinned. `'neutral'` (the default) is
   *  the same as omitting it.
   *  @defaultValue 'neutral' */
  tone?:
    | "neutral"
    | "brand"
    | "info"
    | "success"
    | "warning"
    | "critical"
    | (string & {});
  /** Surface emphasis. `secondary` (the default) is a subtle fill;
   *  `primary` is a more pronounced card; `tertiary` is transparent (the
   *  bare disclosure).
   *  @defaultValue 'secondary' */
  priority?: "primary" | "secondary" | "tertiary";
  /** Chevron. `inside` (default) keeps it in the header row; `outside`
   *  hangs it in the left gutter so the title sits flush with
   *  surrounding content (the docs-header layout; `priority="tertiary"`
   *  only); `none` removes it on any priority and drops the body's
   *  chevron-alignment indent.
   *  @defaultValue 'inside' */
  marker?: "inside" | "outside" | "none";
  /** Header actions (e.g. buttons, tags) rendered at the end of the
   *  header row, OUTSIDE the toggle trigger — clicking them never
   *  toggles, they're separately focusable, and screen readers see them
   *  as separate controls. */
  actions?: React.ReactNode;
  /** Disables the header: not clickable or focusable, hover affordance
   *  off, text dimmed. The open state freezes as-is — disabling an open
   *  expander keeps it open. `actions` stay live; disable them
   *  separately if needed. */
  disabled?: boolean;
  /** Controlled open state. When provided, the consumer owns open/close:
   *  the expander only follows this prop, and clicking the summary just
   *  requests a change via `onToggle` (so a toggle can be rejected by not
   *  updating). Leave undefined for uncontrolled. */
  open?: boolean;
  /** Initial open state for the uncontrolled case. */
  defaultOpen?: boolean;
  /** Fired whenever the summary is toggled, with the requested open
   *  state (in controlled mode, apply it to `open` to accept). */
  onToggle?: (open: boolean) => void;
}

/** The element's `toggle` event payload. */
type ToggleEvent = CustomEvent<{ open: boolean }>;

/** Pull the requested open state out of the element's `toggle` event,
 *  across renderers: a raw `CustomEvent` carries `detail` directly; a
 *  synthetic wrapper carries it on `nativeEvent.detail`. */
function toggledOpen(e: ToggleEvent | { nativeEvent: ToggleEvent }): boolean {
  const detail =
    ("nativeEvent" in e ? e.nativeEvent?.detail : undefined) ??
    ("detail" in e ? e.detail : undefined);
  return !!detail?.open;
}

/**
 * `<Expander>` — a collapsible disclosure section.
 *
 * A pure, stateless pass-through to `<a-expander>`: the element owns all
 * interaction (toggle, keyboard, ARIA, animation), so the wrapper holds
 * no state and grabs no ref — it only maps props to attributes (safe
 * wherever the host DOM is reconciled, incl. off the UI thread).
 *
 * Uncontrolled (`defaultOpen`): the element owns its open state. The
 * wrapper emits `defaultopen` — never `open` — so the DOM carries no
 * stale state attribute. Controlled (`open` + `onToggle`): the wrapper
 * emits `open="" | "false"`; the element treats the attribute as the
 * source of truth and clicks only dispatch the `toggle` event, giving
 * real controlled semantics (a consumer can reject a toggle).
 */
export const Expander = ({
  title,
  level,
  tone,
  priority,
  marker,
  actions,
  disabled,
  open,
  defaultOpen,
  onToggle,
  className,
  style,
  children,
  ...rest
}: ExpanderProps) => {
  const controlled = open !== undefined;

  // A non-named tone is a literal CSS color: feed it to the element's
  // oklch derivation via an inline custom property (the CSS attr() form
  // is only a fallback for raw-HTML authors).
  const isCustomTone = tone != null && !NAMED_TONES.has(tone);
  const computedStyle = isCustomTone
    ? { ...style, ["--expander-tone-source"]: tone }
    : style;

  // A string (or number) title is rendered as our <a-expander-summary>,
  // which carries the hover affordance. A node title is the consumer's
  // own markup: slot it through a layout-neutral display:contents span —
  // the shadow hover hook targets ::slotted(a-expander-summary), so a
  // custom title opts out of the summary styling automatically. (No
  // cloneElement/isValidElement — those are React-only APIs that break
  // the configure() portability story, and a wrapper span also handles
  // fragments and arrays.)
  const titleNode =
    typeof title === "object" && title !== null ? (
      <span slot="title" style={{ display: "contents" }}>
        {title}
      </span>
    ) : (
      <a-expander-summary slot="title">{title}</a-expander-summary>
    );

  return (
    <a-expander
      open={controlled ? (open ? "" : "false") : undefined}
      defaultopen={!controlled && defaultOpen ? "" : undefined}
      level={level != null ? (String(level) as `${typeof level}`) : undefined}
      tone={tone && tone !== "neutral" ? tone : undefined}
      priority={priority && priority !== "secondary" ? priority : undefined}
      marker={marker && marker !== "inside" ? marker : undefined}
      disabled={disabled ? "" : undefined}
      // All-lowercase `ontoggle` is the one event-prop spelling both
      // renderers bind to our `toggle` event: React 19 keeps the case of
      // whatever follows `on` (so `onToggle` would listen for "Toggle"),
      // Preact lowercases. Verified against real React 19 + Preact.
      ontoggle={onToggle ? (e: ToggleEvent) => onToggle(toggledOpen(e)) : undefined}
      class={className}
      style={computedStyle}
      {...rest}
    >
      {titleNode}
      {actions != null && (
        <span slot="actions" style={{ display: "contents" }}>
          {actions}
        </span>
      )}
      <a-expander-details>{children}</a-expander-details>
    </a-expander>
  );
};
