import s from './Swatches.module.css'
import bgExampleSvg from './bg-example.svg?raw'

type Tone = 'neutral' | 'brand' | 'info' | 'success' | 'critical' | 'warning'
type Kind = 'bg' | 'text' | 'border'

interface TokenRow {
  name: string
  light: string
  dark: string
}

const TONES: { id: Tone; label: string }[] = [
  { id: 'neutral',  label: 'Neutral' },
  { id: 'brand',    label: 'Brand' },
  { id: 'info',     label: 'Info' },
  { id: 'success',  label: 'Success' },
  { id: 'critical', label: 'Critical' },
  { id: 'warning',  label: 'Warning' },
]

// bg-section is mode-invariant across tones (no tone-specific variant exists in
// the Figma library) — we still include it as the 5th swatch in every tone row
// so the layout stays consistent and shows that section is shared.
const BG_SECTION: TokenRow = { name: 'bg-section', light: '#ffffff', dark: 'hsl(280 20% 0% / 1)' }

const TOKENS: Record<Kind, Partial<Record<Tone, TokenRow[]>>> = {
  bg: {
    neutral: [
      { name: 'bg-base',    light: '#fbfafb', dark: 'hsl(280 10% 5.5% / 1)' },
      BG_SECTION,
      { name: 'bg-pane',    light: '#f6f4f6', dark: 'hsl(280 10% 7% / 1)' },
      { name: 'bg-block',   light: '#f1eff1', dark: 'hsl(285 7% 8% / 1)' },
      { name: 'bg-spot',    light: '#ece9ec', dark: 'hsl(285 9% 9% / 1)' },
    ],
    brand: [
      { name: 'bg-base-brand',  light: '#fcfcfe', dark: 'hsl(251 41% 4% / 1)' },
      BG_SECTION,
      { name: 'bg-pane-brand',  light: '#f7f6fd', dark: 'hsl(250 41% 8% / 1)' },
      { name: 'bg-block-brand', light: '#efeefc', dark: 'hsl(250 40% 10% / 1)' },
      { name: 'bg-spot-brand',  light: '#e9e5fa', dark: 'hsl(249 39% 12% / 1)' },
    ],
    info: [
      { name: 'bg-base-info',  light: '#fbfcfe', dark: 'hsl(211 77% 4% / 1)' },
      BG_SECTION,
      { name: 'bg-pane-info',  light: '#f2f7fd', dark: 'hsl(208 73% 7% / 1)' },
      { name: 'bg-block-info', light: '#e9f3fb', dark: 'hsl(208 70% 8.5% / 1)' },
      { name: 'bg-spot-info',  light: '#e1eefa', dark: 'hsl(208 65% 13% / 1)' },
    ],
    success: [
      { name: 'bg-base-success',  light: '#f7fcf9', dark: 'hsl(140 60% 2.7% / 1)' },
      BG_SECTION,
      { name: 'bg-pane-success',  light: '#ecf9f0', dark: 'hsl(138 59% 4.5% / 1)' },
      { name: 'bg-block-success', light: '#e2f5e8', dark: 'hsl(137 54% 5.5% / 1)' },
      { name: 'bg-spot-success',  light: '#d9f2e0', dark: 'hsl(138 54% 7% / 1)' },
    ],
    critical: [
      { name: 'bg-base-critical',  light: '#fefbfb', dark: 'hsl(358 72% 4% / 1)' },
      BG_SECTION,
      { name: 'bg-pane-critical',  light: '#fdf2f2', dark: 'hsl(359 70% 7.5% / 1)' },
      { name: 'bg-block-critical', light: '#fcebeb', dark: 'hsl(359 66% 9% / 1)' },
      { name: 'bg-spot-critical',  light: '#fae5e5', dark: 'hsl(359 63% 11% / 1)' },
    ],
    warning: [
      { name: 'bg-base-warning',  light: '#fefbf6', dark: 'hsl(30 69% 4% / 1)' },
      BG_SECTION,
      { name: 'bg-pane-warning',  light: '#fcf4e8', dark: 'hsl(30 71% 6.5% / 1)' },
      { name: 'bg-block-warning', light: '#fbeeda', dark: 'hsl(30 70% 8% / 1)' },
      { name: 'bg-spot-warning',  light: '#f9e7cd', dark: 'hsl(30 70% 10% / 1)' },
    ],
  },
  text: {
    neutral: [
      { name: 'text-1', light: '#050306', dark: '#ece9ec' },
      { name: 'text-2', light: '#302b31', dark: '#c1b9c1' },
      { name: 'text-3', light: '#635b65', dark: '#9f99a1' },
      { name: 'text-4', light: '#878089', dark: '#776e77' },
      { name: 'text-5', light: '#9f99a1', dark: '#635b65' },
    ],
    brand: [
      { name: 'text-1-brand', light: '#2e1e7b',   dark: '#c5baff'   },
      { name: 'text-2-brand', light: '#483493',   dark: '#ada0ee'   },
      { name: 'text-3-brand', light: '#483493cc', dark: '#ada0eecc' },
      { name: 'text-4-brand', light: '#48349399', dark: '#ada0ee99' },
      { name: 'text-5-brand', light: '#48349366', dark: '#ada0ee66' },
    ],
    info: [
      { name: 'text-1-info', light: '#003969',   dark: '#9ed2ff'   },
      { name: 'text-2-info', light: '#175082',   dark: '#7db6e8'   },
      { name: 'text-3-info', light: '#175082cc', dark: '#7db6e8cc' },
      { name: 'text-4-info', light: '#175082b2', dark: '#7db6e899' },
      { name: 'text-5-info', light: '#17508280', dark: '#7db6e866' },
    ],
    success: [
      { name: 'text-1-success', light: '#004618',   dark: '#9ddeb1'   },
      { name: 'text-2-success', light: '#1f5c31',   dark: '#74cd8e'   },
      { name: 'text-3-success', light: '#1f5c31cc', dark: '#74cd8ecc' },
      { name: 'text-4-success', light: '#1f5c3199', dark: '#74cd8e99' },
      { name: 'text-5-success', light: '#1f5c3166', dark: '#74cd8e66' },
    ],
    critical: [
      { name: 'text-1-critical', light: '#8f1014',   dark: '#ffabac'   },
      { name: 'text-2-critical', light: '#a01c1c',   dark: '#e78e90'   },
      { name: 'text-3-critical', light: '#a01c1ccc', dark: '#e78e90cc' },
      { name: 'text-4-critical', light: '#a01c1c99', dark: '#e78e9099' },
      { name: 'text-5-critical', light: '#a01c1c66', dark: '#e78e9066' },
    ],
    warning: [
      { name: 'text-1-warning', light: '#7f410b',   dark: '#f0bf75'   },
      { name: 'text-2-warning', light: '#995200',   dark: '#e1a452'   },
      { name: 'text-3-warning', light: '#995200cc', dark: '#e1a452cc' },
      { name: 'text-4-warning', light: '#99520099', dark: '#e1a45299' },
      { name: 'text-5-warning', light: '#99520066', dark: '#e1a45266' },
    ],
  },
  border: {
    neutral: [
      { name: 'border-1', light: '#938d96', dark: 'hsl(288deg 5.21% 42%)' },
      { name: 'border-2', light: '#c1b9c1', dark: 'hsl(282deg 7.04% 28%)' },
      { name: 'border-3', light: '#d4ced4', dark: 'hsl(277.5deg 6.56% 20%)' },
      { name: 'border-4', light: '#e0dce0', dark: 'hsl(290deg 6.52% 13%)' },
      { name: 'border-5', light: '#ece9ec', dark: 'hsl(285deg 7.14% 10%)' },
    ],
    brand: [
      { name: 'border-1-brand', light: '#9081df', dark: 'hsl(250.08deg 59.8% 58%)' },
      { name: 'border-2-brand', light: '#bcb1f1', dark: 'hsl(250deg 50% 42%)' },
      { name: 'border-3-brand', light: '#d2cbf6', dark: 'hsl(252.63deg 47.74% 30%)' },
      { name: 'border-4-brand', light: '#ddd8f8', dark: 'hsl(249.8deg 39.84% 19%)' },
      { name: 'border-5-brand', light: '#e9e5fa', dark: 'hsl(249deg 39.22% 14%)' },
    ],
    info: [
      { name: 'border-1-info', light: '#56a1e1', dark: 'hsl(207.82deg 70.2% 40%)' },
      { name: 'border-2-info', light: '#93c5ec', dark: 'hsl(207.77deg 69.94% 29%)' },
      { name: 'border-3-info', light: '#bad6f3', dark: 'hsl(208.04deg 69.93% 21%)' },
      { name: 'border-4-info', light: '#cfe3f7', dark: 'hsl(208.52deg 62.89% 14%)' },
      { name: 'border-5-info', light: '#e1eefa', dark: 'hsl(207.78deg 65.85% 10.5%)' },
    ],
    success: [
      { name: 'border-1-success', light: '#44c169', dark: 'hsl(138.18deg 49.75% 29%)' },
      { name: 'border-2-success', light: '#88d7a0', dark: 'hsl(138.26deg 50.36% 20%)' },
      { name: 'border-3-success', light: '#b3e5c2', dark: 'hsl(137.7deg 49.59% 16%)' },
      { name: 'border-4-success', light: '#c6ecd1', dark: 'hsl(138.46deg 52% 10%)' },
      { name: 'border-5-success', light: '#d9f2e0', dark: 'hsl(138.86deg 53.85% 7.5%)' },
    ],
    critical: [
      { name: 'border-1-critical', light: '#e56c6c', dark: 'hsl(0deg 56% 46%)' },
      { name: 'border-2-critical', light: '#efa4a4', dark: 'hsl(0.42deg 63% 30%)' },
      { name: 'border-3-critical', light: '#f4c2c2', dark: 'hsl(0deg 62.21% 23%)' },
      { name: 'border-4-critical', light: '#f7d4d4', dark: 'hsl(359.13deg 59% 15%)' },
      { name: 'border-5-critical', light: '#fae5e5', dark: 'hsl(359.06deg 63% 11%)' },
    ],
    warning: [
      { name: 'border-1-warning', light: '#d88118', dark: 'hsl(32.13deg 80.31% 34%)' },
      { name: 'border-2-warning', light: '#edb25a', dark: 'hsl(27.93deg 84.06% 24%)' },
      { name: 'border-3-warning', light: '#f3cc91', dark: 'hsl(30deg 79.66% 17%)' },
      { name: 'border-4-warning', light: '#f6dbb1', dark: 'hsl(28.75deg 63.16% 12%)' },
      { name: 'border-5-warning', light: '#f9e7cd', dark: 'hsl(28.64deg 66.67% 9%)' },
    ],
  },
}

const TITLES: Record<Kind, string> = {
  bg: 'Background',
  text: 'Text',
  border: 'Border',
}

const INTROS: Record<Kind, string> = {
  bg: 'These tokens define how surfaces are structured and layered across the interface. They help create visual hierarchy and guide the user’s attention.',
  text: 'These tokens define how text is presented across the interface. They help establish hierarchy, readability, and consistent contrast.',
  border: 'These tokens define how borders are used to separate, group, and structure elements across the interface.',
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="1.5" />
      <path d="M8 1.5v1.5M8 13v1.5M1.5 8h1.5M13 8h1.5M3.4 3.4l1.06 1.06M11.54 11.54l1.06 1.06M3.4 12.6l1.06-1.06M11.54 4.46l1.06-1.06" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>
  )
}

function MoonStarsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M14 9.5A6 6 0 0 1 6.5 2c0-.4 0-.7.1-1A6 6 0 1 0 15 8.4l-1 .1Z" fill="currentColor" />
      <circle cx="11.5" cy="3.5" r="0.7" fill="currentColor" />
      <circle cx="13.5" cy="6" r="0.5" fill="currentColor" />
    </svg>
  )
}

function Swatch({ kind, token, hex }: { kind: Kind; token: string; hex: string }) {
  return (
    <div class={s.swatch}>
      {kind === 'bg' && (
        <div class={s.bgPreview} style={{ background: `var(--${token})` }} />
      )}
      {kind === 'text' && (
        <div class={s.textPreview} style={{ color: `var(--${token})` }}>Aa</div>
      )}
      {kind === 'border' && (
        <div class={s.borderPreview} style={{ color: `var(--${token})` }}>
          <div class={s.borderCorner} />
        </div>
      )}
      <span class={`${s.tokenName} copyable`}>{token}</span>
      <span class={s.hex}>{hex}</span>
    </div>
  )
}

function ThemeRow({ mode, kind, rows }: { mode: 'light' | 'dark'; kind: Kind; rows: TokenRow[] }) {
  const className = mode === 'dark'
    ? `${s.themeRow} ${s.themeRowDark} dark`
    : `${s.themeRow} ${s.themeRowLight} light`
  return (
    <div class={className}>
      <div class={s.themeLabel}>
        {mode === 'light' ? <SunIcon /> : <MoonStarsIcon />}
        <span>{mode === 'light' ? 'Light theme' : 'Dark theme'}</span>
      </div>
      <div class={s.swatchGrid}>
        {rows.map((row) => (
          <Swatch key={row.name} kind={kind} token={row.name} hex={mode === 'light' ? row.light : row.dark} />
        ))}
      </div>
    </div>
  )
}

function BackgroundDescription() {
  return (
    <div class={s.description}>
      <p><span class="copyable" style={{ fontFamily: 'var(--monospace)' }}>bg-base</span> is the main background color for the page. Use it for large surfaces and overall layouts.</p>
      <p><span class="copyable" style={{ fontFamily: 'var(--monospace)' }}>bg-section</span> is used for secondary areas, such as side navigation or grouped sections. It helps separate content without adding too much contrast.</p>
      <p><span class="copyable" style={{ fontFamily: 'var(--monospace)' }}>bg-pane</span> is used for blocks that need stronger emphasis, such as cards, panels, or highlighted content.</p>
      <p><span class="copyable" style={{ fontFamily: 'var(--monospace)' }}>bg-block</span> and <span class="copyable" style={{ fontFamily: 'var(--monospace)' }}>bg-spot</span> are darker background variations. Their use cases are still exploratory.</p>
    </div>
  )
}

function TextDescription() {
  // Each line uses its own text-* token color so the description visually
  // demonstrates the token's appearance.
  const lines: { token: string; copy: string }[] = [
    { token: 'text-1', copy: 'Primary text, for headings and key content.' },
    { token: 'text-2', copy: 'Secondary text, for descriptions and supporting content.' },
    { token: 'text-3', copy: 'Subdued text, for labels, statuses and secondary data.' },
    { token: 'text-4', copy: 'Minor text, for timestamps, counters and metadata.' },
    { token: 'text-5', copy: 'Placeholder text, for hints and non-critical information.' },
  ]
  return (
    <div class={s.description}>
      {lines.map((l) => (
        <p key={l.token} style={{ color: `var(--${l.token})` }}>
          <span class="copyable" style={{ fontFamily: 'var(--monospace)' }}>{l.token}</span> — {l.copy}
        </p>
      ))}
    </div>
  )
}

function BorderDescription() {
  return (
    <div class={s.description}>
      <p>Border colors are used depending on how much separation is needed and the background they appear on.</p>
      <p><span class="copyable" style={{ fontFamily: 'var(--monospace)' }}>border-1</span> and <span class="copyable" style={{ fontFamily: 'var(--monospace)' }}>border-2</span> are used when a container needs to be clearly defined or when separating elements on stronger backgrounds such as <span class="copyable" style={{ fontFamily: 'var(--monospace)' }}>bg-block</span> and <span class="copyable" style={{ fontFamily: 'var(--monospace)' }}>bg-spot</span>.</p>
      <p><span class="copyable" style={{ fontFamily: 'var(--monospace)' }}>border-3</span> sits in the middle. It provides a moderate level of contrast, useful when a boundary should be visible but not dominant.</p>
      <p><span class="copyable" style={{ fontFamily: 'var(--monospace)' }}>border-4</span> is used to separate <span class="copyable" style={{ fontFamily: 'var(--monospace)' }}>bg-base</span> and <span class="copyable" style={{ fontFamily: 'var(--monospace)' }}>bg-pane</span>, providing a slightly stronger level of contrast.</p>
      <p><span class="copyable" style={{ fontFamily: 'var(--monospace)' }}>border-5</span> is used on lighter surfaces. It works well between <span class="copyable" style={{ fontFamily: 'var(--monospace)' }}>bg-base</span> and <span class="copyable" style={{ fontFamily: 'var(--monospace)' }}>bg-section</span>, often appearing in spacing areas to subtly define boundaries.</p>
    </div>
  )
}

// Background mockup — the exact Figma SVG, with hex colors substituted for our
// token CSS variables so it flips with light/dark mode and stays in sync with
// the design system. For tinted tones, the wrapper remaps neutral var() names
// to the tinted equivalents so the same SVG renders the tinted palette.
function BackgroundExample({ tone }: { tone: Tone }) {
  const style: Record<string, string> = {}
  if (tone !== 'neutral') {
    style['--bg-base']  = `var(--bg-base-${tone})`
    style['--bg-pane']  = `var(--bg-pane-${tone})`
    style['--bg-block'] = `var(--bg-block-${tone})`
    style['--bg-spot']  = `var(--bg-spot-${tone})`
    style['--border-5'] = `var(--border-5-${tone})`
    style['--border-4'] = `var(--border-4-${tone})`
    style['--text-1']   = `var(--text-1-${tone})`
  }
  return (
    <>
      <h3 id="background-illustration" class={s.exampleHeading}>
        <a href="#background-illustration" class="header-anchor muted">Illustration</a>
      </h3>
      <div class={s.exampleScroll}>
        <div class={s.bgExampleSvg} style={style} dangerouslySetInnerHTML={{ __html: bgExampleSvg }} />
      </div>
    </>
  )
}

function ColorBlock({ kind, tone }: { kind: Kind; tone: Tone }) {
  const rows = TOKENS[kind][tone]
  if (!rows || rows.length === 0) return null
  const id = TITLES[kind].toLowerCase()
  return (
    <section class={s.block}>
      <div class={s.blockHeading}>
        <h2 id={id}>
          <a href={`#${id}`} class="header-anchor muted">{TITLES[kind]}</a>
        </h2>
        <p>{INTROS[kind]}</p>
      </div>
      <div class={s.themeRows}>
        <ThemeRow mode="light" kind={kind} rows={rows} />
        <ThemeRow mode="dark" kind={kind} rows={rows} />
      </div>
      {kind === 'bg' && <BackgroundDescription />}
      {kind === 'text' && <TextDescription />}
      {kind === 'border' && <BorderDescription />}
      {kind === 'bg' && <BackgroundExample tone={tone} />}
    </section>
  )
}

function toneHref(t: Tone): string {
  return t === 'neutral' ? '/colors/' : `/colors/${t}/`
}

function ToneTabs({ value }: { value: Tone }) {
  return (
    <div class={s.toneTabs} role="tablist">
      {TONES.map((t) => (
        <a
          key={t.id}
          href={toneHref(t.id)}
          role="tab"
          aria-selected={t.id === value}
          data-preserve-scroll
          class={t.id === value ? `${s.toneTab} ${s.toneTabActive}` : s.toneTab}
        >
          {t.label}
        </a>
      ))}
    </div>
  )
}

export function ColorsPage({ tone = 'neutral' }: { tone?: Tone }) {
  return (
    <div class={s.page}>
      <ToneTabs value={tone} />
      <ColorBlock kind="bg" tone={tone} />
      <ColorBlock kind="text" tone={tone} />
      <ColorBlock kind="border" tone={tone} />
    </div>
  )
}
