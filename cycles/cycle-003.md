# Cycle 003

**Date**: 2026-05-16

## Brainstorm

### Last cycle summary

- Built the entire application stack from scratch in a single cycle: Zod schemas in `src/shared/`, Express + tRPC server with full song CRUD, React client with tRPC/React Query, and a concurrent dev launcher — all wired together end-to-end.
- The `GrowthStage` enum (`seed → seedling → sprout → blooming → dormant → archived`) is now the authoritative vocabulary, locked in the shared Zod schema and inferred as a TypeScript type throughout.
- The song grid renders live data from SQLite via tRPC; the "New Seed" form creates a song, and the card appears immediately in the grid — the first complete user interaction loop works.
- Each song card currently shows a stage emoji (🌰 🌱 🌿 🌸 ❄️ 📦) as a placeholder for the not-yet-built algorithmic plant visual.
- 80 tests pass; TypeScript strict mode clean; production build produces a 242 KB bundle.
- Deferred from this cycle: algorithmic plant visual generation, song detail/edit view, audio uploads, plots UI, withering/decay, Alda integration.

### Current project status

The application is genuinely usable in a minimal sense: you can create song ideas and see them listed. But it feels like a plain CRUD app, not yet like Scion. The two most prominent gaps are:

**What works:**
- Full data flow: create a song → stored in SQLite → fetched via tRPC → rendered in the grid
- All five CRUD procedures functional and tested
- Clean monorepo architecture with strict TypeScript throughout
- Dev experience: `yarn dev` brings up both servers; `yarn test` runs 80 tests in ~1.4s

**What is stubbed / placeholder:**
- Plant visuals: each card shows only a stage emoji — the soul of the product's identity is absent
- Song cards are not interactive — clicking does nothing; there is no way to edit or view full details of a song

**What is missing entirely:**
- Song detail view / edit form (no route, no modal, no navigation)
- Any way to advance a song's growth stage (the stages exist in the schema but no UI exposes them)
- Growth stage is never changed after creation — every seed stays a seed forever
- Audio file uploads, plots, withering/decay, Alda integration (all intentionally parked)

**Gap to next meaningful milestone:** The app needs two things to cross from "skeleton" to "feels like Scion": (1) algorithmic plant visuals on every card, and (2) a detail/edit view so a plant can actually be tended. Together these close the loop on the core metaphor.

### Trajectory & observations

- The "plants as living things" metaphor is currently invisible — the entire aesthetic and emotional identity of the app lives in the algorithmic visuals, and none of it has shipped yet. This is the most urgent creative gap. The product will feel fundamentally different once every song has a unique, evolving visual presence rather than an emoji.
- A detail/edit view is needed before the app is useful for its stated purpose: capturing and *developing* musical fragments. Right now there is no way to develop anything — songs can only be created, never tended.
- The `growth_stage` field is fully modelled and schema-enforced but completely inert in the UI. The next natural tension, once a detail view exists, is: what triggers stage advancement? Manual promotion (a button) is the simplest answer and a reasonable first step; the more interesting automatic/organic approach (timed decay, word-count thresholds, explicit "publish" actions) can follow once the manual path is proven.
- Client-side routing has been implicitly deferred but can no longer be avoided once a detail view exists. React Router is the obvious choice; adding it is small but worth doing cleanly so future views (plots, a timeline, etc.) have a foundation to build on.
- The plant visual generator can live entirely in `src/client/` as a pure function `(id: string, stage: GrowthStage) => SVGElement | ReactNode`. Because it is deterministic and seeded by the song's UUID, it requires no server changes. A simple approach: hash the UUID into a few numeric seeds, use those to control SVG path parameters (stem curve, leaf count/angle, colour hue), and let `growth_stage` gate visual complexity (seed = single small form, blooming = full branching). This is achievable in one focused cycle.
- Once visuals and detail views are in, the app will have enough surface area to think seriously about the growth lifecycle, audio attachments, and eventually plots. Those features depend on having a working edit form to hang controls on.

### Suggestions for this cycle

1. **Algorithmic plant visual generator** — Implement a deterministic SVG plant in `src/client/components/PlantVisual.tsx` seeded by the song's UUID, with visual complexity gated by `growth_stage`. Replace the stage emoji placeholder in `SongCard` with the generated visual. This is the single highest-leverage thing to build: it transforms the app's identity from generic CRUD to Scion. Even a simple generative result (stem curve, 1–5 leaves, hue derived from ID hash) is a massive step forward.

2. **Song detail / edit view** — Add a detail view (modal or dedicated route) that opens when a card is clicked, showing the full `title` and `body` with an inline edit form wired to `song.update` via tRPC. This is the missing half of the app's core loop — without it, there is no way to *develop* a seed.

3. **Growth stage advancement UI** — Add a simple "promote stage" control to the detail view (a button or dropdown that calls `song.update` with the next `growth_stage`). Manual promotion is the right first step; it unblocks the visual system and makes the growth lifecycle tangible. The enum order is already defined in the schema.

4. **Client-side routing with React Router** — Add `react-router-dom` and create routes for the grid (`/`) and song detail (`/songs/:id`). This is prerequisite infrastructure for a proper detail view and lays the foundation for future views (plots page, search, etc.). The migration is small since the app currently has only one screen.

5. **Plant visual: stage-differentiated appearance** — As an extension of suggestion 1, ensure the visual is clearly distinct across all six growth stages (not just subtly different). A `seed` should look spare and closed; a `blooming` plant should look full, layered, and alive. This requires deliberate design choices but no additional architecture.

6. **Delete / archive a song** — The `song.delete` tRPC procedure exists and is tested but is not exposed anywhere in the UI. A "delete" or "archive" action on the detail view closes the lifecycle and makes the app feel complete at the CRUD level.

7. **Empty-state and loading polish** — The current empty state says "No seeds yet. Create your first song idea to get started!" — fine but generic. Once plant visuals exist, the empty state could show a faint illustration or prompt that reinforces the garden metaphor. Low effort, meaningful for first-impression quality.

8. **README: update current state and add screenshot placeholder** — The README currently describes plant visuals as a feature without noting they are not yet built, and there are no screenshots. After implementing visuals, a screenshot of the grid would make the README significantly more compelling and honest about what the app looks like today.

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
