import { HTMLElementBase } from '../anta_helpers'
import { debounce } from 'es-toolkit'
import './a-tooltip.css'

/** Gap (px) the bubble keeps from the cursor / anchor / viewport edge. */
const MARGIN = 4
/** Approx pointer height — how far below the cursor the bubble sits in follow mode. */
const CURSOR_SIZE = 16
/** Default show delay (ms) when nothing else is open. Never use 0 — use ~50. */
const DEFAULT_DELAY = 250
/** Enter/exit fade duration (ms). Mirrors `--_dur` in the shadow style. */
const FADE_MS = 150
/**
 * Grace window (ms) after a tooltip closes during which the *next* tooltip
 * opens immediately (skips the delay). This is what turns the hop from one
 * anchor to another into a clean cross-fade instead of a delayed re-open.
 */
const GRACE_MS = 300
/**
 * Close delay (ms): the bubble lingers this long after the cursor leaves the
 * anchor instead of vanishing instantly. Covers the gap between two separate
 * anchors so moving between them cross-fades (the outgoing bubble is still up
 * when the next one claims the slot), and gives a moment to move the cursor
 * into an interactive bubble before it dismisses.
 */
const CLOSE_DELAY = 120

/* ------------------------------------------------------------------ *
 * Module-level coordinator — PURE IN-MEMORY JS, never touches the DOM.
 * The host app may reconcile its DOM from a worker thread, so we must
 * not add/move nodes or write host attributes from here. This only
 * tracks "who is open" + a grace timer and calls each element's own
 * show()/hide() (which mutate only their own shadow internals).
 * ------------------------------------------------------------------ */
let currentOpen: ATooltipElement | null = null
let graceTimer: ReturnType<typeof setTimeout> | undefined

function graceActive(): boolean {
  return graceTimer !== undefined
}

/** Open is "hot" when another tooltip is showing or just closed — skip the delay. */
function isHot(): boolean {
  return currentOpen !== null || graceActive()
}

function clearGrace() {
  if (graceTimer !== undefined) {
    clearTimeout(graceTimer)
    graceTimer = undefined
  }
}

/** Called from an element as it shows: close the previous one (cross-fade) and claim the slot. */
function claimOpen(el: ATooltipElement) {
  if (currentOpen && currentOpen !== el) currentOpen.hide()
  currentOpen = el
  clearGrace()
}

/** Called from an element as it hides: release the slot and arm the grace window. */
function releaseOpen(el: ATooltipElement) {
  if (currentOpen !== el) return
  currentOpen = null
  clearGrace()
  graceTimer = setTimeout(() => { graceTimer = undefined }, GRACE_MS)
}

/* ------------------------------------------------------------------ *
 * Lazy-listener observer: attach the (relatively heavy) hover/focus
 * listeners only while the anchor is actually on-screen, mirroring the
 * legacy behaviour. One observer for every <a-tooltip> on the page.
 * ------------------------------------------------------------------ */
const anchorToTooltip = new WeakMap<Element, ATooltipElement>()

function handleIntersection(entries: IntersectionObserverEntry[]) {
  for (const entry of entries) {
    const tooltip = anchorToTooltip.get(entry.target)
    if (!tooltip) continue
    if (!tooltip.listening && entry.isIntersecting) {
      requestAnimationFrame(() => tooltip.setupListeners())
    } else if (tooltip.listening && !entry.isIntersecting) {
      requestAnimationFrame(() => tooltip.teardownListeners())
    }
  }
}

// threshold 0 only: any higher would re-fire on animated size changes.
const lazyObserver: IntersectionObserver | null =
  typeof IntersectionObserver !== 'undefined'
    ? new IntersectionObserver(handleIntersection, { root: null, rootMargin: '0px', threshold: 0 })
    : null

export class ATooltipElement extends HTMLElementBase {
  // Observe `delay` so changing it at runtime — e.g. the docs playground
  // patches the attribute on the live element — rebuilds the show debounce
  // with the new value instead of keeping the one captured at setup.
  static observedAttributes = ['delay']

  /** Shadow-internal popover surface — the only thing we ever mutate. */
  private container!: HTMLDivElement
  private anchor: HTMLElement | null = null

  listening = false
  private shown = false
  private lastMouse?: MouseEvent

  private debouncedShow?: ((e?: MouseEvent) => void) & { cancel: () => void }
  private teardown?: () => void
  private closeTimer?: ReturnType<typeof setTimeout>
  private fading = false
  private fadeTimer?: ReturnType<typeof setTimeout>
  private docMoveBound = false

  constructor() {
    super()
    // Built ONCE, here, off the reconciliation path. All later changes
    // are confined to this shadow subtree — never the host or light DOM.
    const shadow = this.attachShadow({ mode: 'open' })

    const style = document.createElement('style')
    style.textContent = `
      :host { display: contents; }

      .container {
        --_dur: ${FADE_MS}ms;

        position: fixed;
        left: 0;
        top: 0;
        margin: 0;
        box-sizing: border-box;
        width: fit-content;
        max-width: var(--tooltip-max-width, min(calc(100vw - 20px), 80ch));
        max-height: calc(100vh - 20px);
        overflow: clip;
        pointer-events: none;
        text-align: left;

        background: var(--tooltip-bg, Canvas);
        color: var(--text-1, CanvasText);
        box-shadow: var(--tooltip-shadow, 0 1px 8px rgba(0, 0, 0, 0.2));
        backdrop-filter: blur(8px);
        padding: 5px 8px;
        border: none;
        border-radius: var(--tooltip-radius, 3px);
        outline: none;

        font-size: 14px;
        line-height: 130%;
        font-weight: 400;
        white-space: break-spaces;
        word-break: break-word;
        overflow-wrap: break-word;

        /* Clean enter/exit fade. allow-discrete keeps the bubble rendered
           through its fade-out after hidePopover(), and @starting-style
           gives every open a from-opacity:0 — so the first paint at a
           not-yet-computed transform is invisible (no flash at a stale
           spot), and re-appearing is always clean. */
        opacity: 0;
        transition:
          opacity var(--_dur) ease,
          overlay var(--_dur) ease allow-discrete,
          display var(--_dur) ease allow-discrete;
      }

      .container:popover-open { opacity: 1; }

      @starting-style {
        .container:popover-open { opacity: 0; }
      }

      /* Interactive tooltips accept pointer events so their content (links,
         buttons) is clickable; the default click-through bubble does not. */
      :host([interactive]) .container { pointer-events: auto; }
    `

    this.container = document.createElement('div')
    this.container.className = 'container'
    this.container.setAttribute('popover', 'manual')
    this.container.setAttribute('role', 'tooltip')
    this.container.append(document.createElement('slot'))

    // Keep an interactive bubble open while the cursor is inside it (these
    // only fire when pointer-events is on, i.e. interactive mode). The
    // anchor's mouseleave schedules a hide; moving into the bubble within
    // that window cancels it, so you can travel anchor → bubble and click.
    this.container.addEventListener('mouseenter', () => { if (this.isInteractive) this.cancelHide() })
    this.container.addEventListener('mouseleave', () => { if (this.isInteractive && this.shown) this.scheduleHide() })

    shadow.append(style, this.container)
  }

  connectedCallback() {
    const parent = this.parentElement
    if (!parent) return
    this.anchor = parent
    anchorToTooltip.set(parent, this)
    lazyObserver?.observe(parent)
  }

  disconnectedCallback() {
    this.hide()
    // Force-detach the fade-time move listener immediately (the element is
    // going away; don't wait out the fade timer).
    if (this.fadeTimer !== undefined) { clearTimeout(this.fadeTimer); this.fadeTimer = undefined }
    this.fading = false
    if (this.docMoveBound) {
      this.doc.removeEventListener('mousemove', this.onDocMove)
      this.docMoveBound = false
    }
    this.teardownListeners()
    if (this.anchor) {
      if (anchorToTooltip.get(this.anchor) === this) {
        anchorToTooltip.delete(this.anchor)
        lazyObserver?.unobserve(this.anchor)
      }
      this.anchor = null
    }
  }

  attributeChangedCallback(name: string) {
    // `delay` is baked into the debounce, so rebuild it when the attribute
    // changes (only meaningful once listeners are wired).
    if (name === 'delay' && this.listening) this.makeDebouncedShow()
  }

  /** (Re)build the show debounce with the CURRENT `delay` (rebuilt when the
   *  `delay` attribute changes). Re-armed on each hover move (trailing), and
   *  fed the latest cursor event, so it shows at the cursor and so moving back
   *  onto an anchor after the tooltip was dismissed re-arms it. */
  private makeDebouncedShow() {
    this.debouncedShow?.cancel()
    this.debouncedShow = debounce((e?: MouseEvent) => this.show(e), this.delay)
  }

  /** The element's OWN window / document. The class may be defined in a
   *  different realm than the element lives in (e.g. the docs playground
   *  renders into an iframe but reuses the parent page's element class), so
   *  the module-global `window`/`document` can point at the wrong frame.
   *  Everything viewport- or document-scoped (clamping, scroll/key/move
   *  listeners) must go through these so it's correct in any frame. */
  private get view(): (Window & typeof globalThis) {
    return (this.ownerDocument?.defaultView as Window & typeof globalThis) ?? window
  }
  private get doc(): Document {
    return this.ownerDocument ?? document
  }

  private get isInteractive(): boolean {
    return this.hasAttribute('interactive')
  }

  /** Pinned under the anchor (no cursor-following). Interactive implies this —
   *  you can't move into a bubble that's chasing the cursor. */
  private get isStatic(): boolean {
    return this.hasAttribute('static') || this.isInteractive
  }

  private get prefersTop(): boolean {
    return this.getAttribute('placement') === 'top'
  }

  private get delay(): number {
    const attr = this.getAttribute('delay')
    if (attr == null) return DEFAULT_DELAY
    const n = parseInt(attr, 10)
    return Number.isFinite(n) ? n : DEFAULT_DELAY
  }

  // --- positioning (sets only the shadow container's own transform) ---

  private positionToTarget = () => {
    requestAnimationFrame(() => {
      if (!this.anchor || !this.shown) return
      const a = this.anchor.getBoundingClientRect()
      const box = this.container.getBoundingClientRect()
      const view = this.view
      const vw = view.innerWidth
      const vh = view.innerHeight

      let left = a.left
      if (left + box.width > vw) left = vw - box.width - MARGIN
      left = Math.max(MARGIN, left)

      let top: number
      if (this.prefersTop) {
        top = a.top - box.height - MARGIN
        if (top < MARGIN) top = a.bottom + MARGIN
      } else {
        top = a.bottom + MARGIN
        if (top + box.height > vh) top = a.top - box.height - MARGIN
      }
      top = Math.max(MARGIN, top)

      this.container.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`
    })
  }

  private positionToMouse = (e: MouseEvent) => {
    requestAnimationFrame(() => {
      if (!this.shown && !this.fading) return
      const box = this.container.getBoundingClientRect()
      const view = this.view
      const vw = view.innerWidth
      const vh = view.innerHeight

      let left = e.clientX + MARGIN
      if (left + box.width > vw) left = vw - box.width - MARGIN
      left = Math.max(MARGIN, left)

      let top: number
      if (this.prefersTop) {
        top = e.clientY - box.height - MARGIN * 2
        if (top < MARGIN) top = e.clientY + CURSOR_SIZE
      } else {
        top = e.clientY + CURSOR_SIZE
        if (top + box.height > vh) top = e.clientY - box.height - MARGIN * 2
      }
      top = Math.max(MARGIN, top)

      this.container.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`
    })
  }

  private position(e?: MouseEvent) {
    if (!this.isStatic && e) this.positionToMouse(e)
    else this.positionToTarget()
  }

  // --- show / hide ---

  show = (e?: MouseEvent) => {
    if (!this.anchor) return
    this.cancelHide() // re-showing (or a hand-off) cancels any pending close
    // Nested anchors: if this anchor *contains* the currently-open tooltip's
    // anchor, an inner (descendant) tooltip is showing — defer to it instead
    // of covering it with this ancestor's. (A descendant or unrelated anchor
    // falls through and takes over, giving the normal hand-off.) Without this
    // the outer + inner would thrash for the single open slot on every move.
    if (currentOpen && currentOpen !== this && this.anchor.contains(currentOpen.anchor)) {
      return
    }
    claimOpen(this) // closes any previously-open tooltip → cross-fade
    if (!this.shown) {
      this.shown = true
      this.fading = false
      if (this.fadeTimer !== undefined) { clearTimeout(this.fadeTimer); this.fadeTimer = undefined }
      this.container.showPopover()
      // A fixed-position popover doesn't scroll with the page, so dismiss
      // on any scroll (capture catches nested scroll containers too) rather
      // than leaving the bubble orphaned over empty space.
      this.view.addEventListener('scroll', this.hide, { capture: true, passive: true })
      this.doc.addEventListener('keydown', this.onKeyDown, true)
      // Follow the cursor for the whole time it's shown — including after the
      // pointer has left the anchor (close pending) AND through the exit fade
      // — so a following bubble keeps trailing the mouse instead of freezing.
      // (No-op for static/interactive.) Detached when the fade finishes.
      if (!this.docMoveBound) { this.doc.addEventListener('mousemove', this.onDocMove); this.docMoveBound = true }
    }
    // Position AFTER showPopover so the bubble is laid out & measurable
    // (wrapped to max-width). Opacity is still ~0 here, so setting the
    // transform never flashes.
    this.position(e)
  }

  hide = () => {
    this.cancelHide()
    if (!this.shown) return
    this.shown = false
    this.container.hidePopover()
    this.view.removeEventListener('scroll', this.hide, { capture: true } as any)
    this.doc.removeEventListener('keydown', this.onKeyDown, true)
    // Keep the cursor-follow listener through the exit fade (a following bubble
    // trails the pointer as it fades instead of freezing), then detach it.
    this.fading = true
    if (this.fadeTimer !== undefined) clearTimeout(this.fadeTimer)
    this.fadeTimer = setTimeout(() => {
      this.fading = false
      this.fadeTimer = undefined
      if (this.docMoveBound) {
        this.doc.removeEventListener('mousemove', this.onDocMove)
        this.docMoveBound = false
      }
    }, FADE_MS)
    releaseOpen(this)
  }

  /** While shown, track the cursor even after it has left the anchor (during
   *  the close delay). Cursor-following only — static/interactive bubbles
   *  stay pinned. */
  private onDocMove = (e: MouseEvent) => {
    if ((this.shown || this.fading) && !this.isStatic) {
      this.lastMouse = e
      this.positionToMouse(e)
    }
  }

  /** Hide after CLOSE_DELAY unless something cancels it first (re-enter, or
   *  another tooltip claiming the slot). Lets the bubble bridge the gap to a
   *  neighbouring anchor — and survive the trip into an interactive bubble. */
  private scheduleHide = () => {
    this.cancelHide()
    this.closeTimer = setTimeout(() => { this.closeTimer = undefined; this.hide() }, CLOSE_DELAY)
  }

  private cancelHide() {
    if (this.closeTimer !== undefined) {
      clearTimeout(this.closeTimer)
      this.closeTimer = undefined
    }
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.hide() // Escape dismisses immediately
  }

  /** Open now if another tooltip is hot (skip delay), else (re)arm the delayed
   *  show with the latest cursor event. */
  private trigger(e?: MouseEvent) {
    if (isHot()) {
      this.debouncedShow?.cancel()
      this.show(e)
    } else {
      this.debouncedShow?.(e)
    }
  }

  // --- lazy listener wiring (called by the intersection observer) ---

  setupListeners() {
    if (this.listening || !this.anchor) {
      this.listening = true
      return
    }
    const anchor = this.anchor
    const view = this.view // element's own frame — see the `view`/`doc` getters
    const doc = this.doc
    this.makeDebouncedShow()

    // mousemove is bound to the ANCHOR (not document): the cursor is over
    // the anchor while hovering, moves over descendants bubble up to it, and
    // it keeps the listener scoped to one element that lives in the same
    // document/registry as this element (a document-level listener proved
    // unreliable across the playground's preview iframe).
    const onMouseMove = (e: MouseEvent) => {
      this.lastMouse = e
      if (this.shown) {
        if (!this.isStatic) this.positionToMouse(e)
      } else {
        // (Re)arm the delayed show. This also re-arms after the tooltip was
        // dismissed without leaving the anchor — e.g. moving back onto the
        // outer box after a nested inner tooltip claimed and hid it.
        this.trigger(e)
      }
    }

    const onLeave = () => {
      this.debouncedShow?.cancel()
      anchor.removeEventListener('mousemove', onMouseMove)
      anchor.removeEventListener('mouseleave', onLeave)
      anchor.removeEventListener('blur', onLeave)
      view.removeEventListener('pagehide', onLeave)
      doc.removeEventListener('visibilitychange', onLeave)
      this.scheduleHide() // linger briefly instead of vanishing on exit
    }

    const onEnter = (e: MouseEvent) => {
      this.lastMouse = e
      anchor.addEventListener('mousemove', onMouseMove)
      anchor.addEventListener('mouseleave', onLeave)
      view.addEventListener('pagehide', onLeave)
      doc.addEventListener('visibilitychange', onLeave)
      this.trigger(e)
    }

    const onFocus = () => {
      anchor.addEventListener('blur', onLeave)
      view.addEventListener('pagehide', onLeave)
      doc.addEventListener('visibilitychange', onLeave)
      this.trigger() // no mouse event → positions to the anchor
    }

    anchor.addEventListener('mouseenter', onEnter)
    anchor.addEventListener('focus', onFocus)

    this.teardown = () => {
      this.debouncedShow?.cancel()
      anchor.removeEventListener('mousemove', onMouseMove)
      anchor.removeEventListener('mouseenter', onEnter)
      anchor.removeEventListener('mouseleave', onLeave)
      anchor.removeEventListener('focus', onFocus)
      anchor.removeEventListener('blur', onLeave)
      view.removeEventListener('pagehide', onLeave)
      doc.removeEventListener('visibilitychange', onLeave)
      this.listening = false
    }
    this.listening = true
  }

  teardownListeners() {
    this.teardown?.()
    this.teardown = undefined
  }
}

export function register_a_tooltip() {
  if (typeof customElements === 'undefined') return
  if (!customElements.get('a-tooltip')) {
    customElements.define('a-tooltip', ATooltipElement)
  }
}

// Importing this module registers the element (granular entry point). The
// barrel re-exports it, so importing the barrel registers it too. Idempotent.
register_a_tooltip()
