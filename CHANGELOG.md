# Changelog

All notable changes to the `@antadesign/anta` package are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project tries to follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This file only tracks what ships to npm consumers — anything under `src/`, `dist/`, the build / generator scripts, and root files in the published tarball. Updates to the documentation site at `antadesign.dev` are not consumer-facing and are intentionally not in this changelog; see the commit history for the site narrative.

Versions ending in `-dev.N` are pre-release builds published under the npm `dev` dist-tag; main releases drop the suffix. Always pin a specific version in your `package.json` (`"@antadesign/anta": "0.1.1-dev.1"`) rather than the floating `"dev"` tag — the floating tag tracks the latest dev build and will silently change between installs.

## Unreleased

### Added
- New `rotate-ccw` icon shape (lucide), available as `<Icon shape="rotate-ccw" />` / `<a-icon shape="rotate-ccw">` and in the `IconShape` union.

### Breaking
- **`<Button>`'s `iconButton` prop is removed** and **`leadingIcon` is renamed to `icon`**. Icon-only behavior is now purely structural: pass `icon` with no `label`, `trailingIcon`, or `children`, and the existing CSS rule (`a-button:has(> a-icon:only-child)`) gives the host the square padding + min-size pin. No opt-in attribute. Migration: `<Button iconButton leadingIcon="check" />` → `<Button icon="check" />`; `<Button leadingIcon="check" label="…" />` → `<Button icon="check" label="…" />`. `trailingIcon` is unchanged.

### Changed
- **Dark theme palette comprehensively retuned.** Every dark-mode background and border token — neutral plus all five tinted tones (brand / success / critical / warning / info) — was reworked into hand-tuned `hsl()` values, deepened from the Anta 0.2 baseline so dark surfaces and borders read with less glare. The dark background and border ramps are now authored in HSL; light mode and dark text tokens are unchanged.
- **Raw `<code>` now sets `line-height: 1em`** (in `src/reset.css`, `@layer anta`) so inline code no longer inflates the line box of the prose it sits in.
- **Neutral secondary button background retuned.** Light mode evens out its rest→hover→active ramp — active drops from ~20% to ~15% alpha (`#44374b33` → `#44374b26`), giving ~7 → 10 → 15% instead of the abrupt 7 → 10 → 20. Dark mode is brought down slightly to ~9 → 14 → 18% (`#e4d1ef` at `17`/`24`/`2e`, from `1a`/`26`/`33`). Other tones unchanged.
- **Dark neutral `--bg-base` / `--bg-section` adjusted.** `--bg-base` lightened to `hsl(280 10% 5.5%)` and `--bg-section` set to near-black `hsl(280 20% 0%)`, so the "section" surface now sits *below* the page canvas in lightness — elevated / code surfaces read as recessed rather than raised. `--bg-pane` / `--bg-block` / `--bg-spot` and all tinted tones are unchanged.
- **Quaternary buttons now read quieter than tertiary.** A `priority="quaternary"` button's rest foreground is the tone at 82% alpha (`color-mix(in oklch, var(--button-fg-quaternary-rest) 82%, transparent)`) — slightly faded — so it's visually distinct from the full-opacity tertiary (previously the two looked identical at rest). Hover / active restore full opacity.
- **Quaternary button press feedback (light mode).** `priority="quaternary"`'s `:active` now lightens the rest foreground by `0.05` in oklch lightness (`oklch(from var(--button-fg-quaternary-rest) calc(l + 0.05) c h)`) for a subtle pressed look, instead of snapping back to the rest color. Dark mode is unchanged — it still returns to rest, since lightening would brighten the already-light foreground.
- **Button label `font-weight` softened from `500` to `450`.** Applies to every `<Button>` / `<a-button>` label across all priorities and sizes.
- **Boolean button attributes now render as presence, not `="true"`.** `<Button>`'s `selected` / `disabled` / `loading` / `paddingless` props now emit a presence attribute (`disabled=""`) instead of `disabled="true"`, and the element CSS matches them by presence (`a-button[disabled]`, not `[disabled="true"]`). The wrapper API is unchanged (still boolean props); hand-authored elements keep working whether you write `disabled`, `disabled=""`, or the old `disabled="true"` (presence matches all). ARIA mirrors (`aria-pressed`, `aria-disabled`, `aria-busy`) stay string-valued.
- **Custom-tone `primary` fill now normalizes lightness.** Instead of painting the raw color, a custom `tone` on `priority="primary"` keeps the source hue + chroma but pins its lightness near the Brand primary's (via `oklch(from … L c h)`), with hover/active stepping the lightness — so a too-light or too-dark input still lands at a Brand-like fill. Re-tunes between light and dark through the same knobs, like the named tones. Secondary/tertiary/quaternary (hue-only) are unchanged.

## 0.1.1-dev.6 — May 28, 2026

### Added
- New `Title` component (`<a-title>` styled tag + `Title` JSX wrapper) for headings at one of six `level`s. Drives both the type scale (font-size + line-height) and the vertical rhythm (logical `margin-block` per level); also surfaces `role="heading"` + `aria-level` for assistive tech. Mirrors `Text`'s `priority` (`primary`-`quinary`, mapping to `--text-1`...`--text-5`) and `tone` (`brand`, `success`, `critical`, `warning`, `info`) APIs. Children are arbitrary — pass icons, badges, or any inline content beside the title text; there are no `leadingIcon` / `trailingIcon` props.
- `<a-title>` is intentionally CSS-only — no `customElements.define`, no shadow DOM. The browser treats it as a generic unknown element and the rules in `dist/elements/a-title.css` do all the work, so consumers who import `@antadesign/anta/elements` get it for free.

### Changed
- `src/reset.css` now styles raw `<h1>`-`<h6>` to match `<Title level={n}>` at the default `primary` priority / no tone — same demi-bold weight (584.62), letter-spacing (0), per-level font-size, line-height, and logical block margins. Reach for a real heading tag when SEO matters and you don't need `tone` / `priority`; reach for `<Title>` when you do.

## 0.1.1-dev.5 — May 25, 2026

### Breaking
- **`<Button>`'s default tone flipped from `brand` to `neutral`.** Buttons rendered without a `tone=` prop now resolve to the neutral token set (gray fill, soft secondary alpha, neutral text on tertiary / quaternary) instead of the saturated brand purple. The CSS selector that owns the default branch moved from `:where(:not([tone]), [tone="brand"])` to `:where(:not([tone]), [tone="neutral"])`, with the inverse on the explicit `[tone="brand"]` block. Migration: add `tone="brand"` explicitly anywhere you relied on the old default; everything else (icons, labels, sizes, priorities) is unchanged.
- **`<Button tone="custom">` removed.** Pass any literal CSS color as the `tone` instead (`tone="#ff1493"`, `tone="oklch(0.6 0.25 30)"`, `tone="rgb(255 20 147)"`, named colors, anything that parses as `<color>`). The JSX wrapper hands the color to the host via `--button-tone-source` on inline style; the CSS resolver extracts the **hue** with `oklch(from var(--button-tone-source) … h)` and runs it through the brand-tone L/C curve so every priority × state slot is populated automatically — hover/active darken on schedule, secondary alpha overlays anchor to the consumer's color, tertiary and quaternary text colors all derive. Power-user `style={{ '--button-fg-color': '#…' }}` overrides still beat the resolver. Migration: drop the `tone="custom"` literal + the trio of `--button-{bg,fg,br}-color` inline declarations and just set `tone` to the source color. Relative-color `oklch(from …)` is the only modern-CSS dependency (Safari ≥16.4, Firefox ≥113, Chrome ≥119).

### Changed
- `Button`'s `tone` prop type widens: the `'custom'` literal is dropped and the union gains `(string & {})` so any color literal is type-safe while autocomplete on the six named tones stays intact. `AButtonAttributes.tone` mirrors the same widening.
- `<Button>` now defaults to `flex-shrink: 0`. When the button sat as a flex item in a tight parent, it used to compress and silently clip its icon / label because the host carries `overflow: hidden`. The new default makes the button hold its natural width and overflow the parent instead — the loud failure mode. Consumers who want the old shrinkable behavior can opt back in with `style={{ flexShrink: 1 }}` per instance. The dedicated `a-menu > a-button` rule simplified accordingly (it used to set `flex-shrink: 0` itself).
- `iconButton` accepts an `IconShape` string in addition to `boolean`. `<Button iconButton="check" />` is now equivalent to `<Button iconButton leadingIcon="check" />`; if both are set, the string form wins.
- Icon-only buttons gain a `min-width` / `min-height` pinned to the natural square (small 20px, default 24px, large 28px) so a tight flex parent can no longer squeeze the host below the 16px icon.
- Base `cursor: pointer` moved from the (deleted) shadow `:host` style into `a-button.css`, so anchor-mode buttons and JS-only consumers (no element CSS loaded yet) both pick it up.

## 0.1.1-dev.4 — May 6, 2026

### Breaking
- **`anta_global_tokens.css` renamed to `tokens.css`** and split. Consumers should update their import: `@antadesign/anta/anta_global_tokens.css` → `@antadesign/anta/tokens.css`. The new file contains *only* the CSS custom property declarations on `:root` / `:root.dark`, plus a one-line `@layer base, anta, components, utilities;` cascade-order declaration. Tokens stay unlayered (custom properties don't compete in the cascade).
- **New `reset.css` import** carries the typography defaults that used to live alongside the tokens (`h1-h6 { font-weight: 600 }`, `strong`, `ul / ol / li / menu`, `a` link states) plus a modern small reset (universal box-sizing, margin reset, replaced-element block-display + max-width, form-control font inheritance, text-wrap defaults). All wrapped in `@layer anta`. Consumers who want Anta's previous out-of-the-box look add `import '@antadesign/anta/reset.css'` alongside the tokens import; consumers who have their own reset can skip it.
- **All Anta CSS now lives in `@layer anta`** — element rules (`a-progress`, `a-text`, `a-icon`, `a-icon.shapes`), the reset, and the generate-icons output. Token property declarations (the `:root { --… }` blocks) remain unlayered so they're available everywhere unconditionally. The pre-declared layer order (`base, anta, components, utilities`) keeps Anta's defaults above any preflight resets (Tailwind's `@layer base`, etc.) while letting consumer components and utility classes override single properties when needed.

### Changed
- Progress component colors realigned with the "Anta 0.2" Figma library (frame `1313:1219`). All four states (light × dark × neutral × info) updated. Every Progress colour now resolves through an existing global token: `--bg-block` / `--bg-spot` / `--border-2` / `--text-2` / `--text-3` and their `-info` variants.
- `--progress-indicator-edge` is now declared once at the base level and derives from `--progress-border-color` via CSS relative-colour syntax (`rgb(from … r g b / 0) → var(…)`). The right-edge gradient automatically tracks the border colour in every state.
- `<a-progress-number>` color anchor moved from `--text-1` / `--text-1-info` to `--text-2` / `--text-2-info`, matching Figma's `component/progress/text-{neutral,info}` tokens.
- `<a-progress-text>` and `<a-progress-hint>` are now tone-aware: in `tone="info"` they pick up `--text-2-info` / `--text-3-info` instead of staying on neutral. Previously this was a visual bug — the descriptive label and hint stayed grey even when the rest of the component shifted to info-blue.
### Added
- New `table-2` icon on `<a-icon>` (Lucide-derived). `synonyms.json` updated with search aliases (`table`, `grid`, `data`, `spreadsheet`, `rows`, `columns`); `a-icon.shapes.{ts,css}` regenerated.
- New `sun` and `moon` icons on `<a-icon>` (Lucide-derived) for theme-toggle UIs.
- New `refresh-ccw-dot` icon on `<a-icon>` (Lucide-derived) — used by the playground's reset button and useful for any "revert to defaults" affordance.


## 0.1.1-dev.3 — May 5, 2026

### Changed
- Dark-mode text tokens `--text-{3,4,5}-{success,critical,warning}` re-anchored to their level-2 base hue (matching the light-mode pattern and the source-of-truth in the Figma "Anta 0.2" library). Visual effect in dark mode: success / critical / warning text at tertiary, quaternary, and quinary priorities shifts slightly toward the level-2 hue. Light-mode tokens are unchanged. All `bg-*` and `border-*` tokens were also audited against the same Figma source — no drift, no changes.

### Removed
- `--text-white` token. It was declared in `anta_global_tokens.css` but referenced nowhere in the package and is not part of the Figma "Anta 0.2" source-of-truth. Consumers relying on `var(--text-white)` should switch to `#ffffff` (or `white`) directly, or define their own variable.

## 0.1.1-dev.2 — May 3, 2026

### Added
- Five new icons on `<a-icon>`: `swatch-book`, `hat-glasses`, `heart-handshake`, `hourglass`, `text-initial` (Lucide-derived). `synonyms.json` updated; `a-icon.shapes.{ts,css}` regenerated.
- `Icon` wrapper gains an optional `label` prop. When set, the wrapper exposes `role="img"` + `aria-label={label}` so the icon is announced. When omitted (the default), the icon is treated as decorative — `aria-hidden="true"` is applied so it doesn't add noise alongside neighbouring text.
- `Progress` wrapper now composes a single `aria-label` from `label` + percentage + `hint`, joined with ` · `, so screen readers announce what sighted users see in one phrase. The element still sets `role="progressbar"`, `aria-valuenow`, and `aria-valuemax` independently.
- `general_types.ts`: `AProgressAttributes` and `AIconAttributes` now declare typed ARIA attributes (`role`, `aria-label`, `aria-valuenow`, `aria-valuemax`, `aria-valuemin`, `aria-hidden`) so JSX type-checks the wrapper's pass-through.

### Changed
- **Convention strengthened (no API impact):** ARIA wiring (`role`, `aria-*`, `tabindex`, etc.) lives in `src/components/<Name>.tsx` JSX wrappers as attribute pass-through, never inside the web component class. Web components stay pure declarative DOM — neither the constructor nor `attributeChangedCallback` mutates host attributes or inline styles. Documented in `CLAUDE.md`.
- Default body `font-weight` in `anta_global_tokens.css` changed to `400` for both `:root, .light` (was `390`) and `.dark` (was `350`). The previous values applied a small optical-compensation offset so dark-mode text was rendered slightly thinner; the new values are uniform regular weight. Apps that override `font-weight` on `:root` or `.dark` are unaffected.

## 0.1.1-dev.1 — May 3, 2026

### Added
- `:root, .light` selector mirror in `anta_global_tokens.css`, so consumers can apply the `light` class to a subtree to opt back into light tokens explicitly even when a `.dark` ancestor would otherwise be in effect (useful for dark/light comparison demos).

## 0.1.0-dev.1 — May 2, 2026

### Added
- `Text` component + `<a-text>` element. Props: `priority` (`primary` / `secondary` / `tertiary` / `quaternary` / `quinary`), `tone` (`brand` / `success` / `critical` / `warning` / `info`), `inline`, `truncate` (`true` for single line, integer ≥ 2 for line-clamp), `expandable` (chevron + fade-out mask, click or Enter to expand).
- `Icon` component + `<a-icon>` element. Mask-based icon set recolored via `currentColor`. `size` prop sets `--icon-size`. 80+ shapes derived from Lucide / Feather / Blueprint sources.
- `scripts/generate-icons.mjs` — Node generator that emits `a-icon.shapes.css` and `a-icon.shapes.ts` from a folder of SVGs. The `.ts` file augments `IconShapes` via a `declare module '@antadesign/anta'` block, so consumer-generated icons auto-merge with Anta's `IconShape` type.
- Global element defaults in `anta_global_tokens.css`:
  - `<a>` styling — color, hairline (0.5 px) underline at 75 % alpha by default, `--link-color-hover` + 1 px underline on hover.
  - `<ul>` / `<ol>` get `padding-left: 3ch` and `li::marker` muted to `--text-5`; `li` gets a `0.5em` bottom margin.
  - `<menu>` is reset (no list-style, no padding, no margins) so consumers can use it as a clean semantic container.
- New tokens `--link-color`, `--link-color-hover` (in `:root` and `.dark`).
- `NOTICES.md` at repo root attributing Lucide (ISC), Feather (MIT), and Blueprint (Apache 2.0) for derived icons; `NOTICES.md` is included in the published tarball.

### Changed
- Prose link styling moved out of the docs `base.css` and into Anta's global tokens, so every consumer of `anta_global_tokens.css` gets the same defaults.

### Notes for upgraders
- If you were inlining your own `a { color: ... }` rule, Anta's defaults will now apply unless overridden — the generated underline / link color / 1 px hover thickness / `currentColor` decoration mirror are picked up automatically. To opt out for a specific element, set `text-decoration: none` and your own `color`.
- If you were styling `<menu>`, `<ul>`, or `<ol>` from scratch, expect the new defaults to take effect; override with more-specific selectors as needed.

## 0.0.x — through April 2026

Initial scaffolding: package layout, `<Progress>` component (`<a-progress>` element + `Progress` JSX wrapper), the light/dark CSS-token system imported from the Figma "Anta 0.2" library (background / text / border tokens × 5 levels × 5 tints + neutral, with hex + oklch dual declarations). No formal versioning during this period; treat as the seed of the design system.
