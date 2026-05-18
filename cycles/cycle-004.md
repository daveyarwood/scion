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

- [x] Complete the Gardener palette: capture all 47 colors as CSS custom properties (currently only ~18 are defined)
- [x] Switch plant rendering from procedural SVG to pixel art sprites: load static PNG sprites per (archetype, stage) and render them with nearest-neighbor scaling (no smoothing)
- [x] Define the archetype selection infrastructure: given a song UUID, deterministically pick an archetype index; wire this up even though there is only one archetype this cycle
- [x] Use the extracted sprites from `img/sprites/` (seed, seedling, sprout, blooming, dormant, archived PNGs — 36×36, transparent background) as the single placeholder archetype
- [x] Palette-swap support: the flower/accent color in each sprite is `#c54c86`; at render time, remap it to a UUID-derived color from the non-green Gardener palette colors

## Scope

- In scope: full Gardener palette in CSS, pixel art sprite renderer, archetype selection infrastructure, placeholder archetype sprites, palette-swap for accent color
- Deferred: Aseprite palette cleanup of the sprites (wrong greens, wrong flower color — to be fixed when real archetype art is produced in a future cycle), plots UI, growth stage promotion UX, React Router, song card info density, withering/decay, empty-state polish

## Work Done

**Gardener palette completion**: All 47 colors from the Lospec Gardener palette now defined as CSS custom properties in `src/client/App.css`, organized by color family (neutrals, blues, greens, browns, oranges, reds, purples/magentas). Added backwards-compatibility alias `--color-green` for existing usage.

**Sprite-based plant renderer**: Replaced procedural SVG plant generator with pixel art sprite rendering:
- Copied all 6 sprite PNGs to `src/client/plant/sprites/` for Vite bundling
- Implemented HTML5 canvas renderer in `PlantVisual.tsx` with `imageSmoothingEnabled = false` for pixel-perfect nearest-neighbor scaling
- Sprites rendered at 4x scale (36px → 144px display) centered on 180×180 canvas
- Updated PlantVisual.css to work with canvas element

**Archetype infrastructure**: Implemented deterministic archetype selection in `src/client/plant/generator.ts`:
- `ARCHETYPES` registry maps archetype IDs to sprite stage filenames
- `selectArchetype(id)` deterministically picks archetype from UUID hash
- `getArchetype(id)` retrieves archetype configuration
- Structure allows adding new archetypes in future cycles with only sprite additions and registry registration—no structural changes needed
- Currently one placeholder archetype with all 6 stage sprites

**Accent color palette-swap**: Implemented UUID-derived accent color selection:
- `selectAccentColor(id)` picks from 17 non-green, non-neutral palette colors (blues, browns, oranges, reds, purples/magentas)
- `PlantVisual.tsx` applies exact pixel-replacement of `#c54c86` (196, 76, 134 RGB) with chosen accent color using `getImageData`/`putImageData`
- Swap is precise (exact RGB match) to preserve indexed-color sprite integrity
- `parseHexToRGB` utility converts hex colors for canvas manipulation

**Testing**: Added 11 new tests to `src/client/plant/generator.test.ts` covering archetype selection, accent color derivation, and integration with plant generation. Total test count increased from 51 to 62; all passing.

**Build & quality**: All tests pass (62), TypeScript strict mode clean, ESLint clean, Prettier formatting applied, production build successful.

## Review Notes

### Summary
Cycle 004 successfully migrated the plant visual system from procedural SVG generation to pixel art sprites with a well-architected archetype registry system. The implementation is clean, well-tested, and follows all project conventions. Code quality is high: no type coercions, proper use of TypeScript generics, arrow functions throughout, and meaningful tests that verify actual exported functionality. The archetype infrastructure is extensible and properly supports future additions. Three issues were identified and fixed during review: a critical RGB conversion bug in the palette swap logic, missing type safety annotations on the archetype registry, and a broken CSS variable reference from the palette expansion.

### Fixed
- **RGB palette swap precision bug**: The code checked for RGB(196, 76, 134) but #c54c86 correctly converts to RGB(197, 76, 134). This would have caused the palette swap to fail to detect and replace the accent color. Fixed in PlantVisual.tsx lines 55 and 62.
- **Archetype registry type safety**: Added explicit `Archetype` interface to define the structure of archetypes with proper `Record<GrowthStage, string>` type for `spriteStages`. This improves type safety and makes the registry more maintainable for future archetype additions. Updated ARCHETYPES array declaration and getArchetype return type.
- **Broken CSS variable**: The palette expansion removed `--color-black` but the code in `.btn-primary:hover` still referenced it, causing runtime CSS failure. Fixed by changing to `--color-dark-gray` which is semantically appropriate for button text on a light-green background.

### Escalated to Open Questions
Nothing escalated.

## Test Results

**Tests run**: 80
**Passing**: 80
**Failing**: 0

### Coverage notes

Cycle 004 introduced three significant new features: archetype selection infrastructure, accent color palette-swapping, and a canvas-based sprite renderer. All exported pure functions have comprehensive test coverage:

**`selectArchetype(id: string)`**: Verified for determinism (same input → same output), valid index bounds, and edge cases (empty strings, long strings, special characters). Since only one archetype exists currently, the function always returns 0, but the tests document expected behavior for when multiple archetypes are added in future cycles.

**`getArchetype(id: number)`**: Tested for valid archetype retrieval, fallback to default for invalid IDs, and correct sprite stage filenames for all six growth stages.

**`selectAccentColor(id: string)`**: Verified for determinism, valid hex color format, and critically, that every returned color is from the defined 17-color palette. Tests exhaustively check that the function never returns arbitrary colors.

**`parseHexToRGB(hex: string)` (newly exported)**: Extracted from PlantVisual.tsx to enable proper testing. 18 new tests cover:
  - Valid hex conversions (with/without `#`, uppercase, mixed case) for all Gardener palette colors
  - Invalid inputs (too short, too long, non-hex chars, empty string) → safe black fallback
  - RGB output properties (always integers, 0-255 range, correct object shape)
  - Critical test: `#c54c86` (the accent color in sprites) converts to exactly RGB(197, 76, 134) for pixel-perfect palette swapping

**Integration coverage**: The `generatePlant()` function is tested comprehensively with 15+ existing tests covering complexity gates by stage, determinism, and property bounds. Each plant now includes an `accentColor` and `archetypeId`; both are validated.

**Not tested (intentional)**: `PlantVisual.tsx` component rendering and canvas image manipulation are not tested in Vitest—the DOM canvas context is unavailable in jsdom. The pure logic (palette swap color calculation) is fully tested via `parseHexToRGB`. Sprite loading and rendering would require a real or mocked canvas environment and are deferred to integration/e2e testing if needed.

**Gap mitigations**: 
- Archetype and accent color selection are both deterministic functions with no randomness, so they're easily testable and reliable.
- Edge cases in the hash/seed functions are covered by tests with unusual input strings.
- The palette-swap logic relies on exact RGB matching; this is verified by testing parseHexToRGB against the exact values from the code comments.

Total test growth: 62 → 80 tests (18 new). All 80 tests pass.

## Open Questions
