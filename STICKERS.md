# Sticker component — brainstorm & design notes

## Context

We want a Sticker component in anta. Source of truth is the Stickers page of the Anta Figma library (~50 named stickers). Some stickers are animated (currently 10 Lottie JSON files live in `./animated/` — `01-wondering.json` … `10-looking4bugs.json`); the rest are static.

The hard requirement: **tree-shaking**. A consumer that uses two stickers must ship only those two — not the whole set. Lazy loading is explicitly off the table. Figma has black/white background variants; in code we ship one transparent version per sticker. Component is always square, takes a `size` prop (px) like Icon, and a `paused` prop accepting `boolean | number`.

This document captures the design direction so we can pick it back up later.

## Decisions made

- **Per-sticker named exports, PascalCase prefix.** `StickerVacation`, `StickerCoding`, … exported from `@antadesign/anta/stickers`. Matches lucide-react-style convention, grep-friendly, no collisions.
- **`paused` as a number means seconds.** `paused={1.5}` freezes at 1.5 s. `paused` (bool `true`) freezes at current frame. `paused={false}` or omitted plays.
- **Static-by-default semantics**: every sticker renders as static; animated ones gain the Lottie player only when their per-sticker module is animated. The consumer doesn't pick "static or animated mode" — it's a property of the sticker itself.
- **Static source format: SVG.** Export each static sticker from Figma as SVG into `./stickers-static/`. Inlined per-module by the codegen so there's no extra HTTP request and the asset rides the JS dependency graph (so tree-shaking works). Fallback to PNG only for individual stickers whose Figma art uses raster effects that don't survive SVG export.

## Proposed architecture

### Tree-shaking strategy: codegen + per-sticker JSX module + barrel

Mirror the existing `scripts/generate-icons.mjs` pattern. A new `scripts/generate-stickers.mjs` reads the animated JSONs (and, once decided, the static assets) and emits one module per sticker under `src/stickers/`:

```
src/stickers/
  index.ts                  # barrel: export * from './vacation', etc.
  vacation.ts               # static sticker (inlines SVG, renders <Sticker static={…} />)
  coding.ts                 # animated sticker (imports Lottie JSON, renders <Sticker animated={data} />)
  …
```

Each file is side-effect-free and uses named exports, so bundlers (esbuild, rollup, vite, webpack with `sideEffects: false`) drop unused ones. The barrel re-exports them all; consumers do `import { StickerCoding } from '@antadesign/anta/stickers'` and pay only for what they use.

The shared rendering shell is a single internal component (`src/components/Sticker.tsx`) that the generated per-sticker modules wrap with their bound asset. The shell decides static vs animated based on what's bound.

### Lottie runtime: `@lottiefiles/dotlottie-web`

- Smallest dep tree of the realistic options (Rust/WASM renderer, ~150 KB wasm + small JS).
- WASM init cost is paid once per page, amortised across all stickers.
- Has its own custom element, but we use the class API inside our own `<a-sticker>` shadow DOM so we own the attribute surface and stay consistent with anta's `<a-*>` tag convention.
- **Fallback path**: if a consumer can't accept WASM, swap to `@lottielab/lottie-player` (lottie-web wrapper, JS-only, larger). The `<a-sticker>` boundary makes that a one-file change.

### Web component / wrapper split (follows anta's two-tier convention)

- `src/elements/a-sticker.ts` + `a-sticker.css` — the static carrier. Pure declarative, sized by `--sticker-size` token. Hosts the inline SVG (or `<img>`) in shadow DOM.
- `src/elements/a-sticker.ts` + `a-sticker.css` — the animated carrier. Owns a canvas inside shadow DOM, instantiates the dotLottie player against the JSON it's handed (via a property, not a JSON URL attribute — keeps bundling explicit). Honours `paused` and seek-time as shadow-internal state. Still respects the "no host-attribute mutations from JS" rule.
- `src/components/Sticker.tsx` — internal shared wrapper. Generated per-sticker modules call it with their bound asset; consumers don't import it directly.
- `src/stickers/*.ts` — generated per-sticker named exports. These are the consumer surface.

### Public props (on each `StickerX`)

| Prop                      | Type                | Default | Notes                                                                                |
| ------------------------- | ------------------- | ------- | ------------------------------------------------------------------------------------ |
| `size`                    | `number`            | `256`   | px. Always square. Sets `--sticker-size`.                                            |
| `paused`                  | `boolean \| number` | `false` | `true` = freeze at current frame. `number` = seconds; freeze and seek.               |
| `label`                   | `string`            | —       | Same a11y pattern as Icon: sets `role="img"` + `aria-label`. Omitted ⇒ `aria-hidden="true"`. |
| `className`, `style`, `…rest` | —               | —       | Passed through to the host element.                                                  |

Static stickers ignore `paused`. The prop is still allowed on the type so consumers don't have to branch.

### Call-site examples

```tsx
import { StickerCoding, StickerHeart } from '@antadesign/anta/stickers'

<StickerCoding size={128} />     // animated, autoplay, transparent bg
<StickerCoding paused />         // freeze at frame 0
<StickerCoding paused={1.5} />   // freeze at 1.5s
<StickerHeart size={64} label="Liked" />
```

## Built so far

All 49 stickers ship as a matched pair: animated (Lottie) + static (SVG). The codegen emits two modules per sticker so the bundler can pick exactly the mode the consumer asks for.

- `scripts/generate-stickers.mjs` — reads `src/elements/stickers/<name>/{<name>.json, <name>.svg}` (sticker sources live next to the icon SVG source folder under `src/elements/`) and emits **two** modules per sticker at `src/components/__generated__/stickers/` (under `components/` since they're JSX wrappers; the `__generated__` segment signals "don't hand-edit"): `<name>.ts` (static SVG — the default, imports `Sticker` from the package root `@antadesign/anta`) and `<name>-animated.ts` (Lottie-backed, imports `StickerAnimated` from `@antadesign/anta`). Both pull their runtime wrapper from the root specifier — the same way the icon codegen imports from `@antadesign/anta`; there's no bespoke runtime subpath. Each module has **two named exports**: the JSX component (`Sticker{Name}` or `Sticker{Name}Animated`) for React/Preact, and the raw payload (`svg` string or `animation` object) for non-JSX consumers who assign it directly to a `<a-sticker>` / `<a-sticker-animated>` element. Bundlers tree-shake whichever isn't used. The split is critical for tree-shaking across modes too: a static-only consumer pulls neither dotLottie nor the Lottie JSON; an animated-only consumer pulls neither the static helper nor the SVG markup.
- Internal helpers live as `src/components/Sticker.tsx` (the static helper, exports `Sticker` + `StickerProps`) and `src/components/StickerAnimated.tsx` (the animated helper, exports `StickerAnimated` + `StickerAnimatedProps`). The bare name everywhere is the static/default; `Animated` is the explicit opt-in suffix. `StickerAnimatedProps extends StickerProps` so the type tower mirrors the API.
- **Two custom elements, one responsibility each:** `<a-sticker>` (static — shadow-DOM div populated from the observed `svg` attribute) and `<a-sticker-animated>` (Lottie — shadow-DOM div populated from observed `animation` + `paused` attributes, driven by `lottie-web` with the SVG renderer). Both render entirely inside shadow DOM — they never mutate the host's light DOM, attributes, or inline style. This honours anta's declarative-DOM rule so reactive engines stay in sync. The element classes have no getters/setters: data flows in through HTML attributes, parsed (for animation) inside `attributeChangedCallback`. Sizing is driven by `--sticker-size` which the JSX wrapper composes into the host's `style`.
- **The Lottie runtime is `lottie-web`** (not `@lottiefiles/dotlottie-web`). `lottie-web`'s SVG renderer creates real `<svg>` elements inside the shadow root and updates path / transform attributes per frame. Rasterisation goes through the browser's native SVG renderer (Skia / Core Graphics) — the same pipeline that draws static SVG content — so animated stickers look as crisp as static ones at every size. The previous dotLottie-web path used a canvas-2D WASM renderer which was noticeably softer on retina screens; that gap closes with `lottie-web` + SVG renderer.
- **Wire format is strings on both sides.** Static stickers ship `svg` as a string (the SVG markup itself); animated stickers ship `animation` as a JSON string. The framework's prop diffing (Preact / React 19+) only calls `setAttribute` when the prop reference changes, so module-scope payloads only set the attribute once per element mount. The animated element calls `JSON.parse` inside `attributeChangedCallback` to turn the string into the Lottie object dotLottie needs. Trade-off: each sticker element carries its full payload as an HTML attribute on the DOM node (visible in DevTools, included in `outerHTML`).
- **JSX wrappers are pass-throughs.** Both `Sticker.tsx` and `StickerAnimated.tsx` destructure only the props they need to transform (`label` for ARIA, `paused` for boolean→attribute coercion) and spread the rest onto the element. `svg` / `animation` are set as properties — Preact and React 19+ route those through the elements' property accessors. Anta's sticker components target the modern JSX runtimes only; older React would stringify these into attributes.
- **`LottieData` type** is re-exported from `@antadesign/anta/sticker-runtime/animated` (sourced from `@lottiefiles/dotlottie-web`) so consumers writing their own typed wrappers don't have to depend on dotLottie directly. Inside anta the `animation` field on `StickerAnimatedInternalProps` and `_animation` on the element class are typed as `LottieData | null` — no more `unknown`.
- SVG normalization: the generator drops Figma's dashed component-frame `<rect>`, forces `viewBox="0 0 256 256"` (Figma sometimes exports 1px-off), and sets `width="100%" height="100%"` so the SVG fills whatever sized container the wrapper provides.
- **`src/stickers/` is the source of truth, not `./animated/`.** Once generated, the per-sticker `.ts` files hold the entire Lottie payload as a `JSON.parse("…")` literal — no `.json` file needs to be present at build time. `./animated/` is gitignored; only repopulate it when you have new Lotties to add. Run `pnpm run stickers` manually to regenerate; the normal `pnpm run build` doesn't touch the codegen.
- `src/elements/a-sticker.ts` + `.css` — shadow-DOM canvas, `data` property, observes `paused` attribute (omit = play; present = freeze; numeric = freeze at that time in seconds). Tears the dotLottie instance down on disconnect.
- `src/components/Sticker.tsx` — internal `StickerLottie` wrapper. Binds `data` via a callback ref (works in React and Preact without hooks). Side-effect-registers the element on import.
- `src/general_types.ts` + `src/jsx-runtime.ts` — `AStickerLottieAttributes` + `JSX.IntrinsicElements['a-sticker']`.
- `package.json` — `stickers` script (runs in `build`), `./stickers` + `./stickers/*` exports, `@lottiefiles/dotlottie-web` dep, `./generate-stickers.mjs` re-export.
- `site/src/pages/components/sticker.mdx` + `site/src/components/StickerDemo.tsx` — docs page with play/pause/freeze-at-1s controls and the sidebar entry under Components.

Tree-shaking boundary verified: `dist/elements/index.js` does not import `a-sticker`, so the dotLottie runtime is pulled only when a sticker import reaches `Sticker.tsx`.

## SVG inlining is verbatim

The generator does **no post-processing** on the SVG content. Whatever the user pastes into `<name>.svg` gets `JSON.stringify`'d (for safe JS-string escaping) and inlined into the module. No viewBox rewriting, no width/height forcing, no Figma-artifact stripping. The consumer is responsible for exporting clean SVGs from Figma (export the `type=static` symbol — 256 × 256 with no parent-frame artifacts).

Sizing is handled entirely by CSS in `a-sticker.css`:

```css
a-sticker > svg { display: block; width: 100%; height: 100%; }
```

That rule overrides any inline `width`/`height` attributes the SVG carries, so the artwork fills the `<a-sticker>` host regardless of what dimensions Figma exported.

## Consumer codegen

Mirrors the icon pattern. Consumers drop their own Lotties into a folder structured like:

```
my-stickers-src/
  happy/
    happy.json
  sad/
    sad.json
```

Then run the published generator pointed at that folder:

```sh
node ./node_modules/@antadesign/anta/dist/generate-stickers.mjs \
  --input ./my-stickers-src \
  --output ./src/my-stickers
```

The generator emits one `Sticker{Name}` per sub-folder plus an `index.ts` barrel, each importing `Sticker` / `StickerAnimated` from `@antadesign/anta` — the package root, so it resolves wherever the consumer's bundler finds anta (no special runtime subpath, mirroring the icon codegen). Tree-shaking, ARIA, and the `paused` semantics behave the same as anta's built-in stickers; the only difference is the import root.

Consumer-side use:

```tsx
import { StickerHappy } from './my-stickers'
<StickerHappy size={96} />
```

`@antadesign/anta/sticker-runtime` loads dotLottie + registers `<a-sticker>` on import. Consumers who never import a sticker (built-in or generated) never pull either, since the runtime entry is only reached through a sticker module.

## Still outstanding

- **Naming reconciliation done.** All 49 stickers use Figma-canonical names (`StickerScared`, `StickerWorkFocus`, etc.). Mapping was done manually via the docs demo — each Lottie's visual was compared against the Figma cards. The second `search` Figma card becomes `StickerSearchBugs`.
- **Name pass (post-reconciliation).** A round of renames to favor shorter, clearer, more intuitive names and to drop numbered suffixes where the art supports a distinct name. The canonical folder name under `src/elements/stickers/<name>/` (and its `<name>.json`/`<name>.svg`) is the source of truth — rename the folder + both files, update `DEFAULT_BUILT_IN` in `scripts/generate-stickers.mjs` to match, then `pnpm run stickers` to regenerate. Mapping applied: `laughing→laugh`, `work-focus→work`, `thumbs-up→wink`, `peek→surprised`, `suspicious→disapprove`, `hide-leaves→peekaboo`, `butterfly→butterfly-snake` (net + snake + butterflies), `butterfly-2→butterfly` (the clean single-butterfly one), `advice→idea`, `search→detective`, `dance-1→dance`, `grew→grow`, `waiting→wait`. `search-bugs` (Sherlock hat + magnifier-on-a-bug) and `thumbs-up-2` were left as-is.
- **Verification still owed:**
  - Manual: open `/components/sticker/` in the running dev server and confirm all 50 play, pause, and freeze at 1s.
  - Bundle audit: build a throwaway consumer that imports a single sticker; confirm only that sticker's JSON ends up in the output bundle.
  - SSR smoke test in the Astro site — the sticker page builds (verified), but render one in a non-island context to confirm no `HTMLElement` reference fires at module top level.
  - Performance: 50 simultaneous Lottie players on one page (the docs demo) — keep an eye on CPU/GPU. If it's painful, the demo can switch to render-on-visible (IntersectionObserver).

## Out of scope for now

- Black/white background variants — Lotties are transparent, consumer controls background.
- A `tone` / `background` prop — easy to add later if needed.
