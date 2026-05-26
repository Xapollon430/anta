import type { BaseProps } from "../general_types"
import type { IconShape } from '../elements/a-icon.shapes'

const NAMED_TONES = new Set([
  'brand', 'neutral', 'critical', 'info', 'success', 'warning',
])

/** Always-allowed props, independent of content/submit/priority mode. */
type BaseButtonProps = BaseProps & {
  /** Semantic tone, or any literal CSS color (`'#ff1493'`, `'oklch(...)'`)
   *  for a one-off custom tone. Defaults to `brand`. */
  tone?:
    | 'neutral'
    | 'brand'
    | 'critical'
    | 'info'
    | 'success'
    | 'warning'
    | (string & {})
  /** Size variant. small=24px, default=28px, large=32px. */
  size?: 'small' | 'default' | 'large'
  /** Show a rotating loading indicator. Blocks clicks. */
  loading?: boolean
  /** Disable the button. */
  disabled?: boolean
  /** Toggled-on / pressed state, e.g. for filter chips. */
  selected?: boolean
  /** Click handler. */
  onClick?: (e: any) => void
  [key: `data-${string}`]: unknown
  [key: `aria-${string}`]: unknown
}

/** Content axis — labeled buttons render label/icons/children; icon-only
 *  buttons render just the named icon and forbid the rest. */
type ContentMode =
  | {
      /** Icon-only button. Renders the named icon standalone. */
      iconButton: IconShape
      leadingIcon?: never
      trailingIcon?: never
      label?: never
      children?: never
    }
  | {
      iconButton?: never
      /** Leading icon shape name. */
      leadingIcon?: IconShape
      /** Trailing icon shape name. */
      trailingIcon?: IconShape
      /** Label text. */
      label?: string
      children?: React.ReactNode
    }

/** Submit axis — anchors (href) don't carry form-submission props; buttons
 *  don't carry anchor props. */
type SubmitMode =
  | {
      /** Renders as `<a role="button">` instead of `<a-button>`. */
      href: string
      /** Anchor target. */
      target?: string
      /** Anchor rel. */
      rel?: string
      type?: never
      form?: never
    }
  | {
      href?: never
      target?: never
      rel?: never
      /** Form submission type. */
      type?: 'button' | 'submit' | 'reset'
      /** Form id when the button isn't a descendant of its form. */
      form?: string
    }

/** Priority axis — `underline` only on `tertiary` / `quaternary`,
 *  `paddingless` only on `quaternary`. */
type PriorityMode =
  | {
      /** Visual emphasis. Defaults to `primary`. */
      priority?: 'primary' | 'secondary'
      underline?: never
      paddingless?: never
    }
  | {
      priority: 'tertiary'
      /** Underline style. */
      underline?: 'solid' | 'dashed' | 'dotted'
      paddingless?: never
    }
  | {
      priority: 'quaternary'
      /** Underline style. */
      underline?: 'solid' | 'dashed' | 'dotted'
      /** Drops outer padding to zero. */
      paddingless?: boolean
    }

export type ButtonProps = BaseButtonProps & ContentMode & SubmitMode & PriorityMode

/**
 * Action button.
 *
 * Renders an `<a-button>` web component (or `<a role="button">` when
 * `href` is set) with the design system's tone × priority matrix applied
 * via CSS attributes.
 *
 * Requires `@antadesign/anta/elements` to be imported (client-side only)
 * to register the underlying custom element.
 *
 * @example Basic usage
 * ```tsx
 * <Button priority="primary" tone="brand" label="Save" onClick={save} />
 * ```
 *
 * @example Anchor styled as a button
 * ```tsx
 * <Button href="/docs" target="_blank" label="Read the docs" />
 * ```
 */
export const Button = ({
  priority,
  tone,
  underline,
  leadingIcon,
  trailingIcon,
  iconButton,
  paddingless,
  label,
  size,
  loading,
  disabled,
  selected,
  href,
  target,
  rel,
  type,
  form,
  className,
  style,
  children,
  ...rest
}: ButtonProps) => {
  // Literal-color tone flows through --button-tone-source; the CSS
  // resolver derives the rest via oklch(from ...).
  const isCustomTone = tone != null && !NAMED_TONES.has(tone)
  const computedStyle = isCustomTone
    ? { ...style, ['--button-tone-source']: tone }
    : style

  const isIconBtn = iconButton != null

  const sharedAttrs = {
    priority,
    tone,
    underline,
    size,
    iconbutton: isIconBtn ? 'true' : undefined,
    paddingless: paddingless ? 'true' : undefined,
    loading: loading ? 'true' : undefined,
    disabled: disabled ? 'true' : undefined,
    selected: selected ? 'true' : undefined,
    tabindex: disabled ? -1 : 0,
    'aria-disabled': disabled ? 'true' : undefined,
    'aria-busy': loading ? 'true' : undefined,
    'aria-pressed': selected ? 'true' : undefined,
    class: className,
    style: computedStyle as React.CSSProperties,
  } as const

  const inner = (
    <>
      {iconButton
        ? <a-icon shape={iconButton} aria-hidden="true" />
        : leadingIcon && <a-icon shape={leadingIcon} aria-hidden="true" />}
      {label != null && !isIconBtn && <a-button-label>{label}</a-button-label>}
      {!isIconBtn && children}
      {!isIconBtn && trailingIcon && <a-icon shape={trailingIcon} aria-hidden="true" />}
    </>
  )

  if (href != null) {
    // type / form intentionally omitted — anchors don't submit forms.
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        role="button"
        {...sharedAttrs as any}
        {...rest}
      >
        {inner}
      </a>
    )
  }

  return (
    <a-button
      type={type}
      form={form}
      {...sharedAttrs}
      {...rest}
    >
      {inner}
    </a-button>
  )
}
