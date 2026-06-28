import { useEffect } from 'preact/hooks'
import { Tabs, Tab, TabPanel } from '@antadesign/anta'

/**
 * Live demo islands for the Tabs docs page.
 *
 * Tabs is a **compound** component — `<Tabs>` reads its `<Tab>` / `<TabPanel>`
 * children to split the strip from the panels and wire up ARIA + roving tabindex.
 * That introspection runs in real React/Preact (a consuming app, the Playground
 * iframe, and a hydrated island) but NOT in Astro's static MDX, where slot children
 * arrive opaque. So each example here is a self-contained island, embedded in the
 * MDX with `client:only="preact"`, rather than inline `<Preview>` markup.
 *
 * Elements are registered by DocsLayout's client `<script>`; the `useEffect` import
 * is belt-and-suspenders for hydration timing (matches the SSR-caveat guidance).
 */
function useElements() {
  useEffect(() => {
    import('@antadesign/anta/elements')
  }, [])
}

const col = { display: 'flex', flexDirection: 'column' as const, gap: '20px', alignItems: 'flex-start' as const }

/** Core API: a strip with panels that switch. */
export function Basic() {
  useElements()
  return (
    <Tabs defaultValue="account" label="Settings">
      <Tab value="account" label="Account" icon="home" />
      <Tab value="security" label="Security" />
      <Tab value="billing" label="Billing" />
      <TabPanel value="account"><p style={{ margin: 0 }}>Profile, email, and password.</p></TabPanel>
      <TabPanel value="security"><p style={{ margin: 0 }}>Two-factor auth and active sessions.</p></TabPanel>
      <TabPanel value="billing"><p style={{ margin: 0 }}>Plan, invoices, and payment method.</p></TabPanel>
    </Tabs>
  )
}

const triad = (
  <>
    <Tab value="a" label="Overview" />
    <Tab value="b" label="Activity" />
    <Tab value="c" label="Settings" />
  </>
)

export function Priorities() {
  useElements()
  return (
    <div style={col}>
      <Tabs defaultValue="a" priority="primary">{triad}</Tabs>
      <Tabs defaultValue="a" priority="secondary">{triad}</Tabs>
      <Tabs defaultValue="a" priority="tertiary">{triad}</Tabs>
    </div>
  )
}

// All named tones except neutral, plus a one-off custom colour as the last row.
const TONE_ROWS = ['brand', 'info', 'success', 'warning', 'critical', '#0d9488'] as const

/** One column of the Tones matrix: every tone at a single priority (2 tabs each). */
export function TonesColumn({ priority }: { priority?: 'primary' | 'secondary' | 'tertiary' }) {
  useElements()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', alignItems: 'flex-start' }}>
      {TONE_ROWS.map((tone) => (
        <Tabs key={tone} defaultValue="a" priority={priority} tone={tone}>
          <Tab value="a" label="One" />
          <Tab value="b" label="Two" />
          <Tab value="c" label="Three" />
        </Tabs>
      ))}
    </div>
  )
}

export function Sizes() {
  useElements()
  const row = (
    <>
      <Tab value="a" label="One" /><Tab value="b" label="Two" /><Tab value="c" label="Three" />
    </>
  )
  return (
    <div style={col}>
      <Tabs defaultValue="a" size="small">{row}</Tabs>
      <Tabs defaultValue="a" size="medium">{row}</Tabs>
      <Tabs defaultValue="a" size="large">{row}</Tabs>
    </div>
  )
}

export function Vertical() {
  useElements()
  return (
    <Tabs defaultValue="general" orientation="vertical" priority="tertiary" label="Workspace">
      <Tab value="general" label="General" />
      <Tab value="members" label="Members" />
      <Tab value="integrations" label="Integrations" />
      <TabPanel value="general"><p style={{ margin: 0 }}>Workspace name and defaults.</p></TabPanel>
      <TabPanel value="members"><p style={{ margin: 0 }}>People and their roles.</p></TabPanel>
      <TabPanel value="integrations"><p style={{ margin: 0 }}>Connected apps and webhooks.</p></TabPanel>
    </Tabs>
  )
}

export function Scrolling() {
  useElements()
  return (
    <div style={{ maxWidth: '320px' }}>
      <Tabs defaultValue="overview">
        <Tab value="overview" label="Overview" />
        <Tab value="activity" label="Activity" />
        <Tab value="settings" label="Settings" />
        <Tab value="members" label="Members" />
        <Tab value="billing" label="Billing" />
        <Tab value="integrations" label="Integrations" />
      </Tabs>
    </div>
  )
}

export function CustomStyling() {
  useElements()
  return (
    <Tabs className="custom-tabs" defaultValue="a">
      <Tab value="a" label="One" />
      <Tab value="b" label="Two" />
      <Tab value="c" label="Three" />
    </Tabs>
  )
}
