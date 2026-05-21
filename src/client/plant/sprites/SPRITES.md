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

A JASC .pal file for this 10-color palette is at `src/client/plant/sprites/scion-sprites.pal`.

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

## Aseprite palette cleanup workflow

Retro Diffusion will likely ignore the palette constraints in the prompt and produce
hundreds of colors. Every generated sheet needs to be cleaned up in Aseprite before
slicing.

1. **Open the sheet** in Aseprite.

2. **Load the restricted palette**
   - Palette menu (bottom of screen) → ≡ → Load Palette
   - Select `src/client/plant/sprites/scion-sprites.pal`
   - This loads exactly the 10 allowed colors. Do NOT load the full Gardener palette —
     it contains 47 colors and will cause Aseprite to remap to the wrong shades.

3. **Convert to Indexed color mode**
   - Sprite menu → Color Mode → Indexed
   - In the dialog, choose **Remap** (not Dither)
   - This snaps every pixel to the nearest of the 10 palette colors

4. **Review the result**
   - Zoom in and check accent elements (petals, mushroom caps) are using the pink/dark-red
     ramp and not green or soil colors
   - Check that transparent areas are still transparent (indexed mode can accidentally
     fill them — undo and retry with "Remap" if so)

5. **Export as PNG**
   - File → Export As → save to `img/` (gitignored scratch space)
   - Keep the filename distinct from the original (e.g. append ` - aseprite edit 2`)

6. **Verify palette compliance**
   - Run the Python snippet below from the repo root. It should report 0 unexpected colors.

   ```python
   from PIL import Image
   import numpy as np

   img = Image.open('img/<your-file>.png').convert('RGBA')
   arr = np.array(img)

   allowed = {
       (25,54,40),(53,99,42),(101,153,57),(162,191,94),(217,216,158),
       (75,25,43),(129,39,55),(197,76,134),(230,115,146),(156,102,94),
   }

   opaque = arr[:,:,3] > 10
   colors = set(map(tuple, arr[opaque][:,:3].tolist()))
   unexpected = colors - allowed
   print(f'{len(colors)} colors found, {len(unexpected)} unexpected')
   for c in sorted(unexpected):
       print(f'  #{c[0]:02x}{c[1]:02x}{c[2]:02x}')
   ```

   If unexpected colors appear, go back to step 3 and try again — usually caused by
   loading the wrong palette before converting.

7. **Slice into individual sprites**

   Run the following Python snippet from the repo root. It detects row bands and column
   segments by alpha gap analysis, crops each sprite to its tight content bounding box,
   and bottom-aligns it on a 64px-tall canvas before saving.

   ```python
   from PIL import Image
   import numpy as np

   img = Image.open('img/<your-aseprite-export>.png').convert('RGBA')
   arr = np.array(img)
   h, w = arr.shape[:2]
   opaque = arr[:,:,3] > 10

   def find_bands(has_content):
       in_band = False; bands = []
       for i, v in enumerate(has_content):
           if v and not in_band: start = i; in_band = True
           elif not v and in_band: bands.append((start, i)); in_band = False
       if in_band: bands.append((start, len(has_content)))
       return bands

   archetypes = ['tulip', 'hibiscus', 'cactus', 'mushroom']
   stages = ['seed', 'seedling', 'sprout', 'budding', 'blooming', 'dormant', 'archived']
   CANVAS_H = 64

   row_bands = find_bands(opaque.any(axis=1))
   assert len(row_bands) == 4, f"Expected 4 rows, got {len(row_bands)}"

   for i, (rs, re) in enumerate(row_bands):
       row_arr = arr[rs:re]
       col_segs = find_bands((row_arr[:,:,3] > 10).any(axis=0))
       assert len(col_segs) == 7, f"Expected 7 cols for {archetypes[i]}, got {len(col_segs)}"
       for j, (cs, ce) in enumerate(col_segs):
           sprite = arr[rs:re, cs:ce]
           # Tight crop to content bounding box
           opq = sprite[:,:,3] > 10
           rows_c = np.where(opq.any(axis=1))[0]
           cols_c = np.where(opq.any(axis=0))[0]
           cropped = sprite[rows_c[0]:rows_c[-1]+1, cols_c[0]:cols_c[-1]+1]
           ch, cw = cropped.shape[:2]
           # Bottom-align on fixed-height canvas
           canvas = np.zeros((CANVAS_H, cw, 4), dtype=np.uint8)
           canvas[CANVAS_H-ch:] = cropped
           Image.fromarray(canvas).save(
               f'src/client/plant/sprites/{archetypes[i]}/{stages[j]}.png'
           )
           print(f'{archetypes[i]}/{stages[j]}: {cw}x{ch} -> {cw}x{CANVAS_H}')
   ```

   After slicing, run the palette compliance check from step 6 against the individual
   sprite files to confirm nothing went wrong.

   **Notes on the slicing approach:**
   - Retro Diffusion does not guarantee consistent vertical alignment within rows — some
     archetypes are bottom-aligned, others are centered. The tight-crop + bottom-align
     step is essential; skipping it produces inconsistent ground lines across archetypes.
   - Always slice from the Aseprite-exported file, not from the raw Retro Diffusion
     output. The raw sheet is in `img/` for reference but must not be sliced directly.
   - Stage filenames must match the `GrowthStage` enum values exactly:
     `seed`, `seedling`, `sprout`, `budding`, `blooming`, `dormant`, `archived`
