import { validateSiteConfig, type SiteConfig } from "./site-validation";

/** 修改本站信息后运行 npm run dev 预览；发布前务必替换 url。 */
export const siteConfig: SiteConfig = {
  title: "EasyShare",
  description: "记录学习，分享思考，培育自己的数字花园。",
  author: "你的名字",
  language: "zh-CN", // 页面语言；界面文案仍为中文
  copyrightStartYear: 2026,
  url: "http://localhost:3000", // 例如 https://username.github.io/my-blog
  notesOrder: "desc", // desc：最新优先；asc：最早优先
  createdFieldName: "created", // Markdown 元数据的创建时间字段
  updatedFieldName: "updated", // Markdown 元数据的更新时间字段
  displayDateField: "updated", // 列表显示 created 或 updated
  links: {
    github: "", // 完整地址；留空隐藏
    twitter: "", // 完整地址；留空隐藏
    email: "", // 只填写邮箱，不加 mailto:
  },
  analytics: {
    umami: {
      websiteId: "", // 留空时关闭统计
      scriptUrl: "https://cloud.umami.is/script.js", // 可改为自托管地址
    },
  },
};

validateSiteConfig(siteConfig);
export type { SiteConfig } from "./site-validation";
