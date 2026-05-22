import { GrowthStage } from '../../shared/index';
import { selectArchetype as selectArchetypeName, selectAccentRamp, ACCENT_RAMPS } from '../../shared/plant';

export interface PlantData {
  archetypeId: number;
}

interface Archetype {
  id: number;
  name: string;
  accentRamp: [string, string, string, string];
}

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
 * Select an archetype ID based on UUID.
 * Wraps the shared selectArchetypeName function and converts the name to an ID.
 */
export const selectArchetype = (id: string): number => {
  const name = selectArchetypeName(id);
  const archetype = ARCHETYPES.find((a) => a.name === name);
  return archetype?.id ?? 0;
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

// Re-export shared functions for convenience
export { selectAccentRamp, ACCENT_RAMPS };

/**
 * Generate plant visual parameters deterministically from a song UUID.
 * Same UUID always produces same plant.
 */
export const generatePlant = (id: string): PlantData => {
  return { archetypeId: selectArchetype(id) };
};
