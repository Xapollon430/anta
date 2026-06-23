/**
 * Demo source for the Radio playground. The props panel binds to the first
 * <Radio>; it lives inside a <RadioGroup> because a radio is only interactive
 * as part of a group. Kept in a sibling .ts file (not inlined in the .mdx) so
 * Astro's MDX pipeline doesn't mangle the indentation — see button.demo.ts.
 */
export default `import { RadioGroup, Radio } from '@antadesign/anta'

<RadioGroup name="demo" defaultValue="a">
  <Radio value="a">First option</Radio>
  <Radio value="b">Second option</Radio>
</RadioGroup>
`
