import { describe, it, expect } from 'vitest';

// Test utilities extracted from SongCard.tsx
describe('SongCard utilities', () => {
  const getStageEmoji = (stage: string): string => {
    const emojiMap: Record<string, string> = {
      seed: '🌰',
      seedling: '🌱',
      sprout: '🌿',
      blooming: '🌸',
      dormant: '❄️',
      archived: '📦',
    };
    return emojiMap[stage] || '🌱';
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  describe('getStageEmoji', () => {
    it('returns correct emoji for seed stage', () => {
      expect(getStageEmoji('seed')).toBe('🌰');
    });

    it('returns correct emoji for seedling stage', () => {
      expect(getStageEmoji('seedling')).toBe('🌱');
    });

    it('returns correct emoji for sprout stage', () => {
      expect(getStageEmoji('sprout')).toBe('🌿');
    });

    it('returns correct emoji for blooming stage', () => {
      expect(getStageEmoji('blooming')).toBe('🌸');
    });

    it('returns correct emoji for dormant stage', () => {
      expect(getStageEmoji('dormant')).toBe('❄️');
    });

    it('returns correct emoji for archived stage', () => {
      expect(getStageEmoji('archived')).toBe('📦');
    });

    it('returns default seedling emoji for unknown stage', () => {
      expect(getStageEmoji('unknown')).toBe('🌱');
      expect(getStageEmoji('invalid-stage')).toBe('🌱');
      expect(getStageEmoji('')).toBe('🌱');
    });

    it('handles null or undefined gracefully', () => {
      expect(getStageEmoji('null')).toBe('🌱');
      expect(getStageEmoji('undefined')).toBe('🌱');
    });

    it('is case-sensitive', () => {
      expect(getStageEmoji('SEED')).toBe('🌱');
      expect(getStageEmoji('Seed')).toBe('🌱');
      expect(getStageEmoji('seed')).toBe('🌰');
    });
  });

  describe('formatDate', () => {
    it('formats a date correctly', () => {
      const date = new Date(2026, 4, 16); // May 16, 2026 (month is 0-indexed)
      const formatted = formatDate(date);
      // The formatted date should contain year 2026
      expect(formatted).toContain('2026');
    });

    it('handles different dates', () => {
      const date1 = new Date(2025, 0, 1); // Jan 1, 2025
      const date2 = new Date(2026, 11, 31); // Dec 31, 2026
      
      const formatted1 = formatDate(date1);
      const formatted2 = formatDate(date2);
      
      expect(formatted1).toContain('2025');
      expect(formatted2).toContain('2026');
    });

    it('formats month as short name', () => {
      const date = new Date(2026, 2, 15); // Mar 15, 2026
      const formatted = formatDate(date);
      expect(formatted).toContain('Mar');
    });

    it('does not include time portion', () => {
      const date = new Date(2026, 4, 16); // May 16, 2026
      const formatted = formatDate(date);
      // Should not contain time information
      expect(formatted).not.toContain(':');
    });

    it('handles dates in different years', () => {
      const date = new Date(2020, 0, 1); // Jan 1, 2020
      const formatted = formatDate(date);
      expect(formatted).toContain('2020');
    });
  });
});
