/**
 * Demo source code for the Tag playground. See progress.demo.ts for the
 * rationale on storing this in a sibling .ts file rather than inlining
 * the template literal in the .mdx.
 */
export default `import { Tag, Icon } from '@antadesign/anta'

<Tag tone="success">Running</Tag>
<Tag tone="info" nocaps>Loading…</Tag>
<Tag tone="brand" size="small">v2.1.0</Tag>
<Tag tone="warning">
  <Icon shape="play" />
  <span>Advance</span>
  <span>136s</span>
</Tag>
`
