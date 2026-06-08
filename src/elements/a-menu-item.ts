import { HTMLElementBase } from '../anta_helpers'
import './a-menu-item.css'

declare global {
  interface Document {
    hasKeyListenerForAMenuItem?: boolean
  }
}

/**
 * `<a-menu-item>` — a single row inside an `<a-menu>`.
 *
 * No shadow DOM: its content (leading icon, label, trailing `kbd` /
 * chevron) is slotted light DOM, styled entirely from `a-menu-item.css`.
 * The element carries almost no logic — the parent `<a-menu>` owns
 * click delegation, keyboard navigation, and the close contract. This
 * class exists so the menu can identify items via `instanceof` and so
 * Enter / Space on a focused item synthesizes a click (the single
 * activation path that flows through the menu's click delegation).
 *
 * ARIA (`role="menuitem"`, `tabindex="-1"`, `aria-haspopup`/`aria-expanded`
 * for submenu parents) is added by the `MenuItem` JSX wrapper, never here —
 * the element must stay re-renderable from any reactive engine without
 * churning host attributes.
 */
export class AMenuItemElement extends HTMLElementBase {
  connectedCallback() {
    // One global delegated keydown for all menu items (mirrors a-button).
    if (!document.hasKeyListenerForAMenuItem) {
      document.addEventListener('keydown', handleKeyDown, true)
      document.hasKeyListenerForAMenuItem = true
    }
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key !== 'Enter' && e.key !== ' ') return
  const el = (e.target as HTMLElement)?.closest?.('a-menu-item') as AMenuItemElement | null
  if (!el) return
  e.preventDefault()
  // Disabled items swallow the key without activating.
  if (el.hasAttribute('disabled')) return
  el.click()
}

export function register_a_menu_item() {
  if (typeof customElements === 'undefined') return
  if (!customElements.get('a-menu-item')) {
    customElements.define('a-menu-item', AMenuItemElement)
  }
}

// Importing this module registers the element (granular entry point). The
// barrel re-exports it, so importing the barrel registers it too. Idempotent.
register_a_menu_item()
