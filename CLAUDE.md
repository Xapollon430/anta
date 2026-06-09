# Anta — Antithesis Design System

Published as `@antadesign/anta` on npm. Portable UI component library. Works in React apps out of the box, in Preact via compat aliasing (`react` → `preact/compat`), and in custom runtimes via `configure()`.

This repo is a pnpm workspace with **two publishable packages** plus the docs site:
- `@antadesign/anta` — this package, at the repo root (`src/`, `dist/`).
- `@antadesign/stickers` — the sticker pack, in top-level [`stickers/`](stickers/CLAUDE.md). It owns the `<a-sticker>` / `<a-sticker-animated>` elements, the `Sticker` / `StickerAnimated` wrappers, the artwork, and the **only** `lottie-web` dependency. It depends on `@antadesign/anta` for the JSX runtime and shared helpers. Kept separate so anta carries no animation runtime. **Anything sticker-related — components, tokens, docs page, the generator — lives there, not here.**
- `site/` — the docs site (not published).

## Architecture

Two tiers per component:

- **`src/elements/`** — Web components (custom elements). Attribute-driven, shadow DOM for rendering, plain CSS for token definitions. Files: `a-{name}.ts`, `a-{name}.css`. The external CSS file defines CSS variable tokens on the host, and the shadow DOM style references those variables. No visible attributes are set from JS on the host element — only shadow-internal styles are modified (e.g. setting `--_percent` on an internal element).
- **`src/components/`** — JSX wrappers. State management, CSS modules. Files: `{Name}.tsx`, `{Name}.module.css`. These handle logic and provide a typed component API. Use `clsx` (imported as `cn`) for class joining. Forward `style` and extra props via spread to the underlying web component.

The tiers are decoupled — JSX wrappers emit `<a-*>` tags but never import element definitions. Binding is by tag name at runtime.

### Key files

- `src/jsx-runtime.ts` — Custom JSX runtime. Defaults to `React.createElement`. Call `configure(h)` to swap.
- `src/types.d.ts` — CSS module type declarations and `JSX.IntrinsicElements` for `a-*` custom elements.
- `src/elements/index.ts` — Barrel export that auto-registers all web components in browser contexts. **Must only be imported client-side** — `HTMLElement` does not exist in Node/SSR.
- `src/index.ts` — Barrel export for JSX components and `configure()`.

## Build & dev

Source lives in `src/`. Build output goes to `dist/`. `dist/` is gitignored — `pnpm install` regenerates it via the `prepare` lifecycle script, and `npm publish` regenerates it via `prepublishOnly` so the published tarball is always fresh. The package is distributed only through npm; the GitHub-URL install path is not supported.

```sh
pnpm run build        # Full build: JS + CSS + types
pnpm run build:js     # esbuild: TSX/TS → dist/*.js
pnpm run build:css    # Copy CSS files to dist (esbuild non-bundle mode doesn't output them)
pnpm run build:types  # tsc: emit .d.ts declarations
pnpm run typecheck    # Type check without emit
```

### Running the dev server — always `pnpm run dev` from the repo root

**For any dev work — editing the anta package *or* the docs site — run `pnpm run dev` from the repo root** (run it in the background; it's long-lived). It does both halves together:

- a `nodemon -w src -w stickers/src` watcher that **rebuilds `dist`** (anta, then `@antadesign/stickers`) and regenerates the site's `docs:*` artifacts on every change to either package's `src/**/*.{ts,tsx,css}`, and
- the docs site's `astro dev` (HMR for `site/`).

The docs site consumes anta from the built `dist/` (workspace symlink), so this is what propagates an anta-source change through to the running site. **Do not** run `cd site && pnpm run dev` for package work — that starts only the site's Astro dev and will *not* rebuild `dist`, so anta `src` edits won't show up and you'd be stuck manually rebuilding + restarting. Pure `site/` edits (`.mdx`, Astro/Preact components) HMR fine under either, but the root command is the one to use so package edits Just Work too.

**Important**: esbuild runs in non-bundle mode (no `--bundle` flag). It compiles each entry point individually but does **not** process CSS imports — it leaves `import "./a-progress.css"` in the JS output without copying the CSS file. The `build:css` step copies CSS files manually. When adding a new component, add its CSS files to `build:css`.

Uses `jsx: "react-jsx"` with `jsxImportSource: "@antadesign/anta"` (automatic transform). The compiled output self-references the package via the exports map: `import { jsx } from "@antadesign/anta/jsx-runtime"`.

### CI

`.github/workflows/ci.yml` runs on pull requests to main:
1. `pnpm run build` — build anta
2. `pnpm run typecheck` — type check
3. `pnpm --filter anta-site build` — build the docs site

## Package consumption

Consumers can use anta via:
- **npm**: `"@antadesign/anta": "dev"` (prerelease) or a specific version
- **Local link**: `"@antadesign/anta": "link:/path/to/anta"` (for development)

The `exports` map handles all subpath imports. Explicit entries exist for `.`, `./jsx-runtime`, `./elements`, `./elements/*`, plus a `"./*"` wildcard fallback. `main` and `types` fields provide fallback for classic `moduleResolution: "node"`.

`react` is a **peer dependency** — consumers provide it (or alias it to `preact/compat`).

### SSR caveat

`@antadesign/anta/elements` registers custom elements using `HTMLElement`, which does not exist in Node.js. In SSR contexts (Astro, Next.js), import it client-side only:

```tsx
// In Astro: use a <script> tag (client-side by default)
<script>import '@antadesign/anta/elements'</script>

// In a Preact/React island: dynamic import inside useEffect
useEffect(() => { import('@antadesign/anta/elements') }, [])
```

## npm publishing

Two packages publish from this repo: **`@antadesign/anta`** (root) and **`@antadesign/stickers`** (`stickers/`). Both go out as prereleases under the npm `dev` dist-tag. Each version string is immutable on npm — **always bump before publishing**.

> **If asked to publish — or to recall how — walk the user through this, in order.** The order and the `pnpm` vs `npm` distinction are the two easy things to get wrong.

**Publish anta first, then stickers.** `@antadesign/stickers` depends on `@antadesign/anta` via `workspace:*`, which pnpm rewrites to anta's **exact current version** at pack time. So the anta version stickers will pin must already be on npm — and it must be the version that carries whatever exports stickers imports (e.g. `./anta_helpers`, `./general_types`). Publishing stickers against an anta version that isn't published yet (or predates an export it needs) makes `npm install @antadesign/stickers` unresolvable.

```sh
# 1) anta — from repo root
npm version prerelease --preid=dev        # 0.1.1-dev.8 → 0.1.1-dev.9 (or bump the version field by hand)
npm publish --access public --tag dev     # prepublishOnly rebuilds dist

# 2) stickers — from stickers/
cd stickers
pnpm publish --no-git-checks              # access/tag come from its publishConfig
```

- **Use `pnpm publish` for `stickers`, not `npm publish`.** Only pnpm rewrites the `workspace:*` protocol to a real version; `npm publish` would leave `workspace:*` in the tarball and the package would be uninstallable. (anta has no workspace deps, so `npm publish` is fine there.)
- `stickers/package.json` has `publishConfig: { access: "public", tag: "dev" }`, so its publish needs no `--access` / `--tag` flags. anta passes them explicitly.
- `prepublishOnly` (anta) / `prepare` (both) rebuild `dist` before the tarball is created, so published output is always fresh.
- Bumping the `version` field by hand (vs `npm version`) skips the auto git commit + tag. If you tag releases, create the tag manually; otherwise no action needed.
- 2FA: append `--otp=<code>` if your npm account requires it.

## Changelog

`CHANGELOG.md` at the repo root documents changes to **the `@antadesign/anta` package only** — code shipped to npm consumers (anything under `src/` and `dist/`, plus root files in the published tarball). The docs site under `site/` is its own thing and **does not** belong in the changelog. New site pages, component-docs polish, demos, layout tweaks — all of that ships only on `anta.design` and isn't a consumer-facing change.

When in doubt: would a consumer who installs this version see this change in their app? If no, leave it out of `CHANGELOG.md`. Use commit messages and PR descriptions for the docs-site narrative.

## Documentation site

The `site/` folder is the anta design system documentation website, built as a pnpm workspace member.

**Stack**: Astro 5 (static output) + Preact + MDX + astro-expressive-code (syntax highlighting, tokyo-night theme). Remark plugins: GFM, math, directive, definition-list, attributes. Rehype plugins: slug, autolink-headings, mathjax.

**Structure**:
- `site/src/layouts/DocsLayout.astro` — Sidebar + main content shell. Imports `@antadesign/anta/elements` via client-side `<script>`.
- `site/src/pages/` — `.astro` pages for static content, `.mdx` pages for component docs with code examples
- `site/src/components/` — Preact islands (`.tsx`), hydrated with `client:load`/`client:visible`. The shared `Playground.tsx` is the standard interactive demo for component pages (see "Adding a component docs page"); other islands here are one-off non-playground demos (e.g. `AnimatedProgress.tsx`)
- `site/src/styles/base.css` — Minimal reset and typography (inline values, no CSS variables — will adopt anta's global tokens when available)

**How it uses anta**: `"@antadesign/anta": "workspace:*"` resolves to the local package. Anta must be built first (`pnpm run build` in root). Preact compat (`@astrojs/preact({ compat: true })`) aliases `react` → `preact/compat`, so anta's jsx-runtime works without calling `configure()`.

```sh
cd site && pnpm run dev      # Dev server
cd site && pnpm run build    # Static build
```

**Adding a component docs page**: Create `site/src/pages/components/{name}.mdx` with `layout: ../../layouts/DocsLayout.astro`. For an interactive **playground** (editable code + live preview + auto props form), **use the shared `<Playground>` component** — `<Playground client:visible component="{Name}" layout="side" initialCode={…} />` — with the `initialCode` string kept in a sibling `{name}.demo.ts` file. The `initialCode` is plain TSX (imports + a trailing JSX block, auto-wrapped in a fragment, so it can contain multiple/nested elements). **Do not hand-roll a bespoke per-component playground island** — the shared one gives a consistent editor, props panel, and isolated iframe across every page, and is being extracted into its own package. Reserve custom Preact islands (`site/src/components/*.tsx`, `client:load`) for *non-playground* demos that the playground can't express — e.g. a self-animating preview like `AnimatedProgress`. See `site/CLAUDE.md` for the playground internals.

## Design references

When naming components, props, CSS variables, internal class names, or suggesting patterns, reference established design systems: Material Design, shadcn/ui, Carbon Design System, and Shopify Polaris Web Components. Prefer terminology and conventions already used by these libraries over inventing new ones.

## Working with Figma

See `FIGMA.md` for rules when extracting tokens, components, or styles from the Anta Figma library. Key rule: **always read the full variable list directly from the collection** — don't infer the token set from `get_variable_defs` on a sample node, because tokens that aren't placed on the queried node won't appear, and you'll silently miss values.

## Color manipulation

**To tune the alpha of any color (variable, `currentColor`, hex, etc.), always use `color-mix(in oklch, <color> <percent>%, transparent)`**. Mixing in `oklch` keeps the perceived hue/lightness stable, while the percent maps directly to the desired alpha (e.g. `50%` → 0.5 alpha). This is the standard pattern in Anta — do not reach for `rgba(...)`, hex-with-alpha (`#rrggbbaa`), or `opacity` on the parent when only the alpha of one color needs to change.

```css
/* underline at half-strength of the link's color */
text-decoration-color: color-mix(in oklch, currentColor 50%, transparent);

/* token at 80% alpha */
border-color: color-mix(in oklch, var(--border-4) 80%, transparent);
```

The same rule applies anywhere we lighten/darken/desaturate a color: prefer `color-mix(in oklch, <color> <p>%, <other-color>)` so all interpolation happens in a perceptually-uniform space.

## Conventions

- **Declarative DOM** — Web components are pure declarative. **No element class — neither the constructor nor `attributeChangedCallback` nor any handler — may call `setAttribute`, mutate `className`, set inline `style`, or otherwise change anything on the host element that's visible in the DOM tree.** The host's attributes and inline styles must come from the JSX wrapper (or from the consumer writing `<a-…>` directly). Only shadow-internal elements may be mutated from JS.
- **ARIA goes in JSX wrappers, not web components.** All `role`, `aria-*`, `tabindex`, etc., are added by `src/components/<Name>.tsx` as attribute pass-through, never by `AXxxElement.constructor`. This keeps the web component re-renderable from any reactive engine without state churning the DOM, and keeps the elements usable in non-React/Preact contexts where the consumer adds ARIA themselves. The single exception is when the wrapper passes a value through (e.g. `aria-valuenow={value}`); the wrapper is a thin JSX→DOM bridge and that's its job.
- **Boolean attributes — emit presence, match by presence.** A JSX wrapper maps each boolean prop to `prop ? '' : undefined` — never the raw boolean, never `'true'`. The empty string renders the canonical presence form `attr=""` *consistently across React and Preact*; `undefined` omits the attribute. (Passing the raw boolean is non-portable: Preact stringifies `true` → `attr="true"`, while React 19 renders `attr=""`. `'true'` works but leaves a verbose, misleading `attr="true"` in the DOM.) The element's CSS must then match by **presence** — `a-button[disabled]`, **not** `[disabled="true"]` — so it catches `=""`, `="true"`, and bare presence alike, which also makes hand-authored `<a-… disabled>` work. This is safe against false-positives because the falsy state is always *absence*: `prop ? '' : undefined` makes `false → undefined`, which every React/Preact version omits (and even a raw boolean `false` is dropped by every current version — Preact always removes `false`; React drops `false` for both known boolean attrs and unknown/custom attrs since v16). The exception is **ARIA** attributes, which stay string-valued (`aria-pressed={selected ? 'true' : undefined}`) because ARIA is value-based, not presence-based. **Type the element attribute as `boolean | ''`** in `general_types.ts` (e.g. `disabled?: boolean | ''`) — `boolean` lets a hand-author write `<a-… disabled>` / `disabled={cond}` (runtime: `true`→present, `false`→omitted, both correct), and `''` is the form the wrapper emits. Do **not** widen it to `'' | 'true' | 'false' | boolean`: the string `'false'` is a footgun under presence-matching (`disabled="false"` is *present*, so it reads as **on**), and nothing in React/Preact ever emits `"false"` for a boolean (they omit it), so accepting that string only invites the bug. ARIA attrs are the opposite — keep them `'true' | 'false' | boolean` since the string value is meaningful there.
- **Don't add new web components without a strong reason.** Each one occupies a global tag name. Prefer adding props to existing elements before introducing a new tag.
- **Shadow DOM pattern** — Web components use shadow DOM. The external CSS file (`a-{name}.css`) styles the host element and handles light/dark mode via `.dark` ancestor. The shadow DOM `<style>` declares only structural defaults on `:host`.
- **CSS variables for variant values** — Use `--{component}-*` variables for any property that changes across variants (tone, dark mode). In the base rule, declare all variables first, then leave an empty line before regular properties.
- **CSS variables for shadow internals** — Use `--_` prefix for shadow-internal-only variables set from JS (e.g. `--_percent`).
- **Dark mode** — Use `.dark` ancestor class in the external CSS.
- **Default variant in union types** — Include default value explicitly in the type union (e.g. `tone?: 'neutral' | 'info'`).
- **CSS modules only on JSX wrappers**, plain CSS for web components. Use `.container` as the top-level class in CSS modules.
- **Types** — Use React global types (e.g. `React.CSSProperties`) without importing React. Components must be compatible with both React and Preact.
- **Auto-registration (granular + barrel)** — each `a-{name}` module self-registers and imports its own CSS when loaded, so a granular `import '@antadesign/anta/elements/a-{name}'` registers just that element (and won't drag in other elements' code or deps). The `elements/index.ts` barrel re-exports every module, so `import '@antadesign/anta/elements'` registers them all. Registration is guarded against missing `customElements` (SSR-safe), but elements should still only be imported client-side. (The same pattern powers `@antadesign/stickers/elements` — its granular `a-sticker` path keeps `lottie-web` out, since only `a-sticker-animated` pulls it.)
- **Component-token-first** — Each component defines its own CSS custom properties. Global tokens will be added later.
- **Document defaults with `@defaultValue`** — Every optional prop whose default isn't obvious (enums, numbers like `size`/`level`/`max`, a default tone/priority) **must** carry a `@defaultValue <value>` TSDoc tag on its declaration in `src/components/<Name>.tsx`. This is the single source of truth: TypeDoc captures it into `site/src/api.json`, `PropsTable.astro` renders it as the **Default** column, and the playground's `props-form.ts` reads it for control defaults. State the default *only* in the tag — don't also write "Defaults to …" in the prose description (the Default column would duplicate it). Skip the tag for booleans that default to `false` (obvious) and for required props (no default).
- **Docs-in-sync** — When you rename a component prop, rename a `--{component}-*` token, add a token, or remove one, **update `site/src/pages/components/{name}.mdx` in the same change** so the docs page tracks the source of truth. The same applies to default values, prop type unions, and to any consumer-facing API note in `README.md`. Drift between the source and the docs site is the single most common bug report — easier to keep them in lockstep than to chase the divergence later.

## Adding a new component

1. Create `src/elements/a-{name}.ts` — web component class + `register_a_{name}()` function. At the **top** `import './a-{name}.css'` (so the CSS travels with the element on a granular import), and at the **bottom** call `register_a_{name}()` so the element **self-registers when the module is imported** (the granular entry point `@antadesign/anta/elements/a-{name}`).
2. Create `src/elements/a-{name}.css` — plain CSS using tag selector, attribute selectors for variants
3. Add to `src/elements/index.ts` — add an `export { AXxxElement, register_a_{name} } from './a-{name}'` line. Re-exporting evaluates the module, which self-registers + loads its CSS, so the barrel registers the whole set. (CSS-only styled tags with no module — like `a-title` — instead get a bare `import './a-{name}.css'` in the barrel.)
4. Create `src/components/{Name}.tsx` — JSX wrapper, import CSS module
5. Create `src/components/{Name}.module.css` — scoped styles for wrapper layout
6. Add to `src/index.ts` — re-export the component
7. Add `a-{name}` to `JSX.IntrinsicElements` in `src/types.d.ts`
8. Add entry points to `build:js` script in `package.json`
9. Add CSS files to `build:css` script in `package.json`
10. Run `pnpm run build` to verify
