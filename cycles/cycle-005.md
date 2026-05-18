# Cycle 005

**Date**: 2026-05-17 21:00

## Brainstorm

### Last cycle summary

- Migrated plant visuals from procedural SVG generation to pixel art sprite rendering: a canvas-based renderer with nearest-neighbor scaling (4×) replaced the SVG generator, using a single placeholder archetype with six stage-specific PNGs.
- Built the full archetype registry infrastructure in `generator.ts`: `selectArchetype`, `getArchetype`, and the `Archetype` interface are in place and structured to accept new archetypes with only sprite additions — no structural changes.
- Completed the Gardener palette: all 47 colors are now defined as CSS custom properties, organized by family, with a backwards-compatibility alias.
- Implemented `selectAccentColor` and `parseHexToRGB` as exported, tested utilities ready for the palette ramp swap; the actual ramp swap was deferred (TODO comment in `PlantVisual.tsx`) pending palette-constrained sprites from a proper pixel art tool.
- A post-cycle code review caught and fixed three issues: an off-by-one bug in the RGB value for `#c54c86` (197, not 196), missing explicit `Archetype` interface on the registry, and a broken `--color-black` CSS variable reference.
- Test suite grew from 62 to 80 tests; all passing with TypeScript strict mode and zero type coercions throughout.

### Current project status

The app works end-to-end and has a coherent aesthetic, but the plant visual system is in a halfway state: the archetype infrastructure is solid, yet only one placeholder archetype exists (with old ChatGPT-generated sprites), and the palette ramp swap is unimplemented. A proper sprite sheet now exists (`img/Retro Diffusion - sprite sheet.png`) with four real archetypes (tulip, hibiscus, cactus, mushroom) × 7 growth stages per row — but none of this is wired into the app yet.

**What works:**
- Full CRUD loop: create → unique plant sprite → click to edit title/body/stage → delete
- Archetype registry + deterministic selection by UUID — ready to accept real archetypes
- All 47 Gardener palette colors as CSS custom properties
- 80 focused tests, strict TypeScript, zero type coercions

**What is mismatched or incomplete:**
- The live app still renders the old single placeholder archetype sprites; the four real archetypes are sitting in `img/sprites/{tulip,hibiscus,cactus,mushroom}/` but not bundled or registered
- The growth stage schema has six stages (`seed → seedling → sprout → blooming → dormant → archived`), but the new sprite sheet has **seven** sprites per row — the model generated a "budding" stage between sprout and blooming that we want to adopt. Schema, Zod enum, shared types, stageComplexity map, and generator all need updating.
- `img/sprites/` subdirectories contain old 6-stage placeholder slices that are now obsolete and inconsistent with both the new sheet and the intended 7-stage schema.
- `src/client/plant/sprites/` contains the single old placeholder archetype's sprites — these will be replaced.
- Palette ramp swap is still a TODO comment; won't be meaningful until sprites are palette-constrained.

**What is missing entirely:**
- Plots UI, audio file uploads, React Router, withering/decay, Alda integration (all deferred from prior cycles)
- Automatic or ceremonial growth stage advancement

**Gap to next milestone:** The most pressing work is purely visual coherence: slice the new sprite sheet properly (7 stages × 4 archetypes), add `budding` to the schema, register all four archetypes, and retire the placeholder. Once done, the app will look the part and the archetype infrastructure built in cycle 004 will actually be exercised.

### Trajectory & observations

- **The sprite sheet is the unlock.** Cycle 004 built the frame; cycle 005 hangs the art. The archetype registry, canvas renderer, and deterministic selection are all already in place — wiring up real archetypes is primarily a data pipeline task (slice → bundle → register), not a new architectural problem. This cycle has an unusually clear "done" criterion.
- **The `budding` stage is a genuine design gift.** Seven stages is a richer lifecycle than six, and `budding` fills a real semantic gap (a song that's past sprout but not yet in full bloom). Adding it now, while the schema is still simple, is much cheaper than retrofitting it later. It also forces a deliberate look at the stageComplexity map and the edit modal's stage selector.
- **The palette ramp swap becomes achievable.** The current placeholder sprites are anti-aliased ChatGPT PNGs; the new Retro Diffusion sprites are pixel art likely using a constrained palette. Once the real sprites are bundled, implementing the ramp swap (remapping source shades to a UUID-derived Gardener ramp) becomes a concrete, testable task rather than a deferred aspiration.
- **Data model stability point approaching.** After adding `budding`, the growth stage enum will have been touched twice. Before adding more stages or structural changes, it's worth considering whether the lifecycle is now "right" — locking it down makes the rest of the system easier to reason about.
- **The `img/` directory is becoming a source of confusion.** It holds both the master sprite sheet, intermediate row slices, and old per-archetype subdirectory slices. A cleanup pass (clearly separating "source assets" from "bundled client assets") will pay off before this directory grows further.

### Suggestions for this cycle

1. **Add `budding` to the growth stage schema** — Update `GrowthStageEnum` in `src/shared/index.ts`, the `stageComplexity` and `maxLeaves` maps in `generator.ts`, and the edit modal's stage selector. This is a prerequisite for the sprite work since the new sheet has 7 stages. Schema migration is not required (growth stage is stored as text), but the Zod enum change cascades through shared types, server validation, and client UI.

2. **Slice the new sprite sheet and register all four archetypes** — Write a script (or document the manual process) to slice `img/Retro Diffusion - sprite sheet.png` into 4 × 7 individual PNGs, copy them into `src/client/plant/sprites/{tulip,hibiscus,cactus,mushroom}/`, and register all four archetypes in `generator.ts`. The renderer and deterministic selection already work; this is the wiring step. Delete or archive the obsolete placeholder sprites from `src/client/plant/sprites/` and `img/sprites/`.

3. **Implement the palette ramp swap** — Now that real pixel-art sprites are in place, implement the accent color remapping in `PlantVisual.tsx`: each archetype declares an `accentRamp` (ordered source shades shadow→highlight), `selectAccentColor` picks a target Gardener ramp, and `getImageData`/`putImageData` does a positional shade-to-shade remap at render time. This gives each song a visually distinct flower color based on its UUID.

4. **Growth stage promotion UX** — Replace the raw dropdown in the edit modal with a more intentional "promote / demote" interaction: a dedicated advance button with a label explaining the target stage. This is low effort but high meaning — promoting a song should feel like a small ceremony, not a form field change.

5. **Song card info density** — Show a truncated `body` preview and a relative timestamp ("3 days ago") on each card. The grid currently shows only title + plant; adding a text preview makes cards feel like actual sketchbook entries. Small CSS change, no backend work.

6. **Clean up the `img/` asset directory** — Move the master sprite sheet to a clearly named source location, remove or archive the old sliced placeholder subdirectories, and add a brief README in `img/` explaining what lives there and how to regenerate slices. This prevents the scratch directory from becoming an archaeological site.

7. **Client-side routing with React Router** — Add `react-router-dom` and set up `/` (garden grid) and `/songs/:id` (song detail). Still only one real view, but this unblocks shareable URLs, a future plots view, and anything else that deserves its own screen. Small investment, large option value.

8. **Empty-state polish** — Replace the generic "No seeds yet" fallback with something that reinforces the garden metaphor. Now that real plant sprites exist, the empty state could show a faint illustration or a welcoming prompt that matches the aesthetic of the actual cards. First impressions matter.

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
