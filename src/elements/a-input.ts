import { HTMLElementBase } from '../anta_helpers'
import './a-input.css'

/**
 * `<a-input>` — a self-contained text field. The real `<input>` / `<textarea>`
 * lives in this element's **shadow DOM** (the element creates it), so consumers
 * never hand one in. This is Anta's first *stateful, form-associated* element:
 * it participates in native forms via `ElementInternals` and owns its value.
 *
 * Light-DOM composition (what the `<Input>` wrapper emits, or a vanilla author
 * writes by hand) is slot-based, like `<a-expander>`:
 *
 *   <a-input clearable>
 *     <span slot="label">Email</span>
 *     <a-icon slot="leading" shape="mail" />
 *     <a-button slot="trailing" …>     ← e.g. the clear button (wrapper-owned)
 *     <span slot="hint">We never share it.</span>
 *   </a-input>
 *
 * Shadow structure — every node carries a `part` so consumers can reach it
 * without piercing the boundary blindly:
 *
 *   <div class="label" part="label"><slot name="label">    ← display:none until filled
 *   <div class="field" part="field">                        ← the bordered box; :focus-within ring
 *     <slot name="leading" part="leading">
 *     <input|textarea part="input">                         ← created in JS per multiline/rows
 *     <slot name="trailing" part="trailing">
 *   <div class="hint" part="hint"><slot name="hint">       ← message; wrapper slots an error <Icon> here too when [invalid]
 *
 * ## Value — controlled vs uncontrolled (mirrors a native input)
 *
 * - **Uncontrolled**: omit `value`; pass `defaultvalue` for the initial text.
 *   The element owns the value; typing updates it and the form.
 * - **Controlled**: set the `value` attribute and keep it in sync. The element
 *   reflects it to the shadow control *only when it differs* from what's there,
 *   so the caret never jumps mid-edit.
 *
 * ## Events
 *
 * `input` is `composed` so it escapes the shadow on its own — consumers bind it
 * on the host and read `host.value`. `change` is NOT composed, so the element
 * catches the control's `change` and re-dispatches one on the host.
 *
 * ## Declarative-DOM safety
 *
 * Nothing on the *host* is ever mutated from JS (the host may be reconciled off
 * the UI thread). Filled / invalid are surfaced via `ElementInternals` custom
 * states (`:state(filled)`, `:state(invalid)`) — element-internal, not host
 * attributes — purely as styling hooks (the wrapper's clear button shows on
 * `:state(filled)`). All other writes target the shadow control the element
 * created, which is its own sanctioned territory.
 */

// Attributes copied straight through to the shadow control.
const FORWARDED = [
  'placeholder', 'type', 'name', 'autocomplete', 'inputmode',
  'maxlength', 'minlength', 'pattern', 'spellcheck', 'readonly', 'required',
  'min', 'max', 'step',
] as const
// Presence-based among the forwarded set (toggled, not value-copied).
const BOOL_FORWARDED = new Set(['readonly', 'required'])

// Custom event the wrapper's clear button dispatches (via a-button's
// `data-custom-event`); the element listens for it and clears. Works with no
// framework hydration — a-button's global click/keydown listeners fire it.
// All-lowercase so it binds portably as `onclearinput` in React *and* Preact
// (React keeps the case after `on`; Preact lowercases) — same rule as
// `oninput`/`onchange`. It bubbles, so consumers can listen too.
const CLEAR_EVENT = 'clearinput'

const SHADOW_STYLE = `
  /* Suppress any UA focus outline on the host — with delegatesFocus some
     browsers ring the host too; the field's own ring is the single indicator.
     (The inner input/textarea also sets outline:none below.) */
  :host { display: block; outline: none; }

  .label {
    display: none;
    color: var(--a-input-label);
    font-family: var(--sans-serif);
    font-size: 15px;
    line-height: 20px;
    font-weight: 500;
    margin-bottom: 4px;
  }
  .label.has-label { display: block; }

  .field {
    --_bc: var(--a-input-border);
    --_bw: 0.5px;

    display: flex;
    align-items: center;
    box-sizing: border-box;
    min-height: 28px;
    background: var(--a-input-bg);
    border-radius: 4px;
    /* The border is a shadow, not a real border, so it never affects the box
       size: the rest→invalid width change (0.5px→1px) causes no reflow, and the
       height still matches a same-size Button. Drawn inset (inside the box);
       drop the leading \`inset\` to draw it as an outset ring instead. */
    box-shadow: inset 0 0 0 var(--_bw) var(--_bc);
    transition: box-shadow 120ms ease;
  }
  :host([multiline]) .field { align-items: stretch; }
  :host([invalid]) .field { --_bw: 1px; }
  /* Field height by size — matches the same-size Button (24 / 28 / 32). */
  :host([size="small"]) .field { min-height: 24px; }
  :host([size="large"]) .field { min-height: 32px; }

  @media (hover: hover) and (pointer: fine) {
    :host(:not([disabled])) .field:hover { --_bc: var(--a-input-border-hover); }
  }
  /* Ring shows only when the *control* is focused — not when focus is on a
     slotted child like the clear button (that would be :focus-within). The
     clear button keeps its own focus ring. */
  .field:has(input:focus, textarea:focus) {
    --_bc: var(--a-input-border-hover);
    outline: 1px solid var(--a-input-focus);
    outline-offset: 1px;
  }

  /* Only the control carries the horizontal text inset; the edge slots and the
     clear button stay flush to the field edges (no outer padding). */
  input, textarea {
    flex: 1 1 auto;
    min-width: 0;
    width: 100%;
    box-sizing: border-box;
    border: 0;
    margin: 0;
    padding-block: 0;
    padding-inline: 7px;
    background: transparent;
    outline: none;
    color: var(--a-input-text);
    font-family: var(--sans-serif);
    font-feature-settings: 'ss02', 'ss05';
    font-size: 15px;
    line-height: 20px;
    font-weight: 400;
    /* No browser-injected affordances (search clear/magnifier, number spinners,
       reveal/clear in Edge) — Anta owns every in-field control. */
    -webkit-appearance: none;
            appearance: none;
  }
  textarea {
    resize: none;
    padding-block: 4px;
    overflow-y: auto;
  }
  input::placeholder, textarea::placeholder { color: var(--a-input-placeholder); opacity: 1; }
  input:disabled, textarea:disabled { cursor: not-allowed; }
  input::-webkit-search-cancel-button,
  input::-webkit-search-decoration,
  input::-webkit-search-results-button,
  input::-webkit-search-results-decoration,
  input::-webkit-inner-spin-button,
  input::-webkit-outer-spin-button { -webkit-appearance: none; appearance: none; display: none; }
  input::-ms-clear, input::-ms-reveal { display: none; }

  /* Edge slots stay hidden until they hold content (toggled via slotchange) so
     an empty slot reserves neither a box nor a phantom flex gap. They sit flush
     to the field edges. */
  slot[name="leading"], slot[name="trailing"] { display: none; }
  .field.has-leading slot[name="leading"],
  .field.has-trailing slot[name="trailing"] {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }
  .field.has-trailing slot[name="trailing"] { gap: 2px; }
  /* Disabled: slotted leading/trailing content dims and stops taking input
     (pointer-events is inherited, so it reaches the projected nodes). */
  :host([disabled]) slot[name="leading"],
  :host([disabled]) slot[name="trailing"] { opacity: 0.5; pointer-events: none; }

  /* Clear slot — rightmost, flush. The element owns its visibility (shown only
     when filled + editable) in shadow CSS, so it's bundled wherever the element
     is and never depends on wrapper CSS. An empty slot (not clearable) reserves
     no width. */
  slot[name="clear"] { display: none; flex-shrink: 0; }
  .field.is-filled slot[name="clear"] { display: flex; align-items: center; }
  :host([disabled]) slot[name="clear"],
  :host([readonly]) slot[name="clear"] { display: none; }
  :host([multiline]) slot[name="clear"] { align-self: flex-start; }

  /* A leading item is inset from the edge by the same amount as the text's
     padding, so it lines up on the field's left rhythm. The gap from the icon
     to the text is a touch tighter than the edge padding. */
  .field.has-leading slot[name="leading"] { margin-inline-start: 7px; }
  .field.has-leading input,
  .field.has-leading textarea { padding-inline-start: 5px; }
  :host([multiline]) .field.has-leading slot[name="leading"],
  :host([multiline]) .field.has-trailing slot[name="trailing"] {
    align-items: flex-start;
    padding-top: 2px;
  }

  .hint {
    display: none;
    gap: 4px;
    align-items: flex-start;
    margin-top: 4px;
    color: var(--a-input-hint);
    font-family: var(--sans-serif);
    font-size: 15px;
    line-height: 20px;
  }
  .hint.has-hint { display: flex; }
  /* Invalid recolors the whole hint row (message + the wrapper-rendered error
     <Icon>, which paints with currentColor). */
  :host([invalid]) .hint { color: var(--a-input-error-text); }
`

type Control = HTMLInputElement | HTMLTextAreaElement

export class AInputElement extends HTMLElementBase {
  static formAssociated = true
  static observedAttributes = [
    ...FORWARDED, 'value', 'defaultvalue', 'multiline', 'rows', 'maxrows', 'invalid', 'disabled',
  ]

  private internals?: ElementInternals
  private field: HTMLDivElement
  private labelBox: HTMLDivElement
  private hintBox: HTMLDivElement
  private labelSlot: HTMLSlotElement
  private leadingSlot: HTMLSlotElement
  private trailingSlot: HTMLSlotElement
  private control?: Control
  // The intended value, captured even before the control exists (a framework
  // may set the `value` property before the element connects), so the initial
  // value isn't lost when the control is built.
  private pendingValue?: string
  // True between connect and the first control build, so attribute changes for
  // forwarded props don't try to touch a control that doesn't exist yet.
  private ready = false

  constructor() {
    super()
    this.internals = typeof this.attachInternals === 'function' ? this.attachInternals() : undefined
    const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true })

    const style = document.createElement('style')
    style.textContent = SHADOW_STYLE

    this.labelBox = document.createElement('div')
    this.labelBox.className = 'label'
    this.labelBox.setAttribute('part', 'label')
    this.labelSlot = document.createElement('slot')
    this.labelSlot.name = 'label'
    this.labelBox.append(this.labelSlot)
    // Clicking the (light-DOM) label focuses the (shadow) control — the native
    // <label for> association can't cross the boundary, so we wire it here.
    this.labelSlot.addEventListener('click', () => this.control?.focus())
    // Mirror the label's text into the control's aria-label (unless the host
    // already carries one) so the shadow control has an accessible name.
    this.labelSlot.addEventListener('slotchange', this.onLabelSlotChange)

    this.field = document.createElement('div')
    this.field.className = 'field'
    this.field.setAttribute('part', 'field')
    this.leadingSlot = document.createElement('slot')
    this.leadingSlot.name = 'leading'
    this.leadingSlot.setAttribute('part', 'leading')
    this.trailingSlot = document.createElement('slot')
    this.trailingSlot.name = 'trailing'
    this.trailingSlot.setAttribute('part', 'trailing')
    // CSS can't express "slot has assigned nodes", so toggle a class per edge
    // slot — an empty slot then reserves no box and no phantom flex gap.
    this.leadingSlot.addEventListener('slotchange', () =>
      this.field.classList.toggle('has-leading', this.leadingSlot.assignedNodes().length > 0))
    this.trailingSlot.addEventListener('slotchange', () =>
      this.field.classList.toggle('has-trailing', this.trailingSlot.assignedNodes().length > 0))
    // The clear button is projected here (rightmost). The element gates its
    // visibility via shadow CSS off the filled state — see updateFilled.
    const clearSlot = document.createElement('slot')
    clearSlot.name = 'clear'
    clearSlot.setAttribute('part', 'clear')

    // Leading, then (control inserted here on build), then trailing, then clear.
    this.field.append(this.leadingSlot, this.trailingSlot, clearSlot)

    // A clear button placed in slot="trailing" (an <a-button data-custom-event>)
    // dispatches this bubbling event on click/Enter/Space — without needing the
    // framework to hydrate — and we clear here. clear() dispatches input+change,
    // which is what a controlled consumer reacts to; an uncontrolled field is
    // just emptied. One path serves both.
    this.addEventListener(CLEAR_EVENT, () => this.clear())

    this.hintBox = document.createElement('div')
    this.hintBox.className = 'hint'
    this.hintBox.setAttribute('part', 'hint')
    const hintSlot = document.createElement('slot')
    hintSlot.name = 'hint'
    hintSlot.addEventListener('slotchange', () => {
      this.hintBox.classList.toggle('has-hint', hintSlot.assignedNodes().length > 0)
    })
    this.hintBox.append(hintSlot)

    shadow.append(style, this.labelBox, this.field, this.hintBox)
  }

  connectedCallback() {
    // A `value` set as a property before the element upgraded shadows the
    // accessor as an own data property — re-apply it through the setter so the
    // initial controlled value isn't lost when the control is built.
    if (Object.prototype.hasOwnProperty.call(this, 'value')) {
      const v = (this as unknown as { value: string }).value
      delete (this as unknown as { value?: string }).value
      this.value = v
    }
    if (!this.control) this.buildControl()
    this.ready = true
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null) {
    if (!this.ready && name !== 'value' && name !== 'defaultvalue') return
    if (name === 'multiline' || name === 'rows' || name === 'maxrows') {
      if (!this.control) return
      const needTextarea = this.hasAttribute('multiline') || this.hasAttribute('rows')
      const isTextarea = this.control instanceof HTMLTextAreaElement
      // Only a real input<->textarea flip needs a rebuild; a rows/maxrows tweak
      // reconfigures the existing textarea in place so focus + caret survive.
      if (needTextarea !== isTextarea) this.buildControl(this.value)
      else if (this.control instanceof HTMLTextAreaElement) this.configureTextarea(this.control)
      return
    }
    if (name === 'invalid') {
      this.control?.setAttribute('aria-invalid', value != null ? 'true' : 'false')
      this.updateValidity()
      try { value != null ? this.internals?.states.add('invalid') : this.internals?.states.delete('invalid') } catch {}
      return
    }
    if (name === 'disabled') { this.syncDisabled(); return }
    // Raw-HTML controlled author: route the attribute through the setter
    // (caret-safe, updates form value + validity). React/Preact set the
    // `value` property instead, which hits the same setter.
    if (name === 'value') { this.value = value ?? ''; return }
    if (name === 'defaultvalue') return
    // Forwarded attribute changed.
    if (this.control) this.forward(name, value)
  }

  /** (Re)build the shadow control from the current attributes. */
  private buildControl(initial?: string) {
    const multiline = this.hasAttribute('multiline') || this.hasAttribute('rows')
    const next = document.createElement(multiline ? 'textarea' : 'input') as Control
    next.setAttribute('part', 'input')
    if (this.control) this.control.replaceWith(next)
    else this.trailingSlot.before(next)
    this.control = next

    for (const attr of FORWARDED) {
      if (next instanceof HTMLTextAreaElement && attr === 'type') continue
      this.forward(attr, this.getAttribute(attr))
    }
    this.syncDisabled()
    if (this.hasAttribute('invalid')) next.setAttribute('aria-invalid', 'true')
    this.applyLabelAria()
    if (multiline) this.configureTextarea(next as HTMLTextAreaElement)

    const value = initial ?? this.pendingValue ?? this.getAttribute('value') ?? this.getAttribute('defaultvalue') ?? ''
    next.value = value

    next.addEventListener('input', this.onInput)
    next.addEventListener('change', this.onChange)

    this.internals?.setFormValue(value)
    this.updateValidity()
    this.updateFilled()
  }

  /** Autogrow (no `rows`) via `field-sizing: content`, capped by `maxrows`;
   *  a fixed `rows` count switches it off for a constant-height box. */
  private configureTextarea(ta: HTMLTextAreaElement) {
    const rows = this.getAttribute('rows')
    const maxrows = this.getAttribute('maxrows')
    if (rows != null) {
      ta.rows = Math.max(1, parseInt(rows, 10) || 1)
      ta.style.setProperty('field-sizing', 'fixed')
      ta.style.maxHeight = ''
    } else {
      ta.rows = 1
      ta.style.setProperty('field-sizing', 'content')
      // line * maxrows + block padding (4+4) + borders (~1)
      ta.style.maxHeight = maxrows != null ? `calc(${parseInt(maxrows, 10) || 1} * 20px + 10px)` : ''
    }
  }

  private forward(name: string, value: string | null) {
    const c = this.control
    if (!c) return
    if (c instanceof HTMLTextAreaElement && name === 'type') return
    if (BOOL_FORWARDED.has(name)) c.toggleAttribute(name, value != null)
    else if (value == null) c.removeAttribute(name)
    else c.setAttribute(name, value)
  }

  private syncDisabled() {
    if (this.control) this.control.disabled = this.hasAttribute('disabled')
  }

  private onInput = () => {
    const v = this.control?.value ?? ''
    this.internals?.setFormValue(v)
    this.updateValidity()
    this.updateFilled()
    // `input` is composed — it reaches the host (and consumers) on its own.
  }

  // `change` is not composed; re-emit one on the host so it escapes the shadow.
  private onChange = () => { this.dispatchEvent(new Event('change', { bubbles: true })) }

  private onLabelSlotChange = () => {
    this.labelBox.classList.toggle('has-label', this.labelSlot.assignedNodes().length > 0)
    this.applyLabelAria()
  }

  private applyLabelAria() {
    const c = this.control
    if (!c) return
    if (this.hasAttribute('aria-label') || this.hasAttribute('aria-labelledby')) return
    const text = this.labelSlot.assignedNodes().map((n) => n.textContent ?? '').join(' ').trim()
    if (text) c.setAttribute('aria-label', text)
    else c.removeAttribute('aria-label')
  }

  private updateFilled() {
    const filled = !!this.value
    // Shadow-internal class gates the clear slot's visibility; the custom state
    // is the public CSS hook (`:state(filled)`).
    this.field.classList.toggle('is-filled', filled)
    try {
      if (filled) this.internals?.states.add('filled')
      else this.internals?.states.delete('filled')
    } catch {}
  }

  private updateValidity() {
    const c = this.control
    if (!this.internals || !c) return
    // Reflect the inner control's native constraints — valueMissing (from
    // `required`), typeMismatch (e.g. `type="email"`), patternMismatch,
    // tooShort/tooLong, … — onto the host so the surrounding <form> sees them.
    // The explicit `invalid` prop layers a customError on top when the control
    // is otherwise valid (so an app-level error still blocks submission).
    if (this.hasAttribute('invalid') && c.validity.valid) {
      this.internals.setValidity({ customError: true }, 'Invalid value.', c)
    } else {
      this.internals.setValidity(c.validity, c.validationMessage, c)
    }
  }

  /** The current text value. Reading prefers the live control; before it's
   *  built, the pending/attribute value. */
  get value(): string {
    if (this.control) return this.control.value
    return this.pendingValue ?? this.getAttribute('value') ?? this.getAttribute('defaultvalue') ?? ''
  }
  set value(v: string) {
    this.pendingValue = v
    if (this.control && this.control.value !== v) this.control.value = v
    this.internals?.setFormValue(v)
    this.updateValidity()
    this.updateFilled()
  }

  /** Clear the field and refocus it — fired by the wrapper's clear button.
   *  Dispatches `input` + `change` on the host so controlled consumers update. */
  clear() {
    if (!this.control) return
    this.control.value = ''
    this.internals?.setFormValue('')
    this.updateValidity()
    this.updateFilled()
    this.dispatchEvent(new Event('input', { bubbles: true }))
    this.dispatchEvent(new Event('change', { bubbles: true }))
    this.control.focus()
  }

  // --- Constraint-validation API, proxied from ElementInternals so the host
  //     behaves like a native form control (`el.checkValidity()`, `el.validity`). ---
  get validity(): ValidityState | undefined { return this.internals?.validity }
  get validationMessage(): string { return this.internals?.validationMessage ?? '' }
  get willValidate(): boolean { return this.internals?.willValidate ?? false }
  checkValidity(): boolean { return this.internals?.checkValidity() ?? true }
  reportValidity(): boolean { return this.internals?.reportValidity() ?? true }

  // --- Form-associated callbacks ---
  formResetCallback() { this.value = this.getAttribute('defaultvalue') ?? '' }
  formDisabledCallback(disabled: boolean) { if (this.control) this.control.disabled = disabled }
  formStateRestoreCallback(state: string) { this.value = state ?? '' }
}

export function register_a_input() {
  if (typeof customElements === 'undefined') return
  if (!customElements.get('a-input')) {
    customElements.define('a-input', AInputElement)
  }
}

// Importing this module registers the element (granular entry point). The
// barrel re-exports it, so importing the barrel registers it too. Idempotent.
register_a_input()
