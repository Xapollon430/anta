import { readFileSync, writeFileSync } from 'node:fs'

// ─── /index.mdx ←  README.md ──────────────────────────────────────────────
const readme = readFileSync(new URL('../../README.md', import.meta.url), 'utf8')
const indexBody = readme.replace(/^# .+\n\n/, '') // strip first H1 (package name)
writeFileSync(
  new URL('../src/pages/index.mdx', import.meta.url),
  `---
layout: ../layouts/DocsLayout.astro
title: Overview
---
# Overview

${indexBody}`
)
console.log('Generated src/pages/index.mdx from README.md')

// /changelog/ is rendered directly from the repo-root CHANGELOG.md by
// site/src/pages/changelog.astro (Astro markdown import + the
// rehype-changelog-sections plugin). No generated .mdx — single source.
