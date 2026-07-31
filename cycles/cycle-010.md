# Cycle 010

**Date**: 2026-07-30 22:57

## Brainstorm

### Last cycle summary

- Built the title generator: `src/shared/titleWords.ts` (hand-curated eclectic + common word lists) and `src/shared/titleGenerator.ts` (weighted 4-tier template system with 30+ templates); server calls `generateTitle()` when title is omitted from `song.create`; dice button on edit page for client-side re-rolls.
- Changed new-seed flow: clicking "+ new seed" creates immediately (via `createMutation.mutate({})`) and navigates to the edit page — no form, no toggle state.
- Removed dead modal code: `SongEditModal.tsx`, `SongEditModal.css`, `CreateSongForm.tsx`, `CreateSongForm.css` are gone.
- Added a screenshot to `docs/screenshot.png` and updated README.
- **Post-cycle**, the title generator received extensive iteration: added CS/distributed-systems terms, color words in two tiers (plain + painterly), expanded templates across four tiers (SIMPLE ~55%, EXTENDED ~30%, RECURSIVE ~10%, EXCLAMATION ~5%), added recursive templates with slashes and parentheses, and added `(pt. 1)` suffix support. The word lists are now 1200+ lines.

### Current project status

The app is a genuinely usable daily sketchbook. 148 tests, all passing. TypeScript strict clean. Build produces a working bundle.

**What works well:**
- Full CRUD with correct cache management; no stale-data flash on navigation
- React Router with `/` (garden grid) and `/songs/:id` (full-page editor); catch-all redirect to `/`
- Title generator produces evocative, surprising titles (e.g., *"non-provisional oyster"*, *"the requisitioned mother"*, *"backpressure whisper"*)
- Direct create-and-navigate: click "+ new seed", land on edit page with generated title
- Per-song archetype + accent ramp persisted in DB; stable visual identity
- 28 pixel-art sprites across 4 archetypes, palette-swapped at render time
- `yarn seed` / `yarn clear` dev tooling

**Known gaps (unchanged from cycle 009):**
- **Song list sorted by `created_at`**: The most recently *edited* idea doesn't surface top. `song.list` has `ORDER BY created_at DESC` and no sort parameter.
- **Card footer shows `created_at`**, not `updated_at` — a one-line fix (`formatDate(song.updated_at)`) that's been sitting for two cycles.
- **No filter or search**: No stage-filter chips, no title search. Finding a specific song in a seeded garden requires scrolling.
- **Appearance not user-editable**: `archetype` and `accent_ramp` are stored and rendered but have no edit-page controls.
- **`plot_id` still untouched**: In the schema since cycle 001, never surfaced in UI.

**Minor housekeeping:**
- `wordpos` is in `devDependencies` and `scripts/generate-word-lists.ts` still exists — the one-off WordNet exploration script from cycle 009's early phase. The commit claimed to remove wordpos but the diff actually added it.
- The title generator blend ratio (50/50 eclectic/common) is hardcoded; no mechanism to tune it.

### Trajectory & observations

- **Garden navigation is the most felt friction.** The cycle 008 and 009 brainstorms both flagged sort-by-updated, stage-filter chips, and title search. Two cycles and a heavy seed session later, these remain the most immediately impactful missing features. With `yarn seed` making it trivial to populate 20+ songs, finding the one you were just working on is the daily pain point.
- **The title generator got the most creative attention this cycle** — and it shows. The post-cycle iterations (CS terms, colors, tiered structure, recursive templates) turned it from a functional utility into a genuinely delightful feature. It's the kind of thing where more creative energy could yield interesting results — tunable blend ratios, per-song title history, user-provided word lists — but at some point it's "done enough."
- **The appearance editing feature is tantalizingly close.** DB columns exist, Zod schemas accept the fields, `song.update` handles them, `PlantVisual` accepts them as props. Only the UI controls are missing.
- **Labels remain the biggest scope item.** The cycle 009 brainstorm listed labels MVP as a full-cycle scope item. The data model (labels table + song_labels join table, many-to-many) is well-designed and a logical next major feature after garden navigation is sorted out. Whether this cycle is the right time depends on appetite.
- **The `wordpos` situation is a minor throwoff.** The script and dependency are harmless but inaccurate commit history and lingering dev dependencies add noise. A short cleanup pass would be tidy but low-priority.
- **The API shape hasn't changed in a while.** `song.list` always returns everything sorted by `created_at`. Adding a sort parameter or server-side filtering would be the first meaningful API evolution since the archetype/accent_ramp columns were added.

### Suggestions for this cycle

1. **Sort by `updated_at` (server + client)** — Change `ORDER BY created_at DESC` to `ORDER BY updated_at DESC` in `song.list` and update `SongCard` to show `updated_at` instead of `created_at`. One line of SQL, one line of JSX. Pair with a `song.list` sort parameter (`?orderBy=created|updated`) for future-proofing. *Most impactful single change for daily usability.*

2. **Stage-filter chips above the garden grid** — Clickable stage labels (seed, seedling, sprout, budding, blooming, dormant, archived) that filter the displayed cards client-side. Pure UI, no backend changes. Active chip gets visual emphasis; clicking a selected chip deselects it. *Makes navigation of a full garden instantly better.*

3. **Title search** — A text input in the garden controls bar that filters songs by title client-side. Combine with stage-filter chips: search + filter together. *Completes the garden-navigation triad (sort + filter + search).*

4. **Appearance editing on the edit page** — Archetype thumbnails (click to change) and accent-ramp color swatches (click to cycle through ramps) on the song edit page. Data model and API are fully ready; only the UI is missing. *Unlocks personalization that's been fully wired but invisible.*

5. **Add `song.list` sort parameter to the API** — Extend `song.list` with an optional `orderBy` input (`'created_at'` | `'updated_at'`) and `orderDirection` (`'ASC'` | `'DESC'`). Server-side sorting, validated by Zod. *Clean API evolution, sets the pattern for future query params (filters, pagination).*

6. **Clean up `wordpos` and the WordNet exploration script** — Either delete `scripts/generate-word-lists.ts` and remove `wordpos` from `devDependencies` (it was a one-off), or move the script to an archive location. *Small housekeeping, removes inaccurate commit history artifact.*

7. **Tunable title generator blend ratio** — Extract the 50/50 blend into a named constant or parameter, allowing the dice button to offer different "registers" (more eclectic, more common, balanced). Could be a simple dropdown next to the dice button. *Creative stretch goal building on cycle 009's momentum.*

8. **Labels data model (migration only)** — Create `migrations/004_add_labels.sql` with `labels` and `song_labels` tables, then add the tRPC procedures and validation schemas in a follow-up cycle. Even just getting the schema right is forward progress. *Sets the table for the next major feature without biting off the full UI scope.*

## Goals

- [x] Sort song list by `updated_at` descending — change `ORDER BY` in `song.list` and show `updated_at` on card footers
- [x] Add stage-filter chips above the garden grid — clickable stage labels that filter displayed cards client-side
- [x] Add title search — text input that filters songs by title client-side, combining with stage-filter

## Scope

In scope:
- `src/server/router.ts` — change `song.list` from `ORDER BY created_at DESC` to `ORDER BY updated_at DESC`
- `src/client/components/SongCard.tsx` — change date from `created_at` to `updated_at`
- `src/client/pages/GardenPage.tsx` — stage-filter chip row above the grid + title search input; both as client-side filters that compose with each other
- `src/client/pages/GardenPage.css` — chip bar, active/inactive chip styles, search input styling
- Any new shared types/Zod schemas needed for the UI (none expected; these are client-side-only filters)

Explicitly deferred:
- `song.list` sort parameter (API evolution) — moving too fast; let the simple sort change land first and see how it feels
- Appearance editing on the edit page — full-scope feature, save for a dedicated cycle
- Tunable title generator blend ratio — creative stretch, save for later
- Labels data model — save for a labels-dedicated cycle
- `wordpos` / `scripts/generate-word-lists.ts` cleanup — user explicitly wants to keep these in the repo

## Work Done

- **Goal 1 — Sort by `updated_at` descending**: Changed `ORDER BY created_at DESC` to `ORDER BY updated_at DESC` in `src/server/router.ts` (`song.list` procedure). Changed `SongCard` footer to display `song.updated_at` instead of `song.created_at` in `src/client/components/SongCard.tsx`.
- **Goal 2 — Stage-filter chips**: Added a row of clickable stage chips (seed, seedling, sprout, budding, blooming, dormant, archived) above the garden grid in `src/client/pages/GardenPage.tsx`. Clicking a chip filters displayed songs to that stage; clicking the active chip deselects it (shows all). Active chip gets green background (`stage-chip--active` class). When filters yield no results, a "no songs match your filters" message is shown instead of the empty-garden state. Added CSS in new `src/client/pages/GardenPage.css`.
- **Goal 3 — Title search**: Added a text input in the garden controls bar that filters songs by title client-side (case-insensitive substring match). Combines with the stage-filter chips: both filters compose together via a single `songs.filter()`. Styled consistently with monospace font and Gardener palette variables.

## Review Notes

### Summary

All three goals were implemented cleanly with no issues. The sort change (`ORDER BY updated_at DESC`) is a one-line SQL and one-line JSX change, correctly executed. Stage-filter chips use `GrowthStageEnum.options` which naturally iterates in growth progression order (seed → archived), and the toggle logic (clicking the active chip deselects it) is straightforward. Title search is a simple case-insensitive substring `includes` that composes cleanly with the stage filter. Edge cases are handled: the empty-garden state still shows when the garden is truly empty (not just filtered empty), and a "no songs match your filters" message appears when filters eliminate all results. The CSS uses the established Gardener palette variables, monospace font, and lowercase text throughout. The prettier formatting pass touched many files but introduced no behavioral changes.

### Fixed

Nothing to fix.

### Escalated to Open Questions

Nothing escalated.

## Test Results

<!-- to be filled in by cycle-tester -->

## Open Questions

