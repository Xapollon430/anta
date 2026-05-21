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
`
