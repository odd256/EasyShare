import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { normalizeExport } from '../scripts/normalize-export.mjs';

test('嵌套 segment 文件可被浏览器按扁平文件名读取，重复执行安全', async () => {
  const root = await mkdtemp(join(tmpdir(), 'easyshare-export-'));
  try {
    await mkdir(join(root, '指南', '__next.$c$slug'), { recursive: true });
    await writeFile(join(root, '指南', '__next.$c$slug', '__PAGE__.txt'), 'segment');
    await writeFile(join(root, '指南', '__next._tree.txt'), 'tree');
    await writeFile(join(root, '指南', 'index.html'), '<html></html>');
    assert.equal(await normalizeExport(root), 1);
    assert.equal(await readFile(join(root, '指南', '__next.$c$slug.__PAGE__.txt'), 'utf8'), 'segment');
    assert.equal(await readFile(join(root, '指南', '__next._tree.txt'), 'utf8'), 'tree');
    assert.equal(await normalizeExport(root), 1);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
