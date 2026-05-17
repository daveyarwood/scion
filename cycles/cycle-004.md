# Cycle 004

**Date**: 2026-05-17 19:00

## Brainstorm

### Last cycle summary

- All six goals for cycle 003 were completed, transforming the app from a plain CRUD skeleton into something that actually feels like Scion: Gardener-palette lo-fi UI, algorithmic plant visuals, and click-to-edit modal all shipped.
- The plant visual generator (`src/client/plant/generator.ts`) produces deterministic SVG plants seeded by UUID, with visual complexity gated by the six growth stages. Every song card now has a unique living visual identity instead of a stage emoji.
- The song edit modal (open on card click) exposes the full `title`, `body`, and `growth_stage` fields, wired to `song.update` and `song.delete` via tRPC — the first complete tend-and-develop loop works.
- Type coercions were eliminated across the codebase; typed better-sqlite3 generic parameters replaced all `as Record<string, unknown>` casts, and the no-coercions policy was documented in AGENTS.md.
- The test suite was pruned from 80 to 51 focused tests, removing tests that tested inline test-file logic or required a real DB/server, and the testing philosophy was added to AGENTS.md.
- A post-cycle refactor moved `plantGenerator.ts` from `src/client/utils/` into `src/client/plant/`, establishing the co-location convention and adding an explicit no-`utils/` rule to AGENTS.md.

### Current project status

The app has crossed the threshold from skeleton to genuine prototype. The core metaphor — musical ideas as tended plants — is now visually present and interactable. The two biggest previous gaps (plant visuals and edit view) are both closed.

**What works:**
- Full CRUD loop: create a song → unique plant SVG appears in the grid → click to edit title/body/stage → delete
- Growth stage is surfaced in the UI and can be set manually; the plant visual updates to reflect it
- 51 focused tests, TypeScript strict throughout, zero type coercions, fast CI-friendly test suite
- Gardener palette lo-fi aesthetic: sharp corners, chunky borders, drop shadows, monospace fonts

**What is underdeveloped:**
- The plant visual generator is functional but visually basic — stems, flat leaves, a simple flower. The SVG shapes are geometric; the aesthetic doesn't yet match the lo-fi, handmade quality of the rest of the UI. Stage-to-stage transitions exist but could be more expressive.
- The edit modal resets state on cancel but has no unsaved-changes guard. Stage advancement is a raw dropdown — there's no friction or ceremony to "promoting" a song, which is a meaningful creative act.
- The `body` / notes field is a plain textarea with no formatting, character count, or structural hints — fine for now, but the sketchbook metaphor calls for something richer eventually.

**What is missing entirely:**
- Client-side routing (React Router) — not yet needed with a modal, but increasingly pressing if a song ever deserves its own URL
- Audio file uploads — the backend schema accommodates this (`data/` is gitignored for audio) but no UI or server endpoint exists
- Plots / grouping — `plot_id` has been in the schema since day one but the concept is completely absent from the UI
- Automatic / organic growth stage advancement — no timestamps, no decay, no promotion triggers other than the manual dropdown
- Empty-state polish and any onboarding — the "No seeds yet" message is functional but not evocative

**Gap to next milestone:** The mechanical parts of the app work. The next meaningful step is deepening the metaphor and quality-of-life: richer plant visuals, better information density on cards, and the beginnings of structure (plots) or lifecycle (growth triggers) to make repeated use feel rewarding rather than just utilitarian.

### Trajectory & observations

- The plant visual is the app's face — every first impression goes through it. Right now the SVGs are noticeably programmer-art: straight-line stems, uniform leaf shapes, a symmetric flower. Investing in more organic-looking paths (quadratic bezier curves for leaves, tapered stems, irregular petal forms) would pay off disproportionately in perceived quality. This is achievable without changing the generator's architecture — only the shape primitives need upgrading.
- The growth stage is inert beyond the visual. There's no cost to promoting something to `blooming`, no reward for doing so thoughtfully, and no consequence to letting it sit at `seed` forever. For the app to feel alive, the lifecycle needs either light automation (a song that hasn't been edited in 30 days might wilt toward `dormant`) or at least meaningful ceremony (a deliberate "promote" action rather than a plain dropdown). This is a design question worth settling before the app has many songs.
- Plots are the natural next structural feature — most musicians think in project/album/genre groupings. The data model is ready; a small UI investment (a filter bar, a way to assign a song to a plot at creation time) would unlock a qualitatively different way of using the app. It's also required before the garden metaphor can scale: a single flat list of plants becomes unwieldy past ~20 songs.
- Client-side routing has been deferred successfully so far, but it's becoming a precondition for several desirable things: shareable song URLs, a dedicated plots view, future deep-linking. Adding React Router is a small investment with large option value.
- The `body` / notes field is getting closer to the point where it should have some structure — timestamps, section headers, lyric blocks — but this is probably two or three cycles away. The more urgent thing is making existing fields feel better to use.

### Suggestions for this cycle

1. **Richer plant SVG aesthetics** — Replace flat geometric leaf and stem paths with organic bezier curves; taper stems; give leaves more natural curvature and size variation. The generator architecture stays the same — only the SVG primitives improve. This is the single highest-leverage visual investment: a plant that looks hand-drawn fits the lo-fi UI far better than a programmer-geometric one.

2. **Plots: data model → UI** — Add a `plots` table (migration), expose `plot.list` and `plot.create` via tRPC, and add a basic plot filter/selector to the garden view. Songs can already be assigned a `plot_id`; the missing piece is surfacing plots as a first-class concept. Even a minimal implementation (create a plot, filter the grid by plot) turns the flat song list into an organizable collection.

3. **Growth stage promotion UX** — Replace the plain dropdown in the edit modal with a more intentional "promote / demote" action: a dedicated button that advances the stage one step, with a brief label explaining what the stage means. This adds ceremony to the lifecycle without adding complexity to the data model.

4. **Client-side routing with React Router** — Add `react-router-dom` and set up routes for `/` (grid) and `/songs/:id` (song detail). This is small since there's currently only one real view, but it unblocks shareable links and makes adding plots, search, and future views much cleaner.

5. **Song card information density** — The current card shows the plant, the title, and the stage. Consider also showing a truncated `body` preview, the `created_at` date (e.g. "3 days ago"), and possibly the stage as a label rather than just implicitly in the plant visual. Small improvements here make the garden feel like a living sketchbook rather than a tile grid.

6. **Withering / decay prototype** — Add a `last_tended_at` timestamp (new migration) and update it on every `song.update`. Display a visual wilting indicator on cards whose `last_tended_at` is more than N days ago. This is the lightest possible implementation of the decay mechanic and would make the lifecycle feel organic without requiring any complex automation.

7. **Empty-state and onboarding polish** — Replace the generic "No seeds yet" message with something that reinforces the garden metaphor — a faint illustration, a more evocative prompt, or the first planted seed as an interactive example. This is the first thing a new user sees; it should set the tone.

8. **Delete the empty `src/client/utils/` directory** — It's a leftover from the cycle 003 refactor. Removing it keeps the repo clean and consistent with the documented no-`utils/` convention.

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
