import { GrowthStage } from '../../shared/index';

export interface PlantData {
  archetypeId: number;
  // accentColor is intentionally omitted here until the palette ramp swap is
  // implemented. selectAccentColor() and parseHexToRGB() are retained as
  // exported utilities ready for that work. Each archetype will declare an
  // `accentRamp` (ordered source shades in the sprite), and the UUID-derived
  // accent selection will map those shades to a target Gardener palette ramp
  // at canvas render time.
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
 * Accent color ramps (shadow → light → lighter → highlight).
 * Each ramp is a 4-color progression for palette swapping.
 */
const ACCENT_RAMPS: Array<[string, string, string, string]> = [
  // Blue ramp
  ['#254265', '#3975a9', '#51a2c9', '#81c6d8'],
  // Purple/Pink ramp (original accent colors in sprites)
  ['#492850', '#823a63', '#c54c86', '#e67392'],
  // Red ramp
  ['#af3233', '#e14c43', '#e47d4b', '#f4c37d'],
  // Brown/Tan ramp
  ['#6b4446', '#9c665e', '#d4a78d', '#ecc9ab'],
  // Rust/Orange ramp
  ['#984c39', '#c97743', '#ecaa66', '#f4c37d'],
];

/**
 * Accent colors (non-green, non-neutral Gardener palette colors).
 * These are available for palette-swapping from #c54c86 in sprites.
 * Deprecated: use ACCENT_RAMPS instead.
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
 * Select an accent color based on UUID.
 * Returns a hex color from the non-green, non-neutral palette.
 */
export const selectAccentColor = (id: string): string => {
  const baseSeed = hashString(id);
  const colorIndex = Math.floor(seededRandom(baseSeed, 1) * ACCENT_COLORS.length);
  return ACCENT_COLORS[colorIndex];
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
