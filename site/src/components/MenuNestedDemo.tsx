import { useState, useEffect, useRef } from 'preact/hooks'
import { Button, Menu, MenuItem, MenuSeparator } from '@antadesign/anta'

const COLUMNS = ['Name', 'Status', 'Owner', 'Created', 'Modified']

/**
 * Interactive demo for the Menu docs "Submenus" section: a menu nested three
 * submenus deep (View → Columns → Visible columns) whose deepest flyout is a
 * checkbox list with a "Select all" toggle and a per-row "Only" tertiary
 * button. Hydrated as an island so the checkbox state is live.
 *
 * Every interactive row carries `data-menu-open`, so ticking a box (or hitting
 * "Only") never dismisses the menu — it just updates state. Closing stays on the
 * usual paths (outside-click, Esc, ←, picking a real MenuItem).
 */
export default function MenuNestedDemo() {
  useEffect(() => {
    import('@antadesign/anta/elements')
  }, [])

  const [on, setOn] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(COLUMNS.map((c) => [c, true])),
  )
  const allOn = COLUMNS.every((c) => on[c])
  const someOn = COLUMNS.some((c) => on[c])

  // Functional updates throughout so a handler never reads stale render state.
  const toggle = (c: string) => setOn((s) => ({ ...s, [c]: !s[c] }))
  const only = (c: string) => setOn(() => Object.fromEntries(COLUMNS.map((k) => [k, k === c])))
  const toggleAll = () =>
    setOn((s) => {
      const next = !COLUMNS.every((c) => s[c])
      return Object.fromEntries(COLUMNS.map((c) => [c, next]))
    })

  // `indeterminate` is a DOM property, not an attribute — set it via ref when
  // the selection is mixed (some on, some off).
  const selectAllRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someOn && !allOn
  }, [someOn, allOn])

  return (
    <>
      <Button>More</Button>
      <Menu>
        <MenuItem icon="edit" label="Rename" />
        <MenuItem label="Move to" submenu>
          <Menu submenu hover>
            <MenuItem icon="folder-open" label="Projects" />
            <MenuItem icon="folder-open" label="Archive" />
          </Menu>
        </MenuItem>
        <MenuItem label="View" submenu>
          <Menu submenu hover>
            <MenuItem label="Columns" submenu>
              <Menu submenu hover>
                <MenuItem label="Visible columns" submenu>
                  <Menu submenu hover>
                    <label class="menu-check menu-check--all" data-menu-open>
                      <input
                        ref={selectAllRef}
                        type="checkbox"
                        checked={allOn}
                        onChange={toggleAll}
                      />
                      <span>Select all</span>
                    </label>
                    <MenuSeparator />
                    {COLUMNS.map((c) => (
                      <div class="menu-check-row" data-menu-open key={c}>
                        <label class="menu-check">
                          <input type="checkbox" checked={on[c]} onChange={() => toggle(c)} />
                          <span>{c}</span>
                        </label>
                        <Button priority="tertiary" size="small" onClick={() => only(c)}>
                          Only
                        </Button>
                      </div>
                    ))}
                  </Menu>
                </MenuItem>
              </Menu>
            </MenuItem>
          </Menu>
        </MenuItem>
      </Menu>
    </>
  )
}
