import { HTMLElementBase } from "../anta_helpers";

declare global {
  interface Document {
    hasKeyListenerForAButton?: boolean;
  }
}

export class AButtonElement extends HTMLElementBase {
  constructor() {
    super();
    // All visual styling lives in src/elements/a-button.css and targets
    // the host (`a-button`) directly. The shadow root just projects the
    // light-DOM children through a single `<slot>`.
    const shadow = this.attachShadow({ mode: "open" });
    shadow.append(document.createElement("slot"));
  }

  connectedCallback() {
    if (!document.hasKeyListenerForAButton) {
      document.addEventListener("keydown", handleKeyDown, true);
      document.addEventListener("click", handleClick, true);
      document.hasKeyListenerForAButton = true;
    }
  }
}

function findForm(el: HTMLElement): HTMLFormElement | null {
  const formId = el.getAttribute("form");
  if (formId) {
    return document.getElementById(formId) as HTMLFormElement | null;
  }
  return el.closest("form");
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key !== "Enter" && e.key !== " ") return;
  const el = (e.target as HTMLElement).closest(
    "a-button",
  ) as AButtonElement | null;
  if (!el) return;
  e.preventDefault();
  el.click();
}

function handleClick(e: MouseEvent) {
  const el = (e.target as HTMLElement).closest(
    "a-button",
  ) as AButtonElement | null;
  if (!el) return;

  // Consumer-defined event name. Used for analytics or wiring up
  // workflow-level handlers without per-button onClick props.
  const customEvent = el.getAttribute("data-custom-event");
  if (customEvent) {
    el.dispatchEvent(
      new CustomEvent(customEvent, { bubbles: true, cancelable: true }),
    );
  }

  const type = el.getAttribute("type") || "button";
  const form = findForm(el);
  if (!form) return;

  if (type === "submit") {
    if (form.requestSubmit) {
      form.requestSubmit();
    } else {
      form.submit();
    }
    // Fire a richer event alongside the standard `submit` so
    // listeners can inspect *which* button submitted and what its
    // attributes were. Form authors who only listen to `submit` are
    // unaffected.
    const formData = new FormData(form);
    form.dispatchEvent(
      new CustomEvent("submitdetailed", {
        bubbles: true,
        cancelable: true,
        detail: {
          formData: Object.fromEntries(formData.entries()),
          submitter: {
            tag: el.tagName.toLowerCase(),
            attrs: Object.fromEntries(
              Array.from(el.attributes).map((a) => [a.name, a.value]),
            ),
          },
        },
      }),
    );
  } else if (type === "reset") {
    form.reset();
  }
}

export function register_a_button() {
  if (typeof customElements === "undefined") return;
  if (!customElements.get("a-button")) {
    customElements.define("a-button", AButtonElement);
  }
}
