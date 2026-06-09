import { HTMLElementBase } from '../anta_helpers'
import { AMenuItemElement } from './a-menu-item'
import './a-menu.css'

/** Gap (px) the surface keeps from the anchor / viewport edge. */
const MARGIN = 4
/** Smallest usable surface height when space is tight (it scrolls inside). */
const MIN_HEIGHT = 96
/** Hover-open / hover-close intent delays for submenus (ms). */
const SUBMENU_OPEN_DELAY = 130
const SUBMENU_CLOSE_DELAY = 130
/** Typeahead buffer reset window (ms). */
const TYPEAHEAD_RESET = 500

type Placement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'

type OpenDetail = { coord?: [number, number]; originEvent?: Event }

/* ------------------------------------------------------------------ *
 * Module-level coordinator — PURE IN-MEMORY JS, never touches the DOM
 * tree or host attributes (the host app may reconcile light DOM from a
 * worker thread). It only tracks the open stack and calls each element's
 * own _doShow()/_doHide(), which mutate only their shadow internals, plus
 * el.focus() (moving focus is not a tree mutation).
 * ------------------------------------------------------------------ */
const openStack: AMenuElement[] = []

let docBound = false
let boundDoc: Document | null = null
let boundView: (Window & typeof globalThis) | null = null

function bindDocListeners(doc: Document, view: Window & typeof globalThis) {
  if (docBound) return
  doc.addEventListener('pointerdown', onDocPointerDown, true)
  doc.addEventListener('keydown', onDocKeyDown, true)
  doc.addEventListener('contextmenu', onDocContextMenu, true)
  view.addEventListener('scroll', onScroll, { capture: true, passive: true })
  view.addEventListener('resize', onResize)
  boundDoc = doc
  boundView = view
  docBound = true
}

function unbindDocListeners() {
  if (!docBound) return
  boundDoc?.removeEventListener('pointerdown', onDocPointerDown, true)
  boundDoc?.removeEventListener('keydown', onDocKeyDown, true)
  boundDoc?.removeEventListener('contextmenu', onDocContextMenu, true)
  boundView?.removeEventListener('scroll', onScroll, { capture: true } as any)
  boundView?.removeEventListener('resize', onResize)
  boundDoc = null
  boundView = null
  docBound = false
}

/** A node is "inside the open menu system" if the event path crosses any
 *  open menu's surface or its anchor. `composedPath` crosses shadow
 *  boundaries, so slotted custom content (a slider, an input) counts as
 *  inside — clicking it never dismisses the menu. */
function pathHitsMenus(e: Event): boolean {
  const path = e.composedPath()
  for (const m of openStack) {
    if (path.includes(m.surface)) return true
    const anchor = m.triggerAnchor
    if (anchor && path.includes(anchor)) return true
  }
  return false
}

function onDocPointerDown(e: Event) {
  if (!openStack.length) return
  if (!pathHitsMenus(e)) closeAll()
}

function onDocContextMenu(e: Event) {
  if (!openStack.length) return
  // Right-click inside the menu system (or on an open anchor) is left alone —
  // a context anchor's own handler repositions rather than toggling.
  if (!pathHitsMenus(e)) closeAll()
}

function onScroll(e: Event) {
  if (!openStack.length) return
  // Ignore the surface's own internal (max-height) scroll.
  const t = e.target as Node
  for (const m of openStack) if (m.surface.contains(t)) return
  closeAll()
}

function onResize() {
  if (!openStack.length) return
  closeAll()
}

function onDocKeyDown(e: KeyboardEvent) {
  const menu = openStack[openStack.length - 1]
  if (!menu) return
  menu.handleKey(e)
}

/** Close the whole stack, top-down. */
function closeAll() {
  for (let i = openStack.length - 1; i >= 0; i--) openStack[i]._doHide()
  openStack.length = 0
  unbindDocListeners()
}

/* ------------------------------------------------------------------ *
 * Lazy-listener observer — attach the trigger listeners only while the
 * anchor is on-screen (also correctness under DOM reconciliation: it
 * re-attaches when the anchor reappears, tears down when it leaves).
 * ------------------------------------------------------------------ */
const anchorToMenu = new WeakMap<Element, AMenuElement>()

function handleIntersection(entries: IntersectionObserverEntry[]) {
  for (const entry of entries) {
    const menu = anchorToMenu.get(entry.target)
    if (!menu) continue
    if (!menu.listening && entry.isIntersecting) {
      requestAnimationFrame(() => menu.setupListeners())
    } else if (menu.listening && !entry.isIntersecting) {
      requestAnimationFrame(() => {
        menu.teardownListeners()
        // An anchor scrolled out of view shouldn't leave an orphaned menu.
        if (menu.isOpen) menu.close()
      })
    }
  }
}

const lazyObserver: IntersectionObserver | null =
  typeof IntersectionObserver !== 'undefined'
    ? new IntersectionObserver(handleIntersection, { root: null, rootMargin: '0px', threshold: 0 })
    : null

export class AMenuElement extends HTMLElementBase {
  static observedAttributes = ['placement', 'context', 'coord', 'offset', 'hover']

  /** Shadow-internal popover surface — the only thing we ever mutate. */
  surface!: HTMLDivElement

  listening = false
  private _shown = false
  private teardown?: () => void

  // Submenu hover-intent timers.
  private openTimer?: ReturnType<typeof setTimeout>
  private closeTimer?: ReturnType<typeof setTimeout>

  // Typeahead state (root navigation).
  private typeBuffer = ''
  private typeTimer?: ReturnType<typeof setTimeout>

  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = `
      :host { display: contents; }

      /* The shadow root holds exactly one element — this surface div (with a
         <slot> inside) — so a bare tag selector is unambiguous; no class
         needed. Slotted light-DOM content isn't matched by shadow selectors. */
      div {
        position: fixed;
        left: 0;
        top: 0;
        margin: 0;
        box-sizing: border-box;
        /* Do NOT set display here. Author styles beat the UA popover rule
           (\`[popover]:not(:popover-open){display:none}\`) regardless of
           specificity, so an unconditional \`display:flex\` would keep a CLOSED
           popover laid out in the top layer — invisible (opacity 0) but still
           hoverable/clickable. Set display only on the open state and let the
           UA hide it when closed. */
        flex-direction: column;
        gap: 1px;
        min-width: var(--menu-min-width, 88px);
        max-width: calc(100vw - ${2 * MARGIN}px);
        max-height: calc(100dvh - ${2 * MARGIN}px);
        overflow-y: auto;
        overscroll-behavior: contain;
        scrollbar-width: thin;
        padding: var(--menu-padding, 4px);
        background: var(--menu-bg, Canvas);
        color: var(--text-2, CanvasText);
        border: var(--menu-border, 1px solid);
        border-radius: var(--menu-radius, 8px);
        box-shadow: var(--menu-shadow, 0 8px 24px rgba(0,0,0,0.2));
        -webkit-backdrop-filter: var(--menu-backdrop-filter, blur(20px));
        backdrop-filter: var(--menu-backdrop-filter, blur(20px));
        outline: none;
      }
      /* Open state. Closed → the UA's \`[popover]:not(:popover-open){display:none}\`
         governs (so a closed menu is truly gone — not interactive). A keyframe
         enter-fade is used instead of a transition + \`allow-discrete\`: the
         latter proved fragile here (it could leave the surface stuck at
         display:flex / opacity 0 after close). The fade starts at opacity 0, so
         the first paint (before position() sets the transform) is invisible. */
      div:popover-open {
        display: flex;
        animation: a-menu-enter 80ms ease-out;
      }
      @keyframes a-menu-enter { from { opacity: 0; } }
    `
    this.surface = document.createElement('div')
    this.surface.setAttribute('popover', 'manual')
    this.surface.append(document.createElement('slot'))

    // Keep an open submenu alive while the pointer is inside it.
    this.surface.addEventListener('mouseenter', () => {
      if (this.isSubmenu) this.cancelCloseTimer()
    })
    this.surface.addEventListener('mouseleave', () => {
      if (this.isSubmenu && this.isHover) this.scheduleClose()
    })

    // Single delegated click for activation + the close contract.
    this.surface.addEventListener('click', this.onSurfaceClick)

    shadow.append(style, this.surface)
  }

  connectedCallback() {
    const anchor = this.triggerAnchor
    if (!anchor) return
    anchorToMenu.set(anchor, this)
    lazyObserver?.observe(anchor)
  }

  disconnectedCallback() {
    this.close()
    this.teardownListeners()
    this.cancelOpenTimer()
    this.cancelCloseTimer()
    const anchor = this.triggerAnchor
    if (anchor && anchorToMenu.get(anchor) === this) {
      anchorToMenu.delete(anchor)
      lazyObserver?.unobserve(anchor)
    }
  }

  attributeChangedCallback() {
    // Trigger-shaping attributes changed — rewire the anchor listeners.
    if (this.listening) {
      this.teardownListeners()
      this.setupListeners()
    }
  }

  /* --- realm-correct window / document (iframe playground safety) --- */
  private get view(): Window & typeof globalThis {
    return (this.ownerDocument?.defaultView as Window & typeof globalThis) ?? window
  }
  private get doc(): Document {
    return this.ownerDocument ?? document
  }

  /* --- config getters --- */
  get isSubmenu(): boolean {
    return this.hasAttribute('submenu')
  }
  private get isContext(): boolean {
    return this.hasAttribute('context')
  }
  private get isCoord(): boolean {
    return this.hasAttribute('coord')
  }
  private get isHover(): boolean {
    return this.hasAttribute('hover')
  }
  private get offset(): number {
    const n = parseInt(this.getAttribute('offset') ?? '', 10)
    return Number.isFinite(n) ? n : MARGIN
  }
  private get placement(): Placement {
    const p = this.getAttribute('placement')
    if (p === 'bottom-end' || p === 'top-start' || p === 'top-end') return p
    return 'bottom-start'
  }

  /** Root menu: the previous element sibling is the trigger. Submenu: the
   *  enclosing menu item. One deterministic rule per case — no ambiguity. */
  get triggerAnchor(): HTMLElement | null {
    if (this.isSubmenu) return this.closest('a-menu-item') as HTMLElement | null
    return this.previousElementSibling as HTMLElement | null
  }

  /** For a submenu: the menu that contains its anchor item. */
  private get ownerMenu(): AMenuElement | null {
    if (!this.isSubmenu) return null
    return (this.triggerAnchor?.closest('a-menu') as AMenuElement | null) ?? null
  }

  get isOpen(): boolean {
    return this._shown
  }

  /* --- focusable items belonging to THIS menu (not nested submenus) --- */
  /** Skip elements that can't actually take focus — `display:none` (incl. a
   *  closed submenu's contents), `visibility:hidden`, `content-visibility`
   *  skipped — so navigation never lands on a hidden node (programmatic
   *  `.focus()` on one silently fails). `getClientRects` is the fallback where
   *  `checkVisibility` isn't available. */
  private isVisible(el: HTMLElement): boolean {
    const check = (el as any).checkVisibility as
      | ((opts?: { visibilityProperty?: boolean; contentVisibilityAuto?: boolean }) => boolean)
      | undefined
    if (typeof check === 'function') {
      return check.call(el, { visibilityProperty: true, contentVisibilityAuto: true })
    }
    return el.getClientRects().length > 0
  }

  private focusableItems(): AMenuItemElement[] {
    return (Array.from(this.querySelectorAll('a-menu-item')) as AMenuItemElement[]).filter(
      (it) => it.closest('a-menu') === this && !it.hasAttribute('disabled') && this.isVisible(it),
    )
  }

  /** Every tabbable element belonging to THIS menu (items + nested controls
   *  like inputs / sliders / buttons), in DOM order, visible and enabled —
   *  used to trap Tab within the open menu. Submenu contents are excluded
   *  (their nearest `a-menu` is the submenu). */
  private focusables(): HTMLElement[] {
    const sel =
      'a-menu-item, a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]),' +
      ' select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    return (Array.from(this.querySelectorAll(sel)) as HTMLElement[]).filter(
      (el) =>
        el.closest('a-menu') === this && !el.hasAttribute('disabled') && this.isVisible(el),
    )
  }

  private focusFirstItem() {
    this.focusableItems()[0]?.focus()
  }

  /* ============================ open / close ============================ */

  /** Public imperative API. */
  open(opts?: { coord?: [number, number]; viaKeyboard?: boolean; originEvent?: Event }) {
    this.show(opts?.coord, opts?.viaKeyboard, opts?.originEvent)
  }
  close() {
    this.hide()
  }
  toggle(opts?: { coord?: [number, number]; viaKeyboard?: boolean; originEvent?: Event }) {
    if (this._shown) this.hide()
    else this.open(opts)
  }

  private show(coord?: [number, number], viaKeyboard = false, originEvent?: Event) {
    if (this.isSubmenu) {
      // Collapse any deeper menus opened from sibling items.
      const parent = this.ownerMenu
      if (parent) {
        const pidx = openStack.indexOf(parent)
        if (pidx !== -1) {
          for (let i = openStack.length - 1; i > pidx; i--) openStack[i]._doHide()
          openStack.length = pidx + 1
        }
      }
    } else {
      // Root menu: a fresh root closes any other open menu system entirely.
      closeAll()
    }

    if (openStack.includes(this)) {
      // Already open — just reposition (e.g. a context re-trigger).
      this.position(coord)
      return
    }

    const wasEmpty = openStack.length === 0
    // Opening atop an already-open menu (a submenu over its parent, or a
    // sibling submenu) appears INSTANTLY — the enter-fade reads as a blink next
    // to the static menu already on screen. A fresh root menu still fades in.
    this._doShow(coord, !wasEmpty)
    openStack.push(this)
    if (wasEmpty) bindDocListeners(this.doc, this.view)

    if (viaKeyboard) this.focusFirstItem()
    this.dispatchEvent(new CustomEvent<OpenDetail>('open', { detail: { coord, originEvent } }))
  }

  private hide(originEvent?: Event) {
    const idx = openStack.indexOf(this)
    if (idx === -1) {
      if (this._shown) this._doHide()
      return
    }
    // Close this menu and everything stacked above it (its submenus), top-down.
    for (let i = openStack.length - 1; i >= idx; i--) openStack[i]._doHide()
    openStack.length = idx
    if (openStack.length === 0) unbindDocListeners()
    this.dispatchEvent(new CustomEvent<OpenDetail>('close', { detail: { originEvent } }))
  }

  /** Shadow-only show: open the popover and position it. `instant` skips the
   *  enter-fade and positions synchronously, so a menu opening over an
   *  already-visible one snaps in without a blink. */
  _doShow(coord?: [number, number], instant = false) {
    if (this.surface.isConnected && !this._shown) this.surface.showPopover()
    this._shown = true
    // animation: none → no fade (opacity rests at 1); '' → restore the CSS
    // enter-fade. Shadow-internal style only, so it's worker-safe.
    this.surface.style.animation = instant ? 'none' : ''
    this.position(coord, instant)
  }

  /** Shadow-only hide. */
  _doHide() {
    if (this.surface.isConnected && this._shown) this.surface.hidePopover()
    this._shown = false
    this.cancelOpenTimer()
    this.cancelCloseTimer()
  }

  /* ============================ positioning ============================ */

  private position(coord?: [number, number], sync = false) {
    const run = () => {
      if (!this._shown) return
      const view = this.view
      const vw = view.innerWidth
      const vh = view.innerHeight
      const surface = this.surface

      let left = MARGIN
      let top = MARGIN

      if (coord) {
        surface.style.maxHeight = `${Math.max(MIN_HEIGHT, vh - 2 * MARGIN)}px`
        const box = surface.getBoundingClientRect()
        left = coord[0]
        if (left + box.width > vw - MARGIN) left = vw - box.width - MARGIN
        left = Math.max(MARGIN, left)
        top = coord[1]
        if (top + box.height > vh - MARGIN) top = top - box.height
        top = Math.max(MARGIN, top)
      } else if (this.isSubmenu) {
        const it = this.triggerAnchor?.getBoundingClientRect()
        if (!it) return
        surface.style.maxHeight = `${Math.max(MIN_HEIGHT, vh - 2 * MARGIN)}px`
        const box = surface.getBoundingClientRect()
        left = it.right + this.offset
        if (left + box.width > vw - MARGIN) {
          // Flip to the left of the parent item.
          left = it.left - box.width - this.offset
        }
        left = Math.max(MARGIN, left)
        top = it.top - MARGIN
        if (top + box.height > vh - MARGIN) top = vh - box.height - MARGIN
        top = Math.max(MARGIN, top)
      } else {
        const a = this.triggerAnchor?.getBoundingClientRect()
        if (!a) return
        const p = this.placement
        const spaceBelow = vh - a.bottom - 2 * MARGIN
        const spaceAbove = a.top - 2 * MARGIN

        // Decide the vertical side: honor the placement, flip if the preferred
        // side lacks room and the other side has more.
        let onTop = p.startsWith('top')
        const natural = surface.scrollHeight
        if (onTop && spaceAbove < natural && spaceBelow > spaceAbove) onTop = false
        else if (!onTop && spaceBelow < natural && spaceAbove > spaceBelow) onTop = true

        // Cap the surface to the chosen side's space (it scrolls if taller).
        const space = onTop ? spaceAbove : spaceBelow
        surface.style.maxHeight = `${Math.max(MIN_HEIGHT, Math.floor(space))}px`

        const box = surface.getBoundingClientRect()
        // Cross axis: -start aligns left edges, -end aligns right edges.
        left = p.endsWith('end') ? a.right - box.width : a.left
        if (left + box.width > vw - MARGIN) left = vw - box.width - MARGIN
        left = Math.max(MARGIN, left)

        top = onTop ? a.top - box.height - this.offset : a.bottom + this.offset
        top = Math.max(MARGIN, top)
      }

      surface.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`
    }
    // Sync (instant open atop an already-open menu) avoids both the rAF delay
    // and the unpositioned first frame; otherwise position next frame.
    if (sync) run()
    else requestAnimationFrame(run)
  }

  /* ====================== click / close contract ====================== */

  /**
   * Fully declarative close contract — decided synchronously from the DOM, so
   * it never depends on the consumer's click handler (which in a worker-thread
   * runtime can't `preventDefault` on the UI thread). The menu never
   * stops/prevents the click, so the consumer's selection handler always runs.
   *
   * Walk the click's composedPath outward to the surface; the NEAREST marker
   * wins:
   *   - `data-menu-open`  → keep the menu open (a Done button can still close
   *                          from inside such a region — it's hit first).
   *   - `a-menu-item` (a choice) or `data-menu-close` → close the menu.
   *   - nothing → keep open (plain custom content doesn't dismiss).
   */
  private onSurfaceClick = (e: MouseEvent) => {
    for (const node of e.composedPath()) {
      if (node === this.surface) break // reached the menu boundary
      if (!(node instanceof Element)) continue

      // Nearest `data-menu-open` keeps it open (replaces the legacy
      // `data-popover-stay`; put it on an item, a group, or any container).
      if (node.hasAttribute('data-menu-open')) return

      if (node instanceof AMenuItemElement) {
        if (node.hasAttribute('disabled')) {
          e.preventDefault()
          return
        }
        // Submenu parent → its own handler opens the submenu; don't close.
        if (node.hasAttribute('submenu')) return
        // Checkbox / radio items toggle in place — implicit keep-open.
        const role = node.getAttribute('role')
        if (role === 'menuitemcheckbox' || role === 'menuitemradio') return
        return this.closeSystem(e)
      }

      // Custom content opts into closing with `data-menu-close`.
      if (node.hasAttribute('data-menu-close')) return this.closeSystem(e)
    }
    // No marker in the path → plain content, stay open.
  }

  /** Close the whole open menu system from the root down. */
  private closeSystem(e?: Event) {
    const root = openStack[0] ?? this
    root.hide(e)
  }

  /* ============================ keyboard ============================ */

  /** Called by the coordinator on the topmost open menu. Handles navigation;
   *  Enter / Space activation is handled by a-menu-item's own global keydown
   *  (which synthesizes a click → routed through onSurfaceClick). */
  handleKey(e: KeyboardEvent) {
    const active = this.doc.activeElement as HTMLElement | null

    // Escape always closes the topmost menu, wherever focus is inside it.
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      const anchor = this.triggerAnchor
      this.hide(e)
      anchor?.focus()
      return
    }

    // Trap Tab within the open menu: a non-modal popover doesn't contain focus,
    // so native Tab would walk out the back while the menu is still open. Move
    // focus among ALL of this menu's focusables (items + nested controls),
    // wrapping at the ends so it never escapes.
    if (e.key === 'Tab') {
      const f = this.focusables()
      if (!f.length) return
      e.preventDefault()
      const i = active ? f.indexOf(active) : -1
      const next = e.shiftKey
        ? i <= 0
          ? f.length - 1
          : i - 1
        : i === -1 || i === f.length - 1
          ? 0
          : i + 1
      f[next]?.focus()
      return
    }

    // Arrow / Home / End / type-ahead drive the item cursor — but only while
    // focus is on a menu item (or still outside, entering via ArrowDown). If
    // the user has Tabbed onto a NESTED control in this menu (input, slider,
    // button), hand the keys back to it.
    const within = active?.closest('a-menu') === this
    if (within && !(active instanceof AMenuItemElement)) return

    const items = this.focusableItems()
    const idx = active ? items.indexOf(active as AMenuItemElement) : -1

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        items[idx < 0 ? 0 : (idx + 1) % items.length]?.focus()
        break
      case 'ArrowUp':
        e.preventDefault()
        items[idx <= 0 ? items.length - 1 : idx - 1]?.focus()
        break
      case 'Home':
        e.preventDefault()
        items[0]?.focus()
        break
      case 'End':
        e.preventDefault()
        items[items.length - 1]?.focus()
        break
      case 'ArrowRight': {
        const sub = this.submenuOf(active)
        if (sub) {
          e.preventDefault()
          sub.show(undefined, true)
        }
        break
      }
      case 'ArrowLeft':
        if (this.isSubmenu) {
          e.preventDefault()
          const anchorItem = this.triggerAnchor
          this.hide(e)
          anchorItem?.focus()
        }
        break
      default:
        if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
          this.typeahead(e.key, items)
        }
    }
  }

  private submenuOf(item: HTMLElement | null): AMenuElement | null {
    if (!item || !(item instanceof AMenuItemElement) || !item.hasAttribute('submenu')) return null
    return item.querySelector('a-menu') as AMenuElement | null
  }

  private typeahead(ch: string, items: AMenuItemElement[]) {
    this.typeBuffer += ch.toLowerCase()
    clearTimeout(this.typeTimer)
    this.typeTimer = setTimeout(() => (this.typeBuffer = ''), TYPEAHEAD_RESET)
    const match = items.find((it) => (it.textContent ?? '').trim().toLowerCase().startsWith(this.typeBuffer))
    match?.focus()
  }

  /* ====================== trigger listener wiring ====================== */

  setupListeners() {
    if (this.listening) return
    const anchor = this.triggerAnchor
    if (!anchor) {
      this.listening = true
      return
    }

    if (this.isSubmenu) {
      // The enclosing item drives the submenu: click toggles; optional hover
      // opens/closes with intent timing.
      const onClick = () => this.toggle()
      anchor.addEventListener('click', onClick)
      let onEnter: ((e: Event) => void) | undefined
      let onLeave: (() => void) | undefined
      if (this.isHover) {
        onEnter = () => this.scheduleOpen()
        onLeave = () => this.scheduleClose()
        anchor.addEventListener('mouseenter', onEnter)
        anchor.addEventListener('mouseleave', onLeave)
      }
      this.teardown = () => {
        anchor.removeEventListener('click', onClick)
        if (onEnter) anchor.removeEventListener('mouseenter', onEnter)
        if (onLeave) anchor.removeEventListener('mouseleave', onLeave)
        this.listening = false
      }
    } else if (this.isContext) {
      const onContext = (e: MouseEvent) => {
        e.preventDefault()
        this.show([e.clientX, e.clientY], false, e)
      }
      anchor.addEventListener('contextmenu', onContext)
      this.teardown = () => {
        anchor.removeEventListener('contextmenu', onContext)
        this.listening = false
      }
    } else {
      const onClick = (e: MouseEvent) => {
        // detail === 0 ⇒ keyboard-synthesized click (Enter/Space on the
        // trigger) ⇒ open and move focus to the first item.
        const viaKeyboard = e.detail === 0
        const coord = this.isCoord ? ([e.clientX, e.clientY] as [number, number]) : undefined
        if (this._shown) this.hide(e)
        else this.show(coord, viaKeyboard, e)
      }
      anchor.addEventListener('click', onClick)
      this.teardown = () => {
        anchor.removeEventListener('click', onClick)
        this.listening = false
      }
    }

    this.listening = true
  }

  teardownListeners() {
    this.teardown?.()
    this.teardown = undefined
  }

  /* --- submenu hover-intent timers --- */
  private scheduleOpen() {
    this.cancelCloseTimer()
    if (this._shown) return
    this.cancelOpenTimer()
    this.openTimer = setTimeout(() => {
      this.openTimer = undefined
      this.show()
    }, SUBMENU_OPEN_DELAY)
  }
  private scheduleClose() {
    this.cancelOpenTimer()
    if (!this._shown) return
    this.cancelCloseTimer()
    this.closeTimer = setTimeout(() => {
      this.closeTimer = undefined
      this.hide()
    }, SUBMENU_CLOSE_DELAY)
  }
  private cancelOpenTimer() {
    if (this.openTimer !== undefined) {
      clearTimeout(this.openTimer)
      this.openTimer = undefined
    }
  }
  private cancelCloseTimer() {
    if (this.closeTimer !== undefined) {
      clearTimeout(this.closeTimer)
      this.closeTimer = undefined
    }
  }
}

export function register_a_menu() {
  if (typeof customElements === 'undefined') return
  if (!customElements.get('a-menu')) {
    customElements.define('a-menu', AMenuElement)
  }
}

// Importing this module registers the element (granular entry point). The
// barrel re-exports it, so importing the barrel registers it too. Idempotent.
register_a_menu()
