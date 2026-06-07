import type { BaseAttributes } from '@antadesign/anta/general_types'

/**
 * Attributes for the `<a-sticker>` static sticker carrier.
 *
 * The SVG payload is passed as the `svg` attribute — a markup string.
 * On change, the element writes it into its shadow DOM (no light-DOM
 * `<slot>`, so children aren't rendered). The JSX wrapper
 * (`Sticker{Name}`) sets it from the per-sticker module's inlined SVG.
 * Sizing comes from `--sticker-size`.
 */
export interface AStickerAttributes extends BaseAttributes {
  /** SVG markup string. On change the element drops it into its shadow
   *  DOM (`innerHTML`). */
  svg?: string
  role?: string
  'aria-label'?: string
  'aria-hidden'?: 'true' | 'false' | boolean
}

/**
 * Attributes for the `<a-sticker-animated>` Lottie sticker carrier.
 *
 * The Lottie payload is passed as the `animation` attribute — a JSON
 * string. On change the element `JSON.parse`s it once and drives a
 * `lottie-web` player (SVG renderer) inside its shadow DOM. The JSX
 * wrapper (`Sticker{Name}Animated`) sets it from the per-sticker
 * module's inlined JSON. Sizing comes from the `--sticker-size` CSS
 * variable; `paused` controls playback.
 */
export interface AStickerAnimatedAttributes extends BaseAttributes {
  /** Lottie payload as a JSON string. The element parses it once on
   *  change. */
  animation?: string
  /** Present (any string value, including `""`) freezes the animation.
   *  A numeric string is parsed as seconds and the player seeks to
   *  that time before pausing. Omit to play. */
  paused?: string | boolean | number
  role?: string
  'aria-label'?: string
  'aria-hidden'?: 'true' | 'false' | boolean
}

// Teach anta's JSX runtime about this package's two custom-element tags.
// anta itself ships no sticker code; these intrinsics live here so the
// wrappers (and consumers authoring raw `<a-sticker>` JSX) type-check.
declare module '@antadesign/anta/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      'a-sticker': AStickerAttributes
      'a-sticker-animated': AStickerAnimatedAttributes
    }
  }
}
