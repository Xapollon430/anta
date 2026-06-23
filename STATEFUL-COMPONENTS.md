# Stateful components — the `state` contract

How every interactive component with a discrete state (expander, menu, checkbox,
and future ones) encodes that state. One vocabulary, one event shape, one
control model — so consumers learn it once.

## The three attributes

| attribute | who writes it | meaning |
|---|---|---|
| `state` | the consumer (controlled) | **string enum**, the live source of truth. *Present → controlled.* *Absent → uncontrolled.* |
| `default-state` | the consumer (uncontrolled) | the **initial** state, read once at connect / form-reset. Later changes ignored. |
| `:state(…)` | the element (via `ElementInternals`) | the **output** styling hook for CSS (`:state(open)`). Never a host attribute. |

Note the duality: the **`state` attribute** flows *in* (consumer → element); the
**`:state()` custom state** flows *out* (element → CSS). Same word, opposite
directions — don't confuse the lever with the hook.

## Vocabulary (Radix / shadcn `data-state` values, verbatim)

| component | `state` values |
|---|---|
| expander | `open` · `closed` |
| menu | `open` · `closed` |
| checkbox | `checked` · `unchecked` · `indeterminate` |

Present tense, never past (`open`, not `opened`). New components keep adopting
Radix's `data-state` vocabulary rather than coining their own.

## One event shape — `statechange`, cancelable, fired *before* applying

Each component fires a single `statechange` event, **before** it applies any
change, and it is **cancelable**:

```ts
CustomEvent<{ state: NextState; previous: PrevState }>   // cancelable: true; same enum as the attribute
```

- The payload speaks the **same vocabulary as the attribute**, so a controlled
  handler answers literally with `el.setAttribute('state', e.detail.state)` (the
  wrapper does this for you — see Wrapper props).
- `preventDefault()` vetoes the transition (see the control model). The element
  gates its own application on `dispatchEvent(evt)` returning `true`.
- No booleans in the payload — never make a handler translate `true` into `"open"`.

This mirrors the native cancelable-before pattern (`beforetoggle`, dialog
`cancel`): fire before, let a handler veto, then apply — so a veto never flickers.

## Control model — rejectable everywhere, two ways

- **Uncontrolled** (`state` absent): the element owns its state. On interaction it
  computes the next state, fires the cancelable `statechange`, and applies it
  **only if not prevented**. So an uncontrolled consumer can veto a single
  transition with `e.preventDefault()` (e.g. "confirm before closing") *without*
  lifting all state into controlled mode. Seeded once by `default-state`.
- **Controlled** (`state` present): the element never self-applies. `statechange`
  is a pure request; the consumer accepts by updating `state` and rejects by doing
  nothing (React's controlled `<input value>` model). `preventDefault()` has
  nothing to cancel here — not-updating is the veto.

One rule, both modes: **`preventDefault()` (or, when controlled, not updating
`state`) stops the change; the element never optimistically self-paints then
reverts.**

### Why `preventDefault()` cancels anything

For a `CustomEvent` there is no browser default action — `preventDefault()` only
flips a flag, and it's the *dispatcher* that must honor it. The element is both
the dispatcher and the implementer of the "default action," which is **applying
the new state**. In uncontrolled mode the element was about to apply, so the veto
has something to cancel; in controlled mode it never self-applies, so the veto is
a harmless no-op (the real reject is not updating `state`).

`dispatchEvent()` is **synchronous** and returns `false` iff a listener called
`preventDefault()`, so the whole control model is one algorithm every stateful
element runs:

```ts
onInteraction(next) {
  const evt = new CustomEvent('statechange', {
    cancelable: true,
    detail: { state: next, previous: this.current },
  })
  const ok = this.dispatchEvent(evt)   // false if a handler synchronously preventDefault()'d
  if (this.controlled) return          // controlled: never self-apply — wait for the new attribute value
  if (ok) this.apply(next)             // uncontrolled: apply unless vetoed
}
// controlled ≡ this.hasAttribute('state')
```

**Cancelation is synchronous-only.** `dispatchEvent` has already returned by the
next tick, so a handler must call `preventDefault()` inline — you cannot `await`
and then cancel (same constraint as a native `submit`). For an asynchronous
decision, use controlled mode instead: don't apply, decide whenever, then set
`state`.

## Bare `state`, not `data-state`

We own the `a-*` tag namespace and the house style is bare attributes (`tone`,
`priority`, `level`). So the attribute is bare `state`; only the *values* are
borrowed from Radix's `data-state`.

## Wrapper props (React / Preact)

The element speaks the string enum; the wrapper is the impedance match to React
idiom — boolean for a binary state, a string union only where there's a third
state. (This is the same translation the wrapper already does for `disabled:
boolean` → `disabled=""`, and it mirrors Radix's `checked?: boolean |
'indeterminate'`.)

| element attribute / event | wrapper prop(s) |
|---|---|
| `state` (controlled) | `open?: boolean` · `checked?: boolean \| 'indeterminate'` — boolean when arity 2, union when arity > 2 |
| `default-state` (uncontrolled) | `defaultOpen?: boolean` · `defaultChecked?: boolean \| 'indeterminate'` |
| `statechange` event | `onToggle` / `onChange` (component-idiomatic) |

- The wrapper emits `state` only when the controlled prop is defined, and
  `default-state` only in the uncontrolled case — never both, so the DOM never
  carries a stale state attribute.
- **The callback forwards the event, not just the value**, so a handler can veto:
  `onToggle?: (open: boolean, e: CustomEvent) => void`. Most callers use only the
  first arg; `e.preventDefault()` is the synchronous uncontrolled veto. (Extracting
  just the value — the old `(open) => …` shape — silently removes the ability to
  cancel.)
- Internally the wrapper binds the all-lowercase `onstatechange` so both React 19
  (which keeps the case after `on`) and Preact attach a native listener to our
  custom event — that native-listener path is what lets `preventDefault()` reach
  the element's `dispatchEvent()` return.
