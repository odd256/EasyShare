---
title: Markdown 示例
created: "2026-10-26"
updated: "2026-10-26"
tags: [指南, Markdown]
summary: 代码、公式、提示块、图片与笔记链接示例。
---

## 文本与列表

可以使用 **粗体**、*斜体* 和 `行内代码`，也可以记录任务：

- [x] 创建数字花园
- [ ] 发布新的笔记

## 代码

```typescript
const greeting = "Hello, EasyShare!";
console.log(greeting);
```

## 数学公式

行内公式：$E = mc^2$。

$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$

## 提示块

> [!note]
> 小知识也值得记录。

> [!faq]- 点击展开
> 这里是支持折叠的补充说明。

## 图片与链接

把图片放到 `public/images/`，在正文写 `![说明](/images/garden.svg)`。即使部署到仓库子路径，也不需要在文章里重复添加仓库名。

![数字花园插图](/images/garden.svg)

- [同目录文章](快速开始.md)
- [跨目录文章](<../学习笔记/第一篇 笔记.md>)
- [[学习笔记/第一篇 笔记|内容根目录笔记链接]]
- [回到代码示例](#代码)
- [外部网站](https://example.com)
- [邮件示例](mailto:hello@example.com)

表情也可以直接输入 🌱 或使用短代码 :smile:。
