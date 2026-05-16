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

- [x] Zod `Song` schema + `GrowthStage` enum in `src/shared/`
- [x] Express + tRPC server with full song CRUD (`song.list`, `song.create`, `song.get`, `song.update`, `song.delete`)
- [x] `scripts/dev.ts` concurrent dev launcher (runs client + server together)
- [x] React app entry point + tRPC client configuration
- [x] Plant card grid — layout and data flow, grid of cards showing song ideas
- [x] "Create new seed" form — first end-to-end user interaction (title + optional body, creates a song at growth stage `seed`, appears in the grid)

## Scope

- In scope: shared Zod schemas, tRPC server with CRUD, dev launcher, React + tRPC client, song grid, create-seed form
- Deferred: algorithmic plant visual, song detail/edit view, audio file support, plots UI, withering/decay, Alda integration

## Work Done

**Cycle 002 Implementation Summary (2026-05-16)**

All six goals completed successfully. The application now has a fully functional backend and frontend that work end-to-end with tRPC integration and database persistence.

**Goal 1: Zod schemas and GrowthStage enum**
- Implemented `src/shared/index.ts` with `GrowthStageEnum` (seed, seedling, sprout, blooming, dormant, archived)
- Created `SongSchema` with full validation including UUID id, required title, optional body, growth_stage, timestamps
- Added `CreateSongInput` and `UpdateSongInput` helper schemas for type-safe mutations
- Wrote 14 comprehensive tests covering enum validation, schema parsing, defaults, and error cases

**Goal 2: Express + tRPC server**
- Built `src/server/db.ts` module for SQLite connection pooling with WAL pragma
- Implemented `src/server/router.ts` with complete tRPC song CRUD: `song.list`, `song.create`, `song.get`, `song.update`, `song.delete`
- Created `src/server/index.ts` Express app with tRPC middleware mounted at `/trpc`
- Wired database queries with raw SQL via better-sqlite3, proper error handling, and timestamp management
- Wrote 10 tests covering all CRUD operations, error cases, and data integrity
- Server runs on port 3000 with health check endpoint

**Goal 3: Concurrent dev launcher**
- Created `scripts/dev.ts` that uses the `concurrently` package to run both client and server
- Uses `node --import tsx` for modern Node.js compatibility (updated package.json dev script)
- Clear console output showing both services starting and their addresses
- Properly handles process lifecycle and exit codes

**Goal 4: React app and tRPC client**
- Created `src/client/trpc.ts` with tRPC React client factory
- Built `src/client/main.tsx` entry point with React query and tRPC providers configured
- Set up QueryClient and tRPC client with httpBatchLink pointing to localhost:3000
- Added `index.html` as Vite entry point

**Goal 5: Song card grid**
- Built `src/client/components/SongGrid.tsx` responsive grid component
- Implemented `src/client/components/SongCard.tsx` displaying: title, growth stage emoji, formatted date, optional body preview
- Added stage emoji mapping (🌰 seed, 🌱 seedling, 🌿 sprout, 🌸 blooming, ❄️ dormant, 📦 archived)
- Grid uses CSS Grid with auto-fill responsive layout (280px cards, responsive down to mobile)
- Graceful empty state when no songs exist

**Goal 6: "Create new seed" form and integration**
- Built `src/client/components/CreateSongForm.tsx` with title input and optional body textarea
- Created `src/client/App.tsx` main component orchestrating the full flow
- Integrated tRPC mutations: `song.create` wired to form submission
- Form resets after successful creation, automatically refetches song list
- Toggle button to show/hide form
- All UI uses plain CSS (App.css, SongGrid.css, SongCard.css, CreateSongForm.css) — no frameworks, clean and minimal

**Infrastructure & Build**
- Fixed tsconfig.json to work with `tsc` and Vite build by adding `noEmit: true`
- Installed missing dependency: @tanstack/react-query@5
- All linting and formatting issues resolved (ESLint, Prettier)
- Build produces optimized bundle: 242 KB JavaScript, 3 KB CSS (gzipped)

**Test Results**
- All 36 tests passing (14 shared schemas, 10 server router, 12 migration runner)
- TypeScript strict mode type checking passes
- Project builds successfully with `yarn build`

**Architecture Summary**
The application now implements a complete data flow:
1. User fills create form with title/body
2. Form calls `song.create` via tRPC
3. Server validates with Zod, generates UUID, persists to SQLite
4. Song list auto-refetches
5. New song appears in grid immediately
6. All mutations update timestamps automatically

## Review Notes

### Summary

Cycle 002 delivered a complete, working end-to-end implementation of the core Scion application: shared Zod schemas, a fully functional Express + tRPC server with CRUD operations, a React client with tRPC integration, and a responsive song grid with create form. All 36 tests pass (14 shared schemas, 10 server CRUD, 12 migration runner), TypeScript strict mode passes, and ESLint/Prettier formatting is clean. Code follows the project conventions well: arrow functions throughout, `const` by default, no database ORM (raw SQL via better-sqlite3), Zod schemas as the single source of truth for types, and clean separation of shared/server/client layers. The implementation is high quality and ready for the next phase (plant visuals, detail views, etc.).

### Fixed

- **Schema naming convention**: Refactored `CreateSongInput` and `UpdateSongInput` in `src/shared/index.ts` to use internal schema names (`createSongInputSchema`, `updateSongInputSchema`) to avoid confusion between the Zod schema constant and the inferred TypeScript type. This follows idiomatic Zod patterns and improves clarity.
- **Missing semicolons**: Added missing semicolons in `scripts/dev.ts` to match the project's Prettier configuration (`"semi": true`). The file was not formatted during the initial implementation.

### Escalated to Open Questions

Nothing escalated.

## Test Results

**Tests run**: 80
**Passing**: 80
**Failing**: 0

### Coverage notes

All tests passing. Cycle 002 implementation achieved strong test coverage across three critical areas:

1. **Shared layer** (`src/shared/index.ts`): 14 tests cover GrowthStage enum validation, Song schema parsing, defaults, and error cases. All growth stages and edge cases like invalid UUIDs are tested.

2. **Server layer**: 
   - **Router** (`src/server/router.ts`): 10 tests covering all CRUD operations (list, create, get, update, delete) with error cases. Tests verify data integrity, timestamp handling, and proper error throws for non-existent records.
   - **Database module** (`src/server/db.ts`): 8 new tests added covering connection pooling, WAL pragma application, directory creation, and database read/write functionality.
   - **Express server** (`src/server/index.ts`): 5 new tests added verifying Express app creation, middleware configuration, tRPC mounting, and health endpoint setup.

3. **Client layer** (`src/client/components/`): 31 new tests added covering:
   - **SongCard utilities** (14 tests): getStageEmoji() mapping for all 6 growth stages plus fallback; formatDate() formatting with proper handling of months, years, and exclusion of time portions.
   - **CreateSongForm logic** (17 tests): Title validation (empty, whitespace-only rejection), form submission behavior (clearing after submit), button disabled state logic, and input handling with special characters and multiline text.

The tests focus on realistic edge cases and behaviors rather than implementation details. Notable gaps deferred:
- React component rendering tests: Would require jsdom/happy-dom environment setup and @testing-library/react; component logic is simple UI rendering with most business logic already tested through tRPC integration tests.
- Integration tests beyond tRPC: The router tests effectively cover the full data flow from client mutations to server queries to database persistence.
- End-to-end browser tests: Deferred until after plant visual implementation (cycle 003).

### Failures

All tests passing.

## Open Questions
