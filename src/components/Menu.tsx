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
  /** The menu's contents: `MenuItem`, `MenuSeparator`, `MenuGroup`, or any
   *  custom element. */
  children?: React.ReactNode
}

/**
 * Menu — a dropdown / context menu that anchors to any target and "just
 * works". Place `<Menu>` immediately after the trigger element (a button,
 * say); it opens on click by default. For a whole-area right-click menu, put
 * it after the region and pass `context`.
 *
 * Open state is uncontrolled. Listen for the `open` / `close` events, or grab
 * a `ref` to the `<a-menu>` element and call `.open()` / `.close()` /
 * `.toggle()` for imperative control. Selecting a `MenuItem` closes the menu;
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
      role="menu"
      aria-orientation="vertical"
      class={className}
      {...rest}
    >
      {children}
    </a-menu>
  )
}
