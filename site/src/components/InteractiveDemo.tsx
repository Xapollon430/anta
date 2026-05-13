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
  /** Visual arrangement.
   *  - `stacked` (default): preview on top, tabbed panel underneath.
   *  - `side`: preview on the left, tabbed panel on the right.
   *  Mobile (≤ 900 px) always collapses to `stacked`. */
  layout?: 'stacked' | 'side'
  /** Fixed height of the props/code panel, in pixels. Set so the
   *  playground doesn't grow with form content and so switching tabs
   *  doesn't reflow. Defaults to 400. */
  panelHeight?: number
}

type Tab = 'props' | 'code' | 'css'

/** Read the bound component's `className` attribute from the user's
 *  source. If it's a non-empty literal string, return that name —
 *  used to (a) decide whether to surface the CSS tab and (b) seed
 *  the CSS editor with a `.<name> { }` skeleton on first appearance. */
function readClassNameLiteral(code: string, component: string): string | null {
  const r = readProp(code, component, { name: 'className', kind: 'string' })
  if (r?.kind === 'literal' && typeof r.value === 'string' && r.value.trim()) {
    return r.value.trim()
  }
  return null
}

/** Make sure the CSS source contains a rule whose selector is
 *  `.<className>` — the first class rule we find is repointed to
 *  this name (preserving its body), and if no class rule exists at
 *  all we prepend an empty one. The rest of the CSS is left
 *  untouched. */
function ensureClassRule(css: string, className: string): string {
  // Match the FIRST `.<ident> {` selector in the source. CSS class
  // names can contain word chars and hyphens, can't start with a digit.
  const re = /\.([a-zA-Z_][\w-]*)(\s*\{)/
  const m = re.exec(css)
  if (m) {
    if (m[1] === className) return css
    const start = m.index
    const tail = css.slice(start + m[0].length)
    return css.slice(0, start) + `.${className}${m[2]}` + tail
  }
  return `.${className} {\n  \n}\n${css}`
}

export default function InteractiveDemo({ component, initialCode, layout = 'stacked', panelHeight = 400 }: Props) {
  const [code, setCode] = useState(initialCode)
  // CSS state is independent of the code. We seed it once on mount
  // from whatever className the initialCode already declares, then
  // the user owns it.
  const [styles, setStyles] = useState<string>(() => {
    const name = readClassNameLiteral(initialCode, component)
    return name ? `.${name} {\n  \n}\n` : ''
  })
  const [bundleState, setBundleState] = useState<BundleResult | { ok: false; message: string; pending: true } | null>({
    ok: false,
    message: 'Compiling…',
    pending: true,
  } as any)
  const [runtimeError, setRuntimeError] = useState<string | null>(null)
  const [monacoLib, setMonacoLib] = useState<MonacoEditorLib | null>(null)
  const [tab, setTab] = useState<Tab>('props')
  const [previewHeight, setPreviewHeight] = useState(96)
  const [panelWidth, setPanelWidth] = useState(400)
  const draggingRef = useRef(false)
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  )
  const [monoFontFamily, setMonoFontFamily] = useState<string>('')
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const iframeReadyRef = useRef(false)
  const codeFromFormRef = useRef(false)
  const monacoRef = useRef<any>(null)
  const editorRef = useRef<any>(null)
  const cssEditorRef = useRef<any>(null)
  const tsxHostRef = useRef<HTMLDivElement | null>(null)
  const cssHostRef = useRef<HTMLDivElement | null>(null)

  // First class token of the bound component's `className`. We only
  // ever pay attention to the first whitespace-separated class —
  // any others the user lists are ignored by the CSS surface.
  const firstClass = (readClassNameLiteral(code, component) ?? '').split(/\s+/)[0] ?? ''
  const hasClassName = firstClass !== ''

  // If the className disappears while the CSS tab was active, snap
  // back to Props so we don't end up showing a hidden tab.
  useEffect(() => {
    if (!hasClassName && tab === 'css') setTab('props')
  }, [hasClassName, tab])

  // Track CSS in a ref so the className-watcher effect can read the
  // latest value without re-running on every CSS edit.
  const stylesRef = useRef(styles)
  useEffect(() => { stylesRef.current = styles }, [styles])

  // One-directional sync: when the className (first token) changes,
  // make sure a `.<className>` rule exists in the CSS. If the CSS
  // already has a first class rule, repoint its selector to the new
  // name (body preserved). If there's no class rule at all, prepend
  // an empty one. We never touch any other CSS the user wrote.
  const prevClassRef = useRef<string>(firstClass)
  useEffect(() => {
    if (firstClass === prevClassRef.current) return
    prevClassRef.current = firstClass
    if (!firstClass) return
    const next = ensureClassRule(stylesRef.current, firstClass)
    if (next !== stylesRef.current) setStyles(next)
  }, [firstClass])

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

  // Observe each editor's host and tell its editor to relayout.
  // Monaco's `automaticLayout` polls at ~100ms and frequently misses
  // the first settle of a tab-swapped flex container; a
  // ResizeObserver on the host is reliable. Both editors (TSX and
  // CSS) share this hook.
  useEffect(() => {
    const tsxHost = tsxHostRef.current
    const cssHost = cssHostRef.current
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const ed = entry.target === tsxHost ? editorRef.current : cssEditorRef.current
        if (!ed) continue
        const r = (entry.target as HTMLElement).getBoundingClientRect()
        ed.layout({ width: r.width, height: r.height })
      }
    })
    if (tsxHost) ro.observe(tsxHost)
    if (cssHost) ro.observe(cssHost)
    return () => ro.disconnect()
  }, [monacoLib, hasClassName])


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
      const result = await bundle(code, styles)
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
  }, [code, styles])

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

  // ────────────────────────────────────────────────────────────────
  // Resize handle (side layout only). Pointer-capture lets the
  // pointermove keep firing on the handle element even when the
  // cursor outruns the slim hit area during a fast drag.

  function startResize(e: any) {
    if (layout !== 'side') return
    e.preventDefault()
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch {}
    draggingRef.current = true
  }
  function onResizeMove(e: any) {
    if (!draggingRef.current || !bodyRef.current) return
    const r = bodyRef.current.getBoundingClientRect()
    // The panel is on the right; its width is the distance from the
    // cursor to the body's right edge, clamped so neither side
    // collapses below a usable minimum.
    const next = Math.max(240, Math.min(r.width - 240, r.right - e.clientX))
    setPanelWidth(next)
  }
  function endResize(e: any) {
    draggingRef.current = false
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch {}
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

  const bodyClass = layout === 'side' ? `${s.body} ${s.bodySide}` : s.body

  return (
    <section class={`${s.root} full-bleed`}>
      <div
        class={bodyClass}
        ref={bodyRef}
        style={layout === 'side' ? ({ '--demo-panel-w': `${panelWidth}px` } as any) : undefined}
      >
        <div class={s.preview}>
          <div class={s.previewHeader}>Preview</div>
          <iframe
            ref={iframeRef}
            class={s.previewFrame}
            srcDoc={IFRAME_SRCDOC}
            title={`${component} interactive demo preview`}
            // In `side` layout the preview fills the grid row (its
            // sibling panel drives the height); we let the iframe
            // body scroll on overflow. In `stacked` layout the
            // iframe's content-height observer drives the height so
            // the demo sits as tall as its rendered preview.
            style={layout === 'side' ? undefined : { height: `${previewHeight}px` }}
          />
        </div>

        {layout === 'side' && (
          <div
            class={s.resizeHandle}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize playground panel"
            onPointerDown={startResize}
            onPointerMove={onResizeMove}
            onPointerUp={endResize}
            onPointerCancel={endResize}
          />
        )}

        <div class={s.panel} style={{ '--demo-panel-min': `${panelHeight}px` } as any}>
          <div class={s.tabs} role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'props'}
              class={tab === 'props' ? `${s.tabBtn} ${s.tabBtnActive}` : s.tabBtn}
              onClick={() => setTab('props')}
            >
              <span class={s.tabLabel}>Props</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'code'}
              class={tab === 'code' ? `${s.tabBtn} ${s.tabBtnActive}` : s.tabBtn}
              onClick={() => setTab('code')}
            >
              <span class={s.tabLabel}>Code</span>
            </button>
            {hasClassName && (
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'css'}
                class={tab === 'css' ? `${s.tabBtn} ${s.tabBtnActive}` : s.tabBtn}
                onClick={() => setTab('css')}
              >
                <span class={s.tabLabel}>CSS</span>
              </button>
            )}
            {/* Reset edits to props / code. CSS is intentionally
                preserved — the user owns it independently. */}
            <button
              type="button"
              class={s.resetBtn}
              aria-label="Reset props and code"
              title="Reset props and code"
              onClick={() => setCode(initialCode)}
            >
              <a-icon shape="refresh-ccw-dot" style={{ '--icon-size': '14px' } as any} />
            </button>
          </div>
          {/* Both panels are stacked in the same grid cell so the
              panel sizes to the taller of the two — switching tabs
              never shrinks the box. The inactive one is hidden via
              visibility (still contributes to layout) + inert so it
              doesn't catch keyboard focus or pointer events. */}
          <div class={s.tabStack}>
            <div
              class={tab === 'props' ? s.tabPanel : `${s.tabPanel} ${s.tabPanelHidden}`}
              aria-hidden={tab !== 'props'}
              {...(tab !== 'props' ? { inert: '' } : {})}
            >
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
            <div
              class={tab === 'code' ? s.tabPanel : `${s.tabPanel} ${s.tabPanelHidden}`}
              aria-hidden={tab !== 'code'}
              {...(tab !== 'code' ? { inert: '' } : {})}
            >
              <div class={s.editorHost} ref={tsxHostRef}>
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
                    // If it doesn't exist at creation time Monaco falls
                    // back to `vs` (white) and won't pick up our
                    // redefinition.
                    monacoRef.current = monaco
                    defineAntaTheme(monaco, isDark)
                  }}
                  onMount={(editor, monaco) => {
                    editorRef.current = editor
                    onMonacoMount(editor, monaco)
                    installJsxAwareCommentToggle(editor, monaco)
                    editor.layout()
                  }}
                  options={editorOptions(monoFontFamily)}
                />
                ) : (
                  <div class={s.editorLoading}>Loading editor…</div>
                )}
              </div>
            </div>
            {/* CSS panel is always mounted so its Monaco editor never
                initialises during user typing (Monaco init blocks the
                main thread and was eating keystrokes the first time
                the className field changed). The tab button stays
                conditional — the panel just hides + inert when not
                in use. */}
            <div
              class={tab === 'css' ? s.tabPanel : `${s.tabPanel} ${s.tabPanelHidden}`}
              aria-hidden={tab !== 'css'}
              {...(tab !== 'css' ? { inert: '' } : {})}
            >
              <div class={s.editorHost} ref={cssHostRef}>
                {monacoLib ? (
                  <monacoLib.Editor
                    height="100%"
                    defaultLanguage="css"
                    path="user.css"
                    value={styles}
                    theme="anta"
                    onChange={(v) => setStyles(v ?? '')}
                    beforeMount={(monaco) => {
                      monacoRef.current = monaco
                      defineAntaTheme(monaco, isDark)
                    }}
                    onMount={(editor) => {
                      cssEditorRef.current = editor
                      editor.layout()
                    }}
                    options={editorOptions(monoFontFamily)}
                  />
                ) : (
                  <div class={s.editorLoading}>Loading editor…</div>
                )}
              </div>
            </div>
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
  // Only the literal in code populates the input; the default is
  // shown as a placeholder instead so the user can tell what Anta
  // would do if they leave the field blank.
  const current = read?.kind === 'literal' ? read.value : undefined

  return (
    <div class={s.field}>
      <div class={s.fieldLabel}>
        <span>
          <code>{c.name}{entry.optional ? '?' : ''}</code>
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
          placeholder={control.defaultValue != null ? String(control.defaultValue) : ''}
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
          placeholder={control.defaultValue ?? ''}
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

// Fallback bg-base for the iframe before the parent's stylesheets get
// cloned in. We use the dark-mode value (--bg-base in `.dark`) so the
// preview never flashes white — dark→light is a far less jarring
// transition than white→anything. Once setupIframe mirrors the
// parent's actual `.dark` state, the cloned stylesheet rules take
// over and the iframe lands on the correct mode's value.
const IFRAME_SRCDOC = `<!DOCTYPE html><html class="dark"><head><meta charset="utf-8"><style>
  html, body { margin: 0; background: var(--bg-base, #100e11); font-family: var(--sans-serif, sans-serif); }
  body { padding: 24px; overflow: auto; box-sizing: border-box; min-height: 100%; }
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
  //    same look as the docs site. Anta CSS stays unlayered — its
  //    component defaults beat anything in a cascade layer
  //    (including Tailwind's `@layer utilities`), and consumers can
  //    override via higher-specificity unlayered class selectors
  //    written in their own CSS (which always tie-break in their
  //    favour at unlayered tier). Tailwind utility classes WILL NOT
  //    override Anta declarations — that's an accepted tradeoff for
  //    keeping the library's defaults sticky.
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
// Shared editor options — TSX and CSS instances use the same look.

function editorOptions(fontFamily: string): any {
  return {
    minimap: { enabled: false },
    fontSize: 12,
    fontFamily: fontFamily || undefined,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    wordWrap: 'on',
    lineNumbers: 'off',
    lineNumbersMinChars: 0,
    lineDecorationsWidth: 8,
    glyphMargin: false,
    folding: true,
    padding: { top: 12, bottom: 12 },
    fixedOverflowWidgets: true,
  }
}

// ──────────────────────────────────────────────────────────────────
// JSX-aware comment toggle. Cmd+/ (Ctrl+/ on non-mac) usually maps
// to `editor.action.commentLine`, which prepends `// ` — fine for
// plain JS / TS lines, broken for JSX where `//` shows up as a
// literal text node. We swap in `{/* … */}` when the cursor is on a
// JSX token and otherwise defer to Monaco's default.

function installJsxAwareCommentToggle(editor: any, monaco: any) {
  editor.addAction({
    id: 'anta-jsx-comment-toggle',
    label: 'Toggle JSX-aware comment',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash],
    run: (ed: any) => {
      if (isInsideJsx(ed, monaco)) {
        wrapJsxComment(ed)
      } else {
        ed.getAction('editor.action.commentLine')?.run()
      }
    },
  })
}

/** Decide whether the cursor is parked inside JSX markup vs.
 *  regular TS code. We tokenize the current line via the public
 *  `monaco.editor.tokenize` API (the per-model `getLineTokens` is
 *  not exposed) and pick the latest token that starts at or before
 *  the cursor column. Monaco's TS tokenizer tags JSX with token
 *  types like `tag`, `delimiter.angle`, `meta.tag`, `jsx`. */
function isInsideJsx(editor: any, monaco: any): boolean {
  const model = editor.getModel()
  const pos = editor.getPosition()
  if (!model || !pos) return false
  const line = model.getLineContent(pos.lineNumber)
  // Cheap pre-check: a line whose first non-whitespace char is `<`
  // is JSX with overwhelming probability.
  if (line.trimStart().startsWith('<')) return true
  // Already-commented JSX (`{/* … */}`): treat as JSX so toggle-off
  // routes through the JSX wrapper and unwraps cleanly.
  const t = line.trim()
  if (t.startsWith('{/*') && t.endsWith('*/}')) return true
  const tokens = monaco.editor.tokenize(line, model.getLanguageId())[0]
  if (!tokens?.length) return false
  const col = pos.column - 1
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (tokens[i].offset <= col) {
      const t: string = tokens[i].type || ''
      return /(?:^|\.)(?:tag|jsx|meta\.tag|delimiter\.angle)/.test(t)
    }
  }
  return false
}

function wrapJsxComment(editor: any) {
  const model = editor.getModel()
  if (!model) return
  const sel = editor.getSelection()
  if (!sel) return
  const open = '{/* '
  const close = ' */}'

  // Build the range to operate on:
  // - non-empty selection: that selection
  // - caret only: the trimmed contents of the current line (matches
  //   the default "toggle line comment" intent — comment-out the
  //   line, don't sprinkle an empty comment at the caret).
  let range = sel
  if (sel.isEmpty()) {
    const line = sel.startLineNumber
    const text = model.getLineContent(line)
    const leading = text.length - text.trimStart().length + 1
    const trailing = text.trimEnd().length + 1
    range = { startLineNumber: line, startColumn: leading, endLineNumber: line, endColumn: trailing }
  }
  const text = model.getValueInRange(range)
  const trimmed = text.trim()
  if (trimmed.startsWith('{/*') && trimmed.endsWith('*/}')) {
    // Toggle off — strip the wrapper and its inner padding.
    const unwrapped = trimmed.slice(3, -3).trim()
    editor.executeEdits('jsx-comment', [{ range, text: unwrapped, forceMoveMarkers: true }])
  } else {
    editor.executeEdits('jsx-comment', [{ range, text: open + text + close, forceMoveMarkers: true }])
  }
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
    // 2657 — "JSX expressions must have one parent element". The
    // playground wraps the user's trailing JSX in a Fragment at
    // bundle time, so the user is free to write sibling roots (e.g.
    // a `<style>` next to the component). Silence the squiggle to
    // match that contract.
    diagnosticCodesToIgnore: [2657],
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
