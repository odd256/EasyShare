export interface SiteConfig {
  title: string;
  description: string;
  author: string;
  language: string;
  copyrightStartYear: number;
  /** 完整公开地址，可包含仓库子路径。 */
  url: string;
  notesOrder: "asc" | "desc";
  createdFieldName: string;
  updatedFieldName: string;
  displayDateField: "created" | "updated";
  links: { github: string; twitter: string; email: string };
  analytics: { umami: { websiteId: string; scriptUrl: string } };
}

function fail(message: string): never {
  throw new Error('[EasyShare 配置错误] ' + message + '；请检查 config/site.ts。');
}

export function validateSiteConfig(config: SiteConfig): void {
  for (const field of ["title", "description", "author", "language", "createdFieldName", "updatedFieldName"] as const) {
    if (typeof config[field] !== "string" || !config[field].trim()) fail(field + ' 不能为空');
  }
  if (!/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(config.language)) fail("language 应为 zh-CN、en 等语言标记");
  if (!Number.isInteger(config.copyrightStartYear) || config.copyrightStartYear < 1 || config.copyrightStartYear > new Date().getFullYear()) {
    fail("copyrightStartYear 必须是有效的起始年份，且不能晚于今年");
  }
  if (!["asc", "desc"].includes(config.notesOrder)) fail("notesOrder 只能为 asc 或 desc");
  if (!["created", "updated"].includes(config.displayDateField)) fail("displayDateField 只能为 created 或 updated");
  if (config.createdFieldName === config.updatedFieldName) fail("创建和更新时间字段名不能相同");

  function httpUrl(value: string, field: string) {
    try {
      const url = new URL(value);
      if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
        fail(field + ' 必须是没有账号、查询参数或锚点的 HTTP(S) 地址');
      }
      return url;
    } catch {
      fail(field + ' 必须是有效的完整 HTTP(S) 地址');
    }
  }

  const url = httpUrl(config.url, "url");
  for (const key of ["github", "twitter"] as const) {
    if (config.links[key]) httpUrl(config.links[key], 'links.' + key);
  }
  if (config.links.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.links.email)) fail("links.email 格式不正确");
  if (config.analytics.umami.websiteId) httpUrl(config.analytics.umami.scriptUrl, "analytics.umami.scriptUrl");

  if (process.env.EASYSHARE_DEPLOY === "true") {
    if (["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) fail("部署前必须将 url 替换为公开站点地址");
    const expected = (process.env.PAGES_BASE_PATH ?? "").replace(/\/$/, "");
    const actual = decodeURI(url.pathname).replace(/\/$/, "");
    if (actual !== expected) fail('url 的路径 ' + (actual || '/') + ' 与 Pages 路径 ' + (expected || '/') + ' 不一致');
  }
}
