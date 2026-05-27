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
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

function regenDocsOnChange() {
  const siteDir = fileURLToPath(new URL('.', import.meta.url));
  const readme = fileURLToPath(new URL('../README.md', import.meta.url));
  const changelog = fileURLToPath(new URL('../CHANGELOG.md', import.meta.url));
  const srcDir = fileURLToPath(new URL('../src/', import.meta.url));

  const run = (script, label, logger) => {
    logger.info(`${label} → regenerating`);
    const child = spawn('pnpm', ['run', script], { cwd: siteDir, stdio: 'inherit' });
    child.on('error', (err) => logger.error(`${label} failed: ${err.message}`));
  };

  let pagesTimer, apiTimer;
  const debounce = (ref, fn) => { clearTimeout(ref.t); ref.t = setTimeout(fn, 100); };
  const pagesRef = {}, apiRef = {};

  return {
    name: 'anta:regen-docs',
    hooks: {
      'astro:server:setup': ({ server, logger }) => {
        server.watcher.add([readme, changelog, `${srcDir}**/*.ts`, `${srcDir}**/*.tsx`]);
        server.watcher.on('change', (file) => {
          if (file === readme || file === changelog) {
            debounce(pagesRef, () => run('docs:pages', `${file === readme ? 'README.md' : 'CHANGELOG.md'} changed`, logger));
          } else if (file.startsWith(srcDir) && /\.(ts|tsx)$/.test(file)) {
            debounce(apiRef, () => run('docs:api', 'JSDoc source changed', logger));
          }
        });
      },
    },
  };
}

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
        },
      },
    }),
    mdx(),
    regenDocsOnChange(),
  ],
  trailingSlash: 'always',
  markdown: {
    remarkPlugins: [
      remarkGfm,
      [remarkMath, { singleDollarTextMath: false }],
      remarkDirective,
      remarkDefinitionList,
      remarkAttributes,
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
