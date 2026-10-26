# EasyShare

使用 Markdown 记录学习与思考的数字花园模板。基于 Next.js、React 和 Tailwind CSS，静态导出后部署到 GitHub Pages。

保留目录树、全文搜索、归档和标签筛选、深色模式、数学公式、代码高亮与复制、文章目录、笔记链接、可折叠提示块和图片放大。无需数据库或运行中的应用服务器。

## 从模板开始

1. 在 EasyShare 的 GitHub 仓库中选择 **Use this template → Create a new repository**。
2. 为自己的博客创建仓库，推荐默认分支使用 `main`。
3. 克隆你自己的仓库，而不是模板仓库：

   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   cd YOUR_REPOSITORY
   npm ci
   npm run dev
   ```

需要 **Node.js 22.6 或更高版本**；CI 使用 Node.js 22。安装依赖后默认打开 `http://localhost:3000`。有 nvm 的用户可以使用 `.nvmrc` 选择 Node.js 22。

先修改 `config/site.ts`，再修改 `content/index.md` 介绍自己，然后替换示例文章。首次推送前请完成下方 Pages 设置；默认本地地址会被部署检查拒绝。

## 配置自己的站点

站点配置集中在 `config/site.ts`，字段有类型约束和中文注释。配置变更后重启开发服务器。

| 字段 | 用途 |
| --- | --- |
| `title`、`description` | 网站标题和描述 |
| `author` | 作者名，用于页脚和元数据 |
| `language` | HTML 语言，默认 `zh-CN`；不会翻译中文界面 |
| `copyrightStartYear` | 版权起始年份，同年只显示一个年份 |
| `url` | 完整公开地址，包含仓库路径，不能包含查询参数或锚点 |
| `notesOrder` | `desc` 最新优先，`asc` 最早优先 |
| `createdFieldName`、`updatedFieldName` | 文章 YAML 中的日期字段名 |
| `displayDateField` | 列表显示 `created` 或 `updated` |
| `links.github`、`links.twitter` | 完整个人主页地址；空字符串隐藏 |
| `links.email` | 邮箱，不加 `mailto:`；空字符串隐藏 |
| `analytics.umami.websiteId` | 留空关闭统计，填写后加载统计脚本 |
| `analytics.umami.scriptUrl` | Umami 脚本地址，可使用自托管地址 |

`url` 默认是 `http://localhost:3000`，供开箱预览。部署前改成自己的真实地址：

| 部署类型 | 仓库示例 | `url` 示例 |
| --- | --- | --- |
| 用户站点 | `YOUR_USERNAME.github.io` | `https://YOUR_USERNAME.github.io` |
| 普通仓库站点 | `my-blog` | `https://YOUR_USERNAME.github.io/my-blog` |
| 自定义域名 | 任意博客仓库 | `https://blog.example.com` |

普通仓库的本地地址也包含仓库路径，例如 `http://localhost:3000/my-blog/`。构建默认从 `url` 推导基础路径；Pages 工作流使用 GitHub 输出的路径，并检查其与 `url` 一致。

## 用 Markdown 写作

在 `content/` 下按文件夹组织 `.md` 文件：

```text
content/
  index.md                  # 首页正文，不计入文章列表
  指南/
    快速开始.md
    Markdown 示例.md
  学习笔记/
    第一篇 笔记.md
public/images/              # 正文引用的静态图片
```

每篇文章建议填写明确的日期，日期字符串请加引号：

```yaml
---
title: 我的第一篇笔记
created: "2026-10-26"
updated: "2026-10-26"
tags: [学习, 随笔]
summary: 这篇笔记的简短介绍。
---
```

标题缺省时使用文件名；日期缺省时使用文件系统时间，克隆或 CI 构建可能改变该时间。不要把私密草稿放入 `content/`：当前所有非隐藏 `.md` 文件都会发布，没有 `draft` 或 `publish` 筛选功能。

文件夹对应 URL 层级，空格转为 `-`，例如 `content/学习笔记/第一篇 笔记.md` 对应 `/学习笔记/第一篇-笔记/`。避免在同一目录同时使用 `第一篇 笔记.md` 与 `第一篇-笔记.md`，也避免 `archive.md`、文件名中的 `?` 或 `#` 等与路由冲突的名称。

### 文章链接

普通 `.md` 相对链接以当前文章所在目录为起点；根路径链接和笔记链接以 `content/` 为起点：

```markdown
[同目录文章](快速开始.md)
[跨目录文章](<../学习笔记/第一篇 笔记.md>)
[根目录文章](</指南/Markdown 示例.md#代码>)
[[指南/Markdown 示例]]
[[学习笔记/第一篇 笔记|显示别名]]
[本页标题](#代码)
```

文件名有空格时，普通 Markdown 链接用 `<...>` 包住目标，或者写成 `%20`。笔记链接应写完整目录路径；它提供跳转，不提供反向引用列表。支持文章链接后的查询参数与锚点，外链和邮箱地址保持原样。

### 图片

图片放到 `public/images/`，使用站点根路径引用：

```markdown
![数字花园](/images/garden.svg)
```

不要写 `public/`，也不要手动添加 GitHub 仓库名；构建会自动附加基础路径。外部 HTTP(S) 图片也可直接使用。文章旁的相对图片文件不会自动复制，请统一放在 `public/` 下。

### Markdown 扩展

查看示例文章了解公式、代码、任务列表和提示块。文章目录自动生成；也可显式写 `[TOC]`。提示块支持 `> [!note]`、`> [!faq]-` 等写法。正文支持原生 HTML，仅发布你信任的内容。

## 检查与静态预览

```bash
npm run dev        # 开发预览
npm run check      # ESLint + TypeScript + 路径及配置测试
npm run build      # 导出到 out/
npm run test:export # 检查导出页面中的本地链接、图片和锚点
npm start          # 预览已有 out/，正确挂载仓库子路径
npm run preview    # 重新构建后预览
```

静态预览默认端口为 3000，终端会显示完整访问地址。运行前关闭占用该端口的开发服务器，或者设置 `PORT` 使用其他端口。预览服务器仅供本地检查。

`npm run build` 在 Next.js 构建后执行静态文件兼容处理，补齐 Windows 上可能导出为嵌套目录的导航缓存文件。请通过此命令构建，以保证静态导航文件完整。

## 部署到 GitHub Pages

1. 确保仓库默认分支是 `main`，修改配置中的 `url` 并提交。
2. 在仓库 **Settings → Pages → Build and deployment** 中，将 **Source** 设为 **GitHub Actions**。
3. 推送到 `main`，或者在 **Actions → Check and deploy → Run workflow** 手动运行。
4. 等待 build 和 deploy 成功，访问部署记录中的地址。

PR 只执行检查和构建；推送 `main` 或手动运行才会部署。工作流使用 Node.js 22 和 `npm ci`，部署不需要额外配置个人访问令牌。

如果第一次创建模板仓库时自动触发的工作流失败，先完成 Pages 设置并替换默认地址，再重新运行。配置仍是 localhost 或仓库路径不一致时，构建会显示中文诊断。

### 自定义域名

在 Pages 设置中填写自己的域名，并按 GitHub 提示配置 DNS 和 HTTPS；将 `url` 改为该域名，例如 `https://blog.example.com`，再次运行部署。Actions 发布以 Pages 设置中的域名为准，不需要为模板预置个人 `CNAME` 文件。

### Vercel / Netlify

按静态站点部署：构建命令 `npm run build`，发布目录 `out`，Node.js 22；把 `url` 改为平台域名或自己的域名。模板维持 `output: 'export'`，如平台自动启用 Next.js 服务端适配，请改为静态站点模式。此版本的部署验证以 GitHub Pages 路径行为为主。

## 常见问题

- **子路径访问 404**：核对 `url` 的仓库名与 Pages 地址是否一致；本地访问也要包含该路径。修改配置后重启服务器。
- **图片 404**：图片应放在 `public/` 下，正文从 `/images/...` 引用；Linux 构建区分大小写。
- **公式或图片显示异常**：检查 Markdown 语法和控制台；表情 SVG 从 jsDelivr 加载，需要网络。
- **构建无法下载字体**：当前使用 Next.js 的 Google Geist 字体，构建环境需要能访问字体服务。
- **删除示例后列表为空**：这是有效状态，首页与归档仍可使用；同时删除首页中指向已删示例的链接。

## 技术与授权

技术栈沿用 Next.js 16、React 19、Tailwind CSS 4、shadcn/ui、Animate UI、Motion、markdown-it、Fuse.js、KaTeX 和 highlight.js。依赖版本记录在锁文件中。

代码采用 MIT 许可证，保留原作者版权声明，见 [LICENSE](LICENSE)。文章与图片发布前请确认你拥有相应权利。模板附带的 `garden.svg` 和 `app/icon.svg` 为项目自绘示例，按项目 MIT 许可证提供。

Twemoji SVG 通过 jsDelivr 加载，版本固定为 17.0.3，图片采用 CC BY 4.0，署名归 Twitter, Inc. 及其他贡献者所有；Twemoji 代码采用 MIT。详见 [第三方署名](THIRD_PARTY_NOTICES.md)。

维护者发布模板请阅读 [发布清单](docs/发布清单.md)；本次本地验证见 [验证记录](docs/验证记录.md)。
