# Taking blueprint fixes into a live clone

A clone has no shared history with the blueprint — `rm -rf .git` is part of
creating one. So `git pull` is not the answer, and neither is adding the blueprint
as a second remote: after the history split, every cherry-pick needs
`--allow-unrelated-histories` and conflicts in files you never touched. You trade
two minutes of copying for an afternoon of conflict resolution, and the result is
not reproducible.

## The answer: re-clone, and keep it cheap

Re-cloning is fast **because a clone's divergence is small and portable**. That is
not luck — it follows from two rules in `CLAUDE.md`: no brand values in
components, no content in components. Everything a clone changes is data.

Measured on the first real clone: **re-clone, reload content, run every gate,
commit — about three minutes.** Five files had diverged.

```bash
git clone https://github.com/dPeluChe/landings-base.git <project>-next
cd <project>-next && rm -rf .git && git init && git branch -M main
npm install && npm run reset -- --yes

npm run carry -- ../<project>          # dry run: lists what it would copy
npm run carry -- ../<project> --yes    # applies

npm run lint && npm run check && npm test && npm run build
```

`carry` reads `owned` from **both** locks — the old checkout's and the fresh
one's — and copies the union. It does not guess and it does not need you to
remember the list; remembering it is where this goes wrong. The first clone was
told "you had not touched content" and nearly lost a commit to an `rm -rf`.

**Why both.** A clone records a deliberate divergence by moving that path into
`owned` in its own lock. A fresh checkout cannot know about it, so reading only
the destination's lock skipped six of one clone's files without a word — and
drift stayed green afterwards, because those files had silently gone back to the
blueprint's versions. Files carried for that reason are listed separately at the
end of the run, and `carry` records them as owned in the new lock so the drift
guard agrees instead of failing on a change `carry` itself made.

### New required fields

A release can add a key your content predates — `routes.projects`,
`ui.projectsTitle`. Copying the old file wholesale then fails the build once per
key, and each fix meant opening the blueprint to look the value up.

`carry` merges instead: the freshly reset checkout already holds the new shape,
so your values land on top of it and anything only the new shape has is kept.
Every key filled that way is printed at the end. **Review them** — they are
defaults, not decisions, and some will be `TODO` placeholders that `npm test`
will refuse to let you ship.

Arrays are replaced whole, never merged element by element: `nav`, `social` and
`sections` are content, and interleaving demo entries into them produces
something that looks finished and is wrong.

**Keep the old checkout until every gate passes.** Do not delete it first, and do
not let anyone tell you it is safe to.

## What keeps it cheap: `.blueprint-lock.json`

`npm run reset` writes a fingerprint of every file the blueprint owns. From then
on `tests/blueprint-drift.test.ts` fails if any of them changes.

| Path | Owner |
|---|---|
| `src/content/**` | the clone |
| `src/assets/brand/**` | the clone |
| `src/styles/tokens.css` | the clone |
| `public/**` | the clone |
| `docs/TASK_TODO.md`, `package.json`, `README.md`, `CLAUDE.md` | the clone |
| everything else | the blueprint |

The test is not there to forbid customization. It is there so you find out **the
day re-cloning stops being free** — the first component that lands in
`src/components/`, the first helper in `src/lib/`. Without it you discover that
months later, mid-migration, with no idea when it happened.

### How the test knows where it is

The discriminator is `.blueprint-source`, a marker the blueprint ships and `reset`
deletes. Three states, not two:

| | |
|---|---|
| Marker present | the blueprint — skip |
| No marker, lock present | a clone — verify |
| No marker, no lock | a clone that never reset — **fail**, and say to run it |

The earlier version inferred "blueprint" from the lock being absent. Absence also
means "a clone that never ran reset", so the guard switched itself off in exactly
the case it was written for, silently and in green.

### What the lock does and does not see

It fingerprints what `git ls-files --cached --others --exclude-standard` reports,
so **`.gitignore` decides**. An earlier version walked the disk, swept up editor
caches, and then reported drift when you deleted one — a guardrail that cries wolf
stops being read, which costs more than the bug it catches.

Consequence worth knowing: a file that is neither ignored nor part of the
blueprint becomes part of the lock. Ignore local scratch instead of leaving it
lying around at reset time.

### When the divergence is intentional

Move the path into `owned` in `.blueprint-lock.json` and delete its entry from
`files`. That is a deliberate act, recorded in a diff, and it tells the next
person that this file is yours now and a re-clone will not restore it.

If the change would help *any* landing, open an issue upstream instead — then it
comes back in the next clone and your `owned` list stays short.

## The signal to watch

A clone whose `owned` list has not grown is a clone that can take blueprint fixes
in three minutes, forever. A clone with five entries in `owned` has quietly become
a fork, and that is worth knowing before you plan the next update rather than
during it.
