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

### Monaco is bundled from npm (no CDN)

Monaco lives in `dependencies` as `monaco-editor` and is bundled by Vite into the playground's lazy chunk. The wiring is in `InteractiveDemo.tsx`'s mount effect:

```ts
import('monaco-editor')                                                         // namespace
import('monaco-editor/esm/vs/editor/editor.worker?worker')                      // fallback worker
import('monaco-editor/esm/vs/language/typescript/ts.worker?worker')             // TS service
import('monaco-editor/esm/vs/language/css/css.worker?worker')                   // CSS tab
import('@monaco-editor/react')                                                  // React wrapper
```

After load, `MonacoEnvironment.getWorker(_, label)` returns a fresh `Worker` for `typescript`/`javascript` (ts.worker), `css`/`scss`/`less` (css.worker), and anything else (editor.worker). `loader.config({ monaco: monacoNs })` is what makes `@monaco-editor/react` skip its default CDN fetch.

Trade-off: ~1.5 MB Monaco enters the `/components/<name>/` lazy chunk. The docs site is self-contained — no third-party JS fetch, offline-correct, and the runtime version is whatever `package.json` says.

We only register workers for languages the playground actually uses. Adding JSON/HTML support means adding two more `?worker` imports and switch arms.

## Adding a component docs page

Create `site/src/pages/components/{name}.mdx` with `layout: ../../layouts/DocsLayout.astro`. For an interactive demo, drop `<InteractiveDemo client:load component="…" layout="side" initialCode={…} />` near the top.

```sh
cd site && pnpm run dev      # dev server
cd site && pnpm run build    # static build
```

`pnpm run dev` chains through `docs:api` (typedoc → `src/api.json`), `docs:pages` (regenerate index.mdx from README.md), `docs:wasm` (copy esbuild.wasm), and `docs:iframe-runtime` (rebuild iframe runtime) before starting Astro.
