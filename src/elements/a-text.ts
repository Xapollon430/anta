import { HTMLElementBase } from '../anta_helpers'
import './a-text.css'

// Shadow CSS (kept comment-free — this string ships into every consumer
// document). How it hangs together:
// - The slot defaults to `display: contents` so slotted nodes flow as direct
//   children of the host; the `[truncate]` rule gives it a real -webkit-box
//   display so it becomes the wrapper that holds the line clamp, and
//   `.expanded` drops the clamp entirely.
// - The expandable fade mask is vertical for multi-line, a right-edge
//   horizontal fade for single-line (`truncate="1"`).
// - The expand button is the whole fade strip (full-width bottom strip for
//   multi-line, narrow right region for single-line) — the chevron is just
//   a masked ::before pinned in its bottom-right corner. It appears on
//   hover / focus-within.
const SHADOW_STYLE = `
  :host {
    display: block;
    position: relative;
  }
  :host([inline]) {
    display: inline-block;
  }

  slot {
    display: contents;
  }

  :host([truncate]) slot {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: var(--line-clamp, 1);
    overflow: hidden;
  }

  :host([truncate][expandable]) slot:not(.expanded) {
    -webkit-mask-image: linear-gradient(to bottom, black calc(100% - 2em), transparent 97%);
            mask-image: linear-gradient(to bottom, black calc(100% - 2em), transparent 97%);
  }

  :host([truncate="1"][expandable]) slot:not(.expanded) {
    -webkit-mask-image: linear-gradient(to right, black calc(100% - 7ch), transparent 97%);
            mask-image: linear-gradient(to right, black calc(100% - 7ch), transparent 97%);
  }

  :host([truncate]) slot.expanded {
    display: block;
    -webkit-line-clamp: unset;
    overflow: visible;
  }

  .expand-btn {
    appearance: none;
    background: transparent;
    border: none;
    margin: 0;
    padding: 0;
    color: var(--text-3);
    cursor: pointer;
    font: inherit;
    display: none;
    position: absolute;
    z-index: 1;
    opacity: 0;
    transition: opacity 150ms ease-out, color 150ms ease-out;
  }
  .expand-btn:hover {
    color: var(--text-1);
  }
  .expand-btn::before {
    content: '';
    position: absolute;
    right: -1px;
    bottom: -1px;
    width: 14px;
    height: 14px;
    background-color: currentColor;
    -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E");
            mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E");
    -webkit-mask-position: center;
            mask-position: center;
    -webkit-mask-repeat: no-repeat;
            mask-repeat: no-repeat;
    -webkit-mask-size: contain;
            mask-size: contain;
  }

  :host([truncate][expandable]) .expand-btn:not(.hidden) {
    display: block;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1.5em;
  }

  :host([truncate="1"][expandable]) .expand-btn:not(.hidden) {
    left: auto;
    top: 0;
    bottom: 0;
    width: 3em;
  }

  :host([truncate][expandable]:hover) .expand-btn:not(.hidden),
  :host([truncate][expandable]:focus-within) .expand-btn:not(.hidden) {
    opacity: 1;
  }
`

/**
 * `<a-text>` — body text element with truncation / expansion.
 *
 * Styling notes (`a-text.css` ships comment-free):
 * - `a-text[truncate] { min-width: 0 }` is the one external requirement of
 *   the shadow clamp: the host must be allowed to shrink inside flex/grid
 *   parents so the inner clamp can actually clip content.
 * - The default (no `priority`) is the SECONDARY level — body text reads at
 *   `--text-2` on the base rule; `priority="primary"` opts into the
 *   strongest `--text-1`.
 * - Priority/tone link colors: levels 1–2 keep the brand link color; levels
 *   3–5 mute the link to `currentColor` and step the hover up one level
 *   (3→2, 4→3, 5→4). Tinted variants do the same within their
 *   `--text-{N}-{tone}` ramp (level 1 has nothing above it — hover keeps the
 *   color and only the underline alpha changes).
 * - The `a-text a` rules layer on anta's global `a` defaults from
 *   `reset.css`, overriding only color and the one-step-up hover color
 *   (underline thickness/offset/alpha are inherited); the hover repeats the
 *   underline color so it tracks the priority color. Hover is gated to
 *   `(hover: hover) and (pointer: fine)` to avoid sticky hover after a tap.
 */
export class ATextElement extends HTMLElementBase {
  static observedAttributes = ['expandable', 'truncate']

  private slotEl: HTMLSlotElement
  private expandBtn: HTMLButtonElement

  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })

    const style = document.createElement('style')
    style.textContent = SHADOW_STYLE

    this.slotEl = document.createElement('slot')

    this.expandBtn = document.createElement('button')
    this.expandBtn.className = 'expand-btn'
    this.expandBtn.type = 'button'
    this.expandBtn.setAttribute('aria-label', 'Show more')
    this.expandBtn.setAttribute('aria-expanded', 'false')
    this.expandBtn.addEventListener('click', this.handleExpand)

    shadow.append(style, this.slotEl, this.expandBtn)
  }

  attributeChangedCallback() {
    // When the configuration changes, restart in the collapsed state.
    this.slotEl.classList.remove('expanded')
    this.expandBtn.classList.remove('hidden')
    this.expandBtn.setAttribute('aria-expanded', 'false')
  }

  private handleExpand = () => {
    if (this.slotEl.classList.contains('expanded')) return
    this.slotEl.classList.add('expanded')
    this.expandBtn.classList.add('hidden')
    this.expandBtn.setAttribute('aria-expanded', 'true')
  }
}

export function register_a_text() {
  if (typeof customElements === 'undefined') return
  if (!customElements.get('a-text')) {
    customElements.define('a-text', ATextElement)
  }
}

// Importing this module registers the element (granular entry point). The
// barrel re-exports it, so importing the barrel registers it too. Idempotent.
register_a_text()
