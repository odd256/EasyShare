/** 仅用于原生 HTML 的站内地址；Next Link / router 自动处理 basePath。 */
export function withBasePath(path: string, basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  const base = basePath.replace(/\/$/, "");
  if (!base || path === base || path.startsWith(base + '/') || path.startsWith(base + '?') || path.startsWith(base + '#')) return path;
  return base + path;
}

function isExternal(href: string): boolean {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/|#|\?)/i.test(href) || href === "";
}

function decodeSegment(segment: string): string {
  try { return decodeURIComponent(segment); } catch { return segment; }
}

/** sourcePath 为 content 根目录下的文件路径，例如 指南/第一篇.md。 */
export function markdownHref(href: string, sourcePath = "index.md", basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "", wiki = false): string {
  if (isExternal(href)) return href;
  const suffixAt = href.search(/[?#]/);
  const pathname = suffixAt < 0 ? href : href.slice(0, suffixAt);
  const suffix = suffixAt < 0 ? "" : href.slice(suffixAt);
  const isNote = wiki || /\.md$/i.test(pathname);
  if (!isNote) return withBasePath(href, basePath);

  const base = basePath.replace(/\/$/, "");
  const unprefixed = base && pathname.startsWith(base + '/') ? pathname.slice(base.length) : pathname;
  const directory = !wiki && !unprefixed.startsWith("/") ? sourcePath.split("/").slice(0, -1) : [];
  const segments = [...directory];
  for (const part of unprefixed.split("/")) {
    const decoded = decodeSegment(part);
    if (!decoded || decoded === ".") continue;
    if (decoded === "..") segments.pop();
    else segments.push(decoded);
  }
  const last = segments.pop() ?? "";
  const stem = last.replace(/\.md$/i, "");
  if (!(segments.length === 0 && stem === "index")) segments.push(stem);
  const urlPath = "/" + segments.map(part => encodeURIComponent(part.replace(/ /g, "-"))).join("/");
  return withBasePath(urlPath, basePath) + suffix;
}
