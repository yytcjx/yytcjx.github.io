# Repository Guidelines

## Project Structure & Module Organization
This repository is an Astro 5 static blog. Main application code lives in `src/`: page routes in `src/pages`, shared UI in `src/components`, layouts in `src/layouts`, content schemas in `src/content`, and reusable helpers in `src/lib` and `src/utils`. Blog posts are stored in `src/content/blog` as `.md` or `.mdx`. Static assets belong in `public/`, while repository-level automation lives in `scripts/` and `.github/workflows/`. Site settings are loaded from `ryuchan.config.yaml`.

## Build, Test, and Development Commands
Use pnpm; the lockfile and GitHub Actions workflow expect it.

- `pnpm install`: install dependencies.
- `pnpm run dev`: start the Astro dev server.
- `pnpm run check`: run `astro check` for type and content validation.
- `pnpm run build`: fetch music metadata, run checks, build `dist/`, and generate the Pagefind index.
- `pnpm run search:index`: rebuild the site and refresh `public/pagefind/` for local search testing.
- `pnpm run search:clean`: remove generated search artifacts.
- `pnpm exec eslint .`: run the repo’s ESLint + formatter rules.

## Coding Style & Naming Conventions
Follow the existing Antfu ESLint config: double quotes, semicolons, and explicit arrow-function parentheses. Use PascalCase for Astro and React component files (`Navbar.astro`, `WritePage.tsx`), camelCase for utilities (`blogUtils.ts`), and lowercase route/content paths (`src/pages/blog`, `src/content/blog`). Keep frontmatter fields aligned with `src/content/config.ts`: `title`, `description`, `pubDate`, optional `updated`, `image`, `badge`, `draft`, `categories`, and `tags`.

## Testing Guidelines
There is no dedicated automated test suite yet. Treat `pnpm run check`, `pnpm exec eslint .`, and `pnpm run build` as the minimum pre-PR validation set. When changing search, content loading, or the online editor/config flows under `src/components/write`, verify the affected route locally and note the manual checks you performed in the PR.

## Commit & Pull Request Guidelines
The visible history is sparse, but it already uses concise, imperative subjects with optional type prefixes such as `ci:`. Prefer that format for new commits: `feat: add tag filter state reset`. Pull requests should include a short summary, affected routes or config files, linked issues when applicable, and screenshots for UI changes. Keep generated files out of commits unless the change specifically requires them; `public/pagefind/` is ignored.

## Security & Configuration Tips
Do not commit `.env`, `.env.production`, private keys, or GitHub App credentials. Review changes to `ryuchan.config.yaml` carefully, because they affect site metadata, integrations, and deployment output.
