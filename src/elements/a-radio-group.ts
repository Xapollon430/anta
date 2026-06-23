import { HTMLElementBase } from "../anta_helpers";
import { ARadioElement } from "./a-radio";
import "./a-radio-group.css";

// Shadow contains two named sub-elements <a-radio-label> / <a-radio-hint> that
// the group fills from its `label` / `hint` attributes, plus a wrapping
// [part="radios"] div around the default slot. The sub-tags are anta-named for
// devtools clarity and styled by tag name in the shadow <style>.
const SHADOW_STYLE = `
  :host {
    display: flex;
    flex-direction: column;
  }
  a-radio-label, a-radio-hint { display: none; }
  :host([label]) a-radio-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-1);
    margin-block-end: 4px;
  }
  :host([hint]) a-radio-hint {
    display: block;
    font-size: 12px;
    color: var(--text-3);
    margin-block-start: 4px;
  }
  [part="radios"] {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  :host([orientation="horizontal"]) [part="radios"] {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 16px;
  }
`;

export class ARadioGroupElement extends HTMLElementBase {
  static formAssociated = true;
  static observedAttributes = ["value", "disabled", "label", "hint"];

  private internals?: ElementInternals;
  private uncontrolledValue: string | null = null;
  private mo?: MutationObserver;
  private labelEl!: HTMLElement;
  private hintEl!: HTMLElement;

  constructor() {
    super();
    this.internals = this.attachInternals?.();

    const shadow = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = SHADOW_STYLE;

    this.labelEl = document.createElement("a-radio-label");
    this.labelEl.setAttribute("part", "label");

    const radiosEl = document.createElement("div");
    radiosEl.setAttribute("part", "radios");
    radiosEl.append(document.createElement("slot"));

    this.hintEl = document.createElement("a-radio-hint");
    this.hintEl.setAttribute("part", "hint");

    shadow.append(style, this.labelEl, radiosEl, this.hintEl);
  }

  connectedCallback() {
    this.uncontrolledValue = this.getAttribute("defaultvalue");
    this.addEventListener("click", this.onClick);
    this.addEventListener("keydown", this.onKeyDown);
    this.mo ??= new MutationObserver(this.sync);
    this.mo.observe(this, { childList: true });
    this.syncLabelHint();
    this.sync();
  }

  disconnectedCallback() {
    this.mo?.disconnect();
  }

  attributeChangedCallback(name: string) {
    if (name === "label" || name === "hint") this.syncLabelHint();
    else this.sync();
  }

  formDisabledCallback(disabled: boolean) {
    if (disabled) this.internals?.states.add("disabled");
    else this.internals?.states.delete("disabled");
    this.sync();
  }

  private syncLabelHint() {
    this.labelEl.textContent = this.getAttribute("label") || "";
    this.hintEl.textContent = this.getAttribute("hint") || "";
  }

  private get currentValue() {
    return this.hasAttribute("value")
      ? this.getAttribute("value")
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
    this.internals?.setFormValue(value);

    const radios = this.radios;
    const enabled = radios.filter((r) => !r.hasAttribute("disabled"));
    const selectedEl =
      radios.find((r) => r.value === value && value !== null) ?? null;
    const tabStop =
      selectedEl && !selectedEl.hasAttribute("disabled")
        ? selectedEl
        : enabled[0] ?? null;

    for (const r of radios) {
      r.selected = r === selectedEl;
      r.tabIndex = r === tabStop && !this.isDisabled ? 0 : -1;
    }
  };

  private requestSelect(value: string) {
    if (!this.hasAttribute("value")) {
      this.uncontrolledValue = value;
      this.sync();
    }
    this.dispatchEvent(new CustomEvent("change", { detail: { value } }));
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
