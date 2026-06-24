import { HTMLElementBase } from "../anta_helpers";
import { ARadioElement } from "./a-radio";
import "./a-radio-group.css";

const SHADOW_STYLE = `
  :host { display: flex; flex-direction: column; }
  slot:not([name]) { display: flex; flex-direction: column; gap: 8px; }
  :host([orientation="horizontal"]) slot:not([name]) {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 16px;
  }
`;

export class ARadioGroupElement extends HTMLElementBase {
  static formAssociated = true;
  static observedAttributes = ["state", "disabled"];

  private internals?: ElementInternals;
  private uncontrolledValue: string | null = null;
  private radioSlot: HTMLSlotElement;

  constructor() {
    super();
    this.internals = this.attachInternals?.();
    const shadow = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = SHADOW_STYLE;

    const labelSlot = document.createElement("slot");
    labelSlot.name = "label";
    // Default (nameless) slot — radios project here; its slotchange tracks them.
    this.radioSlot = document.createElement("slot");
    const hintSlot = document.createElement("slot");
    hintSlot.name = "hint";

    shadow.append(style, labelSlot, this.radioSlot, hintSlot);
  }

  connectedCallback() {
    this.uncontrolledValue = this.getAttribute("default-state");
    this.addEventListener("click", this.onClick);
    this.addEventListener("keydown", this.onKeyDown);
    // slotchange fires when the radio set changes (add/remove/reorder). Stable
    // arrow refs make these addEventListener calls idempotent across reconnects.
    this.radioSlot.addEventListener("slotchange", this.sync);
    this.sync();
  }

  attributeChangedCallback() {
    this.sync();
  }

  formDisabledCallback(disabled: boolean) {
    if (disabled) this.internals?.states.add("disabled");
    else this.internals?.states.delete("disabled");
    this.sync();
  }

  formResetCallback() {
    this.uncontrolledValue = this.getAttribute("default-state");
    this.sync();
  }

  formStateRestoreCallback(state: string) {
    this.uncontrolledValue = state;
    this.sync();
  }

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
    this.internals?.setFormValue(value, value);

    const radios = this.radios;
    const enabled = radios.filter((r) => !r.hasAttribute("disabled"));
    const selectedEl =
      radios.find((r) => r.value === value && value !== null) ?? null;
    const tabStop =
      selectedEl && !selectedEl.hasAttribute("disabled")
        ? selectedEl
        : (enabled[0] ?? null);

    // The group sets only two things per radio: `selected` (a property — the
    // radio reflects it into :state(selected) + aria-checked itself) and the
    // roving `tabIndex` (group-level concern — it alone knows the tab stop).
    for (const r of radios) {
      r.selected = r === selectedEl;
      r.tabIndex = r === tabStop && !this.isDisabled ? 0 : -1;
    }
  };

  // The shared state algorithm: fire the cancelable `statechange` *before*
  // applying. Controlled never self-applies; uncontrolled applies unless vetoed.
  private requestSelect(next: string) {
    const prev = this.currentValue;
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
    radio.focus();
    if (radio.value !== this.currentValue) this.requestSelect(radio.value);
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
        if (focused.value !== this.currentValue)
          this.requestSelect(focused.value);
      }
      return;
    }

    const forward = e.key === "ArrowDown" || e.key === "ArrowRight";
    const back = e.key === "ArrowUp" || e.key === "ArrowLeft";
    if (!forward && !back) return;
    e.preventDefault();

    let i = focused ? enabled.indexOf(focused) : -1;
    if (i === -1) i = enabled.findIndex((r) => r.value === this.currentValue);
    if (i === -1) i = 0;

    const next =
      enabled[(i + (forward ? 1 : -1) + enabled.length) % enabled.length];
    next.focus();
    if (next.value !== this.currentValue) this.requestSelect(next.value);
  };
}

export function register_a_radio_group() {
  if (typeof customElements === "undefined") return;
  if (!customElements.get("a-radio-group"))
    customElements.define("a-radio-group", ARadioGroupElement);
}
register_a_radio_group();
