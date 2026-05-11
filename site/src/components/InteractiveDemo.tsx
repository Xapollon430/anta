/**
 * InteractiveDemo — single-component playground.
 *
 *   <InteractiveDemo component="Progress" initialCode={`...`} client:load />
 *
 * Renders three regions:
 *   - A live preview, isolated inside an iframe so user CSS / DOM
 *     changes can't touch the docs page.
 *   - A props form auto-generated from `api.json` for the bound
 *     component. Every form edit performs a targeted string
 *     replacement on the source code (so siblings like a `<style>`
 *     block are preserved).
 *   - A Monaco editor showing the same source. Hand-edits feed back
 *     into the form (best-effort literal-attribute scan) and back
 *     into the iframe via the in-browser bundler (esbuild-wasm).
 *
 * See site/lib/sandbox/* for the moving parts.
 */
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import s from './InteractiveDemo.module.css'

import { controlsFor, type Control, type PropEntry } from '../../lib/sandbox/props-form.ts'
import { bundle, type BundleResult } from '../../lib/sandbox/bundler.ts'
import { getDemoModules } from '../../lib/sandbox/modules.ts'
import { replaceProp } from '../../lib/sandbox/prop-patch.ts'
import { readProp } from '../../lib/sandbox/prop-read.ts'

/** Path served from `site/public/`. The script is a self-contained
 *  browser ESM bundle of @antadesign/anta/elements + per-element CSS;
 *  built by `site/scripts/build-iframe-runtime.mjs`. */
const IFRAME_RUNTIME_URL = '/iframe-anta-runtime.js'

// Lazily loaded inside an effect so the docs page paints without
// blocking on Monaco's ~1.5 MB bundle.
type MonacoEditorLib = typeof import('@monaco-editor/react')

interface Props {
  /** Anta component name to bind the props form to. Must match the
   *  TypeScript interface `{component}Props` in `api.json`. */
  component: string
  /** Initial code (TSX) shown in the editor and run in the iframe. */
  initialCode: string
}

type Mobiletab = 'props' | 'code'

export default function InteractiveDemo({ component, initialCode }: Props) {
  const [code, setCode] = useState(initialCode)
  const [bundleState, setBundleState] = useState<BundleResult | { ok: false; message: string; pending: true } | null>({
    ok: false,
    message: 'Compiling…',
    pending: true,
  } as any)
  const [runtimeError, setRuntimeError] = useState<string | null>(null)
  const [monacoLib, setMonacoLib] = useState<MonacoEditorLib | null>(null)
  const [mobileTab, setMobileTab] = useState<Mobiletab>('code')
  const [previewHeight, setPreviewHeight] = useState(96)
  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  )
  const [monoFontFamily, setMonoFontFamily] = useState<string>('')
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const iframeReadyRef = useRef(false)
  const codeFromFormRef = useRef(false)
  const monacoRef = useRef<any>(null)

  // Track the parent's dark-mode state — drives both Monaco's theme
  // and the resolved value of --bg-section.
  useEffect(() => {
    const apply = () => setIsDark(document.documentElement.classList.contains('dark'))
    apply()
    const obs = new MutationObserver(apply)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  // (Re)define the single `anta` Monaco theme whenever the dark class
  // flips. We rebuild rather than keeping two separate themes because
  // --bg-section can only be resolved in whichever mode is currently
  // active, and Monaco caches resolved colors per theme name — so we
  // always rewrite this one and call setTheme to force a repaint.
  useEffect(() => {
    const monaco = monacoRef.current
    if (!monaco) return
    defineAntaTheme(monaco, isDark)
    monaco.editor.setTheme('anta')
  }, [isDark])

  // Resolve Anta's --monospace token for Monaco's fontFamily option —
  // Monaco doesn't read CSS variables itself.
  useEffect(() => {
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue('--monospace')
      .trim()
    if (v) setMonoFontFamily(v)
  }, [])

  const controls = useMemo(() => controlsFor(component), [component])

  // Lazy-load Monaco's React wrapper once on mount.
  useEffect(() => {
    let cancelled = false
    import('@monaco-editor/react').then((mod) => {
      if (cancelled) return
      setMonacoLib(mod)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Compile pipeline: debounce + bundle + push to iframe.
  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(async () => {
      const result = await bundle(code)
      if (cancelled) return
      setBundleState(result)
      if (result.ok && iframeRef.current && iframeReadyRef.current) {
        pushBundleToIframe(iframeRef.current, result.code)
        setRuntimeError(null)
      }
    }, 200)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [code])

  // Listen for runtime errors + content-height updates from the iframe.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (!e.data || typeof e.data !== 'object') return
      if (e.data.__demo === 'runtime-error') {
        setRuntimeError(String(e.data.message ?? 'Unknown runtime error'))
      } else if (e.data.__demo === 'runtime-clear') {
        setRuntimeError(null)
      } else if (e.data.__demo === 'content-height') {
        // Clamp to a sensible range so a runaway render can't grow the
        // demo to fill the viewport.
        const h = Math.max(64, Math.min(800, Number(e.data.height) || 96))
        setPreviewHeight(h)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  // Initialise the iframe (clone stylesheets, seed __demo_modules__,
  // register custom elements, set up dark-mode mirror). srcdoc iframes
  // can `load` before the Preact reconciler attaches `onLoad`, so we
  // poll readyState here and fall back to a `load` listener.
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    let cancelled = false
    function init() {
      if (cancelled) return
      const doc = iframe.contentDocument
      if (!doc || !iframe.contentWindow) return
      setupIframe(iframe)
      iframeReadyRef.current = true
      // If a bundle is already compiled, push it now.
      if (bundleState && (bundleState as any).ok) {
        pushBundleToIframe(iframe, (bundleState as BundleResult & { code: string }).code)
      }
    }
    const doc = iframe.contentDocument
    if (doc && (doc.readyState === 'complete' || doc.readyState === 'interactive')) {
      init()
      return () => { cancelled = true }
    }
    iframe.addEventListener('load', init)
    return () => {
      cancelled = true
      iframe.removeEventListener('load', init)
    }
    // The iframe is mounted exactly once per component instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Push a code change into Monaco (when the form rewrites code).
  // We avoid a feedback loop by marking codeFromFormRef and ignoring
  // the next editor-onChange.
  function updateCode(next: string, fromForm = false) {
    if (next === code) return
    codeFromFormRef.current = fromForm
    setCode(next)
  }

  function handleFormChange(prop: PropEntry, value: string | number | boolean | null) {
    const next = replaceProp(code, component, prop.prop, value)
    updateCode(next, true)
  }

  function handleEditorChange(next: string | undefined) {
    if (next == null) return
    if (codeFromFormRef.current) {
      codeFromFormRef.current = false
      return
    }
    updateCode(next, false)
  }

  // ────────────────────────────────────────────────────────────────
  // Render

  const compileError = bundleState && !(bundleState as any).ok && !(bundleState as any).pending
    ? (bundleState as { ok: false; message: string }).message
    : null

  return (
    <section class={`${s.root} full-bleed`}>
      <div class={s.preview}>
        <iframe
          ref={iframeRef}
          class={s.previewFrame}
          srcDoc={IFRAME_SRCDOC}
          title={`${component} interactive demo preview`}
          style={{ height: `${previewHeight}px` }}
        />
      </div>

      <div class={s.tabs}>
        <button
          type="button"
          class={mobileTab === 'props' ? `${s.tabBtn} ${s.tabBtnActive}` : s.tabBtn}
          onClick={() => setMobileTab('props')}
        >
          Props
        </button>
        <button
          type="button"
          class={mobileTab === 'code' ? `${s.tabBtn} ${s.tabBtnActive}` : s.tabBtn}
          onClick={() => setMobileTab('code')}
        >
          Code
        </button>
      </div>

      <div class={s.panels}>
        <div class={`${s.panel} ${mobileTab !== 'props' ? s.hiddenOnMobile : ''}`}>
          <div class={s.panelHeader}>Props</div>
          <div class={s.form}>
            {controls.length === 0 && (
              <div class={s.fieldHint}>No props detected for {component}. Check api.json.</div>
            )}
            {controls.map((entry) => (
              <FormField
                key={entry.control.name}
                entry={entry}
                code={code}
                componentName={component}
                onChange={(v) => handleFormChange(entry, v)}
              />
            ))}
          </div>
        </div>
        <div class={`${s.panel} ${mobileTab !== 'code' ? s.hiddenOnMobile : ''}`}>
          <div class={s.panelHeader}>Code</div>
          <div class={s.editorHost}>
            {monacoLib ? (
              <monacoLib.Editor
                height="100%"
                defaultLanguage="typescript"
                path="user.tsx"
                value={code}
                theme="anta"
                onChange={handleEditorChange}
                beforeMount={(monaco) => {
                  // Register the theme BEFORE Monaco creates the editor.
                  // If it doesn't exist at creation time Monaco falls back
                  // to `vs` (white) and won't pick up our redefinition.
                  monacoRef.current = monaco
                  defineAntaTheme(monaco, isDark)
                }}
                onMount={(editor, monaco) => {
                  onMonacoMount(editor, monaco)
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 12,
                  fontFamily: monoFontFamily || undefined,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                  // Hide line numbers but keep folding on — its gutter
                  // gives a natural left margin (without it Monaco's
                  // text crashes into the panel border).
                  lineNumbers: 'off',
                  lineNumbersMinChars: 0,
                  lineDecorationsWidth: 8,
                  glyphMargin: false,
                  folding: true,
                  padding: { top: 12, bottom: 12 },
                  // Render hover / suggestion popups into <body> so the
                  // panel's overflow:hidden clip (used to round the
                  // bottom corners) doesn't truncate them.
                  fixedOverflowWidgets: true,
                }}
              />
            ) : (
              <div class={s.editorLoading}>Loading editor…</div>
            )}
          </div>
        </div>
      </div>

      {compileError && (
        <div class={s.error}>
          <span class={s.errorKind}>Compile error</span>
          {compileError}
        </div>
      )}
      {!compileError && runtimeError && (
        <div class={s.error}>
          <span class={s.errorKind}>Runtime error</span>
          {runtimeError}
        </div>
      )}
    </section>
  )
}

// ──────────────────────────────────────────────────────────────────
// Form field

function FormField({
  entry,
  code,
  componentName,
  onChange,
}: {
  entry: PropEntry
  code: string
  componentName: string
  onChange: (v: string | number | boolean | null) => void
}) {
  const c = entry.control
  const read = readProp(code, componentName, entry.prop)
  const fromExpression = read?.kind === 'expression'
  const current = read?.kind === 'literal' ? read.value : c.defaultValue

  return (
    <div class={s.field}>
      <div class={s.fieldLabel}>
        <span>
          <code>{c.name}</code>
          {c.description ? <span class={s.fieldHint}> — {c.description}</span> : null}
        </span>
        {fromExpression
          ? <span class={s.fieldExpressionBadge}>set by code</span>
          : c.kind === 'slider' && typeof current === 'number'
            ? <span class={s.fieldValueLabel}>{current}</span>
            : null}
      </div>
      <FieldControl
        control={c}
        value={current}
        disabled={fromExpression}
        onChange={onChange}
      />
    </div>
  )
}

function FieldControl({
  control,
  value,
  disabled,
  onChange,
}: {
  control: Control
  value: string | number | boolean | undefined
  disabled: boolean
  onChange: (v: string | number | boolean | null) => void
}) {
  const cls = disabled ? s.disabled : ''
  switch (control.kind) {
    case 'slider':
      return (
        <input
          type="range"
          class={`${s.slider} ${cls}`}
          min={control.min}
          max={control.max}
          step={control.step}
          value={typeof value === 'number' ? value : control.defaultValue ?? control.min}
          onInput={(e) => onChange(Number((e.currentTarget as HTMLInputElement).value))}
          disabled={disabled}
        />
      )
    case 'number':
      return (
        <input
          type="number"
          class={`${s.number} ${cls}`}
          value={typeof value === 'number' ? value : ''}
          onInput={(e) => {
            const v = (e.currentTarget as HTMLInputElement).value
            onChange(v === '' ? null : Number(v))
          }}
          disabled={disabled}
        />
      )
    case 'text':
      return (
        <input
          type="text"
          class={`${s.text} ${cls}`}
          value={typeof value === 'string' ? value : ''}
          onInput={(e) => onChange((e.currentTarget as HTMLInputElement).value)}
          disabled={disabled}
        />
      )
    case 'boolean':
      return (
        <label class={cls}>
          <input
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange((e.currentTarget as HTMLInputElement).checked)}
            disabled={disabled}
          />
        </label>
      )
    case 'segmented':
      return (
        <div class={`${s.segment} ${cls}`} role="radiogroup" aria-label={control.name}>
          {control.options.map((opt) => (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={value === opt}
              class={value === opt ? `${s.segBtn} ${s.segBtnActive}` : s.segBtn}
              onClick={() => onChange(opt)}
              disabled={disabled}
            >
              {opt}
            </button>
          ))}
        </div>
      )
  }
}

// ──────────────────────────────────────────────────────────────────
// Iframe lifecycle helpers

const IFRAME_SRCDOC = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  html, body { margin: 0; padding: 16px; background: var(--bg-base, #fff); font-family: var(--sans-serif, sans-serif); }
  #root { display: block; }
</style></head><body><div id="root"></div></body></html>`

function setupIframe(iframe: HTMLIFrameElement) {
  const doc = iframe.contentDocument
  const win = iframe.contentWindow as Window & { __demo_modules__?: Record<string, unknown> }
  if (!doc || !win) return

  // 1) Module registry.
  win.__demo_modules__ = getDemoModules()

  // 2) Clone Anta-related <link rel="stylesheet"> + <style> tags from
  //    the parent into the iframe so the rendered preview gets the
  //    same look as the docs site.
  for (const link of Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))) {
    const clone = doc.createElement('link')
    clone.rel = 'stylesheet'
    clone.href = link.href
    doc.head.appendChild(clone)
  }
  // Also clone any inline <style> from the head that's likely tokens.
  // (Astro inlines a small reset; this picks it up if present.)
  for (const style of Array.from(document.head.querySelectorAll('style'))) {
    if (style.textContent && style.textContent.includes('--bg-base')) {
      const clone = doc.createElement('style')
      clone.textContent = style.textContent
      doc.head.appendChild(clone)
    }
  }

  // 3) Register Anta's custom elements inside the iframe so <a-progress>
  //    upgrades on the iframe's own customElements registry. We import
  //    the module directly into the iframe's window via a script tag.
  //    Vite resolves the bare specifier in the parent at build time;
  //    inside the iframe we use a dynamic import of the resolved URL.
  const reg = doc.createElement('script')
  reg.type = 'module'
  reg.textContent = `
    // Side-effect import — registers <a-progress>, <a-text>, <a-icon>
    // on this iframe's customElements registry.
    import("${getElementsModuleUrl()}").catch(() => {})
  `
  doc.head.appendChild(reg)

  // 4) Mirror the parent's .dark class.
  const apply = () => {
    if (document.documentElement.classList.contains('dark')) {
      doc.documentElement.classList.add('dark')
    } else {
      doc.documentElement.classList.remove('dark')
    }
  }
  apply()
  const obs = new MutationObserver(apply)
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  // Detach when the iframe unloads.
  iframe.addEventListener('unload', () => obs.disconnect(), { once: true })

  // 5) Capture iframe runtime errors → bubble to parent via postMessage.
  win.addEventListener('error', (e: any) => {
    window.postMessage({ __demo: 'runtime-error', message: e?.message ?? String(e) }, '*')
  })
  win.addEventListener('unhandledrejection', (e: any) => {
    window.postMessage({ __demo: 'runtime-error', message: String(e?.reason ?? e) }, '*')
  })

  // 6) Auto-resize: observe the iframe body's height and tell the parent
  //    to size the iframe element accordingly. Avoids a fixed-height
  //    iframe with the demo content lost in empty space.
  const observed = doc.body
  const report = () => {
    // scrollHeight + a little breathing room for padding.
    const h = observed.scrollHeight + 24
    window.postMessage({ __demo: 'content-height', height: h }, '*')
  }
  const ResizeObserverCtor = (win as any).ResizeObserver
  if (ResizeObserverCtor) {
    const ro = new ResizeObserverCtor(report)
    ro.observe(observed)
    iframe.addEventListener('unload', () => ro.disconnect(), { once: true })
  }
  // Initial report after a microtask so the first render lands first.
  setTimeout(report, 0)
}

function pushBundleToIframe(iframe: HTMLIFrameElement, code: string) {
  const doc = iframe.contentDocument
  if (!doc) return
  // Remove previous user bundle.
  const prev = doc.getElementById('user-bundle')
  if (prev) prev.remove()
  // Do NOT clear `#root` here. Preact tracks its previous render via a
  // `_children` property on the parent DOM node; clearing innerHTML
  // removes the visible nodes but leaves preact's bookkeeping pointing
  // at stale references, so the next `render()` call silently does
  // nothing. Letting preact diff in place is also the right behaviour
  // — typical "re-render with new props" patches the existing tree.
  // Clear last runtime error.
  window.postMessage({ __demo: 'runtime-clear' }, '*')
  // Append new script as a module so user-code imports resolve.
  const script = doc.createElement('script')
  script.type = 'module'
  script.id = 'user-bundle'
  script.textContent = code
  doc.body.appendChild(script)
  // ResizeObserver will pick up the new content size; a one-shot
  // post here covers the gap before the observer fires.
  setTimeout(() => {
    window.postMessage(
      { __demo: 'content-height', height: doc.body.scrollHeight + 24 },
      '*',
    )
  }, 50)
}

/** Return an absolute URL pointing at the prebuilt iframe runtime
 *  bundle (Anta elements registration + CSS). The iframe lives at
 *  `about:srcdoc` and can't resolve relative paths. */
function getElementsModuleUrl(): string {
  return new URL(IFRAME_RUNTIME_URL, window.location.href).href
}

// ──────────────────────────────────────────────────────────────────
// Theme bridge: define `anta-light` / `anta-dark` so the editor's
// background tracks Anta's --bg-section. Monaco's defineTheme accepts
// only hex (#rrggbb[aa]); --bg-section resolves to oklch(...), so we
// paint via a 1×1 canvas to extract sRGB bytes the browser already
// computed for us.

function defineAntaTheme(monaco: any, isDark: boolean) {
  const bg = resolveCssColorToHex('--bg-section')
  if (!bg) return
  monaco.editor.defineTheme('anta', {
    base: isDark ? 'vs-dark' : 'vs',
    inherit: true,
    rules: [],
    colors: { 'editor.background': bg, 'editorGutter.background': bg },
  })
}

function resolveCssColorToHex(varName: string): string | null {
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  if (!v) return null
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.fillStyle = v
  ctx.fillRect(0, 0, 1, 1)
  const d = ctx.getImageData(0, 0, 1, 1).data
  return (
    '#' +
    [d[0], d[1], d[2]].map((c) => c.toString(16).padStart(2, '0')).join('')
  )
}

// ──────────────────────────────────────────────────────────────────
// Monaco mount: load Anta's .d.ts files into Monaco's TS service so
// the editor knows about Progress / Text / Icon types.

// Vite glob: pull every .d.ts file from anta's dist + preact at build
// time. The package.json files come along too so Monaco's TS service
// can do NodeJS-style module resolution (exports / types / main).
const antaTypeDefs = import.meta.glob(
  '/node_modules/@antadesign/anta/dist/**/*.d.ts',
  { eager: true, query: '?raw', import: 'default' }
) as Record<string, string>

const preactTypeDefs = import.meta.glob(
  '/node_modules/preact/**/*.d.ts',
  { eager: true, query: '?raw', import: 'default' }
) as Record<string, string>

const packageJsons = import.meta.glob(
  [
    '/node_modules/@antadesign/anta/package.json',
    '/node_modules/preact/package.json',
    '/node_modules/preact/*/package.json',
  ],
  { eager: true, query: '?raw', import: 'default' }
) as Record<string, string>

let monacoTypesInstalled = false

function onMonacoMount(_editor: unknown, monaco: any) {
  if (monacoTypesInstalled) return
  monacoTypesInstalled = true
  const ts = monaco.languages.typescript
  ts.typescriptDefaults.setCompilerOptions({
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    jsx: ts.JsxEmit.Preserve,
    jsxImportSource: 'preact',
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    strict: false,
    isolatedModules: true,
  })
  ts.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  })
  for (const [absPath, contents] of Object.entries(antaTypeDefs)) {
    ts.typescriptDefaults.addExtraLib(contents, 'file://' + absPath)
  }
  for (const [absPath, contents] of Object.entries(preactTypeDefs)) {
    ts.typescriptDefaults.addExtraLib(contents, 'file://' + absPath)
  }
  for (const [absPath, contents] of Object.entries(packageJsons)) {
    ts.typescriptDefaults.addExtraLib(contents, 'file://' + absPath)
  }
}
