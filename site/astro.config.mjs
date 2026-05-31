import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import mdx from '@astrojs/mdx';
import astroExpressiveCode, { createInlineSvgUrl } from 'astro-expressive-code';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkDirective from 'remark-directive';
import remarkDefinitionList from 'remark-definition-list';
import remarkAttributes from 'remark-attributes';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeMathjax from 'rehype-mathjax';
import rehypeTableWrap from './lib/rehype-table-wrap.mjs';
import rehypeChangelogSections from './lib/rehype-changelog-sections.mjs';
import remarkUnwrapJsxParagraph from './lib/remark-unwrap-jsx-paragraph.mjs';
import remarkUnwrapImages from './lib/remark-unwrap-images.mjs';

export default defineConfig({
  site: 'https://antadesign.dev',
  devToolbar: { enabled: false },
  integrations: [
    preact({ compat: true }),
    astroExpressiveCode({
      themes: ['github-light', 'tokyo-night'],
      // Switch themes by the docs site's `.dark` class on <html>,
      // not by `prefers-color-scheme`. The theme toggle in the
      // sidebar lives in user-space — the OS preference is only the
      // fallback when the user has never toggled — so binding code-
      // block themes to the media query made them lag behind the
      // explicit choice. github-light (first in the array) stays as
      // the unscoped default; tokyo-night applies under `.dark`.
      useDarkModeMediaQuery: false,
      themeCssSelector: (theme) => theme.type === 'dark' ? '.dark' : '',
      styleOverrides: {
        borderWidth: '1px',
        borderColor: 'var(--border-5)',
        codeBackground: 'var(--bg-section)',
        codePaddingBlock: '0.75rem',
        codePaddingInline: '1rem',
        frames: {
          frameBoxShadowCssValue: 'none',
          editorBackground: 'var(--bg-section)',
          editorTabBarBackground: 'var(--bg-pane)',
          editorActiveTabBackground: 'var(--bg-section)',
          terminalBackground: 'var(--bg-section)',
          terminalTitlebarBackground: 'var(--bg-pane)',
          terminalTitlebarBorderBottomColor: 'var(--border-5)',
          copyIcon: createInlineSvgUrl([
            `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'>`,
            `<rect width='14' height='14' x='8' y='8' rx='2' ry='2'/>`,
            `<path d='M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2'/>`,
            `</svg>`,
          ]),
          // Style the copy button like an Anta neutral *tertiary* icon
          // button: borderless, transparent at rest, with the same icon
          // color and purple-tinted fill (and opacities) Anta uses for the
          // tertiary rest/hover/active states. Values are per-theme so the
          // dark scope (`.dark`) gets Anta's dark-mode tertiary palette.
          // (One unavoidable gap: EC only animates the background fill, so
          // the icon color can't darken on hover the way Anta's does.)
          inlineButtonForeground: ({ theme }) => (theme.type === 'dark' ? '#afa9b1' : '#635b65'),
          inlineButtonBorderOpacity: '0',
          inlineButtonBackground: ({ theme }) => (theme.type === 'dark' ? '#e4d1ef' : '#44374b'),
          inlineButtonBackgroundIdleOpacity: '0',
          inlineButtonBackgroundHoverOrFocusOpacity: ({ theme }) => (theme.type === 'dark' ? '0.1' : '0.05'),
          inlineButtonBackgroundActiveOpacity: ({ theme }) => (theme.type === 'dark' ? '0.15' : '0.1'),
        },
      },
    }),
    mdx(),
  ],
  trailingSlash: 'always',
  markdown: {
    remarkPlugins: [
      remarkGfm,
      [remarkMath, { singleDollarTextMath: false }],
      remarkDirective,
      remarkDefinitionList,
      remarkAttributes,
      remarkUnwrapImages,
      remarkUnwrapJsxParagraph,
    ],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'wrap',
          properties: {
            className: ['header-anchor', 'muted'],
          },
        },
      ],
      rehypeMathjax,
      rehypeChangelogSections,
      rehypeTableWrap,
    ],
  },
});
