/**
 * @antadesign/anta — Antithesis Design System
 *
 * Portable UI components with web component internals and JSX wrappers.
 * Works with React, Preact (via compat or `configure()`), or any custom JSX runtime.
 *
 * Import components from this entry point:
 * ```ts
 * import { Progress } from '@antadesign/anta'
 * ```
 *
 * Register custom elements (client-side only):
 * ```ts
 * import '@antadesign/anta/elements'
 * ```
 *
 * @packageDocumentation
 */
export { Progress } from './components/Progress'
export type { ProgressProps } from './components/Progress'
export { Text } from './components/Text'
export type { TextProps } from './components/Text'
export { Title } from './components/Title'
export type { TitleProps } from './components/Title'
export { Tag } from './components/Tag'
export type { TagProps } from './components/Tag'
export { Icon } from './components/Icon'
export type { IconProps } from './components/Icon'
export { Button } from './components/Button'
export type {
  ButtonProps,
  BaseButtonProps,
  ContentMode,
  SubmitMode,
  PriorityMode,
} from './components/Button'
export { ICON_SHAPES, ICON_SYNONYMS } from './elements/a-icon.shapes'
export { Tooltip } from './components/Tooltip'
export type { TooltipProps } from './components/Tooltip'
export { Menu } from './components/Menu'
export type { MenuProps } from './components/Menu'
export { MenuItem } from './components/MenuItem'
export type { MenuItemProps } from './components/MenuItem'
export { MenuSeparator } from './components/MenuSeparator'
export type { MenuSeparatorProps } from './components/MenuSeparator'
export { MenuGroup } from './components/MenuGroup'
export type { MenuGroupProps } from './components/MenuGroup'
export type { BaseProps, BaseAttributes } from './general_types'
export { configure } from './jsx-runtime'

/**
 * Seed interface for the icon shape registry. The generated
 * `a-icon.shapes.d.ts` augments this interface with one key per
 * available shape; consumers can do the same with their own generated
 * .d.ts files (TypeScript merges them by interface name).
 */
export interface IconShapes {}
export type IconShape = keyof IconShapes
