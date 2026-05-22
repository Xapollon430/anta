/**
 * Demo source code for the Button playground. See progress.demo.ts
 * for the rationale on storing this in a sibling .ts file rather than
 * inlining the template literal in the .mdx.
 *
 * Helper functions in the preamble must avoid lines that start with
 * \`<\` (after whitespace) — the sandbox's \`wrapWithRender\` uses that
 * as the JSX-block entry trigger.
 */
export default `import { Button } from '@antadesign/anta'

/** # All states
 * Every tone × priority × state combo from the Figma component set —
 * 6 tones × 4 priorities × 7 states = 168 buttons. Tone groups stack
 * vertically; within each group, columns are priorities (primary,
 * secondary, tertiary, quaternary) and rows are states (rest, hover,
 * pressed, disabled, loading, focus, selected).
 */
<div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'flex-start' }}>

  {/* ─────── BRAND ─────── */}
  <div>
    <div style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.7, marginBottom: 8 }}>tone="brand"</div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, max-content)', columnGap: 16, rowGap: 8 }}>
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="brand" priority="primary" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="brand" priority="secondary" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="brand" priority="tertiary" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="brand" priority="quaternary" />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="brand" priority="primary"    data-state="hover" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="brand" priority="secondary"  data-state="hover" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="brand" priority="tertiary"   data-state="hover" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="brand" priority="quaternary" data-state="hover" />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="brand" priority="primary"    data-state="active" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="brand" priority="secondary"  data-state="active" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="brand" priority="tertiary"   data-state="active" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="brand" priority="quaternary" data-state="active" />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="brand" priority="primary"    disabled />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="brand" priority="secondary"  disabled />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="brand" priority="tertiary"   disabled />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="brand" priority="quaternary" disabled />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="brand" priority="primary"    loading />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="brand" priority="secondary"  loading />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="brand" priority="tertiary"   loading />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="brand" priority="quaternary" loading />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="brand" priority="primary"    data-state="focus" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="brand" priority="secondary"  data-state="focus" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="brand" priority="tertiary"   data-state="focus" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="brand" priority="quaternary" data-state="focus" />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="brand" priority="primary"    selected />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="brand" priority="secondary"  selected />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="brand" priority="tertiary"   selected />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="brand" priority="quaternary" selected />
    </div>
  </div>

  {/* ─────── NEUTRAL ─────── */}
  <div>
    <div style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.7, marginBottom: 8 }}>tone="neutral"</div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, max-content)', columnGap: 16, rowGap: 8 }}>
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="neutral" priority="primary" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="neutral" priority="secondary" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="neutral" priority="tertiary" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="neutral" priority="quaternary" />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="neutral" priority="primary"    data-state="hover" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="neutral" priority="secondary"  data-state="hover" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="neutral" priority="tertiary"   data-state="hover" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="neutral" priority="quaternary" data-state="hover" />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="neutral" priority="primary"    data-state="active" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="neutral" priority="secondary"  data-state="active" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="neutral" priority="tertiary"   data-state="active" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="neutral" priority="quaternary" data-state="active" />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="neutral" priority="primary"    disabled />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="neutral" priority="secondary"  disabled />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="neutral" priority="tertiary"   disabled />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="neutral" priority="quaternary" disabled />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="neutral" priority="primary"    loading />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="neutral" priority="secondary"  loading />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="neutral" priority="tertiary"   loading />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="neutral" priority="quaternary" loading />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="neutral" priority="primary"    data-state="focus" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="neutral" priority="secondary"  data-state="focus" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="neutral" priority="tertiary"   data-state="focus" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="neutral" priority="quaternary" data-state="focus" />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="neutral" priority="primary"    selected />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="neutral" priority="secondary"  selected />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="neutral" priority="tertiary"   selected />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="neutral" priority="quaternary" selected />
    </div>
  </div>

  {/* ─────── INFO ─────── */}
  <div>
    <div style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.7, marginBottom: 8 }}>tone="info"</div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, max-content)', columnGap: 16, rowGap: 8 }}>
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="info" priority="primary" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="info" priority="secondary" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="info" priority="tertiary" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="info" priority="quaternary" />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="info" priority="primary"    data-state="hover" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="info" priority="secondary"  data-state="hover" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="info" priority="tertiary"   data-state="hover" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="info" priority="quaternary" data-state="hover" />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="info" priority="primary"    data-state="active" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="info" priority="secondary"  data-state="active" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="info" priority="tertiary"   data-state="active" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="info" priority="quaternary" data-state="active" />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="info" priority="primary"    disabled />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="info" priority="secondary"  disabled />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="info" priority="tertiary"   disabled />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="info" priority="quaternary" disabled />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="info" priority="primary"    loading />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="info" priority="secondary"  loading />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="info" priority="tertiary"   loading />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="info" priority="quaternary" loading />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="info" priority="primary"    data-state="focus" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="info" priority="secondary"  data-state="focus" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="info" priority="tertiary"   data-state="focus" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="info" priority="quaternary" data-state="focus" />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="info" priority="primary"    selected />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="info" priority="secondary"  selected />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="info" priority="tertiary"   selected />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="info" priority="quaternary" selected />
    </div>
  </div>

  {/* ─────── SUCCESS ─────── */}
  <div>
    <div style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.7, marginBottom: 8 }}>tone="success"</div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, max-content)', columnGap: 16, rowGap: 8 }}>
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="success" priority="primary" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="success" priority="secondary" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="success" priority="tertiary" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="success" priority="quaternary" />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="success" priority="primary"    data-state="hover" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="success" priority="secondary"  data-state="hover" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="success" priority="tertiary"   data-state="hover" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="success" priority="quaternary" data-state="hover" />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="success" priority="primary"    data-state="active" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="success" priority="secondary"  data-state="active" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="success" priority="tertiary"   data-state="active" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="success" priority="quaternary" data-state="active" />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="success" priority="primary"    disabled />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="success" priority="secondary"  disabled />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="success" priority="tertiary"   disabled />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="success" priority="quaternary" disabled />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="success" priority="primary"    loading />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="success" priority="secondary"  loading />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="success" priority="tertiary"   loading />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="success" priority="quaternary" loading />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="success" priority="primary"    data-state="focus" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="success" priority="secondary"  data-state="focus" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="success" priority="tertiary"   data-state="focus" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="success" priority="quaternary" data-state="focus" />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="success" priority="primary"    selected />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="success" priority="secondary"  selected />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="success" priority="tertiary"   selected />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="success" priority="quaternary" selected />
    </div>
  </div>

  {/* ─────── CRITICAL ─────── */}
  <div>
    <div style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.7, marginBottom: 8 }}>tone="critical"</div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, max-content)', columnGap: 16, rowGap: 8 }}>
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="critical" priority="primary" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="critical" priority="secondary" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="critical" priority="tertiary" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="critical" priority="quaternary" />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="critical" priority="primary"    data-state="hover" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="critical" priority="secondary"  data-state="hover" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="critical" priority="tertiary"   data-state="hover" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="critical" priority="quaternary" data-state="hover" />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="critical" priority="primary"    data-state="active" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="critical" priority="secondary"  data-state="active" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="critical" priority="tertiary"   data-state="active" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="critical" priority="quaternary" data-state="active" />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="critical" priority="primary"    disabled />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="critical" priority="secondary"  disabled />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="critical" priority="tertiary"   disabled />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="critical" priority="quaternary" disabled />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="critical" priority="primary"    loading />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="critical" priority="secondary"  loading />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="critical" priority="tertiary"   loading />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="critical" priority="quaternary" loading />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="critical" priority="primary"    data-state="focus" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="critical" priority="secondary"  data-state="focus" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="critical" priority="tertiary"   data-state="focus" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="critical" priority="quaternary" data-state="focus" />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="critical" priority="primary"    selected />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="critical" priority="secondary"  selected />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="critical" priority="tertiary"   selected />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="critical" priority="quaternary" selected />
    </div>
  </div>

  {/* ─────── WARNING ─────── */}
  <div>
    <div style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.7, marginBottom: 8 }}>tone="warning"</div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, max-content)', columnGap: 16, rowGap: 8 }}>
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="warning" priority="primary" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="warning" priority="secondary" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="warning" priority="tertiary" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="warning" priority="quaternary" />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="warning" priority="primary"    data-state="hover" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="warning" priority="secondary"  data-state="hover" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="warning" priority="tertiary"   data-state="hover" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="warning" priority="quaternary" data-state="hover" />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="warning" priority="primary"    data-state="active" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="warning" priority="secondary"  data-state="active" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="warning" priority="tertiary"   data-state="active" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="warning" priority="quaternary" data-state="active" />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="warning" priority="primary"    disabled />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="warning" priority="secondary"  disabled />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="warning" priority="tertiary"   disabled />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="warning" priority="quaternary" disabled />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="warning" priority="primary"    loading />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="warning" priority="secondary"  loading />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="warning" priority="tertiary"   loading />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="warning" priority="quaternary" loading />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="warning" priority="primary"    data-state="focus" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="warning" priority="secondary"  data-state="focus" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="warning" priority="tertiary"   data-state="focus" />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="warning" priority="quaternary" data-state="focus" />

      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="warning" priority="primary"    selected />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="warning" priority="secondary"  selected />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="warning" priority="tertiary"   selected />
      <Button label="Button" leadingIcon="info" trailingIcon="info" tone="warning" priority="quaternary" selected />
    </div>
  </div>

</div>

/** # Icon-only button
 * Pass \`iconButton\` to collapse the button to a square with just the
 * icon inside. Pair with one of \`leadingIcon\` / \`trailingIcon\` — the
 * label is suppressed regardless.
 */
<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
  <Button iconButton leadingIcon="info" />
  <Button iconButton leadingIcon="info" size="small" />
  <Button iconButton leadingIcon="info" size="large" />
</div>

/** # Basic
 * The minimum invocation — a tone-less, priority-less button.
 * Defaults: \`tone="brand"\` and \`priority="primary"\`.
 */
<Button label="Save changes" leadingIcon="info" trailingIcon="info" />

/** # Primary brand action
 * The page's main call to action: \`priority="primary"\` + \`tone="brand"\`.
 */
<Button label="Launch test run" leadingIcon="play" trailingIcon="arrow-right" priority="primary" tone="brand" />

/** # Critical destructive action
 * Pair \`tone="critical"\` with \`priority="primary"\` for irreversible actions.
 */
<Button label="Delete project" leadingIcon="trash" trailingIcon="x" priority="primary" tone="critical" />

/** # Tertiary
 * Background-less; only fills on hover. Useful in dense toolbars.
 */
<Button label="View details" leadingIcon="info" trailingIcon="arrow-right" priority="tertiary" tone="info" />

/** # Quaternary
 * Text-only — no background, no border, no transitions. The lightest
 * touch in the priority scale.
 */
<Button label="Skip for now" leadingIcon="x" trailingIcon="arrow-right" priority="quaternary" />

/** # Loading
 * Visual-only — the click handler still fires. Pair with \`disabled\`
 * if the action should be inert while loading.
 */
<Button label="Sending…" leadingIcon="info" trailingIcon="info" loading tone="brand" priority="primary" />

/** # Loading — long labels
 * The sliding stripe pattern is anchored to the button's own bounds,
 * so it stretches naturally with the label. Below: the same loading
 * state at three label lengths, across primary and secondary.
 */
<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
  <Button label="Save" loading tone="brand" priority="primary" />
  <Button label="Save changes to draft" loading tone="brand" priority="primary" />
  <Button label="Save changes to draft and publish the release" leadingIcon="play" trailingIcon="arrow-right" loading tone="brand" priority="primary" />

  <Button label="Save" loading tone="info" priority="secondary" />
  <Button label="Validating signature, please wait…" leadingIcon="info" loading tone="info" priority="secondary" />
  <Button label="Re-syncing your workspace with the remote registry" trailingIcon="arrow-right" loading tone="success" priority="secondary" />
</div>

/** # Loading — sizes
 * The stripe geometry (\`--button-loading-stripe\`, \`-stripe-gap\`,
 * \`-period\`) is fixed in absolute pixels, so the diagonal pattern's
 * angle stays visually consistent across the three sizes — only the
 * button's own height changes.
 */
<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
  <Button label="Small loading" leadingIcon="info" trailingIcon="info" loading size="small" tone="brand" priority="primary" />
  <Button label="Default loading" leadingIcon="info" trailingIcon="info" loading tone="brand" priority="primary" />
  <Button label="Large loading button" leadingIcon="info" trailingIcon="info" loading size="large" tone="brand" priority="primary" />

  <Button label="Small" leadingIcon="info" trailingIcon="info" loading size="small" tone="critical" priority="secondary" />
  <Button label="Default" leadingIcon="info" trailingIcon="info" loading tone="critical" priority="secondary" />
  <Button label="Large with longer label" leadingIcon="info" trailingIcon="info" loading size="large" tone="critical" priority="secondary" />
</div>

/** # Loading — every tone, primary
 * Same animation across all 6 tones. The stripe colour is driven by
 * \`currentColor\` (the button's label colour), so each cell glides in
 * its own tone with no extra wiring.
 */
<div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
  <Button label="Brand"    loading tone="brand"    priority="primary" />
  <Button label="Neutral"  loading tone="neutral"  priority="primary" />
  <Button label="Info"     loading tone="info"     priority="primary" />
  <Button label="Success"  loading tone="success"  priority="primary" />
  <Button label="Critical" loading tone="critical" priority="primary" />
  <Button label="Warning"  loading tone="warning"  priority="primary" />
</div>

/** # Sizes
 * Three heights: small (24px), default (28px), large (32px). Font
 * size stays 15px in all three — only padding shifts.
 */
<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
  <Button label="Small" leadingIcon="info" trailingIcon="info" size="small" tone="brand" priority="primary" />
  <Button label="Default" leadingIcon="info" trailingIcon="info" tone="brand" priority="primary" />
  <Button label="Large" leadingIcon="info" trailingIcon="info" size="large" tone="brand" priority="primary" />
</div>

/** # Anchor mode
 * Setting \`href\` renders \`<a role="button">\` instead of \`<a-button>\`
 * with identical styling.
 */
<Button label="Read the docs" leadingIcon="book-open" trailingIcon="external-link" href="/" tone="brand" priority="tertiary" />

/** # Paddingless (quaternary only)
 * \`paddingless\` zeros the outer padding so the button sits flush with
 * surrounding text — ideal for inline-link-style controls inside prose.
 * Only takes effect on \`priority="quaternary"\` per the Figma spec.
 */
<div style={{ fontSize: 15, lineHeight: 1.5, maxWidth: 520 }}>
  After saving, you can&nbsp;
  <Button label="undo the change" priority="quaternary" paddingless underline="dashed" tone="brand" />
  &nbsp;or&nbsp;
  <Button label="discard everything" priority="quaternary" paddingless underline="dotted" tone="critical" />
  &nbsp;— both options are reversible until the next save.
</div>

/** # Underline styles (quaternary only)
 * \`underline="solid" | "dashed" | "dotted"\`. Quaternary-only per the
 * Figma spec — the prop is a no-op on other priorities. Color always
 * matches the label via \`currentColor\`.
 */
<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
  <Button label="Solid underline"  priority="quaternary" underline="solid"  />
  <Button label="Dashed underline" priority="quaternary" underline="dashed" />
  <Button label="Dotted underline" priority="quaternary" underline="dotted" />
  <Button label="Critical tone with a dashed underline" priority="quaternary" underline="dashed" tone="critical" />
</div>

/** # Custom tone
 * Pass \`tone="custom"\` to bypass the tone resolver and supply your own
 * colours via the \`--button-fg-color\`, \`--button-bg-color\`,
 * \`--button-br-color\` CSS variables on \`style\` (or any wrapping class).
 * The resolver is a no-op for \`custom\`, so the consumer is fully in
 * control. State shifts (hover/active) aren't wired automatically — add
 * a class with \`:hover\` selectors if you want them.
 */
<div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
  <Button
    label="Hot pink"
    tone="custom"
    leadingIcon="info"
    style={{
      '--button-bg-color': '#ff1493',
      '--button-fg-color': '#ffffff',
      '--button-br-color': '#ff1493',
    } as any}
  />
  <Button
    label="Teal outline"
    tone="custom"
    priority="secondary"
    leadingIcon="info"
    style={{
      '--button-bg-color': 'transparent',
      '--button-fg-color': '#0d9488',
      '--button-br-color': '#0d9488',
    } as any}
  />
  <Button
    label="Custom + disabled"
    tone="custom"
    disabled
    style={{
      '--button-bg-color': '#ff1493',
      '--button-fg-color': '#ffffff',
    } as any}
  />
</div>

/** # Children alongside label
 * The component renders \`children\` after the label and before the
 * trailing icon, so you can mix custom inline content (badges,
 * keyboard hints, etc.) with the standard \`label\` + icons API.
 */
<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
  <Button label="Save" leadingIcon="info" tone="brand" priority="primary">
    <span style={{ opacity: 0.7, fontSize: 12 }}>⌘S</span>
  </Button>
  <Button label="Run query" leadingIcon="play" trailingIcon="arrow-right" tone="success" priority="primary">
    <span style={{
      fontSize: 11,
      padding: '0 6px',
      borderRadius: 8,
      background: 'rgba(255,255,255,0.2)',
    }}>NEW</span>
  </Button>
  <Button leadingIcon="info" tone="info" priority="secondary">
    <span>Children-only, no <code style={{ fontSize: 12 }}>label</code> prop</span>
  </Button>
</div>

/** # Icon-only across tones and sizes
 * Pair \`iconButton\` with every tone, with size variants, to see how
 * the padding auto-square works at each size. Outer wrapper is a
 * \`<section>\` so the playground's example parser doesn't truncate at
 * the first inner \`</div>\`. */
<section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
    <div style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.7, width: 80 }}>brand</div>
    <Button iconButton leadingIcon="play" tone="brand" priority="primary" size="small" />
    <Button iconButton leadingIcon="play" tone="brand" priority="primary" />
    <Button iconButton leadingIcon="play" tone="brand" priority="primary" size="large" />
    <Button iconButton leadingIcon="play" tone="brand" priority="secondary" />
    <Button iconButton leadingIcon="play" tone="brand" priority="tertiary" />
    <Button iconButton leadingIcon="play" tone="brand" priority="quaternary" />
  </div>
  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
    <div style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.7, width: 80 }}>neutral</div>
    <Button iconButton leadingIcon="play" tone="neutral" priority="primary" size="small" />
    <Button iconButton leadingIcon="play" tone="neutral" priority="primary" />
    <Button iconButton leadingIcon="play" tone="neutral" priority="primary" size="large" />
    <Button iconButton leadingIcon="play" tone="neutral" priority="secondary" />
    <Button iconButton leadingIcon="play" tone="neutral" priority="tertiary" />
    <Button iconButton leadingIcon="play" tone="neutral" priority="quaternary" />
  </div>
  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
    <div style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.7, width: 80 }}>info</div>
    <Button iconButton leadingIcon="play" tone="info" priority="primary" size="small" />
    <Button iconButton leadingIcon="play" tone="info" priority="primary" />
    <Button iconButton leadingIcon="play" tone="info" priority="primary" size="large" />
    <Button iconButton leadingIcon="play" tone="info" priority="secondary" />
    <Button iconButton leadingIcon="play" tone="info" priority="tertiary" />
    <Button iconButton leadingIcon="play" tone="info" priority="quaternary" />
  </div>
  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
    <div style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.7, width: 80 }}>success</div>
    <Button iconButton leadingIcon="play" tone="success" priority="primary" size="small" />
    <Button iconButton leadingIcon="play" tone="success" priority="primary" />
    <Button iconButton leadingIcon="play" tone="success" priority="primary" size="large" />
    <Button iconButton leadingIcon="play" tone="success" priority="secondary" />
    <Button iconButton leadingIcon="play" tone="success" priority="tertiary" />
    <Button iconButton leadingIcon="play" tone="success" priority="quaternary" />
  </div>
  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
    <div style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.7, width: 80 }}>critical</div>
    <Button iconButton leadingIcon="play" tone="critical" priority="primary" size="small" />
    <Button iconButton leadingIcon="play" tone="critical" priority="primary" />
    <Button iconButton leadingIcon="play" tone="critical" priority="primary" size="large" />
    <Button iconButton leadingIcon="play" tone="critical" priority="secondary" />
    <Button iconButton leadingIcon="play" tone="critical" priority="tertiary" />
    <Button iconButton leadingIcon="play" tone="critical" priority="quaternary" />
  </div>
  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
    <div style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.7, width: 80 }}>warning</div>
    <Button iconButton leadingIcon="play" tone="warning" priority="primary" size="small" />
    <Button iconButton leadingIcon="play" tone="warning" priority="primary" />
    <Button iconButton leadingIcon="play" tone="warning" priority="primary" size="large" />
    <Button iconButton leadingIcon="play" tone="warning" priority="secondary" />
    <Button iconButton leadingIcon="play" tone="warning" priority="tertiary" />
    <Button iconButton leadingIcon="play" tone="warning" priority="quaternary" />
  </div>
</section>

/** # Toolbar — tertiaries in a row
 * Dense action bar pattern: a row of \`tertiary\` icon buttons. Hover
 * fills in the alpha bg, click goes one alpha step deeper. One cell
 * is \`selected\` to show how a toggled-on state reads against rest
 * neighbours. */
<section style={{ display: 'flex', gap: 2, padding: 4, borderRadius: 6, background: 'rgba(0,0,0,0.04)' }}>
  <Button iconButton leadingIcon="edit" priority="tertiary" tone="neutral" />
  <Button iconButton leadingIcon="copy" priority="tertiary" tone="neutral" />
  <Button iconButton leadingIcon="search" priority="tertiary" tone="neutral" selected />
  <div style={{ width: 1, alignSelf: 'stretch', background: 'rgba(0,0,0,0.08)', margin: '0 4px' }} />
  <Button iconButton leadingIcon="view" priority="tertiary" tone="neutral" />
  <Button iconButton leadingIcon="refresh" priority="tertiary" tone="neutral" />
  <Button iconButton leadingIcon="dots-vertical" priority="tertiary" tone="neutral" />
  <div style={{ flex: 1 }} />
  <Button iconButton leadingIcon="check" priority="tertiary" tone="success" />
  <Button iconButton leadingIcon="trash" priority="tertiary" tone="critical" />
</section>

/** # Confirmation pair — cancel + destructive
 * The two-button pattern for modal footers. Primary \`critical\` for the
 * destructive action, quaternary \`neutral\` for the safe escape. */
<div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', padding: 12, borderRadius: 6, background: 'rgba(0,0,0,0.04)', maxWidth: 400 }}>
  <Button label="Cancel" priority="quaternary" tone="neutral" />
  <Button label="Delete forever" leadingIcon="trash" priority="primary" tone="critical" />
</div>

/** # Inline within prose — paddingless quaternaries
 * Three different underline styles inside a single sentence. Each
 * \`paddingless\` quaternary aligns flush with the surrounding text so
 * the baseline doesn't shift. */
<div style={{ fontSize: 15, lineHeight: 1.7, maxWidth: 560 }}>
  Read the&nbsp;
  <Button label="docs" priority="quaternary" paddingless underline="solid" tone="brand" />
  , file an&nbsp;
  <Button label="issue" priority="quaternary" paddingless underline="dashed" tone="info" />
  , or open a&nbsp;
  <Button label="discussion" priority="quaternary" paddingless underline="dotted" tone="success" />
  &nbsp;if you'd like to chat first.
</div>

/** # Pill bar — selected one of many
 * Filter chip pattern using \`selected\` on secondary buttons. The
 * selected one goes one alpha step deeper, the rest stay at rest. */
<div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
  <Button label="All" leadingIcon="info" priority="secondary" tone="brand" selected />
  <Button label="Active" priority="secondary" tone="brand" />
  <Button label="Archived" priority="secondary" tone="brand" />
  <Button label="Drafts" priority="secondary" tone="brand" />
</div>

/** # Hover/active/focus side-by-side
 * Force the visual state via \`data-state\` so you can compare rest,
 * hover, active, and focus without interacting. (\`data-state\` is the
 * docs-only escape hatch — pseudo-classes still drive real
 * interaction.) Same tone, same priority, four states across. */
<section style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
    <div style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.7, width: 80 }}>primary</div>
    <Button label="rest"   priority="primary" leadingIcon="info" />
    <Button label="hover"  priority="primary" leadingIcon="info" data-state="hover" />
    <Button label="active" priority="primary" leadingIcon="info" data-state="active" />
    <Button label="focus"  priority="primary" leadingIcon="info" data-state="focus" />
  </div>
  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
    <div style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.7, width: 80 }}>secondary</div>
    <Button label="rest"   priority="secondary" leadingIcon="info" />
    <Button label="hover"  priority="secondary" leadingIcon="info" data-state="hover" />
    <Button label="active" priority="secondary" leadingIcon="info" data-state="active" />
    <Button label="focus"  priority="secondary" leadingIcon="info" data-state="focus" />
  </div>
  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
    <div style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.7, width: 80 }}>tertiary</div>
    <Button label="rest"   priority="tertiary" leadingIcon="info" />
    <Button label="hover"  priority="tertiary" leadingIcon="info" data-state="hover" />
    <Button label="active" priority="tertiary" leadingIcon="info" data-state="active" />
    <Button label="focus"  priority="tertiary" leadingIcon="info" data-state="focus" />
  </div>
  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
    <div style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.7, width: 80 }}>quaternary</div>
    <Button label="rest"   priority="quaternary" leadingIcon="info" />
    <Button label="hover"  priority="quaternary" leadingIcon="info" data-state="hover" />
    <Button label="active" priority="quaternary" leadingIcon="info" data-state="active" />
    <Button label="focus"  priority="quaternary" leadingIcon="info" data-state="focus" />
  </div>
</section>

/** # Loading mixed with disabled (the safe pairing)
 * Loading is visual-only — clicks still fire. The Figma spec recommends
 * pairing it with \`disabled\` so the action is genuinely inert during
 * the loading window. Three variants side-by-side. */
<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
  <Button label="Loading only" loading tone="brand" priority="primary" />
  <Button label="Loading + disabled" loading disabled tone="brand" priority="primary" />
  <Button label="Disabled only" disabled tone="brand" priority="primary" />
</div>

/** # Size grid — every priority × every size
 * Quick sanity check that all 12 size × priority combinations land
 * with consistent vertical rhythm. Heights are 24 / 28 / 32px. */
<section style={{ display: 'grid', gridTemplateColumns: 'auto repeat(3, max-content)', columnGap: 16, rowGap: 6, alignItems: 'center' }}>
  <div></div>
  <div style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.7 }}>small</div>
  <div style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.7 }}>default</div>
  <div style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.7 }}>large</div>

  <div style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.7 }}>primary</div>
  <Button label="Button" leadingIcon="info" priority="primary" size="small" />
  <Button label="Button" leadingIcon="info" priority="primary" />
  <Button label="Button" leadingIcon="info" priority="primary" size="large" />

  <div style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.7 }}>secondary</div>
  <Button label="Button" leadingIcon="info" priority="secondary" size="small" />
  <Button label="Button" leadingIcon="info" priority="secondary" />
  <Button label="Button" leadingIcon="info" priority="secondary" size="large" />

  <div style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.7 }}>tertiary</div>
  <Button label="Button" leadingIcon="info" priority="tertiary" size="small" />
  <Button label="Button" leadingIcon="info" priority="tertiary" />
  <Button label="Button" leadingIcon="info" priority="tertiary" size="large" />

  <div style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.7 }}>quaternary</div>
  <Button label="Button" leadingIcon="info" priority="quaternary" size="small" />
  <Button label="Button" leadingIcon="info" priority="quaternary" />
  <Button label="Button" leadingIcon="info" priority="quaternary" size="large" />
</section>

/** # Long-label truncation
 * \`<a-button-label>\` applies \`text-overflow: ellipsis\` so a too-long
 * label inside a constrained width truncates instead of overflowing.
 * Constrain the button with \`--button-max-width\` (or a wrapping
 * container) to see it in action. */
<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
  <Button
    label="Save this very long label that absolutely does not fit"
    leadingIcon="info"
    trailingIcon="arrow-right"
    tone="brand"
    priority="primary"
    style={{ ['--button-max-width' as any]: '220px' } as any}
  />
  <Button
    label="A medium-length label, also constrained"
    leadingIcon="info"
    tone="info"
    priority="secondary"
    style={{ ['--button-max-width' as any]: '220px' } as any}
  />
</div>

/** # Anchor mode across tones
 * \`href\` flips the rendered tag to \`<a role="button">\` with the same
 * styling. Use it for navigations that should look like buttons. */
<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
  <Button label="Brand link"    leadingIcon="info" trailingIcon="external-link" href="/" tone="brand"    priority="primary" />
  <Button label="Info link"     leadingIcon="info" trailingIcon="external-link" href="/" tone="info"     priority="secondary" />
  <Button label="Success link"  leadingIcon="info" trailingIcon="external-link" href="/" tone="success"  priority="tertiary" />
  <Button label="Critical link" leadingIcon="info" trailingIcon="external-link" href="/" tone="critical" priority="quaternary" />
</div>

/** # Custom tone — beyond hot pink
 * \`tone="custom"\` skips the built-in resolver entirely; you supply the
 * three colour vars. State shifts (hover/active) don't auto-derive —
 * either accept the static colour, or attach a class with \`:hover\` /
 * \`:active\` selectors of your own. Disabled always wins. */
<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
  <Button
    label="Cyber teal" leadingIcon="info" tone="custom"
    style={{
      '--button-bg-color': '#0fdec3',
      '--button-fg-color': '#001a14',
    } as any}
  />
  <Button
    label="Vapor pink" leadingIcon="info" tone="custom"
    style={{
      '--button-bg-color': '#ff77b3',
      '--button-fg-color': '#3a0023',
    } as any}
  />
  <Button
    label="Custom outline" leadingIcon="info" tone="custom" priority="secondary"
    style={{
      '--button-bg-color': 'transparent',
      '--button-fg-color': '#0f766e',
      '--button-br-color': '#0f766e',
      '--button-br-width': '1px',
    } as any}
  />
</div>

/** # Disabled across every priority and tone
 * Sanity check that the disabled palette wins over every combo —
 * including custom tones (the bg/fg get pinned to the disabled gray
 * regardless of what the custom inline-style vars set). */
<section style={{ display: 'grid', gridTemplateColumns: 'auto repeat(4, max-content)', columnGap: 16, rowGap: 6, alignItems: 'center' }}>
  <div></div>
  <div style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.7 }}>primary</div>
  <div style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.7 }}>secondary</div>
  <div style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.7 }}>tertiary</div>
  <div style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.7 }}>quaternary</div>

  <div style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.7 }}>brand</div>
  <Button label="Button" leadingIcon="info" disabled tone="brand" priority="primary" />
  <Button label="Button" leadingIcon="info" disabled tone="brand" priority="secondary" />
  <Button label="Button" leadingIcon="info" disabled tone="brand" priority="tertiary" />
  <Button label="Button" leadingIcon="info" disabled tone="brand" priority="quaternary" />

  <div style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.7 }}>neutral</div>
  <Button label="Button" leadingIcon="info" disabled tone="neutral" priority="primary" />
  <Button label="Button" leadingIcon="info" disabled tone="neutral" priority="secondary" />
  <Button label="Button" leadingIcon="info" disabled tone="neutral" priority="tertiary" />
  <Button label="Button" leadingIcon="info" disabled tone="neutral" priority="quaternary" />

  <div style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.7 }}>info</div>
  <Button label="Button" leadingIcon="info" disabled tone="info" priority="primary" />
  <Button label="Button" leadingIcon="info" disabled tone="info" priority="secondary" />
  <Button label="Button" leadingIcon="info" disabled tone="info" priority="tertiary" />
  <Button label="Button" leadingIcon="info" disabled tone="info" priority="quaternary" />

  <div style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.7 }}>success</div>
  <Button label="Button" leadingIcon="info" disabled tone="success" priority="primary" />
  <Button label="Button" leadingIcon="info" disabled tone="success" priority="secondary" />
  <Button label="Button" leadingIcon="info" disabled tone="success" priority="tertiary" />
  <Button label="Button" leadingIcon="info" disabled tone="success" priority="quaternary" />

  <div style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.7 }}>critical</div>
  <Button label="Button" leadingIcon="info" disabled tone="critical" priority="primary" />
  <Button label="Button" leadingIcon="info" disabled tone="critical" priority="secondary" />
  <Button label="Button" leadingIcon="info" disabled tone="critical" priority="tertiary" />
  <Button label="Button" leadingIcon="info" disabled tone="critical" priority="quaternary" />

  <div style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.7 }}>warning</div>
  <Button label="Button" leadingIcon="info" disabled tone="warning" priority="primary" />
  <Button label="Button" leadingIcon="info" disabled tone="warning" priority="secondary" />
  <Button label="Button" leadingIcon="info" disabled tone="warning" priority="tertiary" />
  <Button label="Button" leadingIcon="info" disabled tone="warning" priority="quaternary" />
</section>
`
