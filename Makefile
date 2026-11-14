# Self-documenting: every target with a `## description` shows up in `make help`.
.DEFAULT_GOAL := help

.PHONY: help install dev build preview check lint test pre-deploy verify audit responsive doctor \
        assets og reset verify-clone init-clone carry ci-status clean fresh

help: ## List the available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	  awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-14s\033[0m %s\n",$$1,$$2}'

install: ## Install dependencies (npm ci)
	npm ci

dev: ## Dev server on :4433
	npm run dev

build: ## Production build (syncs content first)
	npm run build

preview: ## Serve the production build on :4433
	npm run preview

check: ## astro check (0 errors, 0 warnings, 0 hints)
	npm run check

lint: ## ESLint, zero warnings
	npm run lint

test: ## Vitest (needs a fresh build: the suite reads dist/)
	npm test

audit: ## Lighthouse budgets on the built routes (needs a build and headless Chrome)
	npm run audit

responsive: ## No horizontal overflow at the declared widths (needs a real browser)
	npm run responsive

doctor: ## react-doctor must score exactly 100
	npm run doctor

pre-deploy: ## The real gate: lint, check, build, test, audit, react-doctor 100
	npm run pre-deploy

verify: pre-deploy ## Alias of pre-deploy

# ---- Starting a project from this blueprint (see docs/GUIDES/NEW_LANDING.md) ----
init-clone: ## Wizard: brand name, color and contact for a new clone
	npm run init:clone

reset: ## Replace the demo content with placeholders (dry run; add YES=1 to apply)
	node scripts/reset-content.mjs $(if $(YES),--yes,)

verify-clone: ## Prove a freshly reset clone is healthy and every preset builds (only allowed failure: the placeholder gate)
	npm run verify:clone

assets: ## Generate favicons and static assets from the brand files
	npm run assets

og: ## Generate Open Graph images
	npm run generate:og

carry: ## Carry owned files across a blueprint update
	npm run carry

ci-status: ## Latest CI runs
	gh run list --limit 8

clean: ## Remove build output
	rm -rf dist .astro

fresh: clean ## Reinstall from scratch
	rm -rf node_modules
	npm ci
