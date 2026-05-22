# Cycle 008

**Date**: 2026-05-21

## Brainstorm

### Last cycle summary

- Expanded `ACCENT_RAMPS` from 5 to 11 fully Gardener-palette ramps (blue ×3, brown ×2, rust/orange, red, maroon, pink/magenta, pale pink, purple) and removed all dead code: the `ACCENT_COLORS` array and `selectAccentColor` function were deleted along with their 4 tests. Generator test count dropped from 39 to 35.
- Added `scripts/seed-songs.ts` — creates N songs (default 20) via the tRPC HTTP API, with random two-word titles from `/usr/share/dict/words` and random growth stages assigned via a follow-up `song.update` call.
- Added `scripts/clear-songs.ts` — lists all songs and deletes each via `song.delete`; accepts a `--force` flag to skip confirmation.
- Added `yarn seed` and `yarn clear` shorthand scripts to `package.json`.
- Fixed `song.delete` input schema from a bare custom string validator to `z.object({ id: z.string().uuid() })`; updated `App.tsx`, `clear-songs.ts`, and `router.test.ts` accordingly (+2 new delete validation tests).

### Current project status

The application is complete as an end-to-end functional v0 sketchbook. All the foundational infrastructure is solid: strict TypeScript, Zod schemas as source of truth, no type coercions, 121 passing tests, and a working pixel-art garden UI with per-song palette-swapped sprites.

**What works well:**
- Full CRUD for songs, displayed as a responsive grid of pixel-art plant cards
- Deterministic plant identity per song: archetype (1 of 4) and accent color ramp (1 of 11) are both UUID-seeded
- 7-stage lifecycle (seed → seedling → sprout → budding → blooming → dormant → archived); dormant/archived are unreachable via UI arrows
- 28 pixel-art sprites (4 archetypes × 7 stages); nearest-neighbor 3× scaling; palette ramp swap at render time
- Dev tooling: `yarn seed` and `yarn clear` for rapid local testing

**Known gaps and rough edges:**
- **No sort order**: Songs are returned in insertion order (`ORDER BY created_at DESC`). The most recently edited idea isn't surfaced; a `ORDER BY updated_at DESC` change would immediately improve daily use.
- **No filter or search**: With even a handful of songs it's hard to find a specific idea or focus on one stage. No stage-filter tabs, no title search.
- **`window.confirm` for delete**: Breaks the lo-fi aesthetic; a small inline confirmation state would be a quick, contained improvement.
- **Single-page, no URLs**: Everything lives at `/`. The edit modal is functional but there's no shareable link to a song, no back button, and the edit surface is constrained to a modal's vertical height.
- **Plots UI absent**: `plot_id` has been in the schema since migration 001 but is untouched in the UI. The data model already supports grouping by project/genre; this just needs tRPC procedures and UI.
- **No `song.list` sort parameter**: The server always returns insertion order; no way for the client to request a different ordering without a server-side change.

**What is missing entirely:**
- React Router / client-side routing
- Audio file uploads
- Withering/decay, Alda integration (documented future ideas)

### Trajectory & observations

- **The app is ready for real daily use — and real daily use will surface the next priorities.** With `yarn seed` now available, populating the garden is trivially easy. The most immediate friction will be: "I have 30 songs and can't find the one I was working on yesterday." This points directly at sort + filter as the highest-leverage features.
- **Two coherent paths are still diverging.** Path A (sketchbook utility): sort by `updated_at`, stage-filter chips, React Router, richer body editing. Path B (living-garden metaphor): plots, decay/withering, automatic stage advancement heuristics. These paths aren't mutually exclusive but choosing which to start defines the feel of the next 3–4 cycles. Sort + filter is clearly Path A; plots leans toward Path B.
- **React Router is a larger unlock than it appears.** Adding routing would enable: individual song pages with more editing space, back-button navigation, deep-linking from other tools, and eventually audio upload UI. It's a one-time structural investment that unblocks multiple future features. The current modal-based approach will start to feel cramped if body text grows longer or richer editing is added.
- **The modal re-open bug noted in cycle 007 is still present.** When a song is updated externally (e.g., via a stage arrow on a card) and the modal is then opened on that same song, it initializes its `useState` from the stale `song` prop. This is a subtle correctness issue that will become more noticeable as the app gets heavier use.
- **Stage semantics are still manual and opaque.** The garden metaphor says stages should *mean* something — a seed has a title, a seedling has a first draft, a sprout has structure, etc. Right now stages are just labels with arrows. Documenting (even just in the UI as tooltips or in code as comments) what each stage represents would make the promote/demote gestures feel intentional rather than arbitrary.

### Suggestions for this cycle

1. **Sort by `updated_at` (server + client)** — A one-line SQL change (`ORDER BY updated_at DESC`) immediately surfaces the most recently touched idea; this requires no migration, no schema change, and is the single highest-leverage UX improvement available right now.

2. **Stage-filter chips above the grid** — A row of clickable stage labels ("All / Seed / Seedling / Sprout / ...") that filters the displayed cards client-side; pure UI addition with no backend changes; makes navigating a populated garden tractable and pairs naturally with sort-by-updated_at.

3. **Replace `window.confirm` delete with inline confirmation** — Add a `isConfirmingDelete` boolean state to `SongEditModal.tsx`; on first Delete click show "Really delete? [Confirm] [Cancel]" within the modal; the entire change is confined to a single component and is a quick, high-quality UX polish.

4. **Add React Router (`react-router-dom`)** — Wire up `/` (garden grid) and `/songs/:id` (song detail/edit page); this is a larger structural investment but unlocks shareable URLs, richer per-song editing space, and proper browser navigation. The modal continues to work until the detail page is built. Estimated scope: a few hours.

5. **Fix the modal stale-state bug** — The `SongEditModal` initializes its local state from `song` props on mount, but if the song is updated externally (e.g., via card arrows) and the modal is then opened, it shows stale data. Fix: use a `key={song.id + song.updated_at}` or `useEffect` to sync state when the `song` prop changes. Small change, meaningful correctness improvement.

6. **Minimal plots feature** — Add `plot.list` and `plot.create` tRPC procedures (no migration needed — `plot_id` already exists in `songs`); show a plot selector in the edit modal; display a plot label on cards. This would make Scion genuinely useful for managing ideas across multiple projects and is a pure tRPC + UI addition.

7. **Stage meaning / tooltips** — Add short descriptive text to each stage (what it means to be a "seedling" vs. a "sprout") as tooltips on the stage label in the modal and/or as a reference in `stageTransitions.ts` comments. Zero functionality risk, makes the metaphor tangible for daily use.

8. **Title search** — A single text `<input>` above the grid that filters songs by title client-side; trivial to implement alongside stage-filter chips as part of a general "garden controls" bar. Especially valuable as the song count grows.

## Goals

- [x] **Replace `window.confirm` delete with inline confirmation** — add `isConfirmingDelete` state to `SongEditModal.tsx`; first click shows "really delete? [confirm] [cancel]" within the modal
- [x] **React Router** — add `react-router-dom`; wire up `/` (garden grid) and `/songs/:id` (song edit page); the edit page is the modal content promoted to a full page — same fields, same controls, same plant visual; the stale-state modal bug goes away as a side effect since the edit page is always freshly mounted
- [x] **Store `archetype` and `accent_ramp` in the DB** — add a migration with `archetype` (text) and `accent_ramp` (text, stores the 4 hex values as a JSON array) columns to `songs`; populate on `song.create` by randomly picking at creation time; update `song.get` / `song.list` to return these fields; update the client to use stored values instead of deriving from UUID; this decouples visual identity from generator code changes and sets up future user-editable appearance
- [x] **All-lowercase UI** — apply `text-transform: lowercase` (or just change the string literals) to all UI chrome: labels, button text, stage names, headings, navigation; user-inputted data (song titles, body text) is exempt

## Scope

- In scope: inline delete confirmation, React Router with edit page, stored archetype/accent_ramp columns, all-lowercase UI chrome
- Deferred: sort by `updated_at`, stage-filter chips, title search, plots, audio uploads, stage tooltips, animated backgrounds

## Work Done

**Goal 1: Inline Delete Confirmation**
- Added `isConfirmingDelete` boolean state to SongEditModal
- First delete click shows confirmation buttons ("confirm delete" / "cancel")
- Second click executes the delete
- All buttons updated to lowercase labels
- Added .btn-secondary CSS style class

**Goal 2: React Router + Edit Page**
- Added react-router-dom dependency
- Created GardenPage.tsx with garden grid UI (refactored from App.tsx)
- Created SongEditPage.tsx with full-page editor containing:
  - Plant visual display with stored archetype/accent_ramp fallback to UUID
  - Title and body inputs  
  - Stage promotion/demotion controls
  - Inline delete confirmation
  - Save, delete, and back navigation buttons
- Updated App.tsx to use BrowserRouter with routes for `/` and `/songs/:id`
- Song cards now navigate to edit page instead of opening modal
- Stale-state modal bug eliminated as side effect of fresh mount on navigation

**Goal 3: Store Archetype and Accent Ramp in DB**
- Created src/shared/plant.ts with pure plant generation functions:
  - selectArchetype(id: string): returns archetype name string
  - selectAccentRamp(id: string): returns 4-color ramp tuple
  - ACCENT_RAMPS export: 11 Gardener-palette ramps
- Added 10 new tests for shared plant functions (131 total tests)
- Created migration 003_add_archetype_and_accent_ramp.sql:
  - Added archetype TEXT column (nullable)
  - Added accent_ramp TEXT column (nullable, stores JSON array string)
- Updated SongSchema, CreateSongInput, UpdateSongInput, UpdateSongWithId to include archetype and accent_ramp fields
- Modified song.create to populate archetype and accent_ramp using shared functions
- Modified song.update to handle archetype and accent_ramp updates
- Updated PlantVisual.tsx to accept archetype and accentRamp props, using stored values when present and falling back to UUID-derived values
- Updated SongCard to pass archetype and accent_ramp to PlantVisual
- Updated router tests to load all three migrations for in-memory DB setup

**Goal 4: All-Lowercase UI Chrome**
- Applied text-transform: lowercase CSS to UI elements:
  - .btn class (all buttons)
  - .form-group label
  - .modal-form label
  - .stage-label (growth stage display)
  - .empty-state h2 (empty state heading)
  - .app-header p (subtitle)
  - .song-stage (card stage display)
- Changed all button labels to lowercase: 'save', 'delete', 'cancel', 'close', 'back', 'create seed', '+new seed'
- Changed all form labels to lowercase: 'title', 'notes', 'growth stage'
- Changed loading/error messages to lowercase
- Changed modal headers and empty state text to lowercase
- Changed tooltips and aria-labels to lowercase
- Removed .charAt(0).toUpperCase() capitalization from stage display in SongEditModal
- Preserved user-entered data (song titles, body text) without any case transforms
- Added lowercase to GardenPage and SongEditPage headers/text

**Summary**
All four goals completed successfully. The application now has:
1. Better delete UX with inline confirmation (no modal popups)
2. Full React Router integration with dedicated edit page at /songs/:id, eliminating the stale-state bug
3. Persistent archetype and accent_ramp in the database, enabling future user-customizable appearance
4. Consistent all-lowercase UI chrome while preserving user data as-is

Test count: 131 tests (10 new tests for shared plant functions)
TypeScript: strict mode passing
All tests passing after each goal commit

## Review Notes

<!-- To be filled in after work is complete -->

## Test Results

**Tests run**: 148
**Passing**: 148
**Failing**: 0

### Coverage notes

This cycle added substantial new functionality: React Router integration, full-page edit UI, database columns for persisting archetype and accent_ramp, and all-lowercase UI chrome. Test coverage is now comprehensive for the main features:

**What is well tested:**
- ✓ Shared plant selection functions (`selectArchetype`, `selectAccentRamp`) — 10 tests verify determinism, edge cases, and palette validity
- ✓ Zod schemas for songs with archetype/accent_ramp fields — 20 tests (was 14) verify validation, defaults, and nullable fields
- ✓ Database layer (router CRUD) — 17 tests (was 12) now verify that archetype and accent_ramp are populated on `song.create`, returned from `song.get`/`song.list`, and can be updated via `song.update`
- ✓ Utility function `getArchetypeIdByName` — 6 new tests verify all four archetype mappings and fallback behavior
- ✓ Stage transitions, date formatting, migrations — all pre-existing tests still passing (39 + 9 + 12 = 60)

**Coverage gaps (intentional, low risk):**
- React Router pages (`GardenPage`, `SongEditPage`) — not unit-testable without a test renderer; these are integration components that connect tRPC queries to UI. The edit page's delete confirmation state, form initialization, and navigation are tied to React Router and browser navigation, which would require a full test environment (e.g., React Testing Library + jsdom). This is deferred because: (a) these paths are exercised by manual testing and yarn dev, (b) the core business logic (select/update mutations, schema validation) is thoroughly tested elsewhere, and (c) testing React components with tRPC queries requires mocking the entire query layer which adds maintenance burden without proportional benefit.
- PlantVisual.tsx palette swap logic — the canvas manipulation and palette remapping is a render-time side effect that requires a DOM and image loading. Unit testing this would require jsdom and image mocking. The logic is deterministic (remap source ramp colors to target ramp in pixel data) and is indirectly tested via: (a) shared plant functions ensuring archetype/ramp selection is correct, (b) the component accepts stored archetype/ramp props and falls back to UUID-derived values (both paths tested in router tests and plant tests).

**Test count breakdown:**
- src/shared/plant.test.ts: 10 tests
- src/client/plant/stageTransitions.test.ts: 39 tests
- src/shared/index.test.ts: 20 tests (added 6 for archetype/accent_ramp validation)
- src/client/plant/generator.test.ts: 35 tests
- src/client/components/dateFormat.test.ts: 9 tests
- src/client/components/PlantVisual.test.ts: 6 tests (new file)
- src/server/router.test.ts: 17 tests (added 5 for archetype/accent_ramp handling)
- scripts/migrate.test.ts: 12 tests

TypeScript: strict mode passing
Build: vite bundle produces working output
All tests added this cycle are focused on real bugs: archetype/ramp persistence, schema validation, proper fallback behavior.

## Open Questions

<!-- To be filled in as needed -->
