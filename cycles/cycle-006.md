# Cycle 006

**Date**: 2026-05-21 17:15

## Brainstorm

### Last cycle summary

- Added the `budding` growth stage: new migration (`002_add_budding_stage.sql`), updated `GrowthStageEnum` (now 7 stages), updated `stageComplexity` and `maxLeaves` maps in `generator.ts`, and updated all downstream references including the edit modal UI.
- Sliced the Retro Diffusion sprite sheet into 28 individual PNGs (4 archetypes × 7 stages) using a Python alpha-gap detection script; saved into `src/client/plant/sprites/{tulip,hibiscus,cactus,mushroom}/`; retired old placeholder sprites.
- Registered all four archetypes (tulip, hibiscus, cactus, mushroom) in the archetype registry; `selectArchetype` now distributes songs across all four deterministically by UUID.
- Replaced the stage dropdown in the edit modal with ◀/▶ arrow buttons, and added ▲/▼ arrow buttons directly on each song card — stage changes are now a small ceremony rather than a form field edit.
- Extracted pure stage transition logic into `src/client/plant/stageTransitions.ts` (39 tests) and date formatting into `src/client/components/dateFormat.ts` (9 tests); both co-located with their domain rather than in a `utils/` catch-all.

### Current project status

The app is visually coherent and fully functional end-to-end. Every song displays a unique, real pixel-art plant sprite corresponding to its archetype and growth stage, and stage promotion feels intentional. The system is in good shape.

**What works:**
- Full CRUD loop: create → unique deterministic plant sprite (one of 4 archetypes) → click-to-edit title/body/stage → delete
- 7-stage lifecycle (seed → seedling → sprout → budding → blooming → dormant → archived) with promotion/demotion arrows on cards and in the modal; dormant/archived unreachable via UI
- 28 real pixel-art sprites bundled and rendering at 4× nearest-neighbor scale
- Gardener palette CSS custom properties throughout; consistent lo-fi aesthetic
- 116 tests, all passing; strict TypeScript, zero type coercions

**What is incomplete or stubbed:**
- **Palette ramp swap**: `selectAccentColor`, `parseHexToRGB`, and the accentRamp design in SPRITES.md are all ready, but `PlantVisual.tsx` still has a `// TODO: palette ramp swap` comment. This is the most significant gap between "works" and "works the way it was designed to." Every song renders with the same pink accent color — the per-UUID color differentiation that was designed in cycles 003–004 is not yet visible.
- **Sprites are not palette-constrained**: The sliced sprites almost certainly contain more than the 10 allowed palette colors (Retro Diffusion ignores palette constraints). The Aseprite cleanup workflow in SPRITES.md documents how to fix this, but it has not been done. The palette ramp swap cannot work correctly until the sprites use exactly the 4 accent-ramp colors.
- **Slicing algorithm has a known issue**: SPRITES.md contains a callout warning that the column-boundary detection has known problems. No specific description of what's wrong was recorded, which means the next person to re-slice will need to investigate.
- **Song cards show body text but truncation is unstyled**: The `body` field renders in full on cards, which can overflow in the grid. A proper truncation/preview style is missing.
- **Empty state is minimal**: A generic fallback with no garden metaphor or illustration.

**What is missing entirely:**
- Plots UI (`plot_id` has been in the DB since migration 001, but has no UI surface)
- React Router / client-side routing — still a single-page app; no shareable URLs
- Audio file uploads
- Withering/decay, Alda integration (documented as future ideas)
- Any concept of search, filtering, or sorting songs

### Trajectory & observations

- **The palette ramp swap is the one remaining visual goal from the original design.** The entire accent-color pipeline (UUID → `selectAccentColor` → `parseHexToRGB` → canvas pixel remap) was designed over cycles 003–004 and stubbed in the renderer in cycle 004. It has been deferred two cycles in a row because it requires palette-constrained sprites. That prerequisite is now clearly documented and the workflow is in SPRITES.md. This cycle is the natural time to close the loop — it's been waiting long enough that not doing it starts to feel like permanent deferral.
- **The sprite quality issue is a hidden debt.** The slicing alert in SPRITES.md ("known problems, check the cycle log") is a loose end: there is no cycle log entry describing what went wrong. Before re-slicing or implementing the ramp swap, someone needs to characterize the problem. This is a small but real ambiguity to resolve.
- **The app is approaching a "feature-complete v0."** After the palette ramp swap, the core visual identity of the app will match its original design intent. The next natural phase is either: (a) making the app more useful as a sketchbook (body preview, search, React Router, audio), or (b) going deeper on the living-things metaphor (plots, withering, ceremonial stage advancement). Both are coherent directions; the choice is a product question.
- **The `promotable_stages` list is duplicated.** `SongCard.tsx` and `SongEditModal.tsx` each define `const promotableStages: GrowthStage[]` locally instead of importing `PROMOTABLE_STAGES` from `stageTransitions.ts` (which was extracted precisely for this reason). This is a small inconsistency that should be cleaned up.
- **Test count discrepancy.** Cycle 005's final test results section reports 129 tests, but the actual suite currently has 116. The discrepancy likely came from an intermediate state where generator tests were higher before some were pruned. Not a bug, but worth noting to avoid future confusion.

### Suggestions for this cycle

1. **Fix the palette-constrained sprites via the Aseprite workflow** — Run the Aseprite cleanup workflow documented in SPRITES.md on the current sprite sheet; verify with the Python palette-compliance script; re-slice. This is the prerequisite for the ramp swap and has been deferred long enough. Investigate and document the "known slicing issue" as part of this work.

2. **Implement the palette ramp swap in `PlantVisual.tsx`** — With palette-constrained sprites in place, implement the `getImageData`/`putImageData` pixel remap: each archetype declares `accentRamp` (4 source shades), `selectAccentColor` picks a target Gardener ramp, and each source shade maps positionally to the corresponding target shade. Every song will then have a visually distinct flower/cap color. This closes a design goal that has been ready-but-blocked for two cycles.

3. **Use `PROMOTABLE_STAGES` from `stageTransitions.ts` in `SongCard` and `SongEditModal`** — Both components define a local `promotableStages` array that duplicates `PROMOTABLE_STAGES` from the module that was extracted for this exact purpose. Import and use the shared constant; remove the duplicates. Small change, eliminates a real inconsistency.

4. **Song card body preview with proper truncation** — The card currently renders the full `body` text, which overflows on longer entries. Clamp to 2–3 lines with CSS `line-clamp`, or truncate to ~100 characters. Small CSS/logic change that noticeably improves the grid's visual consistency.

5. **Empty state polish** — The "no songs yet" fallback has no personality. Replace it with something that reinforces the garden metaphor — a brief prompt ("Plant your first seed…") and optionally a small illustration using one of the existing sprites. Low effort, high first-impression value.

6. **Add React Router (`react-router-dom`)** — Set up `/` (garden grid) and `/songs/:id` (song detail / full edit view). The modal-based edit UX works but limits the amount of content that fits. A dedicated song detail page would accommodate richer body editing, future audio upload, and shareable URLs. Small dependency addition, large option value for everything that follows.

7. **Resolve and document the slicing algorithm issue** — SPRITES.md contains a vague warning that the column-boundary detection "has known problems" with no specifics. Even if the sprites aren't being re-sliced this cycle, the warning should either be replaced with a clear description of the problem (so it can be fixed) or removed if it's no longer relevant. Ambiguous warnings are technical debt in documentation.

8. **Plots UI groundwork** — `plot_id` has been in the DB schema since day one. A minimal plots feature — create a plot, assign songs to it, filter the grid by plot — would make Scion genuinely useful for organizing ideas across projects. Not a small task, but the data model requires no migration; it's purely a UI and tRPC procedure addition.

## Goals

- [ ] Implement palette ramp swap in `PlantVisual.tsx`: each archetype declares an `accentRamp` (4 source shades shadow→highlight), `selectAccentColor` picks a target Gardener ramp by UUID, and `getImageData`/`putImageData` remaps accent pixels at render time
- [ ] Fix duplicated `promotableStages` arrays in `SongCard.tsx` and `SongEditModal.tsx` — import `PROMOTABLE_STAGES` from `stageTransitions.ts` instead
- [ ] Song card body preview: clamp body text to 2–3 lines with CSS `line-clamp` on cards
- [ ] Empty state polish: replace the generic fallback with a garden-themed prompt; optionally include a small sprite illustration

## Scope

- In scope: palette ramp swap, promotableStages deduplication, card body preview, empty state polish
- Deferred: React Router, plots UI, audio uploads, withering/decay

## Work Done

<!-- to be filled in by cycle-developer -->

## Review Notes

<!-- to be filled in by cycle-reviewer -->

## Test Results

<!-- to be filled in by cycle-tester -->

## Open Questions
