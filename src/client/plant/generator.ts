import { GrowthStage } from '../../shared/index';

export interface PlantData {
  stemHeight: number;
  stemCurve: number;
  leafCount: number;
  leafAngles: number[];
  hue: string;
  complexity: number;
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
 * Generate plant visual parameters deterministically from a song UUID.
 * Same UUID always produces same plant.
 * Different UUIDs produce visually different plants.
 */
export const generatePlant = (id: string, stage: GrowthStage): PlantData => {
  const baseSeed = hashString(id);

  // Gardener palette colors
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
  };
};
