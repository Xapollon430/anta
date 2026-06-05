import { HTMLElementBase } from '../anta_helpers'
import './a-icon.css'
import './a-icon.shapes.css'

/**
 * `<a-icon shape="…">` — pure declarative icon element.
 *
 * No shadow DOM and no JS state. Styling is driven entirely by external
 * CSS: the base rule (`a-icon.css`) sets up the mask compositing, and
 * the per-shape rules (`a-icon.shapes.css`, generated) supply the
 * `--icon` URL. Color follows `currentColor`.
 */
export class AIconElement extends HTMLElementBase {}

export function register_a_icon() {
  if (typeof customElements === 'undefined') return
  if (!customElements.get('a-icon')) {
    customElements.define('a-icon', AIconElement)
  }
}

// Importing this module registers the element (granular entry point). The
// barrel re-exports it, so importing the barrel registers it too. Idempotent.
register_a_icon()
