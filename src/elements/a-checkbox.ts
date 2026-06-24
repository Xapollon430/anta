import { HTMLElementBase } from "../anta_helpers";
import "./a-checkbox.css";

type CheckboxState = "checked" | "unchecked" | "indeterminate";

const parseState = (v: string | null): CheckboxState =>
  v === "checked" || v === "indeterminate" ? v : "unchecked";

/**
 * `<a-checkbox>` — interactive light-DOM checkbox. Visual state lives on
 * `ElementInternals` (CSS keys off `:state(checked)` / `:state(indeterminate)`),
 * never on host attributes. **ARIA is not the element's job** — set `role` /
 * `aria-checked` / `aria-label` on the element yourself (the `Checkbox` wrapper
 * does this from its props).
 *
 * One ternary state — `checked` / `unchecked` / `indeterminate` — carried by two
 * attributes: `state` is the **controlled** live value (the element reflects
 * changes to it), `default-state` is the **uncontrolled** seed (read once at
 * connect / form-reset, later changes ignored). No "controlled" flag — the
 * attribute name carries the intent (`controlled ≡ hasAttribute('state')`).
 *
 * Follows the shared state contract (see `STATEFUL-COMPONENTS.md`): on
 * interaction the element fires a cancelable `statechange` *before* applying.
 * Controlled callers re-assert `state` from their store; uncontrolled callers
 * can veto a transition synchronously with `event.preventDefault()`. No
 * optimistic self-paint.
 */
export class ACheckboxElement extends HTMLElementBase {
  static formAssociated = true;
  static observedAttributes = ["state", "value"];

  private internals?: ElementInternals;
  private currentState: CheckboxState = "unchecked";

  constructor() {
    super();
    this.internals = this.attachInternals?.();
    this.addEventListener("click", (e: MouseEvent) => this.toggle(e));
    this.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        this.click();
      }
    });
  }

  connectedCallback() {
    this.seed();
    this.paint();
  }

  attributeChangedCallback(name: string) {
    // `state` is the controlled channel — reflect changes. (`default-state` is the
    // uncontrolled seed, handled once in seed(); later changes are ignored.
    // `value` only re-syncs the submitted form entry.)
    if (name === "state") this.currentState = parseState(this.getAttribute("state"));
    this.paint();
  }

  // Matches the host `disabled` attribute and an ancestor `<fieldset disabled>`.
  private get isDisabled() {
    return this.matches(":disabled");
  }
  // Controlled mode: the `state` attribute is present and owns the live value.
  private get isControlled() {
    return this.hasAttribute("state");
  }

  private seed() {
    this.currentState = parseState(
      this.getAttribute("state") ?? this.getAttribute("default-state"),
    );
  }

  private toggle(_e: Event) {
    if (this.isDisabled) return;
    const prev = this.currentState;
    // Indeterminate resolves to checked; otherwise flip (native convention).
    const next: CheckboxState = prev === "checked" ? "unchecked" : "checked";
    const ok = this.dispatchEvent(
      new CustomEvent("statechange", {
        cancelable: true,
        bubbles: true,
        composed: true,
        detail: { next, prev },
      }),
    );
    // Controlled: never self-apply — wait for the consumer to update `state`.
    // Uncontrolled: apply unless a listener synchronously preventDefault()'d.
    if (this.isControlled) return;
    if (ok) {
      this.currentState = next;
      this.paint();
    }
  }

  private paint() {
    const i = this.internals;
    if (!i) return;
    i.states.delete("checked");
    i.states.delete("indeterminate");
    if (this.currentState === "indeterminate") i.states.add("indeterminate");
    else if (this.currentState === "checked") i.states.add("checked");
    // Submit value/"on" when checked, nothing otherwise; 2nd arg is the bfcache state.
    i.setFormValue?.(
      this.currentState === "checked" ? (this.getAttribute("value") ?? "on") : null,
      this.currentState,
    );
  }

  formResetCallback() {
    this.seed();
    this.paint();
  }

  formStateRestoreCallback(state: string) {
    this.currentState = parseState(state);
    this.paint();
  }

  formDisabledCallback() {
    this.paint();
  }
}

export function register_a_checkbox() {
  if (typeof customElements === "undefined") return;
  if (!customElements.get("a-checkbox"))
    customElements.define("a-checkbox", ACheckboxElement);
}

register_a_checkbox();
