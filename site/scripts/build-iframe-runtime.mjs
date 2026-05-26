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
 * One-shot by default; pass `--watch` to keep rebuilding on changes
 * to `src/elements/**` (used by `site/scripts/dev.mjs` so the iframe
 * sandbox picks up anta source edits without a server restart).
 *
 * We use Node esbuild (available transitively via Astro/Vite) rather
 * than esbuild-wasm so the build step runs at native speed alongside
 * the rest of `docs:`.
 */
import { build, context } from 'esbuild'
import { readFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const root = new URL('../..', import.meta.url)
const entry = fileURLToPath(new URL('src/elements/index.ts', root))
const outFile = fileURLToPath(new URL('site/public/iframe-anta-runtime.js', root))
const watchMode = process.argv.includes('--watch')

await mkdir(dirname(outFile), { recursive: true })

const buildOptions = {
  entryPoints: [entry],
  outfile: outFile,
  bundle: true,
  format: 'esm',
  target: 'es2020',
  // Silent in one-shot mode (the final `console.log` carries the
  // single message we want). In watch mode the rebuild-log plugin
  // takes over so each rebuild is reported on its own line.
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
    watchMode && {
      name: 'rebuild-log',
      setup(b) {
        b.onEnd((result) => {
          const errors = result.errors?.length ?? 0
          if (errors > 0) {
            console.error(`[iframe-runtime] rebuild failed (${errors} error${errors === 1 ? '' : 's'})`)
            for (const err of result.errors) console.error(err.text)
          } else {
            console.log(`[iframe-runtime] rebuilt`)
          }
        })
      },
    },
  ].filter(Boolean),
}

if (watchMode) {
  const ctx = await context(buildOptions)
  // Initial rebuild so the bundle exists before we start watching.
  // `ctx.watch()` schedules its own first build too, but awaiting
  // `rebuild()` first guarantees the file is on disk by the time
  // this script's caller (site/scripts/dev.mjs) hands off to astro.
  await ctx.rebuild()
  await ctx.watch()
  console.log(`[iframe-runtime] watching src/elements/**`)
  // Keep the process alive. esbuild's watcher runs on a background
  // thread; without something keeping the event loop busy, Node
  // would exit immediately.
  process.on('SIGINT', async () => { await ctx.dispose(); process.exit(0) })
  process.on('SIGTERM', async () => { await ctx.dispose(); process.exit(0) })
} else {
  await build(buildOptions)
  console.log(`built ${outFile}`)
}
