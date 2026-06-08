import type { BaseProps } from '../general_types'

export interface MenuGroupProps extends BaseProps {
  /** The section heading shown above the grouped items (also the group's
   *  accessible name). */
  label?: string
  /** Keep the menu open after any item in this group is chosen. */
  keepOpen?: boolean
  /** The grouped `MenuItem`s. */
  children?: React.ReactNode
}

/**
 * MenuGroup — a titled section that organises related `MenuItem`s. Keyboard
 * navigation flattens items across groups, skipping the heading.
 *
 * @example
 * ```tsx
 * <MenuGroup label="Edit">
 *   <MenuItem icon="copy" label="Copy" />
 *   <MenuItem icon="cut" label="Cut" />
 * </MenuGroup>
 * ```
 */
export const MenuGroup = ({ label, keepOpen, className, children, ...rest }: MenuGroupProps) => {
  return (
    <a-menu-group
      role="group"
      aria-label={label}
      keep-open={keepOpen ? '' : undefined}
      class={className}
      {...rest}
    >
      {label != null && <a-menu-group-label aria-hidden="true">{label}</a-menu-group-label>}
      {children}
    </a-menu-group>
  )
}
