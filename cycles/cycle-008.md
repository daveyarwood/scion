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

- [ ] **Replace `window.confirm` delete with inline confirmation** — add `isConfirmingDelete` state to `SongEditModal.tsx`; first click shows "really delete? [confirm] [cancel]" within the modal
- [ ] **React Router** — add `react-router-dom`; wire up `/` (garden grid) and `/songs/:id` (song edit page); the edit page is the modal content promoted to a full page — same fields, same controls, same plant visual; the stale-state modal bug goes away as a side effect since the edit page is always freshly mounted
- [ ] **Store `archetype` and `accent_ramp` in the DB** — add a migration with `archetype` (text) and `accent_ramp` (text, stores the 4 hex values as a JSON array) columns to `songs`; populate on `song.create` by randomly picking at creation time; update `song.get` / `song.list` to return these fields; update the client to use stored values instead of deriving from UUID; this decouples visual identity from generator code changes and sets up future user-editable appearance
- [ ] **All-lowercase UI** — apply `text-transform: lowercase` (or just change the string literals) to all UI chrome: labels, button text, stage names, headings, navigation; user-inputted data (song titles, body text) is exempt

## Scope

- In scope: inline delete confirmation, React Router with edit page, stored archetype/accent_ramp columns, all-lowercase UI chrome
- Deferred: sort by `updated_at`, stage-filter chips, title search, plots, audio uploads, stage tooltips, animated backgrounds

## Work Done

<!-- To be filled in during the cycle -->

## Review Notes

<!-- To be filled in after work is complete -->

## Test Results

<!-- To be filled in after tests are run -->

## Open Questions

<!-- To be filled in as needed -->
