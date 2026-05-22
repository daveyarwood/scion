# Cycle 009

**Date**: 2026-05-21

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
- **`SongEditModal` and related modal CSS still exist**: `SongEditModal.tsx`, `SongEditModal.css` are still present and `SongEditPage.css` imports the modal styles. The modal itself is no longer used (no route renders it); this is dead code.
- **`plot_id` still untouched**: In the schema since migration 001, never surfaced in the UI.
- **No `song.list` sort parameter**: The server always returns creation-order; sorting requires a server-side change.

**What is missing entirely:**
- Sort by `updated_at`
- Stage-filter and search UI
- Labels / organisation beyond the single garden view
- Audio uploads, withering/decay, Alda integration (documented future ideas)

### Trajectory & observations

- **The "sketchbook utility" path is clearly the most pressing.** Sort by `updated_at` and stage-filter chips were deferred from cycle 008's brainstorm. They were the top two suggestions then and they remain so now. With `yarn seed` making it trivial to fill the garden with 20+ songs, the inability to find the one you were just working on is the most immediately felt friction. One more cycle of deferral starts to feel like avoidance.
- **Dead code is accumulating.** `SongEditModal.tsx`, `SongEditModal.css`, and the dead import in `SongEditPage.css` are no longer used. Leaving dead components around creates confusion for future work and should be cleaned up before the component tree grows further.
- **The `updated_at` date on cards is a quick win.** Cards currently show `created_at` in their footer. Showing `updated_at` instead (or a smart "last edited" label) is a single-line change with real UX benefit. It pairs naturally with sort-by-updated_at.
- **Appearance editing is close but not there.** The DB columns exist, the `PlantVisual` component accepts these as props, the edit page renders the plant. Adding an archetype selector and accent-ramp picker on the edit page is the next natural step and would make each song feel even more personal. This could be as simple as two small controls (a set of archetype icons, a row of color swatches) placed near the plant visual.
- **The node-based content model from VISION.md will require the edit page to grow.** The current edit page layout (plant visual left, form right, fixed textarea) is sensible for a single body field but will need restructuring as `song_nodes` becomes a goal. That's probably 2–3 cycles out, but decisions made now (e.g. layout CSS) will either ease or complicate that transition.
- **Labels are the right next organisation primitive.** VISION.md already decided: labels over plots. A many-to-many tag system would make the garden meaningful for multi-project use. But it's a non-trivial feature (new DB tables, tRPC procedures, label UI, filter by label) — probably a full cycle on its own.

### Suggestions for this cycle

1. **Sort by `updated_at` (server + client)** — Change `ORDER BY created_at DESC` to `ORDER BY updated_at DESC` in `router.ts`; this is a one-line SQL change with no migration and is the single highest-leverage UX improvement available right now. Pair it with showing `updated_at` on card footers instead of `created_at`.

2. **Stage-filter chips above the grid** — A row of clickable stage labels ("all / seed / seedling / sprout / ...") that filters the displayed cards client-side; pure UI addition with no backend changes; makes navigating a populated garden tractable and pairs naturally with sort-by-updated_at.

3. **Title search** — A single text `<input>` in the garden controls bar that filters songs by title client-side; trivial to implement alongside stage-filter chips as part of a general "garden controls" section. These three (sort + filter + search) could reasonably be done as one cohesive "garden navigation" goal.

4. **Remove dead modal code** — Delete `SongEditModal.tsx`, `SongEditModal.css`, and fix the import in `SongEditPage.css` to use its own styles directly; small cleanup that keeps the component tree honest and removes a source of confusion for future work.

5. **Appearance editing on the edit page** — Add archetype and accent-ramp selectors to `SongEditPage`: a row of small archetype sprite thumbnails (click to select) and a row of color swatches (click to select ramp); wire to `song.update`; the data model is fully ready for this and it makes each song feel genuinely personal.

6. **Show `updated_at` on song cards** — Change `song-date` in `SongCard.tsx` from `formatDate(song.created_at)` to `formatDate(song.updated_at)` with a "last edited" label; one-line change, immediately more useful.

7. **Labels MVP** — Add a `labels` table and `song_labels` join table via a new migration; add `label.list`, `label.create`, `song.addLabel`, `song.removeLabel` tRPC procedures; show label chips on cards and an editable label list on the edit page; filter the garden by label. This is a full-cycle scope item but would make Scion genuinely useful for multi-project work.

8. **Curated title name generator** — A dice icon next to the title field on the create form (and/or edit page) that generates a random name from curated word pools with templates (`[adjective] [noun]`, `the [adjective] [noun]`, etc.); client-side only, no server round-trip; makes the seed-planting ritual feel more playful (VISION.md already describes this).

## Goals

<!-- To be filled in by the human -->

## Scope

<!-- To be filled in by the human -->

## Work Done

<!-- To be filled in during the cycle -->

## Review Notes

<!-- To be filled in after implementation -->

## Test Results

<!-- To be filled in after implementation -->

## Open Questions

<!-- To be filled in if needed -->
