# Cycle 007

**Date**: 2026-05-21 19:50

## Brainstorm

### Last cycle summary

- Implemented the palette ramp swap in `PlantVisual.tsx`: after drawing the sprite, canvas pixel data is scanned and accent-ramp pixels are remapped to a UUID-derived target ramp via `getImageData`/`putImageData`. Each song now has a deterministic but unique accent color family.
- Added `selectAccentRamp` to `generator.ts`, with `ACCENT_RAMPS` defining 5 target ramps (blue, purple/pink, red, brown/tan, rust/orange); added 6 new tests and an archetype `accentRamp` validation test; generator suite grew from 32 to 39 tests.
- Eliminated duplicated `promotableStages` arrays from `SongCard.tsx` and `SongEditModal.tsx` — both now import `getPromotedStage`/`getDemotedStage` from `stageTransitions.ts`.
- Confirmed that body text line-clamping (3 lines, `webkit-line-clamp`) was already in place from a prior cycle; no changes required.
- Replaced the generic empty state with a garden-themed prompt ("Your garden is empty / Plant your first seed to get started") rendered with a live `PlantVisual` seed sprite illustration.

### Current project status

The app is fully functional end-to-end and has reached its original visual design intent. Every song shows a unique pixel-art plant and unique accent color. The test suite is healthy at 123 passing tests with zero coercions and strict TypeScript throughout.

**What works:**
- Full CRUD: create → unique deterministic plant sprite (1 of 4 archetypes, UUID-seeded) → edit title/body/stage → delete
- 7-stage lifecycle with promote/demote arrows on cards and in the modal; dormant/archived unreachable via UI
- Palette ramp swap code in `PlantVisual.tsx` is complete and correct — each song's accent pixels remap to a UUID-derived color ramp at render time
- 28 real pixel-art sprites, nearest-neighbor scaling (3×), bottom-aligned
- Garden-themed empty state with sprite illustration
- Gardener palette CSS custom properties throughout

**What is incomplete or has a known gap:**
- **Single-page app / no shareable URLs**: Everything lives in one route. The modal is sufficient for MVP use, but a song detail page with a proper URL would open up richer editing, audio uploads, and future deep-linking.
- **Single-page app / no shareable URLs**: Everything lives in one route. The modal is sufficient for MVP use, but a song detail page with a proper URL would open up richer editing, audio uploads, and future deep-linking.
- **No search, filter, or sort**: As the garden grows, navigating it becomes harder. No mechanism to find a song by title, filter by stage, or reorder.
- **Body text renders in full in cards**: `line-clamp: 3` is set, but the CSS may not be applied consistently across browsers; cards with long notes still feel visually uneven.
- **Plots UI entirely absent**: `plot_id` has been in the schema since migration 001; no UI has ever touched it.

**What is missing entirely:**
- React Router / client-side routing
- Audio file uploads
- Withering/decay, Alda integration (documented future ideas)
- Any concept of tagging, filtering, or search

### Trajectory & observations

- **The palette ramp swap is fully working.** Sprites were re-sliced from the Aseprite-cleaned sheet in cycle 006 and contain the exact source accent ramp colors. The pixel remap fires correctly and each song shows a UUID-derived accent color. Suggestion 1 below should be removed.
- **The app is at a "functional v0" and is about to hit a fork.** Two coherent paths forward exist: (a) deepen the living-things metaphor — palette-constrained sprites, plots, withering/decay, ceremonial stage mechanics; or (b) make it more useful as a daily sketchbook — React Router, search/filter, richer body editing, audio uploads. The choice shapes which work feels natural next.
- **Accumulting small UX debt.** The delete confirmation uses a bare `window.confirm`. The modal resets form state on close but doesn't do so on re-open if the song was updated elsewhere. These are small but noticeable rough edges.
- **No sorting or order.** Songs are returned in insertion order. As the garden grows, there's no way to surface recently active seeds or find a half-finished idea. Even a trivial sort-by-updated_at would help daily use significantly.
- **The `ACCENT_COLORS` array in `generator.ts` is now dead code.** `selectAccentColor` still references it and is still exported, but it was effectively superseded by `selectAccentRamp` in cycle 006. It's marked `@deprecated` in a comment but is not removed and still accumulates test overhead. It should either be deleted or given a clear role.

### Suggestions for this cycle

1. **Sort by updated_at** — A sort-by-updated_at (most recently edited first) would make the app meaningfully more useful as a sketchbook immediately; it requires a trivial SQL `ORDER BY` change plus a small tRPC/client update with no schema migration.

3. **Add React Router (`react-router-dom`)** — Wire up `/` (garden grid) and `/songs/:id` (song detail/edit); this enables shareable URLs, makes the edit surface richer, and unblocks future features like audio uploads and per-song pages. Small dependency addition, large architectural unlock.

4. **Remove or clearly sunset the dead `ACCENT_COLORS` / `selectAccentColor` code** — It's marked deprecated but still present, still tested, and will confuse anyone reading `generator.ts`; either delete it or give it an explicit purpose; this is a one-file cleanup with a small test-count reduction.

5. **Search or filter by stage** — A minimal stage-filter control (e.g., tabs or chips above the grid: All / Seed / Blooming / etc.) would make navigating a growing garden tractable and is a pure UI addition with no backend changes; it pairs naturally with the sort improvement.

6. **Replace `window.confirm` delete with an in-UI confirmation** — The bare browser dialog breaks the lo-fi aesthetic and is not dismissible with keyboard flow; a small inline confirmation state in the modal ("Are you sure? [Delete] [Cancel]") is better UX and entirely contained within `SongEditModal.tsx`.

7. **Minimal plots feature** — Create a plot (name only), assign a song to a plot via the edit modal, and show a plot label on the card; `plot_id` has been in the schema since day one and the data model needs no migration; this is purely a tRPC + UI addition and would make the app genuinely useful for managing ideas across multiple projects.

8. **Investigate automatic stage advancement heuristics** — Even a simple rule ("a song with a non-empty body for more than N days advances from seed to seedling") would make the living-things metaphor feel alive rather than purely manual; this is a design exploration task more than an implementation task, but sketching the rule set would set up a future cycle.

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
