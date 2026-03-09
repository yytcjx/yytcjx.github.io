#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import yaml from "js-yaml";
import slugify from "slugify";

const POST_TEMPLATES = {
  essay: {
    description: "Long-form essay with background, argument, and conclusion sections.",
    body: `## 背景

说明这篇文章为什么值得写，它试图处理什么问题。

## 核心观点

写清楚最重要的判断、结论或方法。

## 展开分析

把关键过程、取舍和例子补完整。

## 结论

总结这篇文章真正想留下的东西。
`,
  },
  guide: {
    description: "Practical guide for operations, tooling, or workflows.",
    body: `## 适用场景

说明这份指南适合什么问题和什么读者。

## 前置条件

- 条件一
- 条件二

## 操作步骤

1. 第一步
2. 第二步
3. 第三步

## 常见问题

列出容易踩坑的地方和处理方式。
`,
  },
  weekly: {
    description: "Weekly review template for progress, issues, and next steps.",
    body: `## 本周完成

- 
- 

## 本周问题

- 
- 

## 本周观察

记录这周最值得保留的判断或变化。

## 下周计划

1. 
2. 
3. 
`,
  },
  note: {
    description: "Short note for lightweight observations or temporary records.",
    body: `## 记录

先写下最重要的信息或想法。

## 补充

需要的时候再继续扩展。
`,
  },
};

const args = parseArgs(process.argv.slice(2));
const command = args._[0];
const blogDir = path.resolve(process.cwd(), args.dir || "src/content/blog");

const commands = {
  new: createPost,
  draft: createDraft,
  list: listPosts,
  find: findPosts,
  edit: editPost,
  delete: deletePost,
  clear: clearPosts,
  rename: renamePost,
  publish: publishPost,
  backup: backupPosts,
  templates: listTemplates,
  help: printHelp,
};

if (!command || !commands[command]) {
  printHelp(command ? `Unknown command: ${command}` : undefined);
  process.exit(command ? 1 : 0);
}

ensureDirectory(blogDir);

try {
  commands[command]();
}
catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

function createPost() {
  const title = requireArg("title", args.title);
  const slug = normalizeSlug(args.slug || title);
  const ext = normalizeExt(args.ext);
  const filePath = path.join(blogDir, `${slug}.${ext}`);
  const template = getTemplate(args.template);

  assertPostDoesNotExist(slug);

  const frontmatter = {
    title,
    description: args.desc || args.description || title,
    pubDate: args.date || today(),
  };

  if (args.updated)
    frontmatter.updated = args.updated;
  if (args.image)
    frontmatter.image = args.image;
  if (args.badge)
    frontmatter.badge = args.badge;

  frontmatter.draft = parseBoolean(args.draft, false);

  const categories = toList(args.categories);
  const tags = toList(args.tags);

  if (categories.length)
    frontmatter.categories = categories;
  if (tags.length)
    frontmatter.tags = tags;

  writePostFile(filePath, frontmatter, args.body || template.body);
  console.log(`Created ${path.relative(process.cwd(), filePath)}`);

  if (parseBoolean(args.open, false))
    openInEditor(filePath);
}

function createDraft() {
  args.draft = true;
  if (!args.template)
    args.template = "note";
  createPost();
}

function listPosts() {
  const posts = loadPosts();

  if (!posts.length) {
    console.log(`No posts found in ${path.relative(process.cwd(), blogDir)}`);
    return;
  }

  for (const post of posts) {
    const title = post.frontmatter.title || "(untitled)";
    const date = formatDate(post.frontmatter.pubDate);
    console.log(`${post.slug}\t${date}\t${title}`);
  }
}

function findPosts() {
  const query = requireArg("query", args.query || args.q).toLowerCase();
  const posts = loadPosts();
  const matches = posts.filter((post) => {
    const haystacks = [
      post.slug,
      post.frontmatter.title,
      post.frontmatter.description,
      post.frontmatter.badge,
      ...(post.frontmatter.tags || []),
      ...(post.frontmatter.categories || []),
      post.raw,
    ].filter(Boolean);

    return haystacks.some(value => String(value).toLowerCase().includes(query));
  });

  if (!matches.length) {
    console.log(`No posts matched "${query}"`);
    return;
  }

  for (const post of matches) {
    const title = post.frontmatter.title || "(untitled)";
    console.log(`${post.slug}\t${title}\t${path.relative(process.cwd(), post.filePath)}`);
  }
}

function editPost() {
  const post = readPost(requireArg("slug", args.slug));
  openInEditor(post.filePath);
}

function deletePost() {
  const post = readPost(requireArg("slug", args.slug));

  if (!parseBoolean(args.force, false))
    throw new Error("Refusing to delete without --force");

  fs.unlinkSync(post.filePath);
  console.log(`Deleted ${path.relative(process.cwd(), post.filePath)}`);
}

function clearPosts() {
  if (!parseBoolean(args.force, false))
    throw new Error("Refusing to clear posts without --force");

  const posts = loadPosts();

  for (const post of posts)
    fs.unlinkSync(post.filePath);

  console.log(`Deleted ${posts.length} post(s) from ${path.relative(process.cwd(), blogDir)}`);
}

function renamePost() {
  const post = readPost(requireArg("slug", args.slug));
  const nextSlug = normalizeSlug(requireArg("new-slug", args["new-slug"] || args.newSlug));
  const nextPath = path.join(blogDir, `${nextSlug}${path.extname(post.filePath)}`);

  if (fs.existsSync(nextPath))
    throw new Error(`Target already exists: ${path.relative(process.cwd(), nextPath)}`);

  fs.renameSync(post.filePath, nextPath);
  console.log(`Renamed ${post.slug} -> ${nextSlug}`);
}

function publishPost() {
  const post = readPost(requireArg("slug", args.slug));
  const nextFrontmatter = {
    ...post.frontmatter,
    draft: false,
    updated: args.updated || today(),
  };

  if (args.date) {
    nextFrontmatter.pubDate = args.date;
  } else if (!nextFrontmatter.pubDate) {
    nextFrontmatter.pubDate = today();
  }

  if (args.badge)
    nextFrontmatter.badge = args.badge;

  if (parseBoolean(args["clear-badge"], false))
    delete nextFrontmatter.badge;

  writePostFile(post.filePath, nextFrontmatter, post.body);
  console.log(`Published ${path.relative(process.cwd(), post.filePath)}`);
}

function backupPosts() {
  const backupRoot = path.resolve(process.cwd(), args["backup-dir"] || "backups/blog");
  const targetDir = path.join(backupRoot, createTimestamp());

  ensureDirectory(backupRoot);
  fs.cpSync(blogDir, targetDir, { recursive: true });
  console.log(`Backed up ${path.relative(process.cwd(), blogDir)} -> ${path.relative(process.cwd(), targetDir)}`);
}

function listTemplates() {
  for (const [name, template] of Object.entries(POST_TEMPLATES))
    console.log(`${name}\t${template.description}`);
}

function printHelp(errorMessage) {
  if (errorMessage)
    console.error(errorMessage);

  console.log(`Usage:
  node scripts/blog-manager.mjs <command> [options]

Commands:
  new        Create a markdown or MDX post
  draft      Create a draft post with a starter template
  list       List posts in the blog directory
  find       Search slug, frontmatter, and content
  edit       Open a post in $EDITOR
  delete     Delete a post (requires --force)
  clear      Delete all posts in the blog directory
  rename     Rename a post file slug
  publish    Mark a post as published and update frontmatter
  backup     Copy the post directory to a timestamped backup folder
  templates  List available post templates

Examples:
  node scripts/blog-manager.mjs new --title "My Post" --template guide --badge "Pin"
  node scripts/blog-manager.mjs draft --title "Draft Idea" --template note
  node scripts/blog-manager.mjs find --query "markdown"
  node scripts/blog-manager.mjs edit --slug markdown-style-guide
  node scripts/blog-manager.mjs delete --slug markdown-style-guide --force
  node scripts/blog-manager.mjs publish --slug draft-idea --badge Pin
  node scripts/blog-manager.mjs backup --backup-dir backups/blog
  node scripts/blog-manager.mjs clear --force`);
}

function parseArgs(argv) {
  const parsed = { _: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      parsed._.push(token);
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];

    if (!next || next.startsWith("--")) {
      parsed[key] = true;
      continue;
    }

    parsed[key] = next;
    index += 1;
  }

  return parsed;
}

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function loadPosts() {
  return fs.readdirSync(blogDir)
    .filter(file => file.endsWith(".md") || file.endsWith(".mdx"))
    .sort()
    .map((file) => {
      const filePath = path.join(blogDir, file);
      const raw = fs.readFileSync(filePath, "utf8");
      const { frontmatter } = splitFrontmatter(raw);

      return {
        filePath,
        raw,
        frontmatter,
        slug: file.replace(/\.(md|mdx)$/u, ""),
      };
    });
}

function splitFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/u);
  if (!match) {
    return {
      frontmatter: {},
      body: raw.replace(/^\r?\n/u, ""),
    };
  }

  return {
    frontmatter: yaml.load(match[1]) || {},
    body: raw.slice(match[0].length).replace(/^\r?\n/u, ""),
  };
}

function readPost(slug) {
  const filePath = resolvePostPath(slug);
  const raw = fs.readFileSync(filePath, "utf8");
  const { frontmatter, body } = splitFrontmatter(raw);

  return {
    slug,
    filePath,
    raw,
    frontmatter,
    body,
  };
}

function resolvePostPath(slug) {
  const matches = [".md", ".mdx"]
    .map(ext => path.join(blogDir, `${slug}${ext}`))
    .filter(filePath => fs.existsSync(filePath));

  if (!matches.length)
    throw new Error(`Post not found for slug: ${slug}`);
  if (matches.length > 1)
    throw new Error(`Multiple posts found for slug: ${slug}`);

  return matches[0];
}

function writePostFile(filePath, frontmatter, body) {
  const serializedFrontmatter = yaml.dump(normalizeFrontmatter(frontmatter), { lineWidth: -1, noRefs: true }).trimEnd();
  const normalizedBody = String(body || "").replace(/^\r?\n/u, "");
  const content = [
    "---",
    serializedFrontmatter,
    "---",
    "",
    normalizedBody,
  ].join("\n");

  fs.writeFileSync(filePath, `${content}\n`, "utf8");
}

function normalizeFrontmatter(frontmatter) {
  const orderedKeys = ["title", "description", "pubDate", "updated", "image", "badge", "draft", "categories", "tags"];
  const normalized = {};

  for (const key of orderedKeys) {
    const value = sanitizeFrontmatterValue(key, frontmatter[key]);
    if (value !== undefined)
      normalized[key] = value;
  }

  for (const [key, rawValue] of Object.entries(frontmatter)) {
    if (key in normalized || orderedKeys.includes(key))
      continue;

    const value = sanitizeFrontmatterValue(key, rawValue);
    if (value !== undefined)
      normalized[key] = value;
  }

  return normalized;
}

function sanitizeFrontmatterValue(key, rawValue) {
  if (rawValue === undefined || rawValue === null)
    return undefined;

  if (Array.isArray(rawValue)) {
    const list = [...new Set(rawValue.map(item => String(item).trim()).filter(Boolean))];
    return list.length ? list : undefined;
  }

  if (key === "pubDate" || key === "updated")
    return formatDateValue(rawValue);

  if (typeof rawValue === "string") {
    const value = rawValue.trim();
    return value === "" ? undefined : value;
  }

  return rawValue;
}

function openInEditor(filePath) {
  const editor = process.env.EDITOR || process.env.VISUAL || "vi";
  const quotedPath = `"${filePath.replace(/"/gu, '\\"')}"`;
  const result = spawnSync(`${editor} ${quotedPath}`, { stdio: "inherit", shell: true });

  if (result.status !== 0)
    throw new Error(`Editor exited with status ${result.status ?? "unknown"}`);
}

function normalizeSlug(input) {
  const slug = slugify(String(input), { lower: true, strict: true, trim: true });
  if (!slug)
    throw new Error(`Unable to generate slug from "${input}"`);
  return slug;
}

function normalizeExt(input) {
  if (!input)
    return "md";

  const ext = String(input).replace(/^\./u, "").toLowerCase();
  if (ext !== "md" && ext !== "mdx")
    throw new Error(`Unsupported extension: ${input}`);
  return ext;
}

function getTemplate(name) {
  if (!name)
    return POST_TEMPLATES.note;

  const template = POST_TEMPLATES[String(name).toLowerCase()];
  if (!template)
    throw new Error(`Unknown template: ${name}`);
  return template;
}

function assertPostDoesNotExist(slug) {
  const conflicts = [".md", ".mdx"]
    .map(ext => path.join(blogDir, `${slug}${ext}`))
    .filter(filePath => fs.existsSync(filePath));

  if (conflicts.length)
    throw new Error(`Post already exists: ${path.relative(process.cwd(), conflicts[0])}`);
}

function toList(input) {
  if (!input)
    return [];

  return [...new Set(String(input)
    .split(",")
    .map(item => item.trim())
    .filter(Boolean))];
}

function parseBoolean(value, fallback) {
  if (value === undefined)
    return fallback;

  const normalized = String(value).toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized))
    return true;
  if (["0", "false", "no", "off"].includes(normalized))
    return false;
  return fallback;
}

function formatDate(value) {
  if (!value)
    return "-";
  if (value instanceof Date)
    return value.toISOString().slice(0, 10);
  return String(value);
}

function formatDateValue(value) {
  if (value instanceof Date)
    return value.toISOString().slice(0, 10);
  return String(value);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function createTimestamp() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/gu, "");
  const time = now.toTimeString().slice(0, 8).replace(/:/gu, "");
  return `${date}-${time}`;
}

function requireArg(name, value) {
  if (value === undefined || value === "")
    throw new Error(`Missing required argument: ${name}`);
  return value;
}
