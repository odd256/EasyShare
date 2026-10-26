import markdownIt, { type MarkdownIt } from 'markdown-it';
import matter from 'gray-matter';
import { katex } from '@mdit/plugin-katex';
import { anchor, headerLink } from '@mdit/plugin-anchor';
import toc from 'markdown-it-toc-done-right';
import { tasklist } from '@mdit/plugin-tasklist';
import { imgLazyload } from '@mdit/plugin-img-lazyload';
import mdHighlight from 'markdown-it-highlightjs';
import { fullEmoji } from '@mdit/plugin-emoji';
import { markdownHref, withBasePath } from './site-paths';
import twemoji from '@twemoji/api';
import { load } from 'cheerio';
import { markdownCallouts } from './markdown-callouts';

// 自定义双向链接渲染插件（处理 [[笔记名称]] 语法）
function wikiLinks(md: MarkdownIt) {
  md.inline.ruler.after('emphasis', 'wikilink', (state, silent) => {
    if (state.src.charCodeAt(state.pos) !== 0x5B /* [ */) return false;
    if (state.src.charCodeAt(state.pos + 1) !== 0x5B /* [ */) return false;

    const start = state.pos + 2;
    const end = state.src.indexOf(']]', start);
    if (end === -1) return false;

    if (!silent) {
      const content = state.src.slice(start, end);
      const [link, alias] = content.split('|');
      const token = state.push('link_open', 'a', 1);
      
      token.attrs = [['href', link.trim()], ['class', 'wikilink']];
      
      const textToken = state.push('text', '', 0);
      textToken.content = (alias || link).trim();
      
      state.push('link_close', 'a', -1);
    }

    state.pos = end + 2;
    return true;
  });
}

let currentToc = "";
const headingSlug = (title: string) => title.trim().toLowerCase().replace(/\s+/g, '-');

function applyTwemoji(html: string): string {
  const $ = load(html, {}, false);
  const ignored = 'pre, code, script, style, textarea, title, noscript, svg, math, .katex';

  // 只替换文本节点，保留 HTML 属性、代码示例和公式。
  const textNodes = $.root().find('*').addBack().contents().filter((_, node) => node.type === 'text');
  textNodes.each((_, node) => {
    if (node.type !== 'text' || $(node).parents(ignored).length) return;

    // Twemoji 返回的 HTML 未经安全过滤，因此解析前先转义文本。
    const escapedText = md.utils.escapeHtml(node.data);
    const rendered = twemoji.parse(escapedText, {
      base: 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@17.0.3/assets/',
      folder: 'svg',
      ext: '.svg',
    });
    if (rendered !== escapedText) $(node).replaceWith(rendered);
  });

  return $.root().html() ?? '';
}

const md = new markdownIt({
  html: true,
  linkify: false,
  typographer: true,
})
.use(tasklist, { label: true })
.use(imgLazyload)
.use(mdHighlight, { inline: false })
.use(wikiLinks)
.use(markdownCallouts)
.use(katex)
.use(fullEmoji)
.use(anchor, { slugify: headingSlug, permalink: headerLink() })
.use(toc, { 
  slugify: headingSlug,
  listType: 'ul', 
  containerClass: 'toc-container',
  callback: (html: string) => {
    currentToc = html;
  }
});

// 表情词元包含普通 Unicode 字符，将其按文本处理，
// 使标题和目录中的表情与正文直接输入的表情保持一致。
md.core.ruler.after('emoji', 'emoji_text', (state) => {
  for (const token of state.tokens) {
    for (const child of token.children ?? []) {
      if (child.type === 'emoji') child.type = 'text';
    }
  }
});

// 处理普通 Markdown 链接中的 .md 结尾
const defaultRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options);
};

md.renderer.rules.link_open = function(tokens, idx, options, env, self) {
  const hAttr = tokens[idx].attrGet('href');
  if (typeof hAttr === 'string') {
    const sourcePath = typeof env?.sourcePath === 'string' ? env.sourcePath : undefined;
    tokens[idx].attrSet('href', markdownHref(hAttr, sourcePath, undefined, tokens[idx].attrGet('class') === 'wikilink'));
  }
  return defaultRender(tokens, idx, options, env, self);
};

export function parseMarkdown(content: string, options?: { skipToc?: boolean; sourcePath?: string }) {
  try {
    const { data, content: markdownContent } = matter(content);

    let mdContentToParse = markdownContent || "";
    if (!options?.skipToc && !mdContentToParse.includes("[TOC]")) {
      mdContentToParse = "[TOC]\n\n" + mdContentToParse;
    }

    currentToc = "";
    const html = md.render(mdContentToParse, { sourcePath: options?.sourcePath ?? 'index.md' });
    // 同时处理 Markdown 图片和用户正文中的原生 HTML 资源。
    const $ = load(html, {}, false);
    $('[src]').each((_, element) => {
      const src = $(element).attr('src');
      if (src) $(element).attr('src', withBasePath(src));
    });
    $('a[href]').each((_, element) => {
      const href = $(element).attr('href');
      if (href) $(element).attr('href', markdownHref(href, options?.sourcePath));
    });

    return {
      metadata: data,
      content: applyTwemoji($.root().html() ?? ''),
      toc: applyTwemoji(currentToc)
    };
  } catch (e) {
    console.error("Error parsing markdown:", e);
    return {
      metadata: {},
      content: "<p>Error parsing content</p>",
      toc: ""
    };
  }
}
