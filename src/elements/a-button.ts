import { HTMLElementBase } from "../anta_helpers";
import "./a-button.css";

declare global {
  interface Document {
    hasKeyListenerForAButton?: boolean;
  }
}

/** Install the one-per-document delegated key/click handlers that power Enter/
 *  Space activation, form submit/reset, and `data-custom-event`. Idempotent.
 *  Called eagerly at registration (so the handlers exist before the first click
 *  — e.g. a freshly-rendered clear button in a sandboxed iframe) and again from
 *  connectedCallback as a fallback. */
function installDocumentHandlers() {
  if (typeof document === "undefined" || document.hasKeyListenerForAButton) return;
  document.addEventListener("keydown", handleKeyDown, true);
  document.addEventListener("click", handleClick, true);
  document.hasKeyListenerForAButton = true;
}

export class AButtonElement extends HTMLElementBase {
  connectedCallback() {
    installDocumentHandlers();
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

  // Optional bubbling event for analytics / workflow handlers.
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
    // Richer event so listeners can inspect which button submitted.
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
  // Eager install so the delegated handlers exist as soon as a-button is
  // defined — before any button (incl. a wrapper-rendered clear button) is
  // first clicked. connectedCallback re-checks as a fallback.
  installDocumentHandlers();
  if (!customElements.get("a-button")) {
    customElements.define("a-button", AButtonElement);
  }
}

// Importing this module registers the element (granular entry point). The
// barrel re-exports it, so importing the barrel registers it too. Idempotent.
register_a_button();
