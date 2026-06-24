import type { BaseProps } from '../general_types'
import type { IconShape } from '../elements/a-icon.shapes'

export interface MenuItemProps extends BaseProps {
  /** Leading icon shape. */
  icon?: IconShape
  /** The item's text. Omit and pass `children` for richer content. */
  label?: string
  /** A trailing keyboard-shortcut hint, e.g. `"⌘E"`. */
  kbd?: string
  /** A trailing icon (ignored when `submenu` is set — the chevron takes its
   *  place). */
  iconTrailing?: IconShape
  /** Disable the item: greyed out, not focusable for activation, no close. */
  disabled?: boolean
  /** Semantic tone — colors the label, icon, and hover tint. `critical` is the
   *  destructive action; `neutral` (the default) is the standard gray.
   *  @defaultValue neutral */
  tone?: 'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'critical'
  /** Marks this item as a submenu parent: adds the trailing chevron,
   *  `aria-haspopup="menu"`, and an `aria-expanded` baseline (kept in sync by
   *  the nested menu). Nest the flyout as a `<Menu>` child. */
  submenu?: boolean
  /** Convenience activation handler — fires on click / Enter / Space unless
   *  the item is disabled. (Mapped to the underlying click.) */
  onSelect?: (e: any) => void
  /** Item content. With `label` set, children are extra content — most
   *  notably the nested `<Menu>` for a submenu parent. */
  children?: React.ReactNode
}

/**
 * MenuItem — a single selectable row inside a `Menu`. Composes a leading
 * `icon`, a `label` (or `children`), an optional trailing `kbd` hint, and an
 * optional trailing icon. For a submenu, set `submenu` and nest a
 * `<Menu>` as a child — a chevron is added automatically.
 *
 * Selecting an item closes the menu; add `data-menu-open` to keep it open
 * (toggles / multi-select) — it forwards to the element.
 *
 * @example
 * ```tsx
 * <MenuItem icon="copy" label="Duplicate" kbd="⌘D" onSelect={dup} />
 * <MenuItem label="Word wrap" data-menu-open onSelect={toggleWrap} />
 * <MenuItem label="Share" submenu>
 *   <Menu hover>
 *     <MenuItem label="Copy link" onSelect={copyLink} />
 *   </Menu>
 * </MenuItem>
 * ```
 */
export const MenuItem = ({
  icon,
  label,
  kbd,
  iconTrailing,
  disabled,
  tone,
  submenu,
  onSelect,
  className,
  children,
  ...rest
}: MenuItemProps) => {
  return (
    <a-menu-item
      role="menuitem"
      tabIndex={0}
      disabled={disabled ? '' : undefined}
      // 'neutral' is the implicit default — emit no DOM attribute.
      tone={tone && tone !== 'neutral' ? tone : undefined}
      submenu={submenu ? '' : undefined}
      aria-haspopup={submenu ? 'menu' : undefined}
      // Resting baseline; the nested submenu's a-menu element reflects the
      // live open state onto this attribute (it owns that state).
      aria-expanded={submenu ? 'false' : undefined}
      aria-disabled={disabled ? 'true' : undefined}
      onClick={disabled ? undefined : onSelect}
      class={className}
      {...rest}
    >
      {icon && <a-icon shape={icon} aria-hidden="true" />}
      {label != null && <a-menu-item-label>{label}</a-menu-item-label>}
      {kbd && <kbd>{kbd}</kbd>}
      {submenu ? (
        <a-icon shape="chevron-right" aria-hidden="true" />
      ) : (
        iconTrailing && <a-icon shape={iconTrailing} aria-hidden="true" />
      )}
      {children}
    </a-menu-item>
  )
}
