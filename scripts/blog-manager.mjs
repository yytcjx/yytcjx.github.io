#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import yaml from "js-yaml";
import slugify from "slugify";

const args = parseArgs(process.argv.slice(2));
const command = args._[0];
const blogDir = path.resolve(process.cwd(), args.dir || "src/content/blog");

const commands = {
  new: createPost,
  list: listPosts,
  find: findPosts,
  edit: editPost,
  delete: deletePost,
  clear: clearPosts,
  rename: renamePost,
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

  assertPostDoesNotExist(slug);

  const frontmatter = {
    title,
    description: args.desc || args.description || title,
    pubDate: args.date || new Date().toISOString().slice(0, 10),
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

  const content = [
    "---",
    yaml.dump(frontmatter, { lineWidth: -1, noRefs: true }).trimEnd(),
    "---",
    "",
    args.body || "Write here.",
    "",
  ].join("\n");

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Created ${path.relative(process.cwd(), filePath)}`);

  if (parseBoolean(args.open, false))
    openInEditor(filePath);
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
  const post = resolvePost(requireArg("slug", args.slug));
  openInEditor(post.filePath);
}

function deletePost() {
  const post = resolvePost(requireArg("slug", args.slug));

  if (!parseBoolean(args.force, false)) {
    throw new Error("Refusing to delete without --force");
  }

  fs.unlinkSync(post.filePath);
  console.log(`Deleted ${path.relative(process.cwd(), post.filePath)}`);
}

function clearPosts() {
  if (!parseBoolean(args.force, false)) {
    throw new Error("Refusing to clear posts without --force");
  }

  const posts = loadPosts();

  for (const post of posts)
    fs.unlinkSync(post.filePath);

  console.log(`Deleted ${posts.length} post(s) from ${path.relative(process.cwd(), blogDir)}`);
}

function renamePost() {
  const post = resolvePost(requireArg("slug", args.slug));
  const nextSlug = normalizeSlug(requireArg("new-slug", args["new-slug"] || args.newSlug));
  const nextPath = path.join(blogDir, `${nextSlug}${path.extname(post.filePath)}`);

  if (fs.existsSync(nextPath))
    throw new Error(`Target already exists: ${path.relative(process.cwd(), nextPath)}`);

  fs.renameSync(post.filePath, nextPath);
  console.log(`Renamed ${post.slug} -> ${nextSlug}`);
}

function printHelp(errorMessage) {
  if (errorMessage)
    console.error(errorMessage);

  console.log(`Usage:
  node scripts/blog-manager.mjs <command> [options]

Commands:
  new      Create a markdown or MDX post
  list     List posts in the blog directory
  find     Search slug, frontmatter, and content
  edit     Open a post in $EDITOR
  delete   Delete a post (requires --force)
  clear    Delete all posts in the blog directory
  rename   Rename a post file slug

Examples:
  node scripts/blog-manager.mjs new --title "My Post" --badge "Pin" --tags "Astro,Notes"
  node scripts/blog-manager.mjs find --query "markdown"
  node scripts/blog-manager.mjs edit --slug markdown-style-guide
  node scripts/blog-manager.mjs delete --slug markdown-style-guide --force
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
      const frontmatter = extractFrontmatter(raw);

      return {
        filePath,
        raw,
        frontmatter,
        slug: file.replace(/\.(md|mdx)$/u, ""),
      };
    });
}

function extractFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/u);
  if (!match)
    return {};
  return yaml.load(match[1]) || {};
}

function resolvePost(slug) {
  const matches = [".md", ".mdx"]
    .map(ext => path.join(blogDir, `${slug}${ext}`))
    .filter(filePath => fs.existsSync(filePath));

  if (!matches.length)
    throw new Error(`Post not found for slug: ${slug}`);
  if (matches.length > 1)
    throw new Error(`Multiple posts found for slug: ${slug}`);

  return {
    slug,
    filePath: matches[0],
  };
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

function assertPostDoesNotExist(slug) {
  const conflicts = [".md", ".mdx"]
    .map(ext => path.join(blogDir, `${slug}${ext}`))
    .filter(filePath => fs.existsSync(filePath));

  if (conflicts.length) {
    throw new Error(`Post already exists: ${path.relative(process.cwd(), conflicts[0])}`);
  }
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

function requireArg(name, value) {
  if (value === undefined || value === "")
    throw new Error(`Missing required argument: ${name}`);
  return value;
}
