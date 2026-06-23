# Radio Button — design decisions & progress

Living log for the `@antadesign/anta` radio button work. Captures **why** each
choice was made so we don't relitigate it. Source design: Figma "radio button"
page (`node 228:297`, file `cIvfEHHCYgJb5RYuMqBMbN`).

## Shape

Figma models it two-tier: a **core** `radiobutton` (disable, size, label slot)
around a **nested** `_radiobutton` circle (tone, state, selected). Figma does not
model grouping, but single-select radios are only useful in a set. So in anta:

- **`<a-radio>`** — one option (circle + label slot). Presentational.
- **`<a-radio-group>`** — coordinator; owns the selected value, keyboard, and
  form participation.
- **`<Radio>` / `<RadioGroup>`** — stateless JSX wrappers (prop → attribute).

## Decisions

| # | Decision | Why |
|---|---|---|
| 1 | Prop/attr name is **`selected`**, not `checked` | Matches anta `Button` + the Figma layer name. (ARIA `aria-checked` would be the conventional input term, but ARIA is deferred — see #4.) |
| 2 | Group logic lives in a dedicated **`<a-radio-group>` element**, not a React wrapper | anta wrappers are **pure stateless prop→attribute mappers** — verified: zero `useState`/`useContext`/`react` imports in any `src/components/*.tsx`. Under `configure()` (custom runtimes, Preact-without-compat) hooks/context don't exist. State must live in the element layer, exactly like `<a-expander>`. More portable, not less. |
| 3 | **Controlled (`value`) vs uncontrolled (`defaultvalue`)** on the group, mirroring `<a-expander>`'s `open`/`defaultopen` | Established anta pattern; lets a consumer reject a change by not updating `value`. |
| 4 | **v1 keeps keyboard, defers ARIA** | Per user. Arrow-key selection + roving tabindex are in; `role`/`aria-checked` come in a later pass. |
| 5 | Native `<form>` participation is on the **group** (`<a-radio-group>` is the form-associated element), not each radio | One `name=value` per group is the correct native radio behavior; simpler than per-radio form participation. |
| 6 | Selected **visual renders from the element's own `:state(selected)`** (set by the group via a `selected` property), not a host attribute | Declarative-DOM rule: an element can't mutate its own host. `:state()` (ElementInternals) is host-safe and invisible to React, so React (which only controls the group's `value`) never fights the element over `selected`. A standalone `<a-radio selected>` attribute also renders selected (fallback). |
| 7 | **Default tone `brand`**, **default size `medium`** | Figma defaults. CSS base rule = brand; emit `tone="neutral"` / `size="small"\|"large"` only off-default (Button convention). |
| 8 | Group `tone`/`size`/`disabled` **cascade to children**; per-`Radio` overrides | Inherited CSS custom properties — portable, no cloning (which the codebase avoids). |
| 9 | **Error/invalid state deferred** | Tokens exist (`border-error`, `selected-border-*`) — reserved for a future `invalid` prop. |

## Tokens (`--radio-*`, from `dynamic colors/{Light,Dark}.tokens.json`)

Component-local literals + a `.dark` block (these aren't global role tokens).
Disabled alphas via `color-mix(in oklch, … %, transparent)` (anta color rule).

| token | light | dark |
|---|---|---|
| `focus` | `#503CB4` | `#A897FC` |
| `border` (rest) | `#D4CED4` | `#49424C` |
| `border-hover` | `#AFA9B1` | `#635B65` |
| `border-active` | `#938D96` | `#776E77` |
| `bg` (unselected fill) | `#FFFFFF` | `#1A171B` |
| `bg-checked` brand rest/hover/active | `#7460D7` / `#5F4BC3` / `#503CB4` | `#7460D7` / `#8270DB` / `#9081DF` |
| `bg-checked` neutral rest/hover/active | `#776E77` / `#635B65` / `#534C57` | `#776E77` / `#878089` / `#938D96` |
| `selected-border-hover` / `-active` | `#503CB4` / `#483493` | `#9081DF` / `#ADA0EE` |
| `bg-disabled` | `#44374B` @10% | `#E4D1EF` @10% |
| `border-disabled` | `#44374B` @15% | `#E4D1EF` @15% |
| `border-error` *(future)* | `#C9302C` | `#DE4545` |

Sizes (control circle): small 16px, medium 18px, large 20px. Gap to label 8px
(6px at small).

## Progress

- [x] Decisions settled; plan approved.
- [x] `a-radio` element (`a-radio.ts` + `a-radio.css`)
- [x] `a-radio-group` element (`a-radio-group.ts` + `a-radio-group.css`)
- [x] `Radio` + `RadioGroup` wrappers
- [x] Type/export wiring (`general_types`, `jsx-runtime`, `index`, `elements/index`)
- [x] Build + typecheck clean
- [x] Docs page (`radio.mdx`, `radio.demo.ts`), sidebar nav, sandbox `modules.ts`, `CHANGELOG.md`
- [x] Verified in headless Chrome — 18/18 behaviour assertions pass (single-select,
      form value via form-association, roving tabindex, change event, disabled
      skipping, arrow-wrap nav, Space-select, controlled "request-only"
      semantics) + light/dark visual render matches Figma.
- [x] Simplified: dropped shadow DOM on `<a-radio>` (circle/dot are `::before` /
      `::after` pseudos in light DOM; all styling now in `a-radio.css`).
- [x] Split docs into separate pages — `Radio` (option) and `RadioGroup` (container).
- [x] **Label + hint** on `<a-radio-group>` as `label="..."` / `hint="..."`
      attributes. The element renders them via two named shadow sub-elements
      `<a-radio-label>` / `<a-radio-hint>` (anta-named, styled by tag in the
      shadow `<style>`, exposed as `part="label"` / `part="hint"` for external
      `::part()` overrides). Not slotted from light DOM — the wrapper just
      passes the attributes through.
- [x] Documented `:state(selected)` (and `[selected]` fallback) as a public
      styling hook on `<a-radio>`.
