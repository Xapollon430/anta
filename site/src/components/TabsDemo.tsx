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

// Fixed panel box so switching tabs doesn't reflow the preview (panels differ in length).
const panel = { margin: 0, paddingTop: '4px', minHeight: '40px' }

/** Core API: a strip with panels that switch. */
export function Basic() {
  useElements()
  return (
    <Tabs defaultValue="account" label="Settings">
      <Tab value="account" label="Account" icon="home" />
      <Tab value="security" label="Security" />
      <Tab value="billing" label="Billing" />
      <TabPanel value="account" style={panel}><p style={{ margin: 0 }}>Profile, email, and password.</p></TabPanel>
      <TabPanel value="security" style={panel}><p style={{ margin: 0 }}>Two-factor auth and active sessions.</p></TabPanel>
      <TabPanel value="billing" style={panel}><p style={{ margin: 0 }}>Plan, invoices, and payment method.</p></TabPanel>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', alignItems: 'center' }}>
      {TONE_ROWS.map((tone) => (
        <Tabs key={tone} defaultValue="a" priority={priority} tone={tone} style={{ alignSelf: 'center' }}>
          <Tab value="a" label="Overview" />
          <Tab value="b" label="Activity" />
          <Tab value="c" label="Settings" />
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
      <TabPanel value="general" style={panel}><p style={{ margin: 0 }}>Workspace name and defaults.</p></TabPanel>
      <TabPanel value="members" style={panel}><p style={{ margin: 0 }}>People and their roles.</p></TabPanel>
      <TabPanel value="integrations" style={panel}><p style={{ margin: 0 }}>Connected apps and webhooks.</p></TabPanel>
    </Tabs>
  )
}

/** Default overflow: a strip wider than its container ellipsizes the labels. Fills the
 *  preview width (small side margins) with enough tabs to overflow it. */
export function Overflow() {
  useElements()
  return (
    <div style={{ width: '100%', padding: '0 6px', boxSizing: 'border-box' }}>
      <Tabs defaultValue="overview" label="Sections">
        <Tab value="overview" label="Overview" />
        <Tab value="activity" label="Activity" />
        <Tab value="repositories" label="Repositories" />
        <Tab value="pulls" label="Pull requests" />
        <Tab value="discussions" label="Discussions" />
        <Tab value="members" label="Members" />
        <Tab value="integrations" label="Integrations" />
      </Tabs>
    </div>
  )
}

/** Styling: opt back into horizontal scrolling (full labels, scrollbar). */
export function ScrollTabs() {
  useElements()
  return (
    <div className="scroll-tabs" style={{ maxWidth: '300px' }}>
      <Tabs defaultValue="overview" label="Sections">
        <Tab value="overview" label="Overview" />
        <Tab value="activity" label="Activity" />
        <Tab value="settings" label="Settings" />
        <Tab value="members" label="Members" />
        <Tab value="billing" label="Billing" />
        <Tab value="integrations" label="Integrations" />
        <Tab value="notifications" label="Notifications" />
        <Tab value="permissions" label="Permissions" />
        <Tab value="audit" label="Audit log" />
      </Tabs>
    </div>
  )
}

/** Styling: equal-width tabs that fill the strip (varying label lengths → same width). */
export function EqualWidth() {
  useElements()
  return (
    <div className="equal-tabs" style={{ width: '100%' }}>
      <Tabs defaultValue="all" label="Filter">
        <Tab value="all" label="All" />
        <Tab value="assigned" label="Assigned to me" />
        <Tab value="recent" label="Recent" />
        <Tab value="archived" label="Archived" />
      </Tabs>
    </div>
  )
}

/** Styling: let labels wrap so the tabs grow taller instead of truncating. */
export function WrapTabs() {
  useElements()
  return (
    <div className="wrap-tabs" style={{ maxWidth: '300px' }}>
      <Tabs defaultValue="a" label="Reports">
        <Tab value="a" label="Quarterly revenue" />
        <Tab value="b" label="Customer retention" />
        <Tab value="c" label="Product analytics" />
      </Tabs>
    </div>
  )
}

export function CustomStyling() {
  useElements()
  return (
    <Tabs className="custom-tabs" defaultValue="a">
      <Tab value="a" label="Overview" />
      <Tab value="b" label="Activity" />
      <Tab value="c" label="Settings" />
    </Tabs>
  )
}

/** Styling: noslide — the highlight snaps between tabs instead of sliding. */
export function NoSlide() {
  useElements()
  return (
    <Tabs defaultValue="a" noslide label="Sections">
      <Tab value="a" label="Overview" />
      <Tab value="b" label="Activity" />
      <Tab value="c" label="Settings" />
    </Tabs>
  )
}
