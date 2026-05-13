# Anta docs site (`site/`)

This is the documentation site for `@antadesign/anta`, deployed at antadesign.dev. It is **not** part of the published npm package — anything that ships to consumers lives in the repo root (`src/`, `dist/`).

Stack: Astro 5 static output, Preact islands (`@astrojs/preact`, with `compat: true` so `react` aliases to `preact/compat`), MDX for component pages, astro-expressive-code for syntax-highlighted code blocks, Monaco editor for the interactive playground.

The docs site consumes Anta via the workspace symlink (`"@antadesign/anta": "workspace:*"`), so Anta must be built first (`pnpm run build` at the repo root) before `site/` resolves `dist/` artifacts.

## InteractiveDemo playground

The `<InteractiveDemo>` component (`site/src/components/InteractiveDemo.tsx`) is the playground that lands on `/components/<name>/` pages. It is the largest single component in this directory and is intentionally self-contained so that a future migration to a dedicated package (`@antadesign/sandbox` or similar) and a dedicated repository can lift it out without disturbing the rest of the site.

Supporting code:

- `site/lib/sandbox/` — `bundler.ts`, `modules.ts`, `prop-patch.ts`, `prop-read.ts`, `props-form.ts`, `locate-tag.ts`. These are the long-lived primitives. When the sandbox moves to its own package, these go with it; the docs site is left with just `InteractiveDemo.tsx` consuming the extracted package.
- `site/scripts/copy-esbuild-wasm.mjs` — copies `esbuild.wasm` into `site/public/` so the iframe can fetch `/esbuild.wasm` directly.
- `site/scripts/build-iframe-runtime.mjs` — pre-builds `site/public/iframe-anta-runtime.js`, a self-contained ESM bundle of `@antadesign/anta/elements` + per-element CSS that the iframe dynamic-imports to register custom elements on its own `customElements` registry.

### Monaco is loaded from a CDN (today)

`@monaco-editor/react` (the wrapper) defers Monaco loading to `@monaco-editor/loader`, which by default fetches Monaco from `cdn.jsdelivr.net/npm/monaco-editor@<version>/min/vs/`. Even though `monaco-editor` is in our `dependencies`, Vite never actually imports it — the wrapper sidesteps bundling so consumers don't have to wire up worker scripts.

**This is deliberate-for-now, and will be revisited when the playground moves to its own package / repo.** At that point we should switch to bundled-from-npm Monaco:

```ts
import * as monacoLib from 'monaco-editor'
import { loader } from '@monaco-editor/react'
loader.config({ monaco: monacoLib })
```

…plus a `MonacoEnvironment.getWorker` shim that uses `new URL('monaco-editor/esm/vs/language/typescript/ts.worker', import.meta.url)` for each worker label (typescript / css / json / html / editor). Trade-offs: ~1.5 MB Monaco becomes part of the page's lazy chunk on `/components/<name>/`, but the docs site no longer depends on an external CDN, runs offline-correctly, and version-drift between `dependencies` and runtime disappears. The work is ~30 minutes of Vite config plus per-worker testing.

For now: the CDN load is acceptable for a public docs site, and it keeps the site bundle small. The note exists so the bundling switch lands deliberately at migration time, not as a panic when someone hits the CDN dependency in a more sensitive context.

## Adding a component docs page

Create `site/src/pages/components/{name}.mdx` with `layout: ../../layouts/DocsLayout.astro`. For an interactive demo, drop `<InteractiveDemo client:load component="…" layout="side" initialCode={…} />` near the top.

```sh
cd site && pnpm run dev      # dev server
cd site && pnpm run build    # static build
```

`pnpm run dev` chains through `docs:api` (typedoc → `src/api.json`), `docs:pages` (regenerate index.mdx from README.md), `docs:wasm` (copy esbuild.wasm), and `docs:iframe-runtime` (rebuild iframe runtime) before starting Astro.
