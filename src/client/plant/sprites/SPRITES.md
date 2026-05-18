# Sprite Generation Notes

Sprites were generated using [Retro Diffusion](https://www.retrodiffusion.ai/).

## Current sheet layout

- 256×256px, transparent background
- 4 rows (archetypes) × 7 columns (growth stages)
- Each cell is approximately 32×64px (column widths are non-uniform as generated)
- Sliced into individual PNGs per archetype/stage at build time

## Growth stages (columns, left to right)

1. Seed
2. Seedling
3. Sprout
4. Budding
5. Blooming
6. Dormant
7. Archived

Note: The original prompt used 6 stages. `Budding` was added when Retro Diffusion generated
7 columns instead of 6 — it maps naturally between Sprout and Blooming.

## Archetypes (rows, top to bottom)

1. Tulip — single stem, narrow leaves, cup-shaped flower
2. Hibiscus — bushy, broad leaves, large trumpet flowers
3. Cactus — chunky body with spines, small top bloom at blooming only
4. Mushroom — short stem, large rounded cap that grows from a tiny button to a full dome

## Accent elements (palette-swapped at runtime)

- Tulip: petals
- Hibiscus: petals
- Cactus: top bloom (blooming stage only)
- Mushroom: entire cap (all stages)

## Palette constraints

Accent pixels must use ONLY:
```
#4b192b  #812737  #c54c86  #e67392
```

All other pixels must use ONLY:
```
#193628  #35632a  #659939  #a2bf5e  #d9d89e  #9c665e
```

A JASC .pal file for this 10-color palette is at `img/scion-sprites.pal` (gitignored;
regenerate from the colors above if needed).

## Retro Diffusion prompt

Use this prompt to regenerate or add new archetypes. Adjust the row count and archetype
list as needed.

```
Pixel art sprite sheet, 256×256px. 4 rows, 7 columns. Each cell is exactly 32×64px.
Transparent background. No anti-aliasing, gradients, or dithering — hard pixel edges only.

Rows (archetypes):
1. Tulip — single stem, narrow leaves, cup-shaped flower
2. Hibiscus — bushy, broad leaves, large trumpet flowers
3. Cactus — chunky body with spines, small top bloom at blooming only
4. Mushroom — short stem, large rounded cap that grows from a tiny button to a full dome

Columns (growth stages, left to right):
1. Seed — small seed or mound, no stem
2. Seedling — just emerged, short stem
3. Sprout — clearly recognizable young plant
4. Budding — developing, accent element visible but small
5. Blooming — full height, accent element large and prominent
6. Dormant — wilting or bare, no accent element, muted
7. Archived — skeletal, dried out, minimal pixels

Each archetype has an accent element that will be palette-swapped at runtime. Accent
pixels must use ONLY:
#4b192b #812737 #c54c86 #e67392

Accent elements: tulip = petals, hibiscus = petals, cactus = top bloom (blooming only),
mushroom = entire cap (all stages).

All other pixels must use ONLY:
#193628 #35632a #659939 #a2bf5e #d9d89e #9c665e
```

## Post-generation workflow

1. Open sheet in Aseprite
2. Load the 10-color palette (`img/scion-sprites.pal`) — do NOT load the full Gardener palette
3. Sprite > Color Mode > Indexed, select "Remap" to snap all pixels to the nearest palette color
4. Export as PNG
5. Verify compliance: run the palette-check script (or adapt the inline Python used during cycle 005)
6. Slice into individual PNGs and replace files in `src/client/plant/sprites/{archetype}/{stage}.png`
