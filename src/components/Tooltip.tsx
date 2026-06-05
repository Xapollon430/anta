import type { BaseProps } from "../general_types"

export interface TooltipProps extends BaseProps {
  /** Tooltip content. Renders anything — text, markup, an icon + text.
   *  Lives in the light DOM, so it's styleable with your own plain CSS. */
  children?: React.ReactNode
  /** Show delay in milliseconds after hover / focus. Never use `0` — use
   *  ~`50` for a near-instant tooltip (0 has caused issues in practice).
   *  @defaultValue 250 */
  delay?: number
  /** Which side of the anchor the bubble prefers. Auto-flips to the other
   *  side when there isn't room.
   *  @defaultValue bottom */
  placement?: 'top' | 'bottom'
  /** Pin the bubble under the anchor instead of following the cursor. */
  static?: boolean
  /** Make the bubble hoverable and clickable — enables pointer events and
   *  keeps it open while the cursor is over it, so its content (links,
   *  buttons) can be interacted with. Implies `static` (an interactive
   *  bubble can't follow the cursor). */
  interactive?: boolean
}

/**
 * Tooltip — a small floating bubble that describes the element it's placed
 * inside. Render `<Tooltip>` as a child of the element it annotates; it
 * doesn't affect that element's layout.
 *
 * Shows on hover (after `delay`) and on keyboard focus; dismisses on mouse
 * leave, blur, Escape, or when the anchor scrolls away. Follows the cursor
 * by default — pass `static` to pin it under the anchor instead.
 *
 * Requires `@antadesign/anta/elements` to be imported (client-side only)
 * to register the underlying custom element.
 *
 * @example Basic usage
 * ```tsx
 * import { Tooltip } from '@antadesign/anta'
 * import '@antadesign/anta/elements'
 *
 * <button>
 *   Save
 *   <Tooltip>Saves your work</Tooltip>
 * </button>
 * ```
 *
 * @example Pinned above, rich content
 * ```tsx
 * <span style={{ cursor: 'help' }}>
 *   Status
 *   <Tooltip placement="top" static>
 *     <strong>Healthy</strong> — last checked 2m ago
 *   </Tooltip>
 * </span>
 * ```
 */
export const Tooltip = ({
  delay,
  placement,
  static: isStatic,
  interactive,
  className,
  children,
  ...rest
}: TooltipProps) => {
  return (
    <a-tooltip
      delay={delay != null ? String(delay) : undefined}
      // 'bottom' is the implicit default — emit no DOM attribute for it.
      placement={placement === 'top' ? 'top' : undefined}
      // Boolean attributes: presence form when on, omitted when off.
      static={isStatic ? '' : undefined}
      interactive={interactive ? '' : undefined}
      class={className}
      {...rest}
    >
      {children}
    </a-tooltip>
  )
}
