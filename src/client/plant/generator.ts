import { GrowthStage } from '../../shared/index';

export interface PlantData {
  stemHeight: number;
  stemCurve: number;
  leafCount: number;
  leafAngles: number[];
  hue: string;
  complexity: number;
  archetypeId: number;
  accentColor: string;
}

/**
 * Simple hash function to convert a string into a numeric seed.
 * Deterministic: same input always produces same output.
 */
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    // Convert to 32-bit integer
    hash = hash & hash;
  }
  // Convert to positive number between 0 and 1
  return (Math.abs(hash) % 10000) / 10000;
};

/**
 * Generate a pseudo-random number from a seed.
 * Deterministic: same seed always produces same output.
 */
const seededRandom = (seed: number, index: number = 0): number => {
  const combined = (seed * (index + 1) * 9973) % 1;
  return Math.abs(Math.sin(combined * 12.9898) * 43758.5453) % 1;
};

/**
 * Archetype registry: each archetype represents a plant type.
 * Currently only one archetype (placeholder), but structured to support more.
 */
const ARCHETYPES = [
  {
    id: 0,
    name: 'placeholder',
    spriteStages: {
      seed: 'seed.png',
      seedling: 'seedling.png',
      sprout: 'sprout.png',
      blooming: 'blooming.png',
      dormant: 'dormant.png',
      archived: 'archived.png',
    },
  },
];

/**
 * Accent colors (non-green, non-neutral Gardener palette colors).
 * These are available for palette-swapping from #c54c86 in sprites.
 */
const ACCENT_COLORS = [
  '#254265', // dark-blue
  '#3975a9', // blue
  '#51a2c9', // light-blue
  '#81c6d8', // sky-blue
  '#6b4446', // dark-brown
  '#9c665e', // brown
  '#d4a78d', // tan
  '#984c39', // rust
  '#c97743', // burnt-orange
  '#ecaa66', // warm-tan
  '#af3233', // dark-red
  '#e14c43', // red
  '#e47d4b', // orange-red
  '#492850', // purple
  '#823a63', // magenta
  '#c54c86', // bright-magenta (original accent in sprites)
  '#e67392', // pink
];

/**
 * Select an archetype based on UUID.
 * Currently returns archetype 0 (placeholder), but structured for future expansion.
 */
export const selectArchetype = (id: string): number => {
  const baseSeed = hashString(id);
  const archetypeIndex = Math.floor(seededRandom(baseSeed, 0) * ARCHETYPES.length);
  return archetypeIndex;
};

/**
 * Get archetype by ID.
 */
export const getArchetype = (archetypeId: number) => {
  return ARCHETYPES[archetypeId] || ARCHETYPES[0];
};

/**
 * Select an accent color based on UUID.
 * Returns a hex color from the non-green, non-neutral palette.
 */
export const selectAccentColor = (id: string): string => {
  const baseSeed = hashString(id);
  const colorIndex = Math.floor(seededRandom(baseSeed, 1) * ACCENT_COLORS.length);
  return ACCENT_COLORS[colorIndex];
};

/**
 * Generate plant visual parameters deterministically from a song UUID.
 * Same UUID always produces same plant.
 * Different UUIDs produce visually different plants.
 */
export const generatePlant = (id: string, stage: GrowthStage): PlantData => {
  const baseSeed = hashString(id);

  // Gardener palette colors (plant hue, not accent)
  const colors = [
    '#193628', // dark-green
    '#35632a', // green
    '#659939', // medium-green
    '#a2bf5e', // light-green
    '#254265', // dark-blue
    '#3975a9', // blue
    '#51a2c9', // light-blue
    '#6b4446', // dark-brown
    '#9c665e', // brown
    '#984c39', // dark-orange
    '#c97743', // orange
  ];

  const colorIndex = Math.floor(seededRandom(baseSeed, 0) * colors.length);
  const hue = colors[colorIndex];

  // Archetype selection
  const archetypeId = selectArchetype(id);

  // Accent color selection
  const accentColor = selectAccentColor(id);

  // Map growth stage to complexity level
  const stageComplexity: Record<GrowthStage, number> = {
    seed: 1,
    seedling: 2,
    sprout: 3,
    blooming: 5,
    dormant: 2,
    archived: 1,
  };

  const complexity = stageComplexity[stage];

  // Stem parameters
  const stemHeightBase = 80 + seededRandom(baseSeed, 1) * 40;
  const stemHeight = (complexity / 5) * stemHeightBase;
  const stemCurve = seededRandom(baseSeed, 2) * 40 - 20; // -20 to 20

  // Leaf parameters - gated by complexity
  const maxLeaves: Record<GrowthStage, number> = {
    seed: 0,
    seedling: 2,
    sprout: 3,
    blooming: 6,
    dormant: 1,
    archived: 0,
  };

  const leafCount = Math.ceil(seededRandom(baseSeed, 3) * maxLeaves[stage]);

  // Generate leaf angles deterministically
  const leafAngles: number[] = [];
  for (let i = 0; i < leafCount; i++) {
    const angle = -60 + seededRandom(baseSeed, 4 + i) * 120; // -60 to 60 degrees
    leafAngles.push(angle);
  }

  return {
    stemHeight,
    stemCurve,
    leafCount,
    leafAngles,
    hue,
    complexity,
    archetypeId,
    accentColor,
  };
};
