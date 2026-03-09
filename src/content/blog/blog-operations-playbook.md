---
title: "博客运维手册：从新建文章到推送 GitHub 的完整流程"
description: "围绕当前仓库的 Makefile 和内容目录，梳理一套可重复执行的文章管理流程，包括新建、查找、编辑、删除、校验、构建与发布。"
pubDate: 2026-03-08
updated: 2026-03-09
image: /image/image2.jpg
badge: Pin
draft: false
categories:
  - Engineering
  - Operations
tags:
  - Makefile
  - GitHub
  - Deployment
  - Pin
---

如果一个博客要长期更新，最重要的不是“会不会写”，而是“发布流程是否足够顺手”。当新建、查找、修改、删除、校验、提交、推送都能用稳定命令完成时，写作成本会显著下降，出错率也会下降。

当前仓库已经补上了一套基于 `Makefile` 的文章管理入口。这篇文章把整套流程拆开讲清楚，方便后续维护时直接照着执行。

## 一、文章管理的基本原则

文章管理的目标不是为了“命令更酷”，而是为了让内容操作具备以下特征：

- 有统一入口，不需要每次想文件路径。
- 有最小安全边界，避免误删。
- 有固定发布流程，减少漏检。
- 能够被未来的自己快速接手。

基于这个原则，现在的命令设计分成三层。

## 二、第一层：内容操作

### 1. 新建文章

最常用的命令是：

```bash
make post-new title="My Post" desc="Short description"
```

如果希望直接创建置顶文章，可以把 `badge=Pin` 一起带上：

```bash
make post-new \
  title="Weekly Review" \
  desc="Week 10 notes" \
  badge=Pin \
  tags="Review,Weekly" \
  categories="Journal" \
  open=1
```

这个命令背后会做几件事：

- 根据标题自动生成 slug。
- 在 `src/content/blog` 下创建 `.md` 文件。
- 自动写入 frontmatter。
- 可选地调用 `$EDITOR` 直接打开文件。

### 2. 查找文章

当文章数量多起来之后，靠肉眼找文件会越来越慢。现在可以用：

```bash
make post-find q=workflow
```

这个查找不是只搜文件名，它会同时搜索：

- slug
- title
- description
- badge
- tags
- categories
- 正文内容

因此，它更像一个轻量的本地内容检索入口。

### 3. 编辑文章

如果你已经知道文章 slug，可以直接打开：

```bash
make post-edit slug=blog-operations-playbook EDITOR="code -w"
```

`EDITOR` 可以替换成你习惯的工具，比如 `nvim`、`vim`、`code -w`。

### 4. 删除单篇文章

删除是高风险操作，所以命令要求显式确认：

```bash
make post-delete slug=old-post force=1
```

没有 `force=1` 时，不会执行删除。

### 5. 清空文章目录

如果需要重置整个内容目录，可以使用：

```bash
make post-clean force=1
```

这个命令会删除 `src/content/blog` 下所有 `.md` 和 `.mdx` 文件，因此只适合在明确知道后果的时候使用。

## 三、第二层：质量校验

文章写完以后，不要立刻提交。先过一遍最小校验链路：

```bash
make check
make lint
make build
```

这三步分别负责不同的事情：

- `make check`：检查 Astro 内容与类型是否正常。
- `make lint`：检查代码与脚本风格问题。
- `make build`：做一遍真实生产构建，并生成搜索索引。

如果你修改了文章目录、frontmatter、组件或者内容渲染逻辑，至少应该跑到 `make check` 和 `make build`。

## 四、第三层：Git 与发布

日常 Git 流程已经被拆成独立命令，适合按步骤执行：

```bash
make git-status
make git-add path=src/content/blog/blog-operations-playbook.md
make git-commit msg="docs: add operations playbook"
make git-push remote=origin branch=main
```

如果你希望一次性完成“校验 + 构建 + 提交 + 推送”，可以直接用：

```bash
make publish msg="docs: update pinned posts"
```

这条命令会依次执行：

1. `make check`
2. `make build`
3. `git add .`
4. `git commit`
5. `git push`

它很方便，但前提是你已经确认当前工作区里没有不想提交的额外改动。

## 五、建议采用的日常工作流

为了避免写作和发布过程变得混乱，我建议平时固定使用下面的流程：

### 场景一：新写一篇正式文章

1. 用 `make post-new` 建文件。
2. 完成 frontmatter、正文、标题和摘要。
3. 用 `make check` 做基本校验。
4. 本地跑 `make dev` 看页面效果。
5. 用 `make build` 确认生产构建可通过。
6. 用 `make git-add`、`make git-commit`、`make git-push` 完成发布。

### 场景二：更新一篇旧文

1. 用 `make post-find q=关键词` 找文章。
2. 用 `make post-edit slug=...` 打开文件。
3. 更新正文，并同步补充 `updated` 字段。
4. 跑 `make check`。
5. 再决定是否需要完整 `make build`。

### 场景三：重置内容结构

1. 先确认当前文章是否需要备份。
2. 执行 `make post-clean force=1`。
3. 先补置顶文章，再逐步恢复普通内容。
4. 构建并检查首页、归档页、标签页是否正常。

## 六、为什么这套流程值得长期保留

一套好的博客流程，不只是帮助你“今天发一篇文章”，而是帮助你在三个月以后仍然能稳定维护。

这套 Makefile 流程的价值在于：

- 让高频动作变短。
- 让危险动作变显式。
- 让发布动作变标准。
- 让内容维护从“凭感觉”变成“按步骤”。

对于一个想长期更新的博客来说，这种确定性比任何花哨功能都更重要。

后续如果继续扩展，我会优先考虑两类能力：

- 文章模板化，比如自动生成固定章节结构。
- 发布策略化，比如只提交文章目录或自动生成周报草稿。

当这些基础设施逐步补齐以后，博客才真正具备“低摩擦持续更新”的能力。
