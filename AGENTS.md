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

Full-stack working application with garden-themed UI, pixel art plant sprites, per-song palette-swapped accent colors, React Router, dedicated full-page song edit view (cycle 008), and title generator with curated word lists (cycle 009). The following is in place and working:

- Monorepo with TypeScript (strict, project references), Vite, Vitest, ESLint, Prettier
- `migrations/001_initial_schema.sql` — `songs` table (`id`, `title`, `body`, `plot_id`, `growth_stage`, `created_at`, `updated_at`) plus `schema_migrations` tracking table; `migrations/002_add_budding_stage.sql` adds the `budding` stage; `migrations/003_add_archetype_and_accent_ramp.sql` adds `archetype` (text) and `accent_ramp` (text, JSON array) columns
- `scripts/migrate.ts` — migration runner, 12 passing tests
- `scripts/seed-songs.ts` — creates N songs (default 20) via tRPC HTTP API; `yarn seed` shorthand
- `scripts/clear-songs.ts` — deletes all songs via tRPC HTTP API; `--force` flag skips confirmation; `yarn clear` shorthand
- `scripts/check-palette.py` — verifies PNG sprites use only the 10 allowed palette colors
- `scripts/slice-sprites.py` — slices a sprite sheet into individual archetype/stage PNGs using alpha-gap detection
- `yarn dev` runs Vite client + Express server concurrently via `concurrently` (no separate dev.ts script)
- `src/shared/index.ts` — `GrowthStageEnum` (7 stages: seed → seedling → sprout → budding → blooming → dormant → archived), `SongSchema`, `CreateSongInput` (title optional), `UpdateSongInput`, `UpdateSongWithId`; 20 passing tests
- `src/shared/plant.ts` — pure plant generation functions (`selectArchetype`, `selectAccentRamp`, `ACCENT_RAMPS`); usable by both client and server; 10 passing tests
- `src/shared/titleWords.ts` + `titleGenerator.ts` — curated word lists (eclectic + common registers, CS terms, colors) and weighted template system; server calls `generateTitle()` when title omitted from `song.create`; dice button on edit page for client-side re-rolls
- `src/server/` — Express + tRPC server with full song CRUD (`song.list`, `song.create`, `song.get`, `song.update`, `song.delete`); populates `archetype`, `accent_ramp`, and `title` (if omitted) on `song.create`; raw SQL via better-sqlite3; zero type coercions; 17 passing tests
- `src/client/` — React app with React Router (`react-router-dom`); two routes: `/` (garden grid, `GardenPage.tsx`) and `/songs/:id` (full-page editor, `SongEditPage.tsx`); tRPC + React Query; Gardener-palette lo-fi UI; all UI chrome lowercase; garden-themed empty state with seed sprite illustration; "+ new seed" button creates immediately and navigates to edit page
- `src/client/plant/generator.ts` — archetype registry with 4 archetypes (tulip, hibiscus, cactus, mushroom); exports `getArchetype`, `getSpritePath`, `parseHexToRGB`, `generatePlant`; 35 passing tests; `ACCENT_RAMPS` (11 ramps) and `selectArchetype`/`selectAccentRamp` now live in `src/shared/plant.ts`
- `src/client/plant/stageTransitions.ts` — pure stage transition utilities (`getPromotedStage`, `getDemotedStage`, `canPromote`, `canDemote`, `PROMOTABLE_STAGES`); 39 passing tests
- `src/client/components/dateFormat.ts` — pure date formatting utility; 9 passing tests
- `src/client/components/PlantVisual.tsx` — canvas-based pixel art sprite renderer; nearest-neighbor scaling (3×); all 4 archetypes wired; palette ramp swap via `getImageData`/`putImageData`; accepts `archetype` and `accentRamp` props (stored DB values), falls back to UUID-derived values; 6 passing tests
- `src/client/plant/sprites/{tulip,hibiscus,cactus,mushroom}/` — 7 PNG sprites per archetype (28 total); bundled via Vite `import.meta.url`
- `src/client/plant/sprites/SPRITES.md` — sprite generation prompt, Aseprite cleanup workflow, palette constraints, and slicing instructions
- 148 tests total, all passing; TypeScript strict mode passes; build produces a working bundle

Not yet built (deferred):
- Audio file uploads, labels/plots UI, withering/decay, Alda integration
- Sort by `updated_at`, stage-filter chips, title search
- Automatic growth stage advancement (currently manual via arrow buttons)
- Appearance editing controls on the edit page (archetype and accent ramp are stored but not user-editable yet)
- **Note**: Sprites were re-sliced in cycle 006 from the Aseprite-cleaned sheet and contain the exact source accent ramp colors. The palette ramp swap fires correctly; each song renders with a UUID-derived accent color.

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

## Design decisions and future direction

See [VISION.md](./VISION.md) for product vision, deferred features, aesthetic direction, and the rationale behind key design decisions.
