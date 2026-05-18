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

Full-stack working application with garden-themed UI and pixel art plant sprites (cycle 004). The following is in place and working:

- Monorepo with TypeScript (strict, project references), Vite, Vitest, ESLint, Prettier
- `migrations/001_initial_schema.sql` — `songs` table (`id`, `title`, `body`, `plot_id`, `growth_stage`, `created_at`, `updated_at`) plus `schema_migrations` tracking table
- `scripts/migrate.ts` — migration runner, 12 passing tests
- `yarn dev` runs Vite client + Express server concurrently via `concurrently` (no separate dev.ts script)
- `src/shared/index.ts` — `GrowthStageEnum`, `SongSchema`, `CreateSongInput`, `UpdateSongInput`, `UpdateSongWithId`; 14 passing tests
- `src/server/` — Express + tRPC server with full song CRUD (`song.list`, `song.create`, `song.get`, `song.update`, `song.delete`); raw SQL via better-sqlite3; zero type coercions; 10 passing tests
- `src/client/` — React app with tRPC + React Query client, Gardener-palette lo-fi UI, responsive song-card grid, "New Seed" form, click-to-edit modal with stage selector and delete
- `src/client/plant/generator.ts` — archetype registry, deterministic archetype/accent-color selection seeded by UUID; exports `selectArchetype`, `getArchetype`, `selectAccentColor`, `parseHexToRGB`; tests cover all exported functions
- `src/client/components/PlantVisual.tsx` — canvas-based pixel art sprite renderer; nearest-neighbor scaling (4×); one placeholder archetype wired, palette ramp swap deferred
- `src/client/plant/sprites/` — six PNG sprites for the placeholder archetype (seed through archived); bundled via Vite `import.meta.url`
- 80 tests total, all passing; TypeScript strict mode passes; build produces a working bundle

Not yet built (deferred):
- Audio file uploads, plots UI, withering/decay, Alda integration
- Client-side routing (React Router); currently a single-page app with modal for edit
- Automatic growth stage advancement (currently manual via the edit modal dropdown)

## Coding conventions

- TypeScript throughout — strict mode
- Arrow functions preferred over function declarations
- `const` by default
- No ORMs — write SQL directly using better-sqlite3
- Zod schemas are the single source of truth for shared types (infer TypeScript types from Zod schemas, don't duplicate)
- Migrations are append-only — no down migrations; write a new migration to reverse a change
- Keep `src/shared/` free of any Node.js or browser dependencies — it must be importable by both client and server
- Vitest for all tests
- **No type coercions**: Type coercions (`as`, `!`) are strongly discouraged as they hide real type errors. If you find yourself needing one, it usually indicates a missing type annotation or a design issue worth fixing properly. For example:
  - Use generic type parameters with better-sqlite3 queries: `db.prepare<[string], SongType>('...')` instead of `db.prepare('...').get(id) as Record<string, unknown>`
  - Replace manual type guards with Zod schemas for validation
  - Use proper function signatures instead of `as any`
  
 - **No `utils/` modules**: Avoid creating generic `utils/` folders. They tend to accumulate unrelated helpers and encourage lazy organization. Prefer placing small, focused modules alongside the features or components that use them (co-location) or in a clearly named domain package (e.g., `plant/generator.ts`), not in a catch-all `utils` directory.

## Testing philosophy

Tests must verify actual exported implementation code, not logic defined within test files. Follow these principles:

- **Unit tests of pure business logic**: Test exported functions and modules (Zod schemas, utility functions, business logic)
- **No network calls**: Tests must not make HTTP requests; test the logic, not the network layer
- **No running servers**: Tests must not require a live Express server or tRPC endpoint
- **No real filesystem**: Tests must not write to or depend on the actual `data/scion.db` or other real files; use in-memory SQLite (`DB_PATH=:memory:`) if a database is needed
- **CI-compatible**: All tests must pass in a CI environment without external infrastructure, concurrency, or special setup
- **Fast and focused**: Tests should be granular (test one thing well) and run in seconds, not minutes

**Anti-patterns to avoid:**
- Defining test logic inside the test file and testing that logic (e.g., defining `getStageEmoji` in the test file and testing it there)
- Opening the real production database in tests
- Requiring a running server or making HTTP calls from tests
- Testing React component internals (use exported functions or snapshot tests if needed)

## Design decisions (documented, not built)

- **Withering/decay**: Song plants could wither if not developed. Deferred — document as future idea only.
- **Alda integration**: Input Alda notation text, play it back via the Alda engine. Deferred — document as future idea only.
- **Audio file uploads**: Upload recordings to the local server, store path in DB. Deferred a few cycles — backend architecture already accommodates it.
- **Plots**: Grouping mechanism for song ideas (by project, genre, etc.). Data model includes `plot_id` from day one; UI deferred.
- **Social/collaboration**: Future monetization direction. Not in scope for local-first phase.
