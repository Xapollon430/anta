/**
 * build-iframe-runtime.mjs — produce `site/public/iframe-anta-runtime.js`,
 * a self-contained browser ESM bundle that, when imported into any
 * window, registers Anta's custom elements on that window's
 * `customElements` registry and injects the per-element CSS into the
 * document head.
 *
 * The InteractiveDemo's preview iframe (lives at `about:srcdoc`,
 * has its own customElements registry, can't share the parent's)
 * dynamic-imports this URL on first load.
 *
 * We use Node esbuild (available transitively via Astro/Vite) rather
 * than esbuild-wasm so the build step runs at native speed alongside
 * the rest of `docs:`.
 */
import { build } from 'esbuild'
import { readFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const root = new URL('../..', import.meta.url)
const resetCss = fileURLToPath(new URL('src/reset.css', root))
const elementsEntry = fileURLToPath(new URL('src/elements/index.ts', root))
const outFile = fileURLToPath(new URL('site/public/iframe-anta-runtime.js', root))

await mkdir(dirname(outFile), { recursive: true })

await build({
  // Virtual entry: pull reset.css's `@layer anta` rules (base link
  // styling, list resets, etc.) in alongside the element registrations
  // so the iframe ends up with the same anchor underlines, etc., the
  // docs site shows.
  stdin: {
    contents: `import ${JSON.stringify(resetCss)}; import ${JSON.stringify(elementsEntry)};`,
    resolveDir: fileURLToPath(root),
    loader: 'ts',
  },
  outfile: outFile,
  bundle: true,
  format: 'esm',
  target: 'es2020',
  logLevel: 'silent',
  loader: { '.svg': 'text' },
  // Anta's element CSS files use `@import` syntax in some cases and
  // import-from-JS in others. We inline every imported .css as a
  // `<style>` element appended to document.head at module-init time,
  // so the iframe's document picks the CSS up wherever this bundle
  // is dynamic-imported.
  plugins: [
    {
      name: 'css-as-style-tag',
      setup(b) {
        b.onLoad({ filter: /\.css$/ }, async (args) => {
          const css = await readFile(args.path, 'utf8')
          return {
            contents: `
              if (typeof document !== 'undefined') {
                const __s = document.createElement('style');
                __s.textContent = ${JSON.stringify(css)};
                document.head.appendChild(__s);
              }
            `,
            loader: 'js',
          }
        })
      },
    },
  ],
})