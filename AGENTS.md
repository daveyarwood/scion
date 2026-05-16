# Scion — Agent Context

## Project description

A personal creative sketchbook for musical fragments. Song ideas are represented as "plants" — living things you can tend and develop over time. Each idea starts as a seed and grows as you flesh it out. Scion is a local full-stack web application, intended initially for personal use with social/collaborative features as a future possibility.

## Tech stack

**Frontend**: React + TypeScript + Vite
**Backend**: Node.js + Express + tRPC
**Validation**: Zod (shared between client and server)
**Database**: SQLite via better-sqlite3 (direct SQL, no ORM)
**Migrations**: Plain numbered `.sql` files in `migrations/` with a small custom migration runner
**Package manager**: Yarn
**Test runner**: Vitest

## Monorepo structure

```
scion/
  src/
    client/    # React + TypeScript + Vite
    server/    # Node + Express + tRPC
    shared/    # Zod schemas, shared types
  data/        # gitignored — SQLite file, uploaded audio files
  migrations/  # numbered .sql files (e.g. 001_initial_schema.sql)
  scripts/     # migrate.ts and other dev utilities
  cycles/      # cycle planning files
```

## Current state

Full-stack working application (cycle 002). The following is in place and working:

- Monorepo with TypeScript (strict, project references), Vite, Vitest, ESLint, Prettier
- `migrations/001_initial_schema.sql` — `songs` table (`id`, `title`, `body`, `plot_id`, `growth_stage`, `created_at`, `updated_at`) plus `schema_migrations` tracking table
- `scripts/migrate.ts` — migration runner, 12 passing tests
- `scripts/dev.ts` — concurrent dev launcher (Vite client + Express server via `concurrently`)
- `src/shared/index.ts` — `GrowthStageEnum`, `SongSchema`, `CreateSongInput`, `UpdateSongInput`; 14 passing tests
- `src/server/` — Express + tRPC server with full song CRUD (`song.list`, `song.create`, `song.get`, `song.update`, `song.delete`); raw SQL via better-sqlite3; 23 passing tests
- `src/client/` — React app with tRPC + React Query client, responsive song-card grid, "Create new seed" form; 31 passing tests
- 80 tests total, all passing; TypeScript strict mode passes; build produces a working bundle

Not yet built (deferred):
- Algorithmic plant visual generation (each song card shows a stage emoji placeholder instead)
- Song detail / edit view (clicking a card does nothing)
- Audio file uploads, plots UI, withering/decay, Alda integration

## Coding conventions

- TypeScript throughout — strict mode
- Arrow functions preferred over function declarations
- `const` by default
- No ORMs — write SQL directly using better-sqlite3
- Zod schemas are the single source of truth for shared types (infer TypeScript types from Zod schemas, don't duplicate)
- Migrations are append-only — no down migrations; write a new migration to reverse a change
- Keep `src/shared/` free of any Node.js or browser dependencies — it must be importable by both client and server
- Vitest for all tests

## Design decisions (documented, not built)

- **Withering/decay**: Song plants could wither if not developed. Deferred — document as future idea only.
- **Alda integration**: Input Alda notation text, play it back via the Alda engine. Deferred — document as future idea only.
- **Audio file uploads**: Upload recordings to the local server, store path in DB. Deferred a few cycles — backend architecture already accommodates it.
- **Plots**: Grouping mechanism for song ideas (by project, genre, etc.). Data model includes `plot_id` from day one; UI deferred.
- **Social/collaboration**: Future monetization direction. Not in scope for local-first phase.
