import type { BaseProps } from '../general_types'

export interface MenuProps extends BaseProps {
  /** Preferred placement relative to the trigger. The cross-axis suffix
   *  (`-start` / `-end`) aligns the left / right edges; the menu auto-flips
   *  vertically and clamps horizontally when there isn't room.
   *  @defaultValue bottom-start */
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'
  /** Open on right-click (the `contextmenu` event) of the trigger region
   *  instead of a left click, positioned at the pointer. */
  context?: boolean
  /** Open at the pointer coordinates rather than aligned to the trigger box.
   *  Pairs naturally with `context`; on its own it positions a left-click
   *  menu at the cursor. */
  coord?: boolean
  /** Marks this menu as a submenu of the enclosing `MenuItem`. Set by passing
   *  it as a `MenuItem`'s `submenu`; rarely written by hand. */
  submenu?: boolean
  /** For a submenu: also open it on hover (with intent timing), not only on
   *  click. No effect on a root menu. */
  hover?: boolean
  /** Gap in pixels between the trigger and the menu.
   *  @defaultValue 4 */
  offset?: number
  /** Controlled open state. Omit for the default **uncontrolled** menu (it
   *  opens/closes itself). Pass `'opened'` / `'closed'` to **control** it: the
   *  menu's visibility follows this value, and user dismiss (Esc, outside-click,
   *  select) fires `openchange` *without* self-closing — you update `state` in
   *  response. A string (not a boolean) so there's no `"false"`-as-truthy
   *  footgun. Submenus are always uncontrolled regardless of this. */
  state?: 'opened' | 'closed'
  /** Fired whenever the open state changes — on open, and on every dismiss
   *  (Esc, outside-click, scroll, selecting an item). `open` is the new state.
   *  This is the declarative way to observe a menu, and the handler you pair
   *  with `state` to drive a controlled menu (flip `state` in response). */
  onOpenChange?: (open: boolean) => void
  /** The menu's contents: `MenuItem`, `MenuSeparator`, `MenuGroup`, or any
   *  custom element. */
  children?: React.ReactNode
}

/** The element's `openchange` event payload. */
type OpenChangeEvent = CustomEvent<{ open: boolean }>

/** Pull the new open state out of the element's `openchange` event, across
 *  renderers: a raw `CustomEvent` carries `detail` directly; a synthetic
 *  wrapper carries it on `nativeEvent.detail`. */
function openChanged(e: OpenChangeEvent | { nativeEvent: OpenChangeEvent }): boolean {
  const detail =
    ('nativeEvent' in e ? e.nativeEvent?.detail : undefined) ??
    ('detail' in e ? e.detail : undefined)
  return !!detail?.open
}

/**
 * Menu — a dropdown / context menu that anchors to any target and "just
 * works". Place `<Menu>` immediately after the trigger element (a button,
 * say); it opens on click by default. For a whole-area right-click menu, put
 * it after the region and pass `context`.
 *
 * Open state is uncontrolled by default — listen for the `openchange` event
 * (`detail: { open, previousState }`) to observe it, or pass `state` to control
 * it. You can also grab a `ref` and call `.open()` / `.close()` / `.toggle()`.
 * Selecting a `MenuItem` closes the menu;
 * arbitrary injected content does not. Add `data-menu-open` to any item /
 * container to keep it open, or `data-menu-close` to a custom element to let it
 * close.
 *
 * Requires `@antadesign/anta/elements` to be imported (client-side only).
 *
 * @example Dropdown from a button
 * ```tsx
 * <a-button>Actions</a-button>
 * <Menu>
 *   <MenuItem icon="edit" label="Edit" kbd="⌘E" onSelect={onEdit} />
 *   <MenuSeparator />
 *   <MenuItem tone="critical" icon="trash" label="Delete" onSelect={onDelete} />
 * </Menu>
 * ```
 */
export const Menu = ({
  placement,
  context,
  coord,
  submenu,
  hover,
  offset,
  state,
  onOpenChange,
  className,
  children,
  ...rest
}: MenuProps) => {
  return (
    <a-menu
      // 'bottom-start' is the implicit default — emit no DOM attribute.
      placement={placement && placement !== 'bottom-start' ? placement : undefined}
      context={context ? '' : undefined}
      coord={coord ? '' : undefined}
      submenu={submenu ? '' : undefined}
      hover={hover ? '' : undefined}
      offset={offset != null ? String(offset) : undefined}
      // Controlled lever — string ('opened'/'closed'); omit ⇒ uncontrolled.
      state={state}
      // All-lowercase `onopenchange` is the one event-prop spelling both React
      // and Preact bind to a custom element's custom event (they lowercase
      // whatever follows `on`, so `onOpenChange` would listen for "OpenChange").
      onopenchange={onOpenChange ? (e: OpenChangeEvent) => onOpenChange(openChanged(e)) : undefined}
      role="menu"
      aria-orientation="vertical"
      class={className}
      {...rest}
    >
      {children}
    </a-menu>
  )
}
