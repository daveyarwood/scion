import { describe, it, expect } from 'vitest';
import { generatePlant } from './generator';

describe('generatePlant', () => {
  const exampleUuid = '550e8400-e29b-41d4-a716-446655440000';

  describe('determinism', () => {
    it('produces same output for same input', () => {
      const plant1 = generatePlant(exampleUuid, 'seed');
      const plant2 = generatePlant(exampleUuid, 'seed');

      expect(plant1).toEqual(plant2);
    });

    it('produces different output for different IDs', () => {
      const uuid1 = '550e8400-e29b-41d4-a716-446655440000';
      const uuid2 = '650e8400-e29b-41d4-a716-446655440000';

      const plant1 = generatePlant(uuid1, 'seed');
      const plant2 = generatePlant(uuid2, 'seed');

      // At least one property should differ
      const differs =
        plant1.stemHeight !== plant2.stemHeight ||
        plant1.stemCurve !== plant2.stemCurve ||
        plant1.hue !== plant2.hue;
      expect(differs).toBe(true);
    });
  });

  describe('growth stage affects output', () => {
    const uuid = exampleUuid;

    it('seed stage has minimal complexity', () => {
      const plant = generatePlant(uuid, 'seed');
      expect(plant.complexity).toBe(1);
      expect(plant.leafCount).toBe(0);
    });

    it('seedling stage has low complexity', () => {
      const plant = generatePlant(uuid, 'seedling');
      expect(plant.complexity).toBe(2);
      expect(plant.leafCount).toBeLessThanOrEqual(2);
    });

    it('sprout stage has medium complexity', () => {
      const plant = generatePlant(uuid, 'sprout');
      expect(plant.complexity).toBe(3);
      expect(plant.leafCount).toBeLessThanOrEqual(3);
    });

    it('blooming stage has high complexity', () => {
      const plant = generatePlant(uuid, 'blooming');
      expect(plant.complexity).toBe(5);
      expect(plant.leafCount).toBeLessThanOrEqual(6);
    });

    it('dormant stage has low complexity', () => {
      const plant = generatePlant(uuid, 'dormant');
      expect(plant.complexity).toBe(2);
      expect(plant.leafCount).toBeLessThanOrEqual(1);
    });

    it('archived stage has minimal complexity', () => {
      const plant = generatePlant(uuid, 'archived');
      expect(plant.complexity).toBe(1);
      expect(plant.leafCount).toBe(0);
    });
  });

  describe('plant properties are valid', () => {
    it('stem height is positive', () => {
      const plant = generatePlant(exampleUuid, 'sprout');
      expect(plant.stemHeight).toBeGreaterThan(0);
    });

    it('stem curve is within expected range', () => {
      const plant = generatePlant(exampleUuid, 'sprout');
      expect(plant.stemCurve).toBeGreaterThanOrEqual(-20);
      expect(plant.stemCurve).toBeLessThanOrEqual(20);
    });

    it('leaf angles are within expected range', () => {
      const plant = generatePlant(exampleUuid, 'blooming');
      plant.leafAngles.forEach((angle) => {
        expect(angle).toBeGreaterThanOrEqual(-60);
        expect(angle).toBeLessThanOrEqual(60);
      });
    });

    it('leaf count matches leaf angles length', () => {
      const plant = generatePlant(exampleUuid, 'blooming');
      expect(plant.leafCount).toBe(plant.leafAngles.length);
    });

    it('hue is from Gardener palette', () => {
      const validHues = [
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

      const plant = generatePlant(exampleUuid, 'sprout');
      expect(validHues).toContain(plant.hue);
    });
  });

  describe('different stages produce visually distinct plants', () => {
    const uuid = exampleUuid;

    it('seed and blooming have different complexity', () => {
      const seed = generatePlant(uuid, 'seed');
      const blooming = generatePlant(uuid, 'blooming');
      expect(seed.complexity).not.toBe(blooming.complexity);
    });

    it('seed has no leaves while blooming has many potential leaves', () => {
      const seed = generatePlant(uuid, 'seed');
      const blooming = generatePlant(uuid, 'blooming');
      expect(seed.leafCount).toBe(0);
      expect(blooming.leafCount).toBeGreaterThanOrEqual(0);
    });
  });
});
