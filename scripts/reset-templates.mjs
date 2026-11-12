// Docs a clone should NOT inherit, and what replaces them. Everything here is
// blueprint-specific: instructions for creating a landing, the blueprint's own
// backlog, and the blueprint's identity. Reference docs (schema, routing, SEO,
// deploy, testing) stay — a clone needs those.
// Used by scripts/reset-content.mjs.

export const BLUEPRINT_REPO = 'github.com/dPeluChe/landings-base';

/** Its job ends the moment reset runs; demo logos belong to the demo. */
export const MARKER = '.blueprint-source';

export const DROP = [
  'docs/GUIDES/NEW_LANDING.md',
  'docs/GUIDES/CLONE_PROMPT.md',
  'src/assets/demo',
  // Removing it is what makes this a clone; the drift test keys off its absence.
  MARKER,
];

export const BLUEPRINT_IDENTITY = `## What this repo is

A **blueprint**, not a site. It is cloned to start each client or product landing.
Everything here must serve *any* landing; anything that only serves one belongs in
the clone. General improvements made in a clone are backported here.

Workspace rule: \`workspace-blueprints/README.md\`.`;

export const CLONE_IDENTITY = `## What this repo is

A client landing. It serves ONE site and answers to nobody else.

Content lives in \`src/content/\` and is validated by \`src/schemas/\`. Brand values
live in \`src/styles/tokens.css\` and nowhere else.

It started from the **landings-base** blueprint, which is now only a place to
report to: if you hit a bug or find an improvement that *any* landing would want,
open an issue at ${BLUEPRINT_REPO}/issues. Do not try to push there, and do not
carry blueprint concerns into this repo's backlog.

Nothing is committed to \`main\` directly. Branch, commit, pull request — every
time, including content-only edits. \`main\` is what deploys.`;

export const cloneReadme = (docs) => `# Client landing

Static site built with Astro. Content is data validated by Zod schemas; brand
values live in one CSS file; SEO is generated, not hand-written.

## Quick start

\`\`\`bash
npm install
npm run dev               # http://localhost:4433
\`\`\`

## Scripts

| Command | What it does |
|---|---|
| \`npm run dev\` | Dev server on port 4433 |
| \`npm run build\` | \`sync:content\` (prebuild) then static build to \`dist/\` |
| \`npm run preview\` | Serve \`dist/\` on port 4433 |
| \`npm test\` | Schema, routing, contact transport, token contrast, built HTML |
| \`npm run check\` | \`astro check\` |
| \`npm run lint\` | ESLint, must be 0 warnings |
| \`npm run assets\` | Regenerate favicons, webmanifest and OG image from the brand SVGs |
| \`npm run audit\` | Lighthouse against \`dist/\`, fails if the budget is not met |
| \`npm run responsive\` | Fails on horizontal overflow at 320/375/414/768/1024 |

## How work lands

**Nothing is committed to \`main\` directly.** Every change — content, brand,
copy fix — goes on a branch, gets its own commit, and lands through a pull
request. Approving your own PR is fine when you are working alone; skipping the
PR is not.

\`\`\`bash
git checkout -b content/home-copy
# ...work, then the gates: lint, check, build, test
git commit -m "content: home hero and services copy"
git push -u origin content/home-copy
gh pr create --fill && gh pr merge --squash --delete-branch
\`\`\`

The reason is not ceremony: a landing is edited by more than one person and by
agents, and \`main\` is what deploys. A branch is the only place a half-finished
page can exist without being published.

## Where to change what

| To change | Edit |
|---|---|
| Copy, sections, page order | \`src/content/pages/<locale>/*.json\` |
| Brand name, contact, SEO defaults, routes | \`src/content/site/<locale>.json\` |
| Colors, radii, fonts | \`src/styles/tokens.css\` |
| Logo and favicon source | \`src/assets/brand/\`, then \`npm run assets\` |

## Documentation

${docs}

## Reporting upstream

This project came from the **landings-base** blueprint. Bugs or improvements that
would help *any* landing go to ${BLUEPRINT_REPO}/issues — not into this repo's
backlog, and never pushed to that repo directly.
`;

export const CLONE_TASK_TODO = `# TASK_TODO

Backlog for this landing.

## Next

- [ ] Fill \`src/content/\` — \`npm test\` fails while any \`TODO\` placeholder survives
- [ ] Replace \`src/assets/brand/*\` and run \`npm run assets\`
- [ ] Set \`robots.index\` back to \`true\` in every \`src/content/site/<locale>.json\`
- [ ] Set \`SITE_URL\` in the deploy environment

## Not this repo's problem

Bugs or improvements in the blueprint itself go to ${BLUEPRINT_REPO}/issues.
Keeping them here means fixing the same thing in six landings.
`;

/**
 * The working list of a clone, created in the destination by `reset`. Whoever does the
 * clone is the one who finds out what is missing or breaks, so the list lives with them
 * and not in the blueprint: the blueprint cannot know this client's gaps in advance.
 */
export const CLONE_CHECKLIST = `# Clone checklist

Whoever is cloning keeps this file. You are the one who finds out what is missing or what
breaks, so write it down here as it happens. The blueprint does not pre-list your
problems; what you record here is what it learns from you.

Nothing here replaces the gates (\`npm test\`, \`npm run audit\`): this is the human side.

## 1. Inputs

One row per thing the site needs from the client. Add rows the blueprint did not think of.
Status: \`missing\`, \`requested <date>\`, \`received\`, \`n/a\`.

| Input | Status | Notes |
|---|---|---|
| Logo, SVG wordmark | missing | Blocks the visual review: until it is the client's, the demo brand shows over their copy |
| Logo, square mark and dark-background version | missing | |
| Brand color (one hex) | missing | |
| Images: photos, client logos, product shots, video | missing | |
| Copy, per section and per language | missing | |
| Portfolio: which projects and what can be said publicly | missing | Needs the end client's permission, project by project: ask first |
| Final domain | missing | |
| Email, phone, WhatsApp | missing | |
| Address, coordinates and hours (only with a physical location) | missing | |
| Languages (one or two) and dark mode (yes or no) | missing | |

## 2. What was missing or failed

Every surprise: a gate that failed for a reason the docs did not mention, a step that was
unclear, something you had to edit in a blueprint-owned file. Dated, with how it was solved.
Mark **upstream** when any landing would hit it.

| Date | What happened | File or command | How it was solved | Upstream |
|---|---|---|---|---|
| | | | | |

## 3. Before launch

The SEO rules and their gates: \`docs/ARCHITECTURE/SEO.md#rules\`. Check the ones only a
person can do, and note the date:

- [ ] \`SITE_URL\` is different in every clone and lives in three places: \`.env\` (\`reset --site-url\` writes it), Vercel for Preview **and** Production, and the repository variable for CI (\`gh variable set SITE_URL --body https://<domain>\`)
- [ ] \`robots.index\` back to \`true\`
- [ ] Old URLs still answer or redirect with a 301
- [ ] Search Console set up and the sitemap submitted
- [ ] Branch protection on \`main\`

## 4. Report upstream

When the clone ships, open an issue at github.com/dPeluChe/landings-base for each row in
section 2 marked **upstream**, linking this file. Do not fix it only here.
`;
