#!/usr/bin/env node
/**
 * dev.mjs — site dev orchestrator.
 *
 * Runs the one-shot `docs:` prerequisites (typedoc, page generation,
 * esbuild.wasm copy), then launches the iframe-runtime watcher and
 * astro dev side-by-side so anta source edits propagate into the
 * preview iframe without a server restart.
 *
 * Why a Node wrapper instead of a shell one-liner: we need clean
 * SIGINT propagation to both child processes (otherwise the iframe
 * watcher orphans on Ctrl+C and keeps holding the esbuild context).
 * Same pattern as `scripts/dev.mjs` at the repo root.
 */
import { spawn, execFile } from 'node:child_process'
import { promisify } from 'node:util'

const exec = promisify(execFile)

// Prerequisite one-shots. These are cheap and only need to run once;
// putting them in serial keeps the startup log readable.
//
// `docs:api` (typedoc → src/api.json) is what InteractiveDemo's
// props form reads. `docs:pages` regenerates index.mdx from the
// repo's README. `docs:wasm` copies esbuild.wasm into public/ so
// the in-browser bundler can fetch it. The iframe-runtime build
// is intentionally NOT in this list — the watcher below handles
// the initial build and then keeps it fresh.
for (const step of ['docs:api', 'docs:pages', 'docs:wasm']) {
  await exec('pnpm', ['run', '--silent', step])
  console.log(`[${step}] done`)
}

// Long-running processes. esbuild's `ctx.watch()` does an initial
// rebuild as part of starting, so the iframe-runtime bundle will be
// on disk by the time Astro starts serving the demo page. (Even if
// the first iframe request lands before the initial build finishes,
// the next page load picks it up.)
const iframe = spawn(
  'node',
  ['scripts/build-iframe-runtime.mjs', '--watch'],
  { stdio: 'inherit' },
)
const astro = spawn('astro', ['dev'], { stdio: 'inherit' })

let exiting = false
function shutdown(code = 0) {
  if (exiting) return
  exiting = true
  iframe.kill('SIGINT')
  astro.kill('SIGINT')
  // Give the children a beat to exit cleanly before we go.
  setTimeout(() => process.exit(code), 200)
}

// If either child dies, take the whole dev session down with it —
// keeping astro alive while the iframe watcher is dead silently
// regresses to the old "restart to see CSS changes" behaviour, which
// is exactly what this wrapper exists to prevent.
iframe.on('exit', (code) => shutdown(code ?? 0))
astro.on('exit', (code) => shutdown(code ?? 0))
process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))
