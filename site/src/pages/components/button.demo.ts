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

/** # Basic
 * The minimum invocation — defaults to \`tone="neutral"\` and
 * \`priority="primary"\`. Use the Props panel to discover the full
 * prop surface from a clean slate.
 */
<Button label="Save" />

/** # Tones
 * Six named tones — flip \`tone\` in the panel — plus literal CSS colors
 * (\`tone="#ff1493"\`, \`tone="oklch(...)"\`, \`tone="rebeccapurple"\`)
 * for one-off custom tones. The hue is extracted; L/C come from the
 * brand curve.
 */
<Button tone="info" label="Info" />

/** # Priorities
 * Flipping \`priority\` exercises the discriminated union: \`underline\`
 * unlocks on \`tertiary\` / \`quaternary\`, \`paddingless\` only on
 * \`quaternary\`.
 */
<Button tone="brand" priority="secondary" label="Secondary" />

/** # Icons
 * Pair \`icon\` and/or \`trailingIcon\` with a \`label\` for a chip. Pass
 * \`icon\` alone (no label, no children, no trailing icon) and the CSS
 * collapses the button to a square via \`:has(> a-icon:only-child)\`.
 * Icon shape names come from the \`IconShape\` union.
 */
<Button tone="brand" icon="check" label="Confirm" />

/** # States
 * Three booleans modify the visual: \`loading\` slides a stripe overlay,
 * \`disabled\` locks the disabled palette, \`selected\` shares the active
 * look. Toggle any combination in the panel.
 */
<Button tone="brand" loading label="Submitting" />
`
