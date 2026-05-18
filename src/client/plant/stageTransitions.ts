/**
 * Stage transition utilities for growth stage promotion and demotion.
 * These are pure functions for determining valid stage transitions.
 */

import { GrowthStage } from '../../shared/index';

/**
 * Growth stages that can be advanced via the UI.
 * Dormant and archived are not reachable via promotion UI.
 */
export const PROMOTABLE_STAGES: GrowthStage[] = [
  'seed',
  'seedling',
  'sprout',
  'budding',
  'blooming',
];

/**
 * Check if a stage can be promoted to the next stage.
 * Returns the next stage, or undefined if already at max promotable stage.
 */
export const getPromotedStage = (currentStage: GrowthStage): GrowthStage | undefined => {
  const currentIndex = PROMOTABLE_STAGES.indexOf(currentStage);
  if (currentIndex >= 0 && currentIndex < PROMOTABLE_STAGES.length - 1) {
    return PROMOTABLE_STAGES[currentIndex + 1];
  }
  return undefined;
};

/**
 * Check if a stage can be demoted to the previous stage.
 * Returns the previous stage, or undefined if already at min stage.
 */
export const getDemotedStage = (currentStage: GrowthStage): GrowthStage | undefined => {
  const currentIndex = PROMOTABLE_STAGES.indexOf(currentStage);
  if (currentIndex > 0) {
    return PROMOTABLE_STAGES[currentIndex - 1];
  }
  return undefined;
};

/**
 * Check if a stage can be promoted.
 */
export const canPromote = (stage: GrowthStage): boolean => {
  return getPromotedStage(stage) !== undefined;
};

/**
 * Check if a stage can be demoted.
 */
export const canDemote = (stage: GrowthStage): boolean => {
  return getDemotedStage(stage) !== undefined;
};
