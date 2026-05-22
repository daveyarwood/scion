import { GrowthStage } from '../../shared/index';

export interface PlantData {
  archetypeId: number;
}

interface Archetype {
  id: number;
  name: string;
  accentRamp: [string, string, string, string];
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

const ARCHETYPES: Archetype[] = [
  {
    id: 0,
    name: 'tulip',
    accentRamp: ['#4b192b', '#812737', '#c54c86', '#e67392'],
  },
  {
    id: 1,
    name: 'hibiscus',
    accentRamp: ['#4b192b', '#812737', '#c54c86', '#e67392'],
  },
  {
    id: 2,
    name: 'cactus',
    accentRamp: ['#4b192b', '#812737', '#c54c86', '#e67392'],
  },
  {
    id: 3,
    name: 'mushroom',
    accentRamp: ['#4b192b', '#812737', '#c54c86', '#e67392'],
  },
];

/**
 * Accent color ramps (shadow → highlight), all from the Gardener palette.
 * Each ramp is a 4-color progression used for palette-swapping sprite accent
 * pixels at render time. selectAccentRamp picks one deterministically by UUID.
 */
const ACCENT_RAMPS: Array<[string, string, string, string]> = [
  // Blue
  ['#254265', '#3975a9', '#51a2c9', '#81c6d8'],
  // Blue (dark shift)
  ['#1b2034', '#254265', '#3975a9', '#51a2c9'],
  // Blue (pale shift)
  ['#3975a9', '#51a2c9', '#81c6d8', '#b8dee7'],
  // Brown
  ['#6b4446', '#9c665e', '#d4a78d', '#ecc9ab'],
  // Brown (dark shift)
  ['#442e37', '#6b4446', '#9c665e', '#d4a78d'],
  // Rust/Orange
  ['#984c39', '#c97743', '#ecaa66', '#f4c37d'],
  // Red
  ['#af3233', '#e14c43', '#e47d4b', '#f4c37d'],
  // Maroon/Red
  ['#4b192b', '#812737', '#af3233', '#e14c43'],
  // Pink/Magenta (original sprite accent ramp)
  ['#492850', '#823a63', '#c54c86', '#e67392'],
  // Pink (pale shift)
  ['#823a63', '#c54c86', '#e67392', '#efa9b5'],
  // Purple
  ['#322030', '#492850', '#823a63', '#c54c86'],
];

/**
 * Select an archetype based on UUID.
 */
export const selectArchetype = (id: string): number => {
  const baseSeed = hashString(id);
  return Math.floor(seededRandom(baseSeed, 0) * ARCHETYPES.length);
};

/**
 * Get archetype by ID.
 */
export const getArchetype = (archetypeId: number): Archetype => {
  return ARCHETYPES[archetypeId] ?? ARCHETYPES[0];
};

/**
 * Get the sprite path for an archetype at a given growth stage.
 */
export const getSpritePath = (archetypeId: number, stage: GrowthStage): string => {
  const archetype = getArchetype(archetypeId);
  return `${archetype.name}/${stage}.png`;
};

/**
 * Convert hex color string to RGB object.
 * Deterministic: invalid hex returns black (0, 0, 0).
 */
export const parseHexToRGB = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
};

/**
 * Select an accent color ramp based on UUID.
 * Returns a 4-color ramp (shadow → light → lighter → highlight) for palette remapping.
 */
export const selectAccentRamp = (id: string): [string, string, string, string] => {
  const baseSeed = hashString(id);
  const rampIndex = Math.floor(seededRandom(baseSeed, 1) * ACCENT_RAMPS.length);
  return ACCENT_RAMPS[rampIndex];
};

/**
 * Generate plant visual parameters deterministically from a song UUID.
 * Same UUID always produces same plant.
 */
export const generatePlant = (id: string): PlantData => {
  return { archetypeId: selectArchetype(id) };
};
