/**
 * bundler.ts — esbuild-wasm wrapper that turns a user code string into a
 * runnable ESM bundle. The bundler runs in the parent window (not in the
 * iframe) and resolves imports against `moduleManifest`. Each known
 * module becomes a virtual file whose body is a tiny shim that reads the
 * named exports from `window.__demo_modules__` on the iframe's window.
 *
 * The iframe ends up executing something like:
 *
 *   // bundled by esbuild from user code
 *   import { Progress } from "@antadesign/anta"       // ← resolved here
 *   // → expanded to:
 *   //   const m = window.__demo_modules__["@antadesign/anta"]
 *   //   const Progress = m.Progress
 *   import { render } from "preact"
 *   render(<Progress … />, document.getElementById("root"))
 *
 * esbuild handles the JSX/TS transform and concatenates modules in one
 * step. We only configure the plugin so user-facing imports can resolve.
 */
import { moduleManifest } from './modules.ts'

let initialized: Promise<void> | null = null

async function ensureInit(): Promise<typeof import('esbuild-wasm')> {
  const esbuild = await import('esbuild-wasm')
  if (!initialized) {
    initialized = esbuild.initialize({ wasmURL: '/esbuild.wasm', worker: true })
  }
  await initialized
  return esbuild
}

export interface BundleSuccess {
  ok: true
  /** Compiled JS, ready to run as `<script type="module">` in the iframe. */
  code: string
}
export interface BundleFailure {
  ok: false
  /** Human-readable error message — suitable for showing in the UI. */
  message: string
}
export type BundleResult = BundleSuccess | BundleFailure

/** Compile a user code string. Imports are resolved against
 *  `moduleManifest`; anything else becomes a friendly compile error. */
export async function bundle(userCode: string): Promise<BundleResult> {
  let esbuild: typeof import('esbuild-wasm')
  try {
    esbuild = await ensureInit()
  } catch (err: any) {
    return { ok: false, message: `esbuild failed to initialize: ${err?.message ?? err}` }
  }

  const moduleNamespace = 'demo-modules'

  try {
    const result = await esbuild.build({
      stdin: {
        contents: userCode,
        loader: 'tsx',
        sourcefile: 'user.tsx',
      },
      bundle: true,
      format: 'esm',
      write: false,
      jsx: 'automatic',
      jsxImportSource: 'preact',
      logLevel: 'silent',
      plugins: [
        {
          name: 'demo-modules',
          setup(build) {
            const knownPaths = new Set(Object.keys(moduleManifest))
            // Special-case preact/jsx-runtime (and -dev) — emitted by
            // esbuild when `jsxImportSource: 'preact'` is set. Map to
            // a virtual shim that re-exports preact's createElement.
            const jsxRuntimePaths = new Set([
              'preact/jsx-runtime',
              'preact/jsx-dev-runtime',
            ])
            build.onResolve({ filter: /.*/ }, (args) => {
              if (knownPaths.has(args.path)) {
                return { path: args.path, namespace: moduleNamespace }
              }
              if (jsxRuntimePaths.has(args.path)) {
                return { path: args.path, namespace: moduleNamespace }
              }
              return {
                errors: [
                  {
                    text: `Module "${args.path}" is not available in the demo sandbox. Available: ${[...knownPaths].join(', ')}.`,
                  },
                ],
              }
            })
            build.onLoad({ filter: /.*/, namespace: moduleNamespace }, (args) => {
              if (
                args.path === 'preact/jsx-runtime' ||
                args.path === 'preact/jsx-dev-runtime'
              ) {
                return {
                  contents: `
                    const m = window.__demo_modules__['preact']
                    export const jsx = m.h
                    export const jsxs = m.h
                    export const jsxDEV = m.h
                    export const Fragment = m.Fragment
                  `,
                  loader: 'js',
                }
              }
              const exports = moduleManifest[args.path] ?? []
              const exportsBody = exports
                .map((n) => `export const ${n} = m[${JSON.stringify(n)}]`)
                .join('\n')
              return {
                contents: `const m = window.__demo_modules__[${JSON.stringify(args.path)}] || {}\n${exportsBody}\n`,
                loader: 'js',
              }
            })
          },
        },
      ],
    })

    if (result.errors.length > 0) {
      return { ok: false, message: formatErrors(result.errors) }
    }
    const out = result.outputFiles?.[0]
    if (!out) return { ok: false, message: 'esbuild produced no output' }
    return { ok: true, code: out.text }
  } catch (err: any) {
    if (err?.errors && Array.isArray(err.errors)) {
      return { ok: false, message: formatErrors(err.errors) }
    }
    return { ok: false, message: err?.message ?? String(err) }
  }
}

function formatErrors(errors: any[]): string {
  return errors
    .map((e) => {
      const loc = e.location ? `${e.location.line}:${e.location.column}` : ''
      return loc ? `${loc} — ${e.text}` : e.text
    })
    .join('\n')
}
