import { copyFile, readdir } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * 当前 Next.js 在 Windows 上可能把 segment 缓存导出为嵌套目录，
 * 浏览器却请求以点连接的文件名。补齐实际静态文件，保留原文件。
 */
export async function normalizeExport(root) {
  let copied = 0;
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const file = resolve(directory, entry.name);
      if (entry.isDirectory()) await visit(file);
      else if (entry.name.endsWith('.txt')) {
        const parts = relative(root, file).split(sep);
        const index = parts.findIndex(part => part.startsWith('__next.') || part === '__next');
        if (index >= 0 && index < parts.length - 1) {
          const flat = resolve(root, ...parts.slice(0, index), parts.slice(index).join('.'));
          await copyFile(file, flat);
          copied++;
        }
      }
    }
  }
  await visit(root);
  return copied;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const copied = await normalizeExport(resolve('out'));
  console.log(`静态导出兼容处理：补齐 ${copied} 个 segment 文件。`);
}
