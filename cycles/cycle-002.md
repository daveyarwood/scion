# Cycle 002

**Date**: 2026-05-16

## Brainstorm

### Last cycle summary

- Bootstrapped the full monorepo from scratch: `package.json` (Yarn), TypeScript with strict mode and project references, Vite, Vitest, ESLint, Prettier — all configured and passing.
- Created the initial database schema (`migrations/001_initial_schema.sql`): `songs` table with `id`, `title`, `body`, `plot_id`, `growth_stage`, timestamps, and three indexes; `schema_migrations` tracking table.
- Implemented the migration runner (`scripts/migrate.ts`) with clear console output, idempotent application, and a 12-test suite covering schema shape, constraints, defaults, and uniqueness enforcement.
- Wrote a comprehensive `README.md` covering the plant metaphor, tech stack, project structure, and all developer workflows (install, migrate, dev, test, lint, build).
- `src/shared/index.ts`, `src/client/`, and `src/server/` exist as placeholders — no Zod schemas, no server code, no React code yet.

### Current project status

The project has a solid, clean foundation but nothing runnable in a browser. The gap to a first working version is substantial:

- **What works**: migration runner, DB schema, all tooling (TypeScript, Vite, Vitest, ESLint), dependency graph fully installed.
- **What is stubbed**: `src/shared/index.ts` exports only `appName`; no Zod schemas, no inferred types.
- **What is missing entirely**: Express server, tRPC router and procedures, React app entry point, plant card grid UI, algorithmic plant visual, any create/read/update/delete flow.

The next meaningful milestone is a browser showing a grid of song-plant cards fetched from a local tRPC server — the "hello world" of the actual application. Getting there requires building all three layers (shared schemas → server → client) essentially from nothing.

### Trajectory & observations

- The scaffold quality is high and the separation of concerns (shared / server / client, TypeScript project references) will make wiring the layers together clean and safe — the investment in cycle 001 pays off immediately here.
- tRPC means the shared Zod schemas are the keystone: get `Song` right and the rest of the type safety cascades automatically into both server procedures and React query hooks. This should be the first thing written in cycle 002.
- The algorithmic plant visual is load-bearing for the app's identity — not a nice-to-have. Even a bare-bones deterministic SVG (stem + leaves shaped by a hash of the song's `id`, size/colour influenced by `growth_stage`) should land in the same cycle as the grid, so the very first time the app loads in a browser it *feels* like Scion rather than a generic CRUD list.
- `growth_stage` is currently a free-text `TEXT` column in SQLite with a default of `'seed'`. This is intentionally loose for now, but the Zod schema is the right place to introduce an enum (`seed | seedling | sprout | …`) — locking down the vocabulary early will make the plant visual easier to implement and the UI cleaner.
- The `dev` script (`node --loader tsx ./scripts/dev.ts`) references a file that doesn't exist yet. Writing a `scripts/dev.ts` that starts both the Vite dev server and the Express/tRPC server concurrently is a small but necessary piece of developer experience.
- A few cycles out, once CRUD and plant visuals are in place, the natural next tension is between fleshing out the growth/decay lifecycle (what actions advance a plant's stage?) and adding richer content fields (lyrics, chords, notation sketches). That decision can safely wait until the skeleton is running and the feel of the app is tangible.

### Suggestions for this cycle

1. **Zod schemas in `src/shared/`** — Define a `GrowthStage` enum and a `Song` Zod schema; infer `GrowthStage` and `Song` TypeScript types from them. This is the single source of truth the server and client both depend on — build it first.

2. **Express + tRPC server** — Implement `src/server/index.ts` with an Express app, tRPC adapter, and a router covering `song.list`, `song.create`, `song.get`, `song.update`, and `song.delete`. Wire it to the SQLite database via better-sqlite3.

3. **`scripts/dev.ts` — concurrent dev server** — Write the missing dev launcher that runs the Vite client dev server and the Express/tRPC server concurrently so `yarn dev` works end-to-end.

4. **React app entry point and tRPC client** — Set up `src/client/main.tsx`, `App.tsx`, and the tRPC/React Query client configuration. Enough to make a query and render data.

5. **Plant card grid** — Render a grid of plant cards, one per song, showing title and growth stage. Layout and data flow are the goal; polish is deferred.

6. **Algorithmic plant visual (v0)** — Implement a deterministic SVG generator in `src/client/` (or `src/shared/` if kept pure) that takes a song `id` and `growth_stage` and returns a unique visual. Seed a simple hash from the `id`; let `growth_stage` affect size, branching, or colour. Wire it into each plant card. Even a simple result establishes the app's identity from the first load.

7. **"Create new seed" flow** — A minimal form (title + optional notes) that calls `song.create` via tRPC, creates a plant at `growth_stage: 'seed'`, and adds it live to the grid. This completes the first end-to-end user interaction.

8. **Open a song / basic detail view** — Clicking a plant card opens a detail view (modal or route) showing the song's `title` and `body` with an edit form. This is the minimum needed to make the app actually useful for capturing ideas.

## Goals

- [ ] Zod `Song` schema + `GrowthStage` enum in `src/shared/`
- [ ] Express + tRPC server with full song CRUD (`song.list`, `song.create`, `song.get`, `song.update`, `song.delete`)
- [ ] `scripts/dev.ts` concurrent dev launcher (runs client + server together)
- [ ] React app entry point + tRPC client configuration
- [ ] Plant card grid — layout and data flow, grid of cards showing song ideas
- [ ] "Create new seed" form — first end-to-end user interaction (title + optional body, creates a song at growth stage `seed`, appears in the grid)

## Scope

- In scope: shared Zod schemas, tRPC server with CRUD, dev launcher, React + tRPC client, song grid, create-seed form
- Deferred: algorithmic plant visual, song detail/edit view, audio file support, plots UI, withering/decay, Alda integration

## Work Done

<!-- to be filled in by cycle-developer -->

## Review Notes

<!-- to be filled in by cycle-reviewer -->

## Test Results

<!-- to be filled in by cycle-tester -->

## Open Questions
