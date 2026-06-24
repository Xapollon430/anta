import { HTMLElementBase } from "../anta_helpers";
import { ARadioElement } from "./a-radio";
import "./a-radio-group.css";

// ─────────────────────────────────────────────────────────────────────────────
// <a-radio-group> — the single-select coordinator.
//
// All light DOM (no shadow): an optional <a-radio-label>, an <a-radio-list> of
// <a-radio> options, and an optional <a-radio-hint> are plain children laid out
// by a-radio-group.css, so the arrangement is restylable with ordinary CSS.
//
// THE INVARIANT: this element NEVER mutates the DOM. It writes nothing to its own
// host attributes and nothing to its child <a-radio>s. Everything it coordinates
// is expressed off-DOM:
//
//   • Selection — it sets each radio's `selected` *property* (not attribute). The
//     radio reflects that into `:state(selected)` + `aria-checked` via its OWN
//     ElementInternals (see a-radio.ts). No attribute is written to any radio.
//   • Form value — `internals.setFormValue()` on the group (it's the
//     form-associated element).
//   • Roving focus — `internals.ariaActiveDescendantElement` on the group points
//     at the selected radio. This is honored by assistive tech ONLY while the
//     group itself holds focus, which happens in raw hand-assembly where the
//     author makes the group the single tab stop (`<a-radio-group tabindex="0">`).
//     In the `RadioGroup` JSX wrapper path the radios carry a roving `tabindex`
//     (rendered declaratively by the wrapper) and real focus lands on them, so the
//     group is never focused and this reference is simply inert. The two focus
//     models are mutually exclusive by where `tabindex` lives, so the element can
//     maintain the reference unconditionally and let `.focus()` move real focus —
//     `.focus()` is a no-op on a radio that has no `tabindex` (raw mode) and a
//     real move on one that does (wrapper mode). Neither path writes the DOM.
//
// Why no DOM writes: app DOM may be rendered from a worker, so a web component
// that mutates the document fights the renderer. The wrapper is allowed to manage
// the DOM (it renders `tabindex`/`role` declaratively); the element is not.
//
// State follows the shared contract (STATEFUL-COMPONENTS.md): controlled when the
// `state` attribute is present (the wrapper always drives it this way), otherwise
// uncontrolled via an in-memory value seeded from `default-state` (the raw path).
// A pick dispatches a cancelable `statechange` BEFORE applying; controlled callers
// re-assert `state`, uncontrolled callers can veto with `preventDefault()`.
// ─────────────────────────────────────────────────────────────────────────────
export class ARadioGroupElement extends HTMLElementBase {
  static formAssociated = true;
  static observedAttributes = ["state", "disabled"];

  private internals?: ElementInternals;
  private uncontrolledValue: string | null = null;

  constructor() {
    super();
    this.internals = this.attachInternals?.();
  }

  connectedCallback() {
    this.uncontrolledValue = this.getAttribute("default-state");
    this.addEventListener("click", this.onClick);
    this.addEventListener("keydown", this.onKeyDown);
    this.sync();
  }

  attributeChangedCallback() {
    this.sync();
  }

  /** A child <a-radio> calls this on connect so an option added after mount
   *  still gets its `selected` property wired up. (Add-only — a removed option
   *  reconciles on the next sync.) */
  requestSync = () => this.sync();

  formDisabledCallback(disabled: boolean) {
    if (disabled) this.internals?.states.add("disabled");
    else this.internals?.states.delete("disabled");
    this.sync();
  }

  formResetCallback() {
    // Rewind to `default-state`. Uncontrolled self-applies via sync() below; for
    // the controlled/wrapper case we also dispatch `statechange` so the controller
    // (the RadioGroup wrapper's useState, or the app) follows the reset.
    const next = this.getAttribute("default-state");
    this.dispatchEvent(
      new CustomEvent("statechange", {
        bubbles: true,
        composed: true,
        detail: { next, prev: this.currentValue },
      }),
    );
    this.uncontrolledValue = next;
    this.sync();
  }

  formStateRestoreCallback(state: string) {
    this.uncontrolledValue = state;
    this.sync();
  }

  // Controlled when `state` is present; otherwise the in-memory uncontrolled value.
  private get currentValue() {
    return this.hasAttribute("state")
      ? this.getAttribute("state")
      : this.uncontrolledValue;
  }

  private get isDisabled() {
    return (
      this.hasAttribute("disabled") ||
      (this.internals?.states.has("disabled") ?? false)
    );
  }

  private get radios() {
    return Array.from(this.querySelectorAll("a-radio")) as ARadioElement[];
  }

  private sync = () => {
    const value = this.currentValue;
    // Submit name=value when something is selected; submit nothing when the
    // selection is empty/cleared (matches a native radio group with nothing checked).
    this.internals?.setFormValue(value ? value : null, value);

    const radios = this.radios;
    const selectedEl =
      radios.find((r) => r.value === value && value != null && value !== "") ??
      null;

    // Selection, off-DOM: set the `selected` *property* on each radio; the radio
    // turns that into :state(selected) + aria-checked via its own internals.
    for (const r of radios) r.selected = r === selectedEl;

    // Roving focus, off-DOM: point the group's aria-activedescendant at the
    // selected radio (see the header note). Feature-guarded — element-reference
    // ARIA reflection is Baseline-2025; absent it, the wrapper's roving `tabindex`
    // is what carries focus.
    if (this.internals && "ariaActiveDescendantElement" in this.internals) {
      this.internals.ariaActiveDescendantElement = selectedEl;
    }
  };

  // The shared state algorithm: fire the cancelable `statechange` *before*
  // applying. Controlled never self-applies; uncontrolled applies unless vetoed.
  private requestSelect(next: string) {
    const prev = this.currentValue;
    if (next === prev) return;
    const ok = this.dispatchEvent(
      new CustomEvent("statechange", {
        cancelable: true,
        bubbles: true,
        composed: true,
        detail: { next, prev },
      }),
    );
    if (this.hasAttribute("state")) return;
    if (ok) {
      this.uncontrolledValue = next;
      this.sync();
    }
  }

  private onClick = (e: MouseEvent) => {
    if (this.isDisabled) return;
    const radio = (e.target as HTMLElement | null)?.closest(
      "a-radio",
    ) as ARadioElement | null;
    if (!radio || radio.hasAttribute("disabled")) return;
    // Move real focus to the clicked radio. A no-op in raw/aria-activedescendant
    // mode (the radio has no tabindex); a real move in the wrapper's roving mode.
    radio.focus();
    this.requestSelect(radio.value);
  };

  private onKeyDown = (e: KeyboardEvent) => {
    if (this.isDisabled) return;
    const enabled = this.radios.filter((r) => !r.hasAttribute("disabled"));
    if (enabled.length === 0) return;
    const focused = (e.target as HTMLElement | null)?.closest(
      "a-radio",
    ) as ARadioElement | null;

    if (e.key === " " || e.key === "Enter") {
      if (focused && enabled.includes(focused)) {
        e.preventDefault();
        this.requestSelect(focused.value);
      }
      return;
    }

    const forward = e.key === "ArrowDown" || e.key === "ArrowRight";
    const back = e.key === "ArrowUp" || e.key === "ArrowLeft";
    if (!forward && !back) return;
    e.preventDefault();

    // Index of the currently-focused / currently-selected option, then step.
    let i = focused ? enabled.indexOf(focused) : -1;
    if (i === -1) i = enabled.findIndex((r) => r.value === this.currentValue);
    if (i === -1) i = 0;

    const next =
      enabled[(i + (forward ? 1 : -1) + enabled.length) % enabled.length];
    // Selection follows focus (WAI-ARIA radio pattern): move focus, then request
    // the pick. `.focus()` moves real focus in roving mode; in raw mode it no-ops
    // and the sync()'d aria-activedescendant is what advances for AT.
    next.focus();
    this.requestSelect(next.value);
  };
}

export function register_a_radio_group() {
  if (typeof customElements === "undefined") return;
  if (!customElements.get("a-radio-group"))
    customElements.define("a-radio-group", ARadioGroupElement);
}
register_a_radio_group();
