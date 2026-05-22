# Cycle 009

**Date**: 2026-05-21

## Brainstorm

### Last cycle summary

All four cycle 008 goals completed: inline delete confirmation replaced `window.confirm`; React Router added with `/` (garden grid) and `/songs/:id` (edit page), eliminating the stale-state modal bug; `archetype` and `accent_ramp` columns added to DB and populated on `song.create`; all UI chrome lowercased via `text-transform: lowercase`. 148 tests passing.

### Current project status

The app is in daily-use shape after a round of live-testing bug fixes this cycle. Core flows (create, browse, edit, delete) are solid. Navigation between garden and edit page is correct and snappy.

**Known gaps and rough edges:**
- No sort order control — songs are ordered by `created_at DESC`; most recently edited song isn't surfaced
- No stage-filter or title search — hard to find a specific idea as the garden grows
- Plots UI still absent — `plot_id` in schema but untouched in UI
- Stage meanings are opaque — no tooltips or documentation of what each stage represents
- No audio uploads

### Trajectory & observations

This cycle was a polish/bugfix cycle prompted by live testing after cycle 008. The issues found were mostly in the new React Router + edit page flow: cache staleness, form initialization timing, and CSS specificity. These are now resolved. The app feels stable.

The next natural step is utility: sort by `updated_at`, stage-filter chips, and title search would make the garden tractable as it grows. These are pure UI/SQL additions with no schema changes required.

### Suggestions for next cycle

1. **Sort by `updated_at`** — one-line SQL change (`ORDER BY updated_at DESC`); immediately surfaces the most recently touched idea
2. **Stage-filter chips** — a row of clickable stage labels above the grid; pure client-side filter; makes a populated garden navigable
3. **Title search** — a text input filtering cards by title client-side; trivial alongside filter chips
4. **Stage meaning tooltips** — short descriptions of what each stage represents; zero functionality risk, makes the metaphor tangible

## Goals

_To be set at the start of the next cycle._

## Scope

_To be defined._

## Work Done

This cycle was a live-testing bugfix session following cycle 008 deployment.

**Bug: create seed not working**
- Root cause: migrations `002_add_budding_stage` and `003_add_archetype_and_accent_ramp` had never been applied to the live database. The INSERT was failing because the `archetype` and `accent_ramp` columns didn't exist.
- Fix: ran `scripts/migrate.ts` to apply both pending migrations.

**Bug: "Scion" title not lowercase in browser tab**
- Fixed `<title>Scion</title>` → `<title>scion</title>` in `index.html`.

**Bug: "Scion" h1 not lowercase; plant emoji in header**
- Removed `🌱` emoji and changed `Scion` → `scion` in both `GardenPage.tsx` and `SongEditPage.tsx`.
- Added `text-transform: lowercase` to `.app-header h1` in `App.css`.

**Bug: no visual feedback when clicking save**
- Added `saved` boolean state to `SongEditPage`; save button shows `saved!` for 2 seconds after a successful save then reverts to `save`.
- Used `width: 7.5rem; flex-shrink: 0` on `.btn-save` to prevent the button from resizing as its label changes between `save`, `saving...`, and `saved!`.
- Replaced `saved ✓` with `saved!` after discovering the `✓` character caused the button to grow taller in Courier New.

**Bug: clicking a stage arrow caused all arrows on the page to flicker**
- Root cause: `updateMutation.isPending` was a single boolean shared across all cards, disabling all arrows during any update.
- Fix: replaced `isLoadingStageChange: boolean` prop with `loadingSongId: string | null` threaded from `GardenPage` → `SongGrid` → `SongCard`. Only the card whose song is updating has its arrows disabled.

**Bug: delete confirmation used button-swap pattern**
- Redesigned: the save/delete/back buttons are now always stable. Clicking delete shows a full-width inline prompt (`delete this song? | yes, delete | cancel`) above the button row via `flex-wrap` on the footer.
- Added `.delete-confirm-prompt` styles to `SongEditPage.css`.
- Added `flex-wrap: wrap` to `.modal-footer` in `SongEditModal.css`.

**Bug: delete button not visually distinct (cream-colored)**
- Root cause: `.btn-delete` had the same specificity as `.btn` and was losing to the base cream background.
- Fix: changed selector to `.btn.btn-delete` (two classes = higher specificity); set filled `var(--color-dark-red)` background with cream text at rest, `var(--color-red)` on hover.

**Bug: after editing stage on list page, edit page showed old stage**
- Root cause: `SongEditPage` used an `initialized: boolean` guard that locked in the first data received (stale cache), blocking the fresh fetch from updating the form.
- Fix: replaced `initialized` with `isDirty: boolean`. Form syncs from server data whenever `!isDirty && !songQuery.isFetching`. User edits (title, body, stage arrows) set `isDirty = true`. Successful save clears `isDirty`. `isDirty` resets to `false` on `id` change (navigation). Added `staleTime: 0` to `song.get` query to always fetch fresh data on mount.

**Bug: brief flash of stale stage on back navigation from edit to garden**
- Root cause: `song.list` cache was stale when navigating back; the garden rendered old data briefly before the background refetch completed.
- Fix 1: added `staleTime: 0` to `song.list` query in `GardenPage`.
- Fix 2: on successful save in `SongEditPage`, immediately update the `song.list` cache via `utils.song.list.setData` so the garden already has correct data before navigation.

**Bug: multiple growth stage sprites layered on top of each other**
- Root cause: `PlantVisual` effect cleared the canvas synchronously but drew the sprite asynchronously in `img.onload`. If `stage` changed mid-flight (e.g., two rapid syncs from stale then fresh data), the stale `onload` would fire after the new clear, layering sprites.
- Fix: added `cancelled` flag in the effect; cleanup function sets `cancelled = true`; `onload` and `onerror` are no-ops if cancelled. This ensures only the most recent render draws.

## Test Results

**Tests run**: 148
**Passing**: 148
**Failing**: 0

No new tests added this cycle (all fixes were in UI/CSS/cache logic with no new pure functions to unit-test).

TypeScript: strict mode passing.

## Open Questions

<!-- None -->
