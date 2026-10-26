import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';

const root = resolve('out');
let basePath;
try {
  await stat(resolve(root, 'index.html'));
  basePath = JSON.parse(await readFile('.next/routes-manifest.json', 'utf8')).basePath ?? '';
} catch {
  console.error('请先运行 npm run build，再运行 npm start。');
  process.exit(1);
}
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
const server = createServer(async (req, res) => {
  try {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (basePath && pathname === '/') { res.writeHead(302, { Location: encodeURI(basePath + '/') }); res.end(); return; }
    if (basePath && pathname !== basePath && !pathname.startsWith(basePath + '/')) throw new Error('outside base');
    const relative = pathname.slice(basePath.length).replace(/^\//, '');
    let file = resolve(root, relative);
    if (file !== root && !file.startsWith(root + sep)) throw new Error('outside root');
    const info = await stat(file);
    if (info.isDirectory()) {
      if (!pathname.endsWith('/')) { res.writeHead(308, { Location: encodeURI(pathname + '/') + new URL(req.url, 'http://localhost').search }); res.end(); return; }
      file = resolve(file, 'index.html');
    }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    try { res.end(await readFile(resolve(root, '404.html'))); } catch { res.end('Not found'); }
  }
});
const port = Number(process.env.PORT ?? 3000);
server.listen(port, '127.0.0.1', () => console.log('EasyShare 静态预览：http://localhost:' + port + basePath + '/'));
