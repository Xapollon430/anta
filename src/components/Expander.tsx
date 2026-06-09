import { cloneElement, isValidElement } from "react";
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
  /** Chevron position. `inside` (default) keeps it in the header row;
   *  `outside` hangs it in the left gutter so the title sits flush with
   *  surrounding content (the docs-header layout). Only takes effect with
   *  `priority="tertiary"`.
   *  @defaultValue 'inside' */
  marker?: "inside" | "outside";
  /** Controlled open state. When provided, the consumer owns open/close
   *  (pair with `onToggle`). */
  open?: boolean;
  /** Initial open state for the uncontrolled case. */
  defaultOpen?: boolean;
  /** Fired whenever the disclosure toggles, with the new open state. */
  onToggle?: (open: boolean) => void;
}

/** Pull the new open state out of the element's `toggle` CustomEvent,
 *  across renderers: Preact hands the raw event (`detail`), React a
 *  SyntheticEvent (`nativeEvent.detail`). */
function toggledOpen(e: any): boolean {
  return !!(e?.detail?.open ?? e?.nativeEvent?.detail?.open);
}

/**
 * `<Expander>` — a collapsible disclosure section.
 *
 * A pure, stateless pass-through to `<a-expander>`: the element owns all
 * interaction (toggle, keyboard, ARIA, animation) and its open state, so
 * the wrapper holds no state and grabs no ref — it only maps props to
 * attributes (safe wherever the host DOM is reconciled, incl. off the UI
 * thread). Supports controlled (`open` + `onToggle`) and uncontrolled
 * (`defaultOpen`) use; `onToggle` binds to the element's `toggle` event
 * like any DOM handler.
 */
export const Expander = ({
  title,
  level,
  tone,
  priority,
  marker,
  open,
  defaultOpen,
  onToggle,
  className,
  style,
  children,
  ...rest
}: ExpanderProps) => {
  const isOpen = open ?? defaultOpen ?? false;

  // A non-named tone is a literal CSS color: feed it to the element's
  // oklch derivation via an inline custom property (the CSS attr() form
  // is only a fallback for raw-HTML authors).
  const isCustomTone = tone != null && !NAMED_TONES.has(tone);
  const computedStyle = isCustomTone
    ? { ...style, ["--expander-tone-source"]: tone }
    : style;

  // A string title is rendered as our <a-expander-summary> (which carries
  // the hover affordance). A node title is the consumer's own markup —
  // slot it as-is (no <a-expander-summary>), so it keeps full control and
  // opts out of the summary hover styling.
  const titleNode = isValidElement(title) ? (
    cloneElement(title as React.ReactElement<{ slot?: string }>, {
      slot: "title",
    })
  ) : (
    <a-expander-summary slot="title">{title}</a-expander-summary>
  );

  return (
    <a-expander
      open={isOpen ? "" : undefined}
      level={level != null ? (String(level) as `${typeof level}`) : undefined}
      tone={tone && tone !== "neutral" ? tone : undefined}
      priority={priority && priority !== "secondary" ? priority : undefined}
      marker={marker && marker !== "inside" ? marker : undefined}
      onToggle={onToggle ? (e: any) => onToggle(toggledOpen(e)) : undefined}
      class={className}
      style={computedStyle}
      {...rest}
    >
      {titleNode}
      <a-expander-details>{children}</a-expander-details>
    </a-expander>
  );
};
