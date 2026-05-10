/**
 * rehype-changelog-sections.mjs — wraps each version block in CHANGELOG.md
 * (an <h2> whose text starts with a semver pattern, plus all sibling content
 * up to the next such <h2>) inside a <section data-stream="dev|main">.
 * Combined with the `?stream=…` URL param + html[data-stream] CSS rules in
 * site/src/styles/base.css, that lets the single /changelog/ page filter
 * its visible entries client-side without any per-stream URL or generated
 * .mdx file.
 *
 * Stream classification:
 *   - heading text contains "-dev." or starts with "0.0." → "dev"
 *   - everything else (proper semver versions) → "main"
 *
 * Plugin scope: registered globally for the docs-site MDX pipeline, but
 * the version-pattern guard makes it a no-op on every page that doesn't
 * actually contain version-shaped <h2>s. Safe.
 */
// Matches a leading version-like token: digits.digits.{digits or x or
// other identifier chars} — covers 1.2.3, 0.1.1-dev.4, and 0.0.x
// (the legacy "through April 2026" stub).
const versionRe = /^\d+\.\d+\.[\w-]+/
const isDev = (text) => /-dev\.|^0\.0\./i.test(text)

// Recursively join all text-node descendants into a single string. Lets
// us classify <h2><a>0.1.1-dev.4 — May 5, 2026</a></h2> the same as a
// plain <h2> — rehype-autolink-headings wraps headings in anchors.
function textOf(node) {
  if (!node) return ''
  if (node.type === 'text') return node.value || ''
  if (Array.isArray(node.children)) {
    return node.children.map(textOf).join('')
  }
  return ''
}

export default function rehypeChangelogSections() {
  return (tree) => {
    if (!Array.isArray(tree.children)) return

    const out = []
    let section = null

    for (const node of tree.children) {
      const isVersionH2 =
        node.type === 'element' &&
        node.tagName === 'h2' &&
        versionRe.test(textOf(node).trim())

      if (isVersionH2) {
        if (section) out.push(section)
        section = {
          type: 'element',
          tagName: 'section',
          properties: { 'data-stream': isDev(textOf(node)) ? 'dev' : 'main' },
          children: [node],
        }
      } else if (section) {
        section.children.push(node)
      } else {
        out.push(node)
      }
    }
    if (section) out.push(section)

    tree.children = out
  }
}
