# Cycle 009

**Date**: 2026-05-22

## Brainstorm

### Last cycle summary

- Added React Router (`react-router-dom`) with two routes: `/` (garden grid, `GardenPage`) and `/songs/:id` (full-page editor, `SongEditPage`); the old modal-based edit flow was replaced entirely, eliminating the stale-state bug as a side effect of fresh component mounting on navigation.
- Persisted `archetype` and `accent_ramp` in the database via `migrations/003`; added `src/shared/plant.ts` with pure `selectArchetype`/`selectAccentRamp` functions shared between client and server; `song.create` now populates these fields at creation time, decoupling visual identity from generator changes.
- Replaced `window.confirm` delete with an inline confirmation pattern on the edit page: a full-width prompt row appears above the button footer on first click, requiring explicit confirmation before deletion.
- Applied all-lowercase UI chrome consistently across all buttons, labels, headings, stage names, and system text; user-entered data is exempt.
- Fixed a cluster of live-use bugs found in a post-cycle testing session: stale form sync logic (`isDirty` guard), stale list cache on back navigation (`utils.song.list.setData`), per-card stage-loading flicker (`loadingSongId` threading), sprite layering from rapid `PlantVisual` re-renders (`cancelled` flag in effect cleanup), and save button resize from feedback text width.

### Current project status

The app is genuinely usable as a daily creative sketchbook. The full-page edit view feels solid; navigation is correct; create/save/delete all work reliably. The post-cycle bugfix session was thorough and the known rough edges are mostly cosmetic or missing features, not correctness problems.

**What works well:**
- Full CRUD with correct cache management and no stale-data flash on navigation
- React Router routing: `/` and `/songs/:id` with proper back-navigation and browser history
- Per-song archetype + accent ramp persisted in DB; stable across generator changes
- 28 pixel-art sprites across 4 archetypes, palette-swapped at render time; no layering bugs
- Inline delete confirmation; save feedback (`saved!` for 2 seconds); all UI chrome lowercase
- `yarn seed` / `yarn clear` dev tooling for rapidly populating and wiping the garden
- 148 tests, all passing; strict TypeScript throughout; no type coercions

**Known gaps and rough edges:**
- **No sort order for songs**: `ORDER BY created_at DESC` — the most recently *edited* idea doesn't surface. With even a handful of songs this is noticeable.
- **No filter or search**: No stage-filter tabs, no title search. Finding a specific song in a populated garden requires scrolling.
- **Song cards show `created_at`, not `updated_at`**: The footer date on each card shows when the song was first created, not when it was last worked on. This is a one-line fix but subtly misleading.
- **Appearance not user-editable**: `archetype` and `accent_ramp` are stored in the DB and wired through the UI, but the edit page has no controls to change them. The data model is ready; only the UI is missing.
- **`plot_id` still untouched**: In the schema since migration 001, never surfaced in the UI.
- **No `song.list` sort parameter**: The server always returns creation-order; sorting requires a server-side change.

**What is missing entirely:**
- Sort by `updated_at`
- Stage-filter and search UI
- Labels / organisation beyond the single garden view
- Audio uploads, withering/decay, Alda integration (documented future ideas)

### Trajectory & observations

- **The "sketchbook utility" path is clearly most pressing.** Sort by `updated_at` and stage-filter chips were deferred from cycle 008's brainstorm. With `yarn seed` making it trivial to fill the garden with 20+ songs, the inability to find the one you were just working on is the most immediately felt friction.
- **The title generator was the right call.** It changes what "planting a seed" feels like — from a chore (think of a name, type it in) to a ritual (press a button, get a strange and evocative prompt). Several generated titles (`non-provisional oyster`, `undermining songs`, `the requisitioned mother`) felt like genuine song ideas on their own.
- **Dead code is gone.** `SongEditModal.tsx`, `SongEditModal.css`, and `CreateSongForm.tsx/css` were removed this cycle.
- **Appearance editing is close but not there.** The DB columns exist, the `PlantVisual` component accepts these as props, the edit page renders the plant. Adding an archetype selector and accent-ramp picker is the next natural step.

### Suggestions for next cycle

1. **Sort by `updated_at` (server + client)** — Change `ORDER BY created_at DESC` to `ORDER BY updated_at DESC`; one-line SQL change, no migration. Pair with showing `updated_at` on card footers.
2. **Stage-filter chips above the grid** — Clickable stage labels that filter displayed cards client-side; pure UI, no backend changes.
3. **Title search** — A text input in the garden controls bar that filters songs by title client-side. Sort + filter + search together make a cohesive "garden navigation" goal.
4. **Appearance editing on the edit page** — Archetype thumbnails and accent-ramp swatches on `SongEditPage`; data model is fully ready.
5. **Labels MVP** — `labels` table, `song_labels` join table, tRPC procedures, label chips on cards and edit page, filter by label. Full-cycle scope.

## Goals

1. Build a title name generator with curated word pools and templates
2. Change the new-seed flow: clicking "+ new seed" creates immediately and navigates to the edit page
3. Remove dead modal code (`SongEditModal`, `CreateSongForm`)

## Scope

- `src/shared/titleWords.ts` — hand-curated word lists (nouns, plural nouns, verbs, gerunds, adjectives) in two registers: eclectic/bureaucratic and common/everyday
- `src/shared/titleGenerator.ts` — 15 templates, 50/50 blend between registers per slot
- `src/server/router.ts` — `song.create` calls `generateTitle()` when `title` is omitted
- `src/shared/index.ts` — `CreateSongInput.title` made optional
- `src/client/pages/GardenPage.tsx` — "+ new seed" fires `createMutation.mutate({})` and navigates on success; no form, no toggle state
- `src/client/pages/SongEditPage.tsx` — dice button (⚄) next to title field for client-side re-rolls
- `src/client/pages/SongEditPage.css` — modal styles migrated in; new `.title-field-row` and `.btn-dice` styles
- `scripts/seed-songs.ts` — stripped of `/usr/share/dict/words` logic; sends no title, logs server-returned title
- Deleted: `src/client/components/SongEditModal.tsx`, `SongEditModal.css`, `CreateSongForm.tsx`, `CreateSongForm.css`

## Work Done

- Installed `wordpos` as a dev dependency and wrote `scripts/generate-word-lists.ts` to explore WordNet output; concluded WordNet is too noisy for this purpose (too many technical/obscure terms) and switched to hand-curation
- Wrote `src/shared/titleWords.ts` with an eclectic register (bureaucratic, geographic, zoological, institutional vocabulary) and a common register (everyday nouns, verbs, adjectives)
- Wrote `src/shared/titleGenerator.ts` with 15 title templates; each slot blends 50/50 between eclectic and common pools, producing collisions like *"non-provisional oyster"*, *"die the discontinued bureaucrat"*, *"undermining songs"*, *"the requisitioned mother"*
- Removed `[adjective] [noun] and [noun]` template after review — felt structurally awkward
- Moved title files to `src/shared/` so server and client share a single source
- Made `CreateSongInput.title` optional; server calls `generateTitle()` as default
- Replaced "+ new seed" toggle-form flow with direct create-and-navigate
- Added dice button to `SongEditPage` title field for instant client-side re-rolls
- Migrated modal styles into `SongEditPage.css`; deleted all dead modal and form components
- Simplified `seed-songs.ts`: removed `execSync`/`shuf` word fetching; songs now get server-generated titles
- Removed `wordpos` from devDependencies (used only for exploration)
- All 148 tests passing; TypeScript strict mode clean throughout

## Review Notes

N/A — informal cycle, no separate reviewer pass.

## Test Results

148 tests, all passing. No new tests added this cycle (title generator is pure and exercised manually; no logic regressions in modified server/client code).

## Open Questions

- Should the 50/50 blend ratio between eclectic and common pools be tunable? Currently hardcoded in `pickNoun` etc. Could be a named constant if we want to experiment further.
- `scripts/generate-word-lists.ts` remains in the repo as a dev utility. Worth keeping or should it be deleted?
