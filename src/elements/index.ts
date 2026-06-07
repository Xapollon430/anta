/**
 * Barrel: registers ALL Anta custom elements (the convenience path).
 *
 * Each `a-{name}` module self-registers and imports its own CSS when loaded,
 * so re-exporting them here (which evaluates each module) registers the whole
 * set + injects every element's CSS. Importing this barrel for side effects —
 * `import '@antadesign/anta/elements'` — gives you everything.
 *
 * For a SMALLER footprint, import just the element(s) you use instead:
 *   import '@antadesign/anta/elements/a-tooltip'   // registers a-tooltip + its CSS, nothing else
 * That granular path pulls in only that element's code and CSS, nothing else.
 *
 * Must only be imported client-side — registration is guarded against missing
 * `customElements` (SSR), but there's no reason to load it server-side.
 */
export { AProgressElement, register_a_progress } from './a-progress'
export { ATextElement, register_a_text } from './a-text'
export { AIconElement, register_a_icon } from './a-icon'
export { AButtonElement, register_a_button } from './a-button'
export { ATooltipElement, register_a_tooltip } from './a-tooltip'

// `a-title` is a CSS-only styled tag (no JS / no element module), so its
// styles can't ride along on a module import — load them here directly.
import './a-title.css'
