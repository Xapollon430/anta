import type { BaseProps } from "../general_types";

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
  /** Color tint. Re-points the text and (on filled priorities) the
   *  surface to the matching palette.
   *  @defaultValue 'neutral' */
  tone?: "neutral" | "brand" | "info" | "success" | "warning" | "critical";
  /** Surface emphasis. `tertiary` is transparent; `secondary` is a subtle
   *  fill; `primary` is a more pronounced card.
   *  @defaultValue 'tertiary' */
  priority?: "primary" | "secondary" | "tertiary";
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
  open,
  defaultOpen,
  onToggle,
  className,
  style,
  children,
  ...rest
}: ExpanderProps) => {
  const isOpen = open ?? defaultOpen ?? false;

  return (
    <a-expander
      open={isOpen ? "" : undefined}
      level={level != null ? (String(level) as `${typeof level}`) : undefined}
      tone={tone && tone !== "neutral" ? tone : undefined}
      priority={priority && priority !== "tertiary" ? priority : undefined}
      onToggle={onToggle ? (e: any) => onToggle(toggledOpen(e)) : undefined}
      class={className}
      style={style}
      {...rest}
    >
      <a-expander-summary slot="title">{title}</a-expander-summary>
      <a-expander-details>{children}</a-expander-details>
    </a-expander>
  );
};
