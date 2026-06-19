export function hasChildren(children: React.ReactNode): boolean {
  return Array.isArray(children) ? children.length > 0 : children != null
}

/**
 * `HTMLElement` in browsers, a noop class in Node/Worker environments.
 * Use this as the base for custom element classes so importing the
 * module in a non-DOM environment doesn't throw on `extends HTMLElement`.
 * Instantiation in non-DOM environments still fails, but no consumer
 * should be doing that.
 */
const NativeHTMLElement = (typeof HTMLElement !== 'undefined' ? HTMLElement : class {}) as typeof HTMLElement

/**
 * Base for Anta custom elements. Adds realm-correct `view` / `doc` getters:
 * the class may be defined in one realm while the element lives in another
 * (the docs playground renders into an iframe but reuses the parent page's
 * element class), so the module-global `window` / `document` can point at the
 * wrong frame. Anything viewport- or document-scoped — clamping,
 * `getComputedStyle`, scroll / key / pointer listeners — must go through these
 * so it's correct in any frame. Shared by a-tooltip and a-menu.
 */
export class HTMLElementBase extends NativeHTMLElement {
  /** This element's own window (the iframe's window when nested). */
  protected get view(): Window & typeof globalThis {
    return (this.ownerDocument?.defaultView as Window & typeof globalThis) ?? window
  }
  /** This element's own document (the iframe's document when nested). */
  protected get doc(): Document {
    return this.ownerDocument ?? document
  }
}
