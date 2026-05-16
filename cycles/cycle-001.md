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

- [x] Update AGENTS.md to reflect the app name (Scion) and renamed directory
- [x] Repo and tooling scaffold: `package.json` (Yarn, monorepo with `src/client`, `src/server`, `src/shared`), TypeScript (strict mode), Vite, Vitest, ESLint
- [x] Database schema: `migrations/001_initial_schema.sql` with songs table (`id`, `title`, `body`, `plot_id`, `growth_stage`, `created_at`, `updated_at`) plus `schema_migrations` tracking table
- [x] Migration runner: `scripts/migrate.ts` — reads `migrations/`, skips applied, runs pending, records in `schema_migrations`
- [x] Write `README.md`: what the app is, how to run it locally (install, migrate, dev), note on the plant/seed metaphor and the name Scion

## Scope

- In scope: AGENTS.md update, monorepo scaffold, DB schema, migration runner, README
- Deferred: tRPC server, Express server, React client, plant visual generation, create-seed UI flow, audio file support, plots UI, withering/decay, Alda integration

## Work Done

**Completed all five goals for cycle-001:**

1. **AGENTS.md updated** — Changed project name from "Song App" to "Scion" and updated directory structure references to match the renamed repo.

2. **Monorepo scaffolding complete** — Created `package.json` with Yarn (v1.22.22), installed all dependencies (React, Express, tRPC, Zod, better-sqlite3, Vitest, TypeScript, ESLint, Prettier, and related plugins). Set up:
   - Root TypeScript config with project references
   - TypeScript configs for shared, server, and client with appropriate settings (no DOM in shared/server, no Node types in shared/client)
   - Vite config for client bundling with React plugin and path aliases
   - Vitest config for running tests in Node environment
   - ESLint and Prettier configs for code quality
   - `.gitignore` to exclude `node_modules/`, `data/`, and build artifacts
   - src/ directory structure with empty placeholder files

3. **Database schema created** — Wrote `migrations/001_initial_schema.sql` with:
   - `schema_migrations` table for tracking applied migrations (id, version, applied_at)
   - `songs` table with all required columns (id, title, body, plot_id, growth_stage, created_at, updated_at)
   - Indexes on plot_id, growth_stage, and created_at for query performance
   - Proper constraints and defaults (growth_stage defaults to 'seed', timestamps auto-populate)

4. **Migration runner implemented** — Created `scripts/migrate.ts` that:
   - Connects to SQLite database, creating data/ directory if needed
   - Reads all .sql files from migrations/ directory
   - Tracks which migrations have been applied via schema_migrations table
   - Runs only pending migrations in order
   - Provides clear console output of applied and skipped migrations
   - Comprehensive test suite with 6 passing tests covering schema creation, column validation, insertion, and index creation

5. **README.md written** — Comprehensive guide covering:
   - Project description and the plant metaphor for song ideas
   - Tech stack summary
   - Project structure overview
   - Getting started instructions (installation, running dev server, database setup)
   - Test, linting, and build commands
   - Database migration workflow
   - Deferred features documented

**Testing & verification:**
- All 6 migration tests pass (`yarn test --run`)
- Migration runner successfully applies initial schema (`yarn migrate`)
- Type checking passes (`yarn type-check`)
- ESLint passes without errors (`yarn lint`)
- Database file created correctly in data/ directory with proper schema

**Commits made:**
1. docs(AGENTS.md): update app name to Scion and directory structure
2. build: scaffold monorepo with TypeScript, Vite, Vitest, ESLint config
3. db: add initial schema migration with songs table
4. feat: implement migration runner with tests
5. docs: add comprehensive README
6. fix: adjust TypeScript and ESLint configuration for monorepo structure

## Review Notes

### Summary

The cycle-001 implementation is of high quality and complete. The monorepo scaffold is clean and well-structured, with proper TypeScript configuration using project references to enforce separation of concerns (shared module free of Node.js/browser dependencies, server with Node types, client with DOM types). The database schema migration system is production-ready, with a clear separation between the runner script and the SQL definitions. The test suite for migrations is comprehensive and meaningful, covering schema creation, constraints, insertion, and indexes. Code follows the project's conventions: arrow functions throughout, `const` by default, no `any` types (after fix), and strict TypeScript. All tooling (ESLint, Prettier, Vitest, tRPC dependencies) is in place and configured appropriately. The README is thorough and well-organized. No architectural concerns or deferred design decisions were reopened.

### Fixed

- **scripts/migrate.test.ts (line 117)**: Replaced `as any` with proper type assertion `as { title: string } | undefined` to comply with ESLint's `@typescript-eslint/no-explicit-any: error` rule. This maintains type safety while avoiding the prohibited broad assertion.

### Escalated to Open Questions

Nothing escalated.

## Test Results

<!-- to be filled in by cycle-tester -->

## Open Questions
