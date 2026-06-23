import { HTMLElementBase } from "../anta_helpers";
import "./a-radio.css";

export class ARadioElement extends HTMLElementBase {
  static observedAttributes = ["selected"];
  private internals?: ElementInternals;

  constructor() {
    super();
    this.internals = this.attachInternals?.();
  }

  connectedCallback() {
    this.applyState(this.hasAttribute("selected"));
  }

  attributeChangedCallback(name: string) {
    if (name === "selected") this.applyState(this.hasAttribute("selected"));
  }

  get selected(): boolean {
    return (
      this.internals?.states.has("selected") ?? this.hasAttribute("selected")
    );
  }
  set selected(on: boolean) {
    this.applyState(!!on);
  }

  get value(): string {
    return this.getAttribute("value") ?? "";
  }

  private applyState(on: boolean) {
    if (on) this.internals?.states.add("selected");
    else this.internals?.states.delete("selected");
  }
}

export function register_a_radio() {
  if (typeof customElements === "undefined") return;
  if (!customElements.get("a-radio"))
    customElements.define("a-radio", ARadioElement);
}
register_a_radio();
