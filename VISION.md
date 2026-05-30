# Scion — Vision & Design

This is the living design document for Scion. It captures the product vision, aesthetic direction, core metaphors, and ideas for the future. Cycle files record *what was built and why*; this file records *what we're building toward*.

## What is Scion?

A personal creative sketchbook for musical fragments. Song ideas are represented as **plants** — living things you can tend and develop over time. Each idea starts as a seed and grows as you flesh it out.

Scion is local-first, intended for personal use, with social and collaborative features as a future possibility.

## The plant metaphor

The soul of the product. Musical ideas are living things, not documents. You cultivate them.

- **Seed** — a brand new idea, raw and untested
- **Seedling** — you've started developing it; some structure or notes exist
- **Sprout** — clearly recognizable as a song in progress
- **Budding** — developing; the main elements are visible but not complete
- **Blooming** — full expression; the idea is realized
- **Dormant** — set aside, not abandoned; may be revived
- **Archived** — complete or permanently shelved

Stage advancement is manual for now. Future ideas: automatic advancement based on content richness, decay/withering for neglected ideas.

Each song has a **plant visual** — a pixel-art sprite that changes per growth stage. The archetype (tulip, hibiscus, cactus, mushroom) and accent color ramp are assigned at creation and stored in the database, giving each song a stable, unique visual identity.

## Aesthetic direction

- **lo-fi, garden-themed, pixel art** — the Gardener palette throughout; sharp corners; monospace fonts; chunky borders and shadows
- **all lowercase UI chrome** — labels, buttons, headings, stage names; user-entered data is exempt
- **Gardener palette** ([lospec.com/palette-list/gardener](https://lospec.com/palette-list/gardener)) — 47 colors defined as CSS custom properties; sprite accent colors are a 10-color constrained subset

### Future aesthetic ideas

- **Animated backgrounds per card** — pixel patterns (dots, stripes, geometry) or a complementary background color behind each plant; could be algorithmically generated from the accent ramp
- **Simulated wind** — subtle `requestAnimationFrame` sprite offset on a slow sine curve
- **Animated specks** — pixel particles drifting behind each plant; speck count tied to growth stage (more specks = more alive)
- **Multiple color palette themes** — a dropdown to switch between predefined Gardener-style palettes (or define your own); affects both UI and sprite accent colors at creation time

## Plant visuals

- 4 archetypes: tulip, hibiscus, cactus, mushroom
- 7 PNG sprites per archetype (28 total); 64px tall, bottom-aligned, palette-constrained
- Nearest-neighbor scaling at 3× (canvas 128×192px)
- Accent pixels palette-swapped at render time via `getImageData`/`putImageData`
- **Archetype and accent ramp are stored in the DB** (added cycle 008) — stable for the lifetime of the song, regardless of future generator changes
- Accent ramp stored as verbatim hex values (4-tuple), not an index — future-proof against ramp list changes, and opens the door to user-customizable colors

### Adding new archetypes or palettes

See `src/client/plant/sprites/SPRITES.md` for the Retro Diffusion prompt, Aseprite cleanup workflow, palette constraints, and slicing instructions.

## Song content — future direction

The current `body` field is a single text area. The vision is a **node-based content system**: each song has an ordered list of typed content nodes, each with its own shape. You pick which nodes to add from a menu; nodes are repeatable.

Planned node types:
- notes (free text)
- lyrics
- chords / chord sequence
- key / tuning
- instrumentation
- style / genre
- composition notes
- alda fragment (notation text for the Alda engine)
- audio (uploaded file)
- sheet music

The data model: a `song_nodes` table (`id`, `song_id`, `type`, `content` JSON, `position`, `created_at`). This is deferred but informs the routing architecture — the edit surface needs a full page, not a modal.

## Organization

### Labels (planned)

A many-to-many tag system for songs. Each label has a name and a randomly assigned Gardener-palette color. Labels can be used for anything: projects, genres, instruments, tunings, moods, etc.

- A song can have many labels; a label can apply to many songs
- Filter the garden grid by label
- Data model: `labels` table + `song_labels` join table; no migration dependency on existing `plot_id` column

### Plots (undecided)

`plot_id` has been in the `songs` schema since migration 001 as a top-level grouping mechanism (one song belongs to one plot). Whether plots and labels are complementary or redundant is an open question. Decision: implement labels first, then revisit whether a strict hierarchy (plots) adds value on top.

## Song name generator

Fully implemented in cycle 009. The title generator uses hand-curated word lists in two registers (eclectic/bureaucratic and common/everyday) with 50/50 blending per slot, producing evocative collisions like "non-provisional oyster", "undermining songs", "the requisitioned mother".

**Current implementation:**
- `src/shared/titleWords.ts` — curated nouns, verbs, gerunds, adjectives in eclectic and common registers; includes CS/distributed systems terms and colors
- `src/shared/titleGenerator.ts` — weighted template system: simple (~55%), extended (~30%), recursive (~10%), exclamation (~5%); 30+ templates including `[adj] [noun]`, `[verb] the [noun]`, `[noun] / [noun]`, `[noun]!`, `[any] (pt. 1)`, etc.
- Server populates `title` on `song.create` when omitted (calls `generateTitle()`)
- "+ new seed" button creates immediately and navigates to edit page (no form)
- Dice button (⚄) on edit page for client-side re-rolls
- `yarn seed` uses server-generated titles

**Future ideas:**
- Tunable blend ratio between eclectic/common registers (currently hardcoded 50/50)
- User-provided word lists or custom templates
- Per-song title history (show previously generated titles for that song)

## Navigation and routing

React Router (`react-router-dom`) was added in cycle 008:
- `/` — garden grid (`GardenPage`)
- `/songs/:id` — song edit/detail page (`SongEditPage`)

The edit page replaced the old modal and provides room for the node-based content system, plant visual display, and future appearance editing controls.

## Appearance editing

Currently fixed at creation time (randomly assigned). Future direction:
- Show appearance controls on the song detail page
- Allow editing archetype and accent ramp
- Possible gamification: appearance editing unlocked after a song reaches a certain stage, or after N days of active development

## Audio

Deferred. Backend architecture already accommodates it (`data/` directory is gitignored and sized for files). Will be one node type in the content node system.

## Alda integration

Deferred. Input Alda notation text, play it back via the Alda engine. Will be one node type in the content node system.

## Withering / decay

Deferred. Song plants could wither if not tended. Lightest implementation: a `last_tended_at` timestamp + a visual wilting indicator on cards idle for N days. Makes the lifecycle feel organic.

## Social / collaboration

Future monetization direction. Not in scope for the local-first phase.

## Decisions made and why

| Decision | Rationale |
|---|---|
| Store `archetype` + `accent_ramp` in DB, not derived from UUID | Decouples visual identity from generator code; adding new archetypes/ramps won't change existing songs; enables user-editable appearance |
| Accent ramp stored as hex values, not index | Index couples data to the current `ACCENT_RAMPS` array; hex values are self-contained and forward-compatible |
| Labels over plots as first org primitive | Many-to-many tags map better to how music actually works; a song can be ambient, guitar, and DADGAD simultaneously; strict hierarchy (plots) deferred |
| No `utils/` directories | Catch-all utils accumulate unrelated code; co-locate modules with their domain instead |
| No ORMs | Raw SQL via better-sqlite3 is transparent, fast, and appropriate for local-first personal software |
| Migrations are append-only | No down migrations; write a new migration to reverse a change |
| Zod as single source of truth | Infer TypeScript types from Zod schemas; never duplicate type definitions |
| No type coercions (`as`, `!`) | They hide real type errors; fix the design instead |
| All-lowercase UI chrome | Matches lo-fi garden aesthetic; user-entered data is exempt |
