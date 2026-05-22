// Pure plant generation functions (no Node.js or browser dependencies)
// Shared between client and server

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

const ARCHETYPE_NAMES = ['tulip', 'hibiscus', 'cactus', 'mushroom'] as const;

/**
 * Accent color ramps (shadow → highlight), all from the Gardener palette.
 * Each ramp is a 4-color progression used for palette-swapping sprite accent
 * pixels at render time. selectAccentRamp picks one deterministically by UUID.
 */
export const ACCENT_RAMPS: Array<[string, string, string, string]> = [
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
 * Select an archetype name based on UUID.
 * Returns one of: 'tulip', 'hibiscus', 'cactus', 'mushroom'
 */
export const selectArchetype = (id: string): string => {
  const baseSeed = hashString(id);
  const index = Math.floor(seededRandom(baseSeed, 0) * ARCHETYPE_NAMES.length);
  return ARCHETYPE_NAMES[index];
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
