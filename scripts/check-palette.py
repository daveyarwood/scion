#!/usr/bin/env python3
"""
Verify that a sprite sheet or individual sprite PNG uses only the 10 allowed
Scion palette colors (ignoring fully-transparent pixels).

Usage:
    python3 scripts/check-palette.py img/<your-file>.png
    python3 scripts/check-palette.py src/client/plant/sprites/tulip/blooming.png

Exits with code 0 if all colors are compliant, 1 otherwise.
"""

import sys
from PIL import Image
import numpy as np

ALLOWED = {
    (25, 54, 40),   # #193628
    (53, 99, 42),   # #35632a
    (101, 153, 57), # #659939
    (162, 191, 94), # #a2bf5e
    (217, 216, 158),# #d9d89e
    (75, 25, 43),   # #4b192b
    (129, 39, 55),  # #812737
    (197, 76, 134), # #c54c86
    (230, 115, 146),# #e67392
    (156, 102, 94), # #9c665e
}

if len(sys.argv) < 2:
    print(f"Usage: {sys.argv[0]} <image.png> [image2.png ...]")
    sys.exit(1)

any_fail = False
for path in sys.argv[1:]:
    img = Image.open(path).convert('RGBA')
    arr = np.array(img)
    opaque = arr[:, :, 3] > 10
    if not opaque.any():
        print(f"{path}: EMPTY (no opaque pixels)")
        continue
    colors = set(map(tuple, arr[opaque][:, :3].reshape(-1, 3).tolist()))
    unexpected = colors - ALLOWED
    if unexpected:
        print(f"{path}: FAIL — {len(unexpected)} unexpected color(s)")
        for c in sorted(unexpected):
            print(f"  #{c[0]:02x}{c[1]:02x}{c[2]:02x}  rgb{c}")
        any_fail = True
    else:
        print(f"{path}: OK ({len(colors)} color(s))")

sys.exit(1 if any_fail else 0)
