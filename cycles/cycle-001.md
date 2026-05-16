# Cycle 001

**Date**: 2026-05-16

## Brainstorm

### Last cycle summary

_No prior cycle — this is the first cycle of the project._

### Current project status

The project is fully greenfield. The repository contains only:
- `AGENTS.md` — a complete design document covering tech stack, monorepo layout, coding conventions, and deferred feature decisions
- `cycles/cycle-001.md` — this file
- A `tags` file (likely a ctags index)

Nothing has been built: no `package.json`, no source files, no migrations, no tests, no README. The design is well-considered and documented; the gap between current state and a working skeleton is the entirety of the initial implementation.

Key design decisions already made and stable:
- Full-stack monorepo: React/Vite client + Express/tRPC server + SQLite (better-sqlite3, raw SQL)
- Zod as the single source of truth for shared types
- Song ideas modelled as "plants" that grow through development stages (seed → seedling → …)
- Plant visuals are algorithmically generated, seeded by the idea's ID, reflecting growth state
- `plot_id` included in the data model from day one even though the Plots UI is deferred
- Audio uploads deferred but the backend architecture must accommodate them

### Trajectory & observations

- The "plants as living things" metaphor is the soul of the product — the algorithmic visual generation is a meaningful differentiator and should be wired in early, even with a placeholder growth algorithm, so the aesthetic is felt from the first working version.
- The tRPC choice means the API surface and shared types will coevolve naturally; getting the Zod schemas right for the `Song` entity early will pay dividends across every subsequent cycle.
- SQLite + direct SQL is a strong fit for local-first personal software. The migration runner is a small but load-bearing piece of infrastructure — worth doing cleanly in cycle 001 rather than bolting on later.
- The deferred features (plots, audio uploads, withering, Alda) are well-parked. Keeping `plot_id` in the schema from day one is exactly the right call: cheap insurance against a future migration that touches every row.
- A few cycles out, once CRUD and plant visuals are working, the natural next tension will be between fleshing out the growth/decay lifecycle and adding richer content fields (lyrics, chords, notes). That decision should be deferred until the skeleton is in place and the feel of the app is clearer.

### Suggestions for this cycle

1. **Repo and tooling scaffold** — Initialize the monorepo with `package.json` (Yarn workspaces or a single-package setup), TypeScript config, Vite config, ESLint, and Vitest. This is the unglamorous prerequisite for everything else and should be done first, cleanly.

2. **Database schema and migration runner** — Write `001_initial_schema.sql` (songs table with `id`, `title`, `body`, `plot_id`, `growth_stage`, `created_at`, `updated_at`) and the `scripts/migrate.ts` runner. Getting the schema right early avoids painful future migrations.

3. **Shared Zod schemas** — Define the `Song` Zod schema in `src/shared/` and infer TypeScript types from it. This becomes the contract everything else is built against.

4. **tRPC server with basic song CRUD** — Implement Express + tRPC with procedures for `song.list`, `song.create`, `song.get`, `song.update`, and `song.delete`. Enough to drive the UI without touching audio or plots yet.

5. **React client skeleton with song grid** — Set up Vite + React, wire up the tRPC client, and render a grid of plant cards showing each song idea. Cards don't need to be beautiful yet — the grid layout and data flow are the goal.

6. **Algorithmic plant visual (v0)** — Implement a deterministic SVG or canvas plant generator seeded by the song's `id`. Even a very simple generative output (e.g. a procedural stem and leaves whose shape is derived from the ID hash) establishes the visual identity of the app from day one. Growth stage should visibly affect the output.

7. **"Create new seed" flow** — A minimal form to add a new song idea (title + optional body). On submit it creates a new plant at growth stage `seed` and it appears in the grid. This is the first end-to-end user interaction.

8. **README** — Write a project README covering what the app is, how to run it locally (install, migrate, dev server), and a brief note on the plant metaphor. This was explicitly called out as a cycle-001 deliverable.

## Goals

<!-- to be filled in during human planning conversation -->

## Scope

<!-- to be filled in during human planning conversation -->

## Work Done

<!-- to be filled in by cycle-developer -->

## Review Notes

<!-- to be filled in by cycle-reviewer -->

## Test Results

<!-- to be filled in by cycle-tester -->

## Open Questions
