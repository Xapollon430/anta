/**
 * Demo source code for the Progress playground.
 *
 * This file exists only so the template literal's whitespace is
 * preserved verbatim. When the same string is inlined as a JSX
 * attribute in the `.mdx` page, Astro's MDX pipeline strips a layer
 * of common-leading-whitespace, which scrambles the indentation
 * Monaco needs for folding ranges. A plain `.ts` file routes
 * through Vite without that transform.
 */
export default `import { Progress } from '@antadesign/anta'
import { useState, useEffect } from 'preact/hooks'

// Reusable helper — declared once in the preamble, used by any JSX example below.
function AnimatedProgress({ speed = 1 }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setV((x) => (x + speed) % 101), 50)
    return () => clearInterval(id)
  }, [speed])
  return <Progress value={v} label="Animated" />
}

/** # Basic
 * The minimum invocation — just a value.
 */
<Progress value={60} />

/** # With label and hint
 * Pair the progress value with a descriptive label and right-aligned hint.
 */
<Progress value={42} label="Uploading files…" hint="3 of 7" />

/** # Info tone
 * \`tone="info"\` re-tints every internal color via the global \`--*-info\` token cascade.
 */
<Progress value={75} tone="info" label="Processing" />

/** # With a border
 * The host pre-declares \`border: 0px solid var(--progress-border-color)\` — colour
 * and style are wired, width is zero. Give it any width to opt in. The colour
 * auto-tracks the tone (e.g. \`--border-2-info\` for \`tone="info"\`).
 */
<Progress value={60} label="Uploading" hint="3 of 5" style={{ borderBottomWidth: '1px' }} />

/** # Animated
 * \`AnimatedProgress\` is declared in the preamble above. The Props form
 * sees only what the JSX explicitly passes — here, \`speed\` — because the
 * helper isn't in api.json. Try changing it.
 */
<AnimatedProgress speed={2} />
`
