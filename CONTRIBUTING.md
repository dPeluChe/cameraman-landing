# Contributing to Cameraman Landing

Thanks for your interest in improving the Cameraman landing page!

## Setup

```bash
git clone https://github.com/dPeluChe/cameraman-landing.git
cd cameraman-landing
npm install
npm run dev   # http://localhost:3914
```

Requires Node 18+.

## Branch conventions

Use prefix-based branch names:

- `feat/` — new feature or section
- `fix/` — bug fix
- `design/` — visual / layout improvements
- `content/` — copy changes
- `chore/` — deps, config, tooling

Examples: `feat/agents-animation`, `fix/mobile-nav`, `content/update-stats`.

## Keep PRs focused

One logical change per PR. If you're adding a new section AND fixing the nav,
that's two PRs.

## Style

- **TypeScript strict** — no `any`, no `@ts-ignore`.
- **Tailwind 4** for all styling. Custom theme tokens live in `src/index.css`
  under `@theme`. Don't add inline styles unless the value is dynamic.
- **framer-motion** for animations. Use the `Reveal` / `Stagger` wrappers for
  scroll-triggered entrances — don't reinvent per-section.
- **Components** are small and single-purpose. If a section grows past ~200
  lines, extract sub-components into `components/`.
- **No comments** unless explaining a non-obvious *why*. The code should be
  self-documenting.

## Content accuracy

Feature status badges (`shipped` / `new` / `tuning` / `improving`) must reflect
the real state of the [Cameraman app](https://github.com/dPeluChe/cameraman).
When updating a feature's status, cross-reference the app's
[`docs/TASK_TODO.md`](https://github.com/dPeluChe/cameraman/blob/main/docs/TASK_TODO.md)
and [`docs/CHANGELOG.md`](https://github.com/dPeluChe/cameraman/blob/main/docs/CHANGELOG.md).

## Screenshots

Feature cards use `FeatureImage` with gradient placeholders. To add a real
screenshot:

1. Drop the image into `public/screenshots/`
2. Set `imageSrc: '/screenshots/your-image.png'` on the feature object in
   `src/sections/Features.tsx`

## Before submitting

```bash
npm run lint    # no errors
npm run build   # passes cleanly
```

## License

By contributing, you agree that your contributions will be licensed under the
[MIT License](LICENSE).
