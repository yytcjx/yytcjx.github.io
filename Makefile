.DEFAULT_GOAL := help

BLOG_DIR ?= src/content/blog
BLOG_BACKUP_DIR ?= backups/blog
POST_TOOL := node scripts/blog-manager.mjs
NODE_BIN := ./node_modules/.bin
REMOTE ?= origin
BRANCH ?= $(shell git rev-parse --abbrev-ref HEAD 2>/dev/null || printf 'main')

.PHONY: help post-new post-template post-templates post-draft post-publish post-list post-find post-edit post-delete post-clean post-rename post-backup dev check build preview search-index search-clean lint git-status git-diff git-add git-commit git-push publish

help:
	@printf '%s\n' \
	'Repository commands' \
	'===================' \
	'' \
	'Blog management:' \
	'  make post-list' \
	'      List all posts under $(BLOG_DIR).' \
	'' \
	'  make post-new title="My Post" desc="Short description" badge=Pin tags="Astro,Notes" categories="Docs"' \
	'      Create a new post. Optional vars: slug, date, updated, image, ext=md|mdx, draft=1, open=1, template=essay|guide|weekly|note.' \
	'' \
	'  make post-template title="Ops Guide" template=guide open=1' \
	'      Create a post from a named template.' \
	'' \
	'  make post-templates' \
	'      List all built-in starter templates.' \
	'' \
	'  make post-draft title="Idea" template=note open=1' \
	'      Create a draft post with draft=true.' \
	'' \
	'  make post-publish slug=idea badge=Pin' \
	'      Mark a post as published and refresh updated date. Optional vars: date, updated, badge, clear_badge=1.' \
	'' \
	'  make post-edit slug=my-post EDITOR="code -w"' \
	'      Open an existing post with $$EDITOR.' \
	'' \
	'  make post-find q=markdown' \
	'      Search slug, frontmatter, and article body.' \
	'' \
	'  make post-rename slug=my-post new_slug=my-renamed-post' \
	'      Rename a post file slug while keeping the extension.' \
	'' \
	'  make post-delete slug=my-post force=1' \
	'      Delete one post. force=1 is required.' \
	'' \
	'  make post-clean force=1' \
	'      Delete all posts in $(BLOG_DIR). force=1 is required.' \
	'' \
	'  make post-backup' \
	'      Copy $(BLOG_DIR) into a timestamped local backup directory.' \
	'' \
	'Common content flows:' \
	'  make post-new title="Weekly Review" desc="Week 10 notes" badge=Pin tags="Review,Weekly" categories="Journal" open=1' \
	'  make post-draft title="New Idea" template=note open=1' \
	'  make post-publish slug=new-idea' \
	'  make post-find q=Pin' \
	'  make post-delete slug=old-post force=1' \
	'' \
	'Build and validation:' \
	'  make dev' \
	'      Start Astro dev server.' \
	'  make check' \
	'      Run astro check.' \
	'  make lint' \
	'      Run ESLint.' \
	'  make build' \
	'      Build the site and generate Pagefind output.' \
	'  make preview' \
	'      Preview the production build.' \
	'  make search-index | make search-clean' \
	'      Rebuild or clear local Pagefind artifacts.' \
	'' \
	'Git workflow:' \
	'  make git-status' \
	'      Show branch and working tree status.' \
	'  make git-diff' \
	'      Show diff stat for current changes.' \
	'  make git-add path=src/content/blog/my-post.md' \
	'      Stage one path, or everything when path is omitted.' \
	'  make git-commit msg="docs: add my post"' \
	'      Create a commit with the provided message.' \
	'  make git-push remote=origin branch=main' \
	'      Push the current branch to the selected remote.' \
	'  make publish msg="docs: add my post"' \
	'      Run check + build + git add . + git commit + git push.' \
	'' \
	'Variables:' \
	'  BLOG_DIR=$(BLOG_DIR) BLOG_BACKUP_DIR=$(BLOG_BACKUP_DIR) REMOTE=$(REMOTE) BRANCH=$(BRANCH) EDITOR=$(EDITOR)'

post-new:
	@test -n "$(title)" || { echo 'title is required: make post-new title="My Post"'; exit 1; }
	@$(POST_TOOL) new --dir "$(BLOG_DIR)" --title "$(title)" $(if $(slug),--slug "$(slug)") $(if $(desc),--desc "$(desc)") $(if $(description),--description "$(description)") $(if $(date),--date "$(date)") $(if $(updated),--updated "$(updated)") $(if $(image),--image "$(image)") $(if $(badge),--badge "$(badge)") $(if $(tags),--tags "$(tags)") $(if $(categories),--categories "$(categories)") $(if $(ext),--ext "$(ext)") $(if $(body),--body "$(body)") $(if $(draft),--draft "$(draft)") $(if $(open),--open "$(open)") $(if $(template),--template "$(template)")

post-template:
	@test -n "$(title)" || { echo 'title is required: make post-template title="My Post" template=guide'; exit 1; }
	@test -n "$(template)" || { echo 'template is required: make post-template title="My Post" template=guide'; exit 1; }
	@$(POST_TOOL) new --dir "$(BLOG_DIR)" --title "$(title)" --template "$(template)" $(if $(slug),--slug "$(slug)") $(if $(desc),--desc "$(desc)") $(if $(description),--description "$(description)") $(if $(date),--date "$(date)") $(if $(updated),--updated "$(updated)") $(if $(image),--image "$(image)") $(if $(badge),--badge "$(badge)") $(if $(tags),--tags "$(tags)") $(if $(categories),--categories "$(categories)") $(if $(ext),--ext "$(ext)") $(if $(open),--open "$(open)")

post-templates:
	@$(POST_TOOL) templates

post-draft:
	@test -n "$(title)" || { echo 'title is required: make post-draft title="Idea"'; exit 1; }
	@$(POST_TOOL) draft --dir "$(BLOG_DIR)" --title "$(title)" $(if $(slug),--slug "$(slug)") $(if $(desc),--desc "$(desc)") $(if $(description),--description "$(description)") $(if $(date),--date "$(date)") $(if $(updated),--updated "$(updated)") $(if $(image),--image "$(image)") $(if $(badge),--badge "$(badge)") $(if $(tags),--tags "$(tags)") $(if $(categories),--categories "$(categories)") $(if $(ext),--ext "$(ext)") $(if $(body),--body "$(body)") $(if $(open),--open "$(open)") $(if $(template),--template "$(template)")

post-publish:
	@test -n "$(slug)" || { echo 'slug is required: make post-publish slug=my-post'; exit 1; }
	@$(POST_TOOL) publish --dir "$(BLOG_DIR)" --slug "$(slug)" $(if $(date),--date "$(date)") $(if $(updated),--updated "$(updated)") $(if $(badge),--badge "$(badge)") $(if $(filter 1 true yes on,$(clear_badge)),--clear-badge)

post-list:
	@$(POST_TOOL) list --dir "$(BLOG_DIR)"

post-find:
	@test -n "$(or $(q),$(query))" || { echo 'query is required: make post-find q=keyword'; exit 1; }
	@$(POST_TOOL) find --dir "$(BLOG_DIR)" --query "$(or $(q),$(query))"

post-edit:
	@test -n "$(slug)" || { echo 'slug is required: make post-edit slug=my-post'; exit 1; }
	@EDITOR="$(EDITOR)" $(POST_TOOL) edit --dir "$(BLOG_DIR)" --slug "$(slug)"

post-delete:
	@test -n "$(slug)" || { echo 'slug is required: make post-delete slug=my-post force=1'; exit 1; }
	@$(POST_TOOL) delete --dir "$(BLOG_DIR)" --slug "$(slug)" $(if $(filter 1 true yes on,$(force)),--force)

post-clean:
	@$(POST_TOOL) clear --dir "$(BLOG_DIR)" $(if $(filter 1 true yes on,$(force)),--force)

post-rename:
	@test -n "$(slug)" || { echo 'slug is required: make post-rename slug=old new_slug=new'; exit 1; }
	@test -n "$(new_slug)" || { echo 'new_slug is required: make post-rename slug=old new_slug=new'; exit 1; }
	@$(POST_TOOL) rename --dir "$(BLOG_DIR)" --slug "$(slug)" --new-slug "$(new_slug)"

post-backup:
	@$(POST_TOOL) backup --dir "$(BLOG_DIR)" --backup-dir "$(BLOG_BACKUP_DIR)"

dev:
	$(NODE_BIN)/astro dev

check:
	$(NODE_BIN)/astro check

build:
	node scripts/fetch-music-duration.mjs
	$(NODE_BIN)/astro check
	$(NODE_BIN)/astro build
	$(NODE_BIN)/pagefind --site dist
	mkdir -p public/pagefind
	$(NODE_BIN)/cpy 'dist/pagefind/**' public/pagefind

preview:
	$(NODE_BIN)/astro preview

search-index:
	$(MAKE) build

search-clean:
	rm -rf public/pagefind dist/pagefind

lint:
	$(NODE_BIN)/eslint .

git-status:
	git status --short --branch

git-diff:
	git diff --stat

git-add:
	git add $(if $(path),$(path),.)

git-commit:
	@test -n "$(msg)" || { echo 'msg is required: make git-commit msg="docs: add post"'; exit 1; }
	git commit -m "$(msg)"

git-push:
	git push $(or $(remote),$(REMOTE)) $(or $(branch),$(BRANCH))

publish:
	@test -n "$(msg)" || { echo 'msg is required: make publish msg="docs: add post"'; exit 1; }
	$(MAKE) check
	$(MAKE) build
	git add .
	git commit -m "$(msg)"
	git push $(or $(remote),$(REMOTE)) $(or $(branch),$(BRANCH))
