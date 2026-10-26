import type { NextConfig } from "next";
import { siteConfig } from "./config/site";

const isProduction = process.env.NODE_ENV === "production";
const basePath = (process.env.PAGES_BASE_PATH ?? decodeURI(new URL(siteConfig.url).pathname)).replace(/\/$/, "");

if (basePath && (!basePath.startsWith("/") || /[?#\s]/.test(basePath))) {
  throw new Error("[EasyShare 配置错误] 基础路径必须以 / 开头，且不能包含空格、查询参数或锚点。");
}

const nextConfig: NextConfig = {
  ...(isProduction && { output: "export" as const }),
  images: {
    unoptimized: true,
  },
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  trailingSlash: true,
};

export default nextConfig;
