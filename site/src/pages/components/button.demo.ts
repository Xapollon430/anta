/**
 * Demo source code for the Button playground. See progress.demo.ts
 * for the rationale on storing this in a sibling .ts file rather than
 * inlining the template literal in the .mdx.
 *
 * Helper functions in the preamble must avoid lines that start with
 * \`<\` (after whitespace) — the sandbox's \`wrapWithRender\` uses that
 * as the JSX-block entry trigger.
 */
export default `import { Button, Text } from '@antadesign/anta'

/** # Basic
 * The minimum invocation — defaults to \`tone="brand"\` and
 * \`priority="primary"\`.
 */
<Button label="Save" />

/** # Tones
 * Six named tones plus literal CSS colors (\`tone="#ff1493"\`,
 * \`tone="oklch(...)"\`) for one-off custom tones.
 */
<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
  <Button tone="brand"    label="Brand" />
  <Button tone="neutral"  label="Neutral" />
  <Button tone="critical" label="Critical" />
  <Button tone="info"     label="Info" />
  <Button tone="success"  label="Success" />
  <Button tone="warning"  label="Warning" />
</div>

/** # Priorities
 * Four priorities. Hover and press to see the per-priority feedback.
 */
<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
  <Button priority="primary"    label="Primary" />
  <Button priority="secondary"  label="Secondary" />
  <Button priority="tertiary"   label="Tertiary" />
  <Button priority="quaternary" label="Quaternary" />
</div>

/** # Sizes
 * Three sizes — only padding changes; font size stays 15px.
 */
<div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
  <Button size="small"   label="Small" />
  <Button size="default" label="Default" />
  <Button size="large"   label="Large" />
</div>

/** # Leading and trailing icons
 * Pair an icon with the label via \`leadingIcon\` and/or
 * \`trailingIcon\`.
 */
<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
  <Button leadingIcon="check" label="Confirm" />
  <Button trailingIcon="external-link" label="Read the docs" />
  <Button leadingIcon="info" trailingIcon="chevron-down" label="Filter" />
</div>

/** # Icon-only buttons
 * \`iconButton\` flips the button to a square. The icon comes from
 * \`leadingIcon\` / \`trailingIcon\`. \`label\` is a TypeScript error
 * in this mode.
 */
<div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
  <Button iconButton leadingIcon="check" />
  <Button iconButton leadingIcon="trash" tone="critical" />
  <Button iconButton leadingIcon="dots-vertical" priority="tertiary" />
  <Button iconButton leadingIcon="external-link" size="large" />
</div>

/** # States
 * \`disabled\`, \`loading\`, \`selected\` modify the visual. \`loading\`
 * blocks clicks via \`pointer-events: none\`.
 */
<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
  <Button disabled label="Disabled" />
  <Button loading  label="Submitting" />
  <Button selected label="Toggled on" />
</div>

/** # Underline + paddingless
 * \`underline\` only on tertiary / quaternary. \`paddingless\` only
 * on quaternary. Wrap in \`<Text>\` so the prose typography matches
 * the design system.
 */
<Text style={{ maxWidth: 520 }}>
  After saving, you can&nbsp;
  <Button priority="quaternary" paddingless underline="dashed" tone="brand" label="undo the change" />
  &nbsp;or&nbsp;
  <Button priority="quaternary" paddingless underline="dotted" tone="critical" label="discard" />
  &nbsp;— both options are reversible until the next save.
</Text>

/** # Anchor / form
 * \`href\` switches to \`<a role="button">\` (form props become TS
 * errors). \`type="submit" | "reset"\` integrates with the nearest
 * form when there's no href.
 */
<div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
  <Button href="#example" trailingIcon="external-link" label="Anchor" />
  <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', gap: 8 }}>
    <Button type="submit" label="Submit" />
    <Button type="reset"  priority="secondary" tone="neutral" label="Reset" />
  </form>
</div>

/** # Custom tone
 * Any literal CSS color — hue is extracted, L/C come from the brand
 * curve. Use \`style={{ '--button-bg-color': '…' }}\` for pixel-precise
 * overrides.
 */
<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
  <Button tone="#ff1493"            label="Pink hex" />
  <Button tone="oklch(0.6 0.25 30)" label="oklch" />
  <Button tone="hsl(160 84% 39%)"   priority="secondary" label="Mint secondary" />
  <Button tone="rebeccapurple"      priority="tertiary"  label="Named color" />
</div>
`
