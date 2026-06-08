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
 *   <button>                 the summary; chevron is its ::before; the
 *     <slot name="title">    title is projected here
 *   <div>                    the grid that animates height
 *     <div>                  the grid item that clips while animating
 *       <slot>               the body
 *
 * The `<button>` gives free focus + Enter/Space and carries the open
 * state in `aria-expanded` — which is BOTH the a11y signal and the CSS
 * state hook (`button[aria-expanded="true"] + div`), so no extra class
 * is needed. (`aria-controls` is intentionally omitted: it's optional in
 * the disclosure pattern, poorly supported by screen readers, and would
 * force a generated id.)
 *
 * Open state lives in the shadow (the `aria-expanded` attribute + the
 * collapsed region's `inert`) — never the host (declarative-DOM rule:
 * the host may be reconciled off the UI thread; we only touch shadow
 * internals). The host `open` attribute is the controlled input,
 * reflected IN. Clicking the summary toggles immediately and dispatches
 * a `toggle` CustomEvent on the host (`detail: { open }`).
 */

// chevron-right (rotates 90° → points down when open), as a mask so it
// paints with the inherited text color. Mirrors the Disclosure chevron.
const CHEVRON =
  "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3e%3cpath stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m9 18 6-6-6-6'/%3e%3c/svg%3e\")"

const SHADOW_STYLE = `
  :host { display: block; }

  /* Summary — a real <button>, reset to inherit the host's box/text so
     it reads as a plain header row. Focus + Enter/Space come for free. */
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
    gap: 4px;
    cursor: pointer;
    user-select: none;
    border-radius: 2px;
    outline-offset: 4px;
    /* Default summary typography ≈ level 5 (mirrors a-title.css); the
       :host([level]) rules below override it. Demi-bold like <Title>. */
    font-size: 15px;
    line-height: 20px;
    font-weight: 584.62;
    letter-spacing: 0;
  }

  /* Chevron — a ::before mask (no element), painting with currentColor
     (the inherited, possibly toned --expander-text); dimmed at rest,
     full on hover/open, rotating open. */
  button::before {
    content: '';
    width: 16px;
    height: 16px;
    flex-shrink: 0;
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

  /* Hover affordance — applied to OUR default summary (<a-expander-summary>)
     only, so a consumer who slots their own title markup keeps full control
     and opts out. The text strengthens to --text-1 (per tone) with no
     transition (instant, like quaternary buttons). On the transparent
     tertiary surface the title also gets a dotted underline on hover — the
     same affordance as the docs-site section headers. */
  button:hover ::slotted(a-expander-summary) {
    color: var(--expander-text-hover);
  }
  :host(:not([priority])) button:hover ::slotted(a-expander-summary),
  :host([priority="tertiary"]) button:hover ::slotted(a-expander-summary) {
    text-decoration: underline;
    text-decoration-style: dotted;
    text-decoration-color: color-mix(in srgb, currentColor 75%, transparent);
    text-decoration-thickness: 1px;
    text-underline-offset: 3px;
  }

  /* Per-level summary typography — values mirror a-title.css h1–h6. */
  :host([level="1"]) button { font-size: 28px; line-height: 32px; }
  :host([level="2"]) button { font-size: 24px; line-height: 28px; }
  :host([level="3"]) button { font-size: 20px; line-height: 24px; }
  :host([level="4"]) button { font-size: 17px; line-height: 20px; }
  :host([level="5"]) button { font-size: 15px; line-height: 20px; }
  :host([level="6"]) button { font-size: 13px; line-height: 16px; }

  /* Collapsible region — the <div> after the <button>. Grid 0fr-1fr
     animates the height; its inner <div> is the grid item that clips
     while animating and holds the body slot. (The grid item must be a
     real shadow child — a slotted element reached through a
     display:contents slot doesn't size the fr track.) The open state is
     keyed off the button's aria-expanded. Collapsed content is marked
     inert from JS (see setOpen) so it leaves the tab order + a11y tree. */
  button + div {
    display: grid;
    grid-template-rows: 0fr;
  }
  button[aria-expanded="true"] + div { grid-template-rows: 1fr; }
  @media (prefers-reduced-motion: no-preference) {
    button + div { transition: grid-template-rows 200ms ease; }
  }

  button + div > div { min-height: 0; overflow: clip; }
  /* Drop the clip once open + idle so focus rings / nested popovers
     aren't cut off; the delay defers it until after the expand. */
  button[aria-expanded="true"] + div > div {
    overflow: visible;
    transition: overflow 0s 200ms;
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
    const titleSlot = document.createElement('slot')
    titleSlot.name = 'title'
    this.summary.append(titleSlot)
    this.summary.addEventListener('click', this.onSummaryClick)

    this.content = document.createElement('div')
    const body = document.createElement('div')
    body.append(document.createElement('slot'))
    this.content.append(body)

    shadow.append(style, this.summary, this.content)
  }

  connectedCallback() {
    this.setOpen(this.hasAttribute('open'), false)
  }

  attributeChangedCallback(name: string) {
    // Reflect the controlled `open` attribute → internal state (read host,
    // write shadow only). No dispatch — avoids a feedback loop with the
    // wrapper writing the attribute back.
    if (name === 'open') this.setOpen(this.hasAttribute('open'), false)
  }

  private get isOpen(): boolean {
    return this.summary.getAttribute('aria-expanded') === 'true'
  }

  /** Apply open state to the shadow internals (idempotent). When
   *  `dispatch`, also emit a `toggle` event on the host so consumers can
   *  observe / control it. `aria-expanded` is both the a11y signal and
   *  the CSS state hook; `inert` keeps collapsed content out of the tab
   *  order and the accessibility tree. */
  private setOpen(open: boolean, dispatch: boolean) {
    this.summary.setAttribute('aria-expanded', open ? 'true' : 'false')
    this.content.inert = !open
    if (dispatch) this.dispatchEvent(new CustomEvent('toggle', { detail: { open } }))
  }

  private onSummaryClick = () => {
    this.setOpen(!this.isOpen, true)
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
