import { useState } from 'preact/hooks'
import { Checkbox } from '@antadesign/anta'

/**
 * Live indeterminate demo for the Checkbox docs page (mirrors MUI's parent /
 * child example). A parent checkbox whose state is **derived** from two
 * children — `checked` when both are on, `indeterminate` when they differ.
 * Every box is controlled (`state` from app state, `onChange` writes back),
 * the pattern the props-driven playground can't express. Hydrated as an island.
 */
export default function SelectAllDemo() {
  const [on, setOn] = useState<[boolean, boolean]>([true, false])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Checkbox
        state={on[0] && on[1] ? 'checked' : on[0] || on[1] ? 'indeterminate' : 'unchecked'}
        onChange={(next) => setOn([next === 'checked', next === 'checked'])}
      >
        Parent
      </Checkbox>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginInlineStart: '24px',
        }}
      >
        <Checkbox
          state={on[0] ? 'checked' : 'unchecked'}
          onChange={(next) => setOn([next === 'checked', on[1]])}
        >
          Child 1
        </Checkbox>
        <Checkbox
          state={on[1] ? 'checked' : 'unchecked'}
          onChange={(next) => setOn([on[0], next === 'checked'])}
        >
          Child 2
        </Checkbox>
      </div>
    </div>
  )
}
