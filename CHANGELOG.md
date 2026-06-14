# Changelog

All notable changes to the `@antadesign/anta` package are documented here.

This file only tracks what ships to npm consumers — anything under `src/`, `dist/`, the build / generator scripts, and root files in the published tarball. Updates to the documentation site at `anta.design` are not consumer-facing and are intentionally not in this changelog; see the commit history for the site narrative.

Versions ending in `-dev.N` are pre-release builds published under the npm `dev` dist-tag; main releases drop the suffix. Always pin a specific version in your `package.json` (`"@antadesign/anta": "0.1.1-dev.1"`) rather than the floating `"dev"` tag — the floating tag tracks the latest dev build and will silently change between installs.

## 0.2.2 — Unreleased

### Breaking
- **Tooltip is pinned under the anchor by default; cursor-following is now opt-in via `follow`.** Previously `<Tooltip>` / `<a-tooltip>` followed the cursor by default. It now pins beneath the anchor (matching the convention used by Material, shadcn, Carbon, Polaris). Pass `follow` for the cursor-tracking behaviour — it trails the pointer and fades by the cursor's distance from the anchor (full within ~10px, transparent by ~100px, snapping away instantly past that), instead of hanging at full opacity and trailing until the close timer fires. **The `static` attribute / prop is removed** — pinning is the default now, so drop it; add `follow` to anything that relied on the old following behaviour. `interactive` is always pinned (it ignores `follow`).

### Added
- **`--tooltip-padding`** token (defaults to `4px 8px`).
- **Tooltip `::part(bubble)`** — the bubble surface inside the shadow popover is exposed as a shadow part, so consumers can style it directly (`a-tooltip::part(bubble) { … }`) for things the `--tooltip-*` tokens don't cover.

### Changed
- **`copy` icon is rotated a quarter-turn.** `<Icon shape="copy" />` / `<a-icon shape="copy">` now ships rotated 90° by default (the orientation used in most places), so consumers no longer need a per-use `transform: rotate(90deg)`.

### Fixed
- **Button ignores empty / whitespace-only / `NaN` children instead of wrapping them.** `Button` auto-wraps text and number children in `<a-button-label>`; it now drops children that carry no visible content — `""`, whitespace-only strings, and `NaN` — rather than emitting a blank label (which added padding/structure for no text). `null`, `undefined`, and boolean children render nothing, and element children still pass through unwrapped; a valid `0` still renders.
- **Button icon padding no longer miscounts a `<Tooltip>` child.** A `<Tooltip>` is invisible (`display: contents` host, out-of-flow popover) but was counted by the `:first-child` / `:last-child` / `:only-child` selectors that drive icon padding — so an icon-only button with a tooltip lost its square padding, etc. Those selectors now discount `a-tooltip` in any position.

## 0.2.1 — June 10, 2026

### Changed
- **Secondary buttons: inset hairline edge.** The default `secondary` priority's edge is now an *inset* hairline — `box-shadow: inset 0 0 1px color-mix(in oklch, currentColor, transparent 70%)` (was a non-inset `0 0 1px color-mix(in oklch, currentColor, transparent 50%)` in 0.2.0). Softer and contained within the chip.
- **Button loading overlay is subtler.** `--button-loading-opacity` lowered from `0.25` to `0.15`.
- **Table borders use `--border-4`.** Raw `<table>` row separators and the `data-bordered` variant's outer frame + column dividers now use `--border-4` instead of `--border-5` — a touch stronger so the structure reads more clearly. (Both still live in `@layer anta`, overridable as before.)
- **Monospace text carries no letter-spacing.** The reset now sets `letter-spacing: 0` on `code, kbd, samp, pre`, so a global `letter-spacing` an app applies to body prose no longer loosens code (code is metrically even by design).

### Packaging
- **Published CSS is now minified.** `build:css` runs the shipped CSS through esbuild (`--minify`), stripping comments and collapsing whitespace — smaller files in the tarball, identical rendering. Source and dev builds keep readable, commented CSS.

## 0.2.0 — June 9, 2026

### Added
- **New `Tag` component** (`<Tag>` / `<a-tag>`). A compact uppercase pill for status, labels, and metadata. CSS-only (no JS, no shadow DOM) like `<Title>` — tone, size, and case are plain attributes. Content is composed from `icon` / `iconTrailing` (icon shapes), `label`, and `value` props, the same way `<Button>` works; `value` is the primary text (default color/weight) and `label`, when paired with a value, renders as a bold "key" before it (same color, weight 600, no divider — a lone label is treated as the primary text and keeps the default styling). Passing raw `children` instead gives a segmented tag: each segment after the first gets a hairline divider (a leading icon stays flush). `tone` takes the five named tones (`brand` / `info` / `success` / `warning` / `critical`), defaulting to a neutral gray when omitted, **or any literal CSS color** for a one-off custom tone (hue kept, lightness/chroma pinned to the named-tone curve via `oklch(from …)`, re-tuned for dark mode — same mechanism as `<Button>`). Named tones source `--text-2-{tone}` / `--bg-4-{tone}`, so light/dark track automatically. `size="small" | "medium" | "large"` (16 / 20 / 24px, default `medium`, matching `Button`); `nocaps` opts out of the default uppercase. Height is intrinsic (line-height + padding, no fixed height, so text is never clipped); tabular figures (`tnum`) plus `ss05` alternate numerals are always on so counts / versions / timers don't reflow. Exposes `--tag-text`, `--tag-bg`, `--tag-border`, `--tag-separator`, `--tag-padding-block`, `--tag-padding-inline`, `--tag-gap`, `--tag-icon-size`, `--tag-label-weight` (the border + separator derive from `--tag-text`). Registered via the `@antadesign/anta/elements` barrel.
- New `tag` icon shape (lucide), available as `<Icon shape="tag" />` / `<a-icon shape="tag">` and in the `IconShape` union (synonyms: `label`, `badge`, `chip`).

### Breaking
- **Stickers extracted to a separate package, `@antadesign/stickers`.** All sticker code and artwork moved out of `@antadesign/anta` — and with it, the `lottie-web` dependency. Removed from this package: the `Sticker` / `StickerAnimated` components and their types, the `<a-sticker>` / `<a-sticker-animated>` elements, and the `@antadesign/anta/stickers`, `@antadesign/anta/stickers/*`, and `@antadesign/anta/generate-stickers.mjs` subpath exports. Apps that don't use stickers no longer install `lottie-web` at all. Migration: `npm install @antadesign/stickers` (it depends on `@antadesign/anta` + `lottie-web`) and change imports — `@antadesign/anta/stickers` → `@antadesign/stickers`, `@antadesign/anta/elements` (for sticker tags) → add `@antadesign/stickers/elements`. The component API (`size`, `label`, `paused`) and the generator are unchanged.

### Changed
- **`<Text>`'s default `priority` is now `secondary` (was `primary`).** A plain `<Text>` (and `<Text tone="…">`) now renders one step softer — `--text-2` / `--text-2-{tone}` instead of `--text-1` / `--text-1-{tone}` — so default body text isn't the strongest foreground. `primary` is now the explicit opt-in for `--text-1`; `tertiary`–`quinary` are unchanged. Migration: add `priority="primary"` to any `<Text>` that relied on the old strongest default.
- **Selected buttons gain an inset ring.** `selected` now adds `box-shadow: inset 0 0 0 1px currentColor` — a 1px outline in the current foreground color (up from the prior 0.5px) — on top of the existing pressed/active look. Declared after the priority blocks so it survives their `box-shadow` cancels regardless of priority.
- **Secondary buttons gain a hairline edge.** The default `secondary` priority now carries `box-shadow: 0 0 1px color-mix(in oklch, currentColor, transparent 50%)` — a 1px outline in the current foreground tone at 50% alpha — giving the tinted chip a subtle border. `primary`, `tertiary`, and `quaternary` explicitly cancel it (`box-shadow: none`).
- **Secondary button rest labels darkened slightly (light mode).** The `secondary` rest foreground is now shifted down `0.05` in oklch lightness (`oklch(from var(--button-fg-secondary-rest) calc(l - 0.05) c h)`) so the label reads a touch stronger. Applied dynamically at the `--button-fg` wiring via the `--button-fg-secondary-l-shift` knob, so it covers every tone — named and custom alike. Hover / active are unchanged, and dark mode zeroes the shift (`--button-fg-secondary-l-shift: 0`).
- **Quaternary button labels are slightly heavier.** `priority="quaternary"` sets `font-weight: 415` (vs the `450` shared default) so the faded quaternary text holds up at its lower opacity.
- **Quaternary buttons now read quieter than tertiary.** A `priority="quaternary"` button's rest foreground is the tone at 90% alpha (`color-mix(in oklch, var(--button-fg-quaternary-rest) 90%, transparent)`) — slightly faded — so it's visually distinct from the full-opacity tertiary (previously the two looked identical at rest). Hover / active restore full opacity.

### Fixed
- **An empty `tone` on a button no longer renders it invisible.** A `tone=""` (e.g. when a consumer clears the prop) matched the custom-tone branch by attribute presence, where the empty value resolved to `transparent` and wiped the button's foreground/background. Both the wrapper and the element now treat an empty `tone` as "no tone" → the neutral default: `<Button>` collapses `tone=""` to omitting the attribute, and the element CSS excludes `[tone=""]` from the custom-tone selector (so a hand-authored `<a-button tone="">` renders neutral too). A missing `tone` attribute was already correct.

## 0.1.1-dev.8 — June 5, 2026

### Added
- **New `Tooltip` component** (`<Tooltip>` / `<a-tooltip>`). A small floating bubble placed as a child of the element it describes — it doesn't affect that element's layout and its content can be anything (slotted light DOM). Shows on hover (after `delay`, default 250ms) and keyboard focus (gated on `:focus-visible`, so a click/tap that merely focuses the anchor doesn't surface it); dismisses on mouse leave, blur, <kbd>Esc</kbd>, or when the anchor scrolls away. On touch devices it opens on **press-and-hold** (~500ms) and lingers ~1.5s after the finger lifts so it stays readable — a quick tap never shows it. Follows the cursor by default; pass `static` to pin it under the anchor, or `interactive` to make the bubble hoverable + clickable (pointer events on, stays open while the cursor is over it — for content like links; implies `static`). `placement="top" | "bottom"` (default `bottom`) auto-flips when there's no room. Renders in the top layer via the Popover API; one tooltip shows at a time, with a short close delay so moving between anchors cross-fades cleanly instead of blinking. Exposes `--tooltip-bg`, `--tooltip-shadow`, `--tooltip-border`, `--tooltip-backdrop-filter`, `--tooltip-radius`, `--tooltip-max-width` (shadow-only theming surface) — so a bubble can be made fully transparent and borderless, or given a real border. The bubble gives its slotted content a normalized text baseline (Anta body typography: `--text-3`, `wdth 100`, `0.02ch` letter-spacing, `1.5` line-height) so the anchor's text styling — e.g. a `<Button>`'s condensed width axis or letter-spacing — doesn't bleed into it; customise a single tooltip's text with a class on your content.
- **Granular element registration / smaller bundles.** Each element can now be imported on its own — `import '@antadesign/anta/elements/a-tooltip'` registers just that element **and loads its CSS**, pulling in only that element's code. A tooltip- or button-only app no longer ships `lottie-web` (which only `a-sticker-animated` needs). The convenience barrel is unchanged: `import '@antadesign/anta/elements'` still registers everything. Implementation: each `a-{name}` module self-registers and imports its own CSS on load; the barrel re-exports them.

### Dependencies
- Added [`es-toolkit`](https://es-toolkit.dev) (`1.47.0`) as a runtime dependency. It's imported with named, tree-shakeable imports, so consumer bundlers include only what's used — currently just `debounce` (in the `<a-tooltip>` element).

### Fixed
- **Anchor-buttons (`<Button href>` / `<a role="button">`) no longer pick up link colour + underline** from Anta's global link reset. `a:link` / `a:visited` are pseudo-classes with the same `(0,1,1)` specificity as `a[role="button"]`, so they tied the button rule and won on source order. The reset's link selectors now exclude `[role="button"]` (`a:not([role="button"])…`), so anchor-buttons keep their button styling. Affects `reset.css`.
- **Button & link `:hover` styles no longer stick after a tap on touch devices.** Hover-only appearance changes (button color/background per priority, the tertiary/quaternary underline, and the global `a` / `a-text a` link hover) are now gated behind `@media (hover: hover) and (pointer: fine)`, so they apply only on real-pointer devices. On touch, buttons and links return to their rest state after a tap instead of keeping the hover look until the next tap elsewhere; `:active` / `[selected]` press feedback is unchanged. Affects `a-button.css`, `reset.css`, and `a-text.css`.

## 0.1.1-dev.7 — June 3, 2026

### Added
- **New `Button` component** (`<Button>` / `<a-button>`). Five named tones (`neutral` default / `brand` / `info` / `success` / `warning` / `critical`) plus any literal CSS color as a custom tone; four priorities (`primary` / `secondary` / `tertiary` / `quaternary`); three sizes (`small` / `medium` / `large`); `icon` / `trailingIcon`, `label`, `loading`, `selected`, `disabled`, `paddingless`; anchor mode via `href`. Registered via the `@antadesign/anta/elements` barrel.
- New `rotate-ccw` icon shape (lucide), available as `<Icon shape="rotate-ccw" />` / `<a-icon shape="rotate-ccw">` and in the `IconShape` union.

### Breaking
- **Background tokens renamed to a numeric elevation scale.** The named background custom properties are replaced by `--bg-1 … --bg-5` (by elevation, 1 = deepest / recessed, 5 = most raised): `--bg-section`→`--bg-1`, `--bg-base`→`--bg-2`, `--bg-pane`→`--bg-3`, `--bg-block`→`--bg-4`, `--bg-spot`→`--bg-5`. Tinted variants follow the number: `--bg-base-info`→`--bg-2-info`, `--bg-spot-info`→`--bg-5-info`, etc. `--bg-1` is neutral-only (no tinted variant). Values are unchanged. `--text-1…5` and `--border-1…5` are unaffected. No back-compat aliases are shipped (prerelease). Migration: rename `var(--bg-base)`→`var(--bg-2)` and so on; if you prefer named tokens, alias them in your own `:root` (e.g. `--bg-base: var(--bg-2)`).
- **`<Button>`'s `iconButton` prop is removed** and **`leadingIcon` is renamed to `icon`**. Icon-only behavior is now purely structural: pass `icon` with no `label`, `trailingIcon`, or `children`, and the existing CSS rule (`a-button:has(> a-icon:only-child)`) gives the host the square padding + min-size pin. No opt-in attribute. Migration: `<Button iconButton leadingIcon="check" />` → `<Button icon="check" />`; `<Button leadingIcon="check" label="…" />` → `<Button icon="check" label="…" />`. `trailingIcon` is unchanged.

### Changed
- **Button sizes grew 2px taller.** Vertical padding gained 1px top and bottom across all sizes (and horizontal padding 1px each side to match), so the default `medium` button is now **28px** tall (was 26): `small` 22 → 24, `medium` 26 → 28, `large` 30 → 32. `padding-y` is now 3 / 5 / 7 and text-edge `padding-x` 7 / 9 / 13 (small / medium / large); icon-edge padding stays text-edge − 2px. Icon-only square buttons track the same heights (min-size 24 / 28 / 32). Font size and the 18px label line-box are unchanged.
- **Dark theme palette comprehensively retuned.** Every dark-mode background and border token — neutral plus all five tinted tones (brand / success / critical / warning / info) — was reworked into hand-tuned `hsl()` values, deepened from the Anta 0.2 baseline so dark surfaces and borders read with less glare. The dark background and border ramps are now authored in HSL; light mode and dark text tokens are unchanged.
- **Raw `<code>` now sets `line-height: 1em`** (in `src/reset.css`, `@layer anta`) so inline code no longer inflates the line box of the prose it sits in.
- **Neutral secondary button background retuned.** Light mode evens out its rest→hover→active ramp — active drops from ~20% to ~15% alpha (`#44374b33` → `#44374b26`), giving ~7 → 10 → 15% instead of the abrupt 7 → 10 → 20. Dark mode is retuned to ~11 → 14 → 18% (`#e4d1ef` at `1c`/`24`/`2e`, from `1a`/`26`/`33`). Other tones unchanged.
- **Dark neutral `--bg-base` / `--bg-section` adjusted** (now `--bg-2` / `--bg-1` after the rename above). `--bg-base` lightened to `hsl(280 10% 5.5%)` and `--bg-section` set to near-black `hsl(280 20% 0%)`, so the deepest surface now sits *below* the page base in lightness — elevated / code surfaces read as recessed rather than raised. `--bg-block` and `--bg-spot` (now `--bg-4` / `--bg-5`) were also nudged (`#161316` / `#1a171b`); `--bg-pane` (`--bg-3`) and all tinted tones are unchanged. (These were later converted from `hsl()` to hex.)
- **Dark tinted button fills bumped (secondary, tertiary, custom tones).** The five named tinted tones (`brand` / `critical` / `info` / `success` / `warning`) step their dark-mode **secondary** fill to 23 → 28 → 33% alpha (rest / hover / active), from ~15 → 20 → 25%; their **tertiary** hover/active fills move in lockstep to 23 → 28%. Custom (color-literal) tones get the same dark ramp via the `--_tone-bg-a-*` knobs (`0.23 / 0.28 / 0.33`). Neutral steps its secondary rest up to ~11% (~11 → 14 → 18% secondary, ~8 → 13% tertiary).
- **Loading stripe animation sped up** — `--button-loading-duration` default `1s` → `0.5s` (override per-instance to taste).
- **Link hover no longer repaints the underline color.** `a:hover` now only thickens the underline (0.5px → 1px); the underline keeps its resting hairline color (the `currentColor` 75% mix) instead of switching to the solid `--link-color-hover`.
- **Quaternary button press feedback (light mode).** `priority="quaternary"`'s `:active` now lightens the rest foreground by `0.05` in oklch lightness (`oklch(from var(--button-fg-quaternary-rest) calc(l + 0.05) c h)`) for a subtle pressed look, instead of snapping back to the rest color. Dark mode is unchanged — it still returns to rest, since lightening would brighten the already-light foreground.
- **Button label `font-weight` softened from `500` to `450`.** Applies to every `<Button>` / `<a-button>` label across all priorities and sizes.
- **Boolean button attributes now render as presence, not `="true"`.** `<Button>`'s `selected` / `disabled` / `loading` / `paddingless` props now emit a presence attribute (`disabled=""`) instead of `disabled="true"`, and the element CSS matches them by presence (`a-button[disabled]`, not `[disabled="true"]`). The wrapper API is unchanged (still boolean props); hand-authored elements keep working whether you write `disabled`, `disabled=""`, or the old `disabled="true"` (presence matches all). ARIA mirrors (`aria-pressed`, `aria-disabled`, `aria-busy`) stay string-valued.
- **Custom-tone `primary` fill now normalizes lightness.** Instead of painting the raw color, a custom `tone` on `priority="primary"` keeps the source hue + chroma but pins its lightness near the Brand primary's (via `oklch(from … L c h)`), with hover/active stepping the lightness — so a too-light or too-dark input still lands at a Brand-like fill. Re-tunes between light and dark through the same knobs, like the named tones. Secondary/tertiary/quaternary (hue-only) are unchanged.

### Fixed
- **`<a-icon>` with a raw `size` attribute no longer collapses to 0×0 on browsers without typed `attr()`** (iOS Safari, Firefox). The `a-icon[size]` rule is now guarded by `@supports`, so where typed `attr()` is unsupported the icon falls back to the visible 16px default instead of vanishing. Use the `<Icon size={N}>` JSX wrapper (which sets `--icon-size` inline) for an exact custom size on those browsers.

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
