import { describe, it, expect } from 'vitest';
import {
  PROMOTABLE_STAGES,
  getPromotedStage,
  getDemotedStage,
  canPromote,
  canDemote,
} from './stageTransitions';

describe('stageTransition utilities', () => {
  describe('PROMOTABLE_STAGES', () => {
    it('includes all promotable stages in order', () => {
      expect(PROMOTABLE_STAGES).toEqual(['seed', 'seedling', 'sprout', 'budding', 'blooming']);
    });

    it('has 5 stages', () => {
      expect(PROMOTABLE_STAGES).toHaveLength(5);
    });

    it('includes budding stage', () => {
      expect(PROMOTABLE_STAGES).toContain('budding');
    });

    it('does not include dormant or archived', () => {
      expect(PROMOTABLE_STAGES).not.toContain('dormant');
      expect(PROMOTABLE_STAGES).not.toContain('archived');
    });
  });

  describe('getPromotedStage', () => {
    it('promotes seed to seedling', () => {
      expect(getPromotedStage('seed')).toBe('seedling');
    });

    it('promotes seedling to sprout', () => {
      expect(getPromotedStage('seedling')).toBe('sprout');
    });

    it('promotes sprout to budding', () => {
      expect(getPromotedStage('sprout')).toBe('budding');
    });

    it('promotes budding to blooming', () => {
      expect(getPromotedStage('budding')).toBe('blooming');
    });

    it('returns undefined for blooming (max promotable stage)', () => {
      expect(getPromotedStage('blooming')).toBeUndefined();
    });

    it('returns undefined for dormant (unreachable via UI)', () => {
      expect(getPromotedStage('dormant')).toBeUndefined();
    });

    it('returns undefined for archived (unreachable via UI)', () => {
      expect(getPromotedStage('archived')).toBeUndefined();
    });

    it('promotes through full lifecycle', () => {
      let stage: any = 'seed';
      expect(stage).toBe('seed');

      stage = getPromotedStage(stage);
      expect(stage).toBe('seedling');

      stage = getPromotedStage(stage);
      expect(stage).toBe('sprout');

      stage = getPromotedStage(stage);
      expect(stage).toBe('budding');

      stage = getPromotedStage(stage);
      expect(stage).toBe('blooming');

      stage = getPromotedStage(stage);
      expect(stage).toBeUndefined();
    });
  });

  describe('getDemotedStage', () => {
    it('demotes blooming to budding', () => {
      expect(getDemotedStage('blooming')).toBe('budding');
    });

    it('demotes budding to sprout', () => {
      expect(getDemotedStage('budding')).toBe('sprout');
    });

    it('demotes sprout to seedling', () => {
      expect(getDemotedStage('sprout')).toBe('seedling');
    });

    it('demotes seedling to seed', () => {
      expect(getDemotedStage('seedling')).toBe('seed');
    });

    it('returns undefined for seed (min stage)', () => {
      expect(getDemotedStage('seed')).toBeUndefined();
    });

    it('returns undefined for dormant (unreachable via UI)', () => {
      expect(getDemotedStage('dormant')).toBeUndefined();
    });

    it('returns undefined for archived (unreachable via UI)', () => {
      expect(getDemotedStage('archived')).toBeUndefined();
    });

    it('demotes through full lifecycle', () => {
      let stage: any = 'blooming';
      expect(stage).toBe('blooming');

      stage = getDemotedStage(stage);
      expect(stage).toBe('budding');

      stage = getDemotedStage(stage);
      expect(stage).toBe('sprout');

      stage = getDemotedStage(stage);
      expect(stage).toBe('seedling');

      stage = getDemotedStage(stage);
      expect(stage).toBe('seed');

      stage = getDemotedStage(stage);
      expect(stage).toBeUndefined();
    });
  });

  describe('canPromote', () => {
    it('returns true for seed', () => {
      expect(canPromote('seed')).toBe(true);
    });

    it('returns true for seedling', () => {
      expect(canPromote('seedling')).toBe(true);
    });

    it('returns true for sprout', () => {
      expect(canPromote('sprout')).toBe(true);
    });

    it('returns true for budding', () => {
      expect(canPromote('budding')).toBe(true);
    });

    it('returns false for blooming (max promotable stage)', () => {
      expect(canPromote('blooming')).toBe(false);
    });

    it('returns false for dormant', () => {
      expect(canPromote('dormant')).toBe(false);
    });

    it('returns false for archived', () => {
      expect(canPromote('archived')).toBe(false);
    });
  });

  describe('canDemote', () => {
    it('returns false for seed (min stage)', () => {
      expect(canDemote('seed')).toBe(false);
    });

    it('returns true for seedling', () => {
      expect(canDemote('seedling')).toBe(true);
    });

    it('returns true for sprout', () => {
      expect(canDemote('sprout')).toBe(true);
    });

    it('returns true for budding', () => {
      expect(canDemote('budding')).toBe(true);
    });

    it('returns true for blooming', () => {
      expect(canDemote('blooming')).toBe(true);
    });

    it('returns false for dormant', () => {
      expect(canDemote('dormant')).toBe(false);
    });

    it('returns false for archived', () => {
      expect(canDemote('archived')).toBe(false);
    });
  });

  describe('round-trip consistency', () => {
    it('promote then demote returns original stage', () => {
      const stages: Array<'seed' | 'seedling' | 'sprout' | 'budding'> = [
        'seed',
        'seedling',
        'sprout',
        'budding',
      ];

      stages.forEach((stage) => {
        const promoted = getPromotedStage(stage);
        if (promoted) {
          const demoted = getDemotedStage(promoted);
          expect(demoted).toBe(stage);
        }
      });
    });

    it('demote then promote returns original stage', () => {
      const stages: Array<'seedling' | 'sprout' | 'budding' | 'blooming'> = [
        'seedling',
        'sprout',
        'budding',
        'blooming',
      ];

      stages.forEach((stage) => {
        const demoted = getDemotedStage(stage);
        if (demoted) {
          const promoted = getPromotedStage(demoted);
          expect(promoted).toBe(stage);
        }
      });
    });
  });

  describe('edge cases with unreachable stages', () => {
    it('treats dormant as a final state (no promotion)', () => {
      expect(canPromote('dormant')).toBe(false);
      expect(getPromotedStage('dormant')).toBeUndefined();
    });

    it('treats archived as an endpoint (no demotion)', () => {
      expect(canDemote('archived')).toBe(false);
      expect(getDemotedStage('archived')).toBeUndefined();
    });

    it('ensures dormant and archived cannot transition', () => {
      expect(getPromotedStage('dormant')).toBeUndefined();
      expect(getDemotedStage('dormant')).toBeUndefined();
      expect(getPromotedStage('archived')).toBeUndefined();
      expect(getDemotedStage('archived')).toBeUndefined();
    });
  });
});
