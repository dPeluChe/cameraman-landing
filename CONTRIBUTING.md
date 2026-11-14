# Contributing to the Cameraman landing

## Setup

```bash
git clone https://github.com/dPeluChe/cameraman-landing.git
cd cameraman-landing
npm install
npm run dev   # http://localhost:4433
```

Requires Node 22.23.4+ (`engines` in `package.json`).

## Branches and PRs

Nothing lands on `main` directly: branch, commit, pull request. Use a prefix:
`feat/`, `fix/`, `design/`, `content/`, `chore/`. One logical change per PR.

## Where to change what

- Copy, sections and their order: `src/content/pages/<locale>/index.json` (English at `/`, Spanish at `/es`). Both locales change together.
- Colors, radii, fonts: `src/styles/tokens.css`, never a component.
- Cameraman's own section types (`cmHero`, `cmShowcase`, `cmFeatures`, `cmCta`, `cmAgent`) and the mascot: `src/site/`. See `docs/GUIDES/EXTENDING.md`.
- App screenshots: `src/assets/screens/`, referenced from the content JSON. Images go through `Picture.astro`, never a raw `<img>`.

The full rules are in `CLAUDE.md` and `AGENTS.md`.

## Content accuracy

Feature claims must match the [Cameraman app](https://github.com/dPeluChe/cameraman). Check its
[`docs/CHANGELOG.md`](https://github.com/dPeluChe/cameraman/blob/main/docs/CHANGELOG.md) before
claiming a feature, and keep the MCP tool count and "beta" honest.

Before adding a screenshot, check it for tokens or keys: a recorded terminal once showed an MCP
bearer token and had to be pixelated.

## Before submitting

```bash
npm run lint && npm run check && npm run build && npm test
npm run responsive   # no horizontal overflow at 320-1024px
npm run audit        # Lighthouse budget: 100 accessibility, best practices and SEO
```

## License

By contributing, you agree that your contributions will be licensed under the
[MIT License](LICENSE).
