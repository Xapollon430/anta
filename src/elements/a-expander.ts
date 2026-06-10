import { HTMLElementBase } from '../anta_helpers'
import './a-expander.css'

/**
 * `<a-expander>` — a collapsible disclosure, built from our own shadow
 * DOM (no native `<details>`/`<summary>`).
 *
 * Light-DOM composition (what the wrapper emits / a vanilla consumer
 * authors) uses two styled sub-elements:
 *
 *   <a-expander>
 *     <a-expander-summary slot="title">Title</a-expander-summary>
 *     <a-expander-details>…body…</a-expander-details>
 *   </a-expander>
 *
 * Shadow structure (no classes / ids — styled by element + structure):
 *
 *   <button part="summary">  the summary; chevron is its ::before; the
 *     <slot name="title">    title is projected here
 *   <div>                    the grid that animates height
 *     <div part="content">   the grid item that clips while animating
 *       <slot>               the body
 *
 * ## Open state — controlled vs. uncontrolled
 *
 * - **Uncontrolled** (no `open` attribute): the element owns its state.
 *   Clicking the summary toggles it; `defaultopen` (presence) sets the
 *   initial state. This is the hand-authored-HTML mode.
 * - **Controlled** (`open` attribute present — `""`/`"true"` open,
 *   `"false"` closed): the attribute is the single source of truth.
 *   Clicks do NOT self-toggle; they only dispatch the `toggle` event
 *   (`detail.open` = the *requested* state) and the consumer answers by
 *   updating the attribute. This gives real controlled semantics — a
 *   consumer can reject a toggle by simply not updating. If you set
 *   `open`, you own it. The attribute is value-based (like ARIA), not
 *   presence-based, because absence must keep meaning "uncontrolled".
 *
 * The internal open state lives in the shadow: `aria-expanded` on the
 * button (BOTH the a11y signal and the CSS state hook — no extra class)
 * plus `inert` on the collapsed region so hidden content leaves the tab
 * order and the a11y tree. Nothing on the host is ever mutated from JS
 * (declarative-DOM rule: the host may be reconciled off the UI thread).
 * `aria-controls` is intentionally omitted: optional in the WAI-ARIA
 * disclosure pattern, poorly supported, and would force a generated id.
 *
 * ## Shadow style notes (the sheet itself ships comment-free)
 *
 * - **Summary**: a real `<button>` (free focus + Enter/Space), reset to
 *   inherit the host's box/text so it reads as a plain header row. Its
 *   typography comes from the `--expander-summary-font-size` /
 *   `-line-height` / `-font-weight` host tokens, re-pointed per `[level]`
 *   in `a-expander.css` — that file mirrors the `a-title.css` type scale
 *   (keep them in sync; `a-title` is CSS-only so there is no shared
 *   constant to import).
 * - **Chevron**: the button's `::before` — a mask painting with
 *   `currentColor` (the inherited, possibly toned `--expander-text`);
 *   dimmed at rest, full on hover/open, rotated 90° when open. Explicit
 *   `margin-inline-end` (flex gap is 0) so spacing is tunable per
 *   variant. With `marker="outside"` (tertiary only) it hangs in the
 *   left gutter: pulled left by its own 16px width + 2px gap while the
 *   host zeroes its left border/padding (see a-expander.css), so the
 *   title sits flush with surrounding content like the docs headers.
 * - **Hover/press affordance**: applies only to OUR default summary via
 *   `::slotted(a-expander-summary)` — a consumer slotting custom title
 *   markup opts out automatically. Hover eases the title to
 *   `--expander-text-hover`; on the transparent tertiary surface it adds
 *   the docs-header dotted underline. Press eases title + (closed)
 *   chevron back to the at-rest look as soft feedback; the underline
 *   intentionally stays (no flicker). The `:active` color rule mirrors
 *   its `:hover` counterpart's specificity and follows it in source
 *   order, so it wins while pressed.
 * - **Collapse animation**: grid `0fr ↔ 1fr` on the region after the
 *   button (`ANIM_MS`), keyed off `aria-expanded`; the inner grid item
 *   clips (`overflow: clip`) while animating. The grid item must be a
 *   real shadow child — a slotted element reached through a
 *   `display: contents` slot doesn't size the fr track. Once open and
 *   idle the clip is dropped (delayed by `ANIM_MS` via a discrete
 *   `overflow` transition) so focus rings / nested popovers aren't cut
 *   off. Known degradation: without `transition-behavior:
 *   allow-discrete` (Firefox < 129, Safari < 18) the un-clip applies
 *   instantly on open, so expanding content paints outside the still-
 *   animating region for `ANIM_MS` — accepted, it's a one-frame-class
 *   cosmetic on a progressive-enhancement property.
 *
 * ## Host CSS notes (`a-expander.css` — also ships comment-free)
 *
 * - The external file styles the HOST box and declares the theme tokens
 *   that cascade — via `color` + custom properties — into the shadow
 *   tree. Named tones use Anta's theme-aware semantic tokens, so no
 *   `.dark` rules are needed (same as `<a-tag>`).
 * - Border + padding are present on every priority (transparent on
 *   tertiary) so switching priority never shifts layout. `secondary` is
 *   the default surface (on the base rule); `primary` re-points to the
 *   stronger card pair; `tertiary` goes transparent. With
 *   `marker="outside"` the left border/padding are zeroed and the body
 *   drops its indent, so title + body sit flush.
 * - `<a-expander-summary>` / `<a-expander-details>` are CSS-only styled
 *   light-DOM tags (like `<a-tag-label>`). The summary inherits the
 *   shadow button's typography and only lays out + ellipsizes; the
 *   details own only layout (the indent) — no typography, so content
 *   keeps its own.
 * - Custom (non-named) `tone` keeps the source hue and pins lightness/
 *   chroma per token via `oklch(from …)`, re-tuned for dark mode — the
 *   `<a-tag>` / `<a-button>` mechanism. The JSX wrapper feeds the color
 *   in via inline `--expander-tone-source`; the typed
 *   `attr(tone type(<color>))` fallback covers raw-HTML authors on
 *   engines that support it.
 */

const ANIM_MS = 200

const CHEVRON =
  "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3e%3cpath stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m9 18 6-6-6-6'/%3e%3c/svg%3e\")"

const SHADOW_STYLE = `
  :host { display: block; }

  button {
    appearance: none;
    -webkit-appearance: none;
    background: none;
    border: none;
    margin: 0;
    padding: 0;
    width: 100%;
    font: inherit;
    color: inherit;
    text-align: left;

    display: flex;
    align-items: center;
    gap: 0;
    cursor: pointer;
    user-select: none;
    border-radius: 2px;
    outline-offset: 4px;
    font-size: var(--expander-summary-font-size);
    line-height: var(--expander-summary-line-height);
    font-weight: var(--expander-summary-font-weight);
    letter-spacing: 0;
  }

  button::before {
    content: '';
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    margin-inline-end: 4px;
    background-color: currentColor;
    -webkit-mask-image: ${CHEVRON};
            mask-image: ${CHEVRON};
    -webkit-mask-size: contain;
            mask-size: contain;
    -webkit-mask-repeat: no-repeat;
            mask-repeat: no-repeat;
    -webkit-mask-position: center;
            mask-position: center;
    opacity: 0.6;
    transition: transform 150ms ease, opacity 150ms ease;
  }
  button:hover::before { opacity: 1; }
  button[aria-expanded="true"]::before { transform: rotate(90deg); opacity: 1; }

  :host([priority="tertiary"][marker="outside"]) button::before {
    margin-inline-start: -18px;
    margin-inline-end: 2px;
  }

  button:hover ::slotted(a-expander-summary) {
    color: var(--expander-text-hover);
  }
  :host([priority="tertiary"]) button:hover ::slotted(a-expander-summary) {
    text-decoration: underline;
    text-decoration-style: dotted;
    text-decoration-color: color-mix(in oklch, currentColor 75%, transparent);
    text-decoration-thickness: 1px;
    text-underline-offset: 3px;
  }

  button:active ::slotted(a-expander-summary) {
    color: var(--expander-text);
  }
  button:not([aria-expanded="true"]):active::before {
    opacity: 0.6;
  }

  button + div {
    display: grid;
    grid-template-rows: 0fr;
  }
  button[aria-expanded="true"] + div { grid-template-rows: 1fr; }
  @media (prefers-reduced-motion: no-preference) {
    button + div { transition: grid-template-rows ${ANIM_MS}ms ease; }
  }

  button + div > div { min-height: 0; overflow: clip; }
  button[aria-expanded="true"] + div > div {
    overflow: visible;
    transition: overflow 0s ${ANIM_MS}ms;
    transition-behavior: allow-discrete;
  }
`

export class AExpanderElement extends HTMLElementBase {
  static observedAttributes = ['open']

  private summary: HTMLButtonElement
  private content: HTMLDivElement

  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })

    const style = document.createElement('style')
    style.textContent = SHADOW_STYLE

    this.summary = document.createElement('button')
    this.summary.type = 'button'
    this.summary.setAttribute('aria-expanded', 'false')
    // Expose the header button as a shadow part so consumers can style it —
    // including states CSS variables can't reach (e.g. ::part(summary):hover,
    // :focus-visible, ::part(summary)::before for the chevron).
    this.summary.setAttribute('part', 'summary')
    const titleSlot = document.createElement('slot')
    titleSlot.name = 'title'
    this.summary.append(titleSlot)
    this.summary.addEventListener('click', this.onSummaryClick)

    this.content = document.createElement('div')
    const body = document.createElement('div')
    // The collapsible body region, exposed as a part for the same reason.
    body.setAttribute('part', 'content')
    body.append(document.createElement('slot'))
    this.content.append(body)

    shadow.append(style, this.summary, this.content)
  }

  /** Controlled mode: the `open` attribute is present and owns the state. */
  private get controlled(): boolean {
    return this.hasAttribute('open')
  }

  private get isOpen(): boolean {
    return this.summary.getAttribute('aria-expanded') === 'true'
  }

  connectedCallback() {
    if (this.controlled) this.syncFromAttribute()
    else this.setOpen(this.hasAttribute('defaultopen'))
  }

  attributeChangedCallback() {
    // Only `open` is observed. When it's removed (controlled →
    // uncontrolled hand-off) the current state is kept, not reset.
    if (this.controlled) this.syncFromAttribute()
  }

  private syncFromAttribute() {
    this.setOpen(this.getAttribute('open') !== 'false')
  }

  /** Apply open state to the shadow internals (idempotent; reads the host,
   *  writes only the shadow). `aria-expanded` is both the a11y signal and
   *  the CSS state hook; `inert` keeps collapsed content out of the tab
   *  order and the accessibility tree. */
  private setOpen(open: boolean) {
    this.summary.setAttribute('aria-expanded', open ? 'true' : 'false')
    this.content.inert = !open
  }

  /** Uncontrolled: toggle, then announce. Controlled: only announce the
   *  requested state — the consumer answers via the `open` attribute. */
  private onSummaryClick = () => {
    const requested = !this.isOpen
    if (!this.controlled) this.setOpen(requested)
    this.dispatchEvent(new CustomEvent('toggle', { detail: { open: requested } }))
  }
}

export function register_a_expander() {
  if (typeof customElements === 'undefined') return
  if (!customElements.get('a-expander')) {
    customElements.define('a-expander', AExpanderElement)
  }
}

// Importing this module registers the element (granular entry point). The
// barrel re-exports it, so importing the barrel registers it too. Idempotent.
register_a_expander()
