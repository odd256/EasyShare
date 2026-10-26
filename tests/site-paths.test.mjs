import test from 'node:test';
import assert from 'node:assert/strict';
import { markdownHref, withBasePath } from '../lib/site-paths.ts';

for (const base of ['', '/example-blog']) {
  test('相对文章、中文空格及锚点：' + (base || '/'), () => {
    const expected = base + '/%E6%8C%87%E5%8D%97/Markdown-%E7%A4%BA%E4%BE%8B#代码';
    assert.equal(markdownHref('../指南/Markdown%20示例.md#代码', '学习笔记/第一篇 笔记.md', base), expected);
    assert.equal(markdownHref('Markdown 示例.md#代码', '指南/快速开始.md', base), expected);
    assert.equal(markdownHref('/指南/Markdown 示例.md#代码', 'index.md', base), expected);
    assert.equal(markdownHref('指南/Markdown 示例#代码', '其他/笔记.md', base, true), expected);
  });
  test('首页、嵌套 index 与查询参数：' + (base || '/'), () => {
    assert.equal(markdownHref('../index.md', '指南/快速开始.md', base), base + '/');
    assert.equal(markdownHref('./index.md', '指南/快速开始.md', base), base + '/%E6%8C%87%E5%8D%97/index');
    assert.equal(markdownHref('/archive?tag=指南', 'index.md', base), base + '/archive?tag=指南');
    assert.equal(markdownHref('/指南/快速开始.md?mode=read#发布', 'index.md', base), base + '/%E6%8C%87%E5%8D%97/%E5%BF%AB%E9%80%9F%E5%BC%80%E5%A7%8B?mode=read#发布');
  });
  test('外链、邮箱、协议相对地址与锚点不变：' + (base || '/'), () => {
    for (const link of ['https://example.com/a.md', 'mailto:hello@example.com', '//cdn.example.com/a.png', '#代码', '?tag=a', 'data:image/png;base64,AA', '']) {
      assert.equal(markdownHref(link, '指南/快速开始.md', base), link);
      assert.equal(withBasePath(link, base), link);
    }
  });
  test('图片与原生站内链接正确添加基础路径：' + (base || '/'), () => {
    assert.equal(withBasePath('/images/garden.svg', base), base + '/images/garden.svg');
    const prefixed = base + '/images/garden.svg';
    assert.equal(withBasePath(prefixed, base), prefixed);
    assert.equal(withBasePath(base + '/archive?tag=a', base), base + '/archive?tag=a');
  });
}

test('仓库前缀只加一次，且不误判同名前缀', () => {
  assert.equal(markdownHref('/example-blog/指南/快速开始.md', 'index.md', '/example-blog'), '/example-blog/%E6%8C%87%E5%8D%97/%E5%BF%AB%E9%80%9F%E5%BC%80%E5%A7%8B');
  assert.equal(withBasePath('/example-blogger/a', '/example-blog'), '/example-blog/example-blogger/a');
});
