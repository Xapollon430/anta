/**
 * Demo source code for the Expander playground. See progress.demo.ts for
 * the rationale on storing this in a sibling .ts file rather than inlining
 * the template literal in the .mdx.
 */
export default `import { Expander, Text } from '@antadesign/anta'

<Expander title="What is Antithesis?" level={4} defaultOpen>
  <Text>
    Antithesis is an autonomous testing platform that hunts for the bugs
    in your software — running it inside a deterministic simulation so any
    failure it finds can be replayed exactly.
  </Text>
</Expander>
`
