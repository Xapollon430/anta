import React from 'react'

type ComponentType = string | Function | symbol

type JsxFunction = {
  h(type: ComponentType, props: Record<string, unknown> | null, ...children: unknown[]): unknown
}['h']

let _jsx: JsxFunction = React.createElement as JsxFunction
let _Fragment: ComponentType = React.Fragment as ComponentType

/**
 * Swap the underlying JSX factory used by all anta components.
 *
 * Not needed for React or Preact-with-compat — those work automatically.
 * Call this before rendering any anta components when using Preact without
 * compat aliasing, or a custom JSX runtime.
 *
 * @example Preact without compat
 * ```ts
 * import { configure } from '@antadesign/anta'
 * import { h, Fragment } from 'preact'
 * configure(h, Fragment)
 * ```
 */
export function configure(jsx: JsxFunction, Fragment?: ComponentType) {
  _jsx = jsx
  if (Fragment !== undefined) _Fragment = Fragment
}

export function jsx(type: ComponentType, props: Record<string, unknown> | null, key?: string | number): unknown {
  const { children, ...rest } = props ?? {}
  const p: Record<string, unknown> = key !== undefined ? { ...rest, key } : rest
  if (children !== undefined) {
    return _jsx(type, p, children)
  }
  return _jsx(type, p)
}

export function jsxs(type: ComponentType, props: Record<string, unknown> | null, key?: string | number): unknown {
  const { children, ...rest } = props ?? {}
  const p: Record<string, unknown> = key !== undefined ? { ...rest, key } : rest
  if (children !== undefined) {
    return _jsx(type, p, ...(children as unknown[]))
  }
  return _jsx(type, p)
}

export { _Fragment as Fragment }

import type { AProgressAttributes, ATextAttributes, ATitleAttributes, ATagAttributes, AExpanderAttributes, AIconAttributes, AButtonAttributes, ACheckboxAttributes, ATooltipAttributes, AInputAttributes, ARadioAttributes, ARadioGroupAttributes, AMenuAttributes, AMenuItemAttributes, AMenuGroupAttributes, BaseAttributes } from './general_types'

// Declared as an `interface` (not a type alias) so downstream companion
// packages — e.g. `@antadesign/stickers` — can augment it with their own
// custom-element tags via `declare module '@antadesign/anta/jsx-runtime'`.
export namespace JSX {
  export interface IntrinsicElements extends React.JSX.IntrinsicElements, AntaIntrinsicElements {}
}

export interface AntaIntrinsicElements {
  'a-progress': AProgressAttributes
  'a-progress-label': BaseAttributes
  'a-progress-number': BaseAttributes
  'a-progress-text': BaseAttributes
  'a-progress-hint': BaseAttributes
  'a-text': ATextAttributes
  'a-title': ATitleAttributes
  'a-tag': ATagAttributes
  'a-tag-label': BaseAttributes
  'a-tag-value': BaseAttributes
  'a-expander': AExpanderAttributes
  'a-expander-summary': BaseAttributes
  'a-expander-details': BaseAttributes
  'a-icon': AIconAttributes
  'a-button': AButtonAttributes
  'a-button-label': BaseAttributes
  'a-checkbox': ACheckboxAttributes
  'a-checkbox-label': BaseAttributes
  'a-checkbox-hint': BaseAttributes
  'a-tooltip': ATooltipAttributes
  'a-input': AInputAttributes
  'a-radio': ARadioAttributes
  'a-radio-group': ARadioGroupAttributes
  'a-radio-group-label': BaseAttributes
  'a-radio-group-hint': BaseAttributes
  'a-radio-list': BaseAttributes
  'a-radio-label': BaseAttributes
  'a-radio-hint': BaseAttributes
  'a-menu': AMenuAttributes
  'a-menu-item': AMenuItemAttributes
  'a-menu-item-label': BaseAttributes
  'a-menu-separator': BaseAttributes
  'a-menu-group': AMenuGroupAttributes
  'a-menu-group-label': BaseAttributes
}
