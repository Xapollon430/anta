import { HTMLElementBase } from "../anta_helpers";
import "./a-button.css";

declare global {
  interface Document {
    hasKeyListenerForAButton?: boolean;
  }
}

/**
 * `<a-button>` — button element (also styles `a[role="button"]`).
 *
 * Styling notes (`a-button.css` ships comment-free):
 * - **Token architecture.** The base rule carries shared constants plus the
 *   neutral tone tokens (neutral is the implicit default; its chip uses a
 *   softer 5% rest alpha vs 10% for named tones). Named tones override via
 *   `[tone="X"]`; critical/warning tertiary active steps heavier (20% vs
 *   15%). Final colors are wired through `--button-fg`/`--button-bg`:
 *   secondary is declared unscoped so a bare `a-button` consumer selector
 *   can override it without bumping specificity; primary/tertiary/quaternary
 *   match an explicit `[priority]` and win on specificity.
 * - **Dark mode** re-tunes with heavier alphas (30/40% vs 10/15%) and flips
 *   neutral's anchor to a lilac — mixing dark gray into a dark bg yields no
 *   contrast.
 * - **Custom tones** (any non-named `tone` value): primary uses the literal
 *   color; other priorities derive from the source HUE via oklch relative
 *   color with lightness/chroma/alpha pinned near Brand. The `--_tone-*`
 *   knobs are the only numbers to tune (the `.dark` block re-tunes them).
 *   The JSX wrapper writes `--button-tone-source` inline; a typed `attr()`
 *   fallback picks up raw `<a-button tone="…">` on Chrome 133+/Safari 18.2+.
 * - **Hover is gated** to `(hover: hover) and (pointer: fine)` so it doesn't
 *   stick after a tap; `:active`/`[selected]` stay ungated (correct press
 *   feedback on touch). Quaternary rests at 82% fg alpha (quieter than
 *   tertiary), restores full opacity on hover, lightens by 0.05 oklch L on
 *   press (dark mode returns to rest instead — it's already light), and has
 *   instant transitions in every direction.
 * - **Layout gotchas:** `flex-shrink: 0` (shrinking + `overflow: hidden`
 *   would clip the label silently); `font-variation-settings` must restate
 *   ALL axes — it replaces rather than merges, and dropping "slnt"/"ital"
 *   renders italic in Safari; the label uses a 17px line box + 1px bottom
 *   padding for optical vertical centering at an unchanged 18px box.
 * - **Icon-only** is purely structural — `:has(> a-icon:only-child)` gives
 *   square padding + a min-size pin (and centers when the host is sized
 *   bigger). A non-only edge icon trims ~2px off its side's padding
 *   (optical), `max(0px, …)` keeping paddingless at 0.
 * - **Underline** renders only on tertiary/quaternary: 0.5px hairline at 75%
 *   alpha at rest, 1px at full alpha on hover/`[selected]`, mirroring the
 *   prose-link rule in `<Text>`.
 * - **Loading** paints a blurred diagonal stripe overlay; the x-period is
 *   the diagonal period projected onto x so the slide loops seamlessly
 *   (overshooting left by one period), and a large negative
 *   `animation-delay` desyncs instances so a row doesn't pulse in lockstep.
 * - **Disabled** sets `background-color`/`color` directly (not the vars) so
 *   an inline `--button-bg` override can't keep a disabled button alive, and
 *   skips transitions — a `.dark` toggle would flash the tone hue
 *   mid-resolve.
 */
export class AButtonElement extends HTMLElementBase {
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
  if (!customElements.get("a-button")) {
    customElements.define("a-button", AButtonElement);
  }
}

// Importing this module registers the element (granular entry point). The
// barrel re-exports it, so importing the barrel registers it too. Idempotent.
register_a_button();
