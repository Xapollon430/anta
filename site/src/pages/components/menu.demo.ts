/**
 * Demo source code for the Menu playground. Kept in a sibling .ts file so
 * Astro's MDX pipeline doesn't mangle the template literal's indentation
 * (see progress.demo.ts for the full rationale).
 */
export default `import { Menu, MenuItem, MenuSeparator, Button } from '@antadesign/anta'

<Button>Actions</Button>
<Menu>
  <MenuItem icon="edit" label="Edit" kbd="⌘E" />
  <MenuItem icon="copy" label="Duplicate" kbd="⌘D" />
  <MenuItem label="Share" submenu>
    <Menu submenu hover>
      <MenuItem icon="link" label="Copy link" />
      <MenuItem icon="send" label="Email" />
    </Menu>
  </MenuItem>
  <MenuSeparator />
  <MenuItem tone="critical" icon="trash" label="Delete" kbd="⌘⌫" />
</Menu>
`
