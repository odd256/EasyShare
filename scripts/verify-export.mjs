import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';
import { load } from 'cheerio';

const root = resolve('out');
const { basePath = '' } = JSON.parse(await readFile('.next/routes-manifest.json', 'utf8'));
const files = [];
async function collect(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const file = resolve(directory, item.name);
    if (item.isDirectory()) await collect(file);
    else if (file.endsWith('.html')) files.push(file);
  }
}
await collect(root);
assert.ok(files.length > 0, '请先运行 npm run build');
let checked = 0;
for (const file of files) {
  const $ = load(await readFile(file, 'utf8'));
  const pagePath = '/' + relative(root, file).split(sep).join('/').replace(/index\.html$/, '');
  for (const element of $('a[href], link[href], [src]').toArray()) {
    const attribute = $(element).attr('src') ?? $(element).attr('href');
    if (!attribute || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(attribute)) continue;
    const url = new URL(attribute, 'http://localhost' + basePath + pagePath);
    const pathname = decodeURIComponent(url.pathname);
    assert.ok(!basePath || pathname === basePath || pathname.startsWith(basePath + '/'), `${file}: 地址跳出了基础路径：${attribute}`);
    let target = resolve(root, '.' + pathname.slice(basePath.length));
    assert.ok(target === root || target.startsWith(root + sep), '地址超出导出目录');
    try {
      if ((await stat(target)).isDirectory()) target = resolve(target, 'index.html');
      await stat(target);
    } catch {
      assert.fail(`${file}: 找不到导出目标 ${attribute}`);
    }
    if (url.hash && url.hash !== '#' && target.endsWith('.html')) {
      const document = target === file ? $ : load(await readFile(target, 'utf8'));
      const id = decodeURIComponent(url.hash.slice(1));
      assert.ok(document('[id]').toArray().some(el => document(el).attr('id') === id), `${file}: 锚点不存在 ${attribute}`);
    }
    checked++;
  }
}
console.log(`静态导出检查通过：${files.length} 个页面，${checked} 个本地地址，基础路径 ${basePath || '/'}。`);
