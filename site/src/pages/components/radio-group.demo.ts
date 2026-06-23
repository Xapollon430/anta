/**
 * Demo source for the RadioGroup playground. Kept in a sibling .ts file (not
 * inlined in the .mdx) so Astro's MDX pipeline doesn't mangle the template
 * literal's indentation — see button.demo.ts.
 */
export default `import { RadioGroup, Radio } from '@antadesign/anta'

<RadioGroup name="contact" defaultValue="email" tone="brand">
  <Radio value="email">Email</Radio>
  <Radio value="sms">SMS</Radio>
  <Radio value="push">Push notification</Radio>
</RadioGroup>
`
