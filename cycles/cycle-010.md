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

