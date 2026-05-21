#!/usr/bin/env python3
"""
Slice a palette-cleaned sprite sheet into individual archetype/stage PNGs.

The sheet must have already been processed through the Aseprite palette cleanup
workflow (see SPRITES.md) before running this script. Run check-palette.py on
the sheet first to confirm compliance.

Usage:
    python3 scripts/slice-sprites.py img/<your-aseprite-export>.png

Output files are written to src/client/plant/sprites/{archetype}/{stage}.png.

Each sprite is tight-cropped to its content bounding box and bottom-aligned on
a 64px-tall canvas, ensuring a consistent ground line across all archetypes
regardless of how Retro Diffusion positioned content within each row.
"""

import sys
import os
from PIL import Image
import numpy as np

ARCHETYPES = ['tulip', 'hibiscus', 'cactus', 'mushroom']
STAGES = ['seed', 'seedling', 'sprout', 'budding', 'blooming', 'dormant', 'archived']
CANVAS_H = 64
OUT_DIR = 'src/client/plant/sprites'


def find_bands(has_content: np.ndarray) -> list[tuple[int, int]]:
    """Return (start, end) index pairs for contiguous True runs."""
    in_band = False
    bands = []
    start = 0
    for i, v in enumerate(has_content):
        if v and not in_band:
            start = i
            in_band = True
        elif not v and in_band:
            bands.append((start, i))
            in_band = False
    if in_band:
        bands.append((start, len(has_content)))
    return bands


if len(sys.argv) != 2:
    print(f"Usage: {sys.argv[0]} <sprite-sheet.png>")
    sys.exit(1)

sheet_path = sys.argv[1]
img = Image.open(sheet_path).convert('RGBA')
arr = np.array(img)
opaque = arr[:, :, 3] > 10

row_bands = find_bands(opaque.any(axis=1))
if len(row_bands) != len(ARCHETYPES):
    print(f"ERROR: expected {len(ARCHETYPES)} row bands, found {len(row_bands)}")
    sys.exit(1)

for i, (rs, re) in enumerate(row_bands):
    archetype = ARCHETYPES[i]
    row_arr = arr[rs:re]
    col_segs = find_bands((row_arr[:, :, 3] > 10).any(axis=0))
    if len(col_segs) != len(STAGES):
        print(f"ERROR: expected {len(STAGES)} column segments for {archetype}, found {len(col_segs)}")
        sys.exit(1)
    for j, (cs, ce) in enumerate(col_segs):
        stage = STAGES[j]
        sprite = arr[rs:re, cs:ce]

        # Tight crop to content bounding box
        opq = sprite[:, :, 3] > 10
        rows_c = np.where(opq.any(axis=1))[0]
        cols_c = np.where(opq.any(axis=0))[0]
        cropped = sprite[rows_c[0]:rows_c[-1] + 1, cols_c[0]:cols_c[-1] + 1]
        ch, cw = cropped.shape[:2]

        if ch > CANVAS_H:
            print(f"WARNING: {archetype}/{stage} content height {ch}px exceeds canvas {CANVAS_H}px — will be clipped")

        # Bottom-align on fixed-height canvas
        canvas = np.zeros((CANVAS_H, cw, 4), dtype=np.uint8)
        canvas[max(0, CANVAS_H - ch):] = cropped[:min(ch, CANVAS_H)]

        out_path = os.path.join(OUT_DIR, archetype, f'{stage}.png')
        Image.fromarray(canvas).save(out_path)
        print(f'  {archetype}/{stage}: {cw}x{ch} -> {cw}x{CANVAS_H}')

print(f"\nSliced {len(ARCHETYPES) * len(STAGES)} sprites into {OUT_DIR}/")
print("Run check-palette.py on the output files to verify compliance.")
