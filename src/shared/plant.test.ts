import { describe, it, expect } from 'vitest';
import { selectArchetype, selectAccentRamp, ACCENT_RAMPS } from './plant';

describe('selectArchetype (shared)', () => {
  it('returns a valid archetype name', () => {
    const name = selectArchetype('550e8400-e29b-41d4-a716-446655440000');
    expect(['tulip', 'hibiscus', 'cactus', 'mushroom']).toContain(name);
  });

  it('returns the same name for the same UUID', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const name1 = selectArchetype(uuid);
    const name2 = selectArchetype(uuid);
    expect(name1).toBe(name2);
  });

  it('may return different names for different UUIDs', () => {
    const uuid1 = '550e8400-e29b-41d4-a716-446655440000';
    const uuid2 = '550e8400-e29b-41d4-a716-446655440001';
    const name1 = selectArchetype(uuid1);
    const name2 = selectArchetype(uuid2);
    expect(typeof name1).toBe('string');
    expect(typeof name2).toBe('string');
  });

  it('handles edge case UUIDs', () => {
    const emptyName = selectArchetype('');
    expect(['tulip', 'hibiscus', 'cactus', 'mushroom']).toContain(emptyName);

    const longName = selectArchetype('x'.repeat(1000));
    expect(['tulip', 'hibiscus', 'cactus', 'mushroom']).toContain(longName);

    const specialName = selectArchetype('!@#$%^&*()');
    expect(['tulip', 'hibiscus', 'cactus', 'mushroom']).toContain(specialName);
  });

  it('always returns one of the four archetype names', () => {
    const testUUIDs = [
      '550e8400-e29b-41d4-a716-446655440000',
      '650e8400-e29b-41d4-a716-446655440000',
      '750e8400-e29b-41d4-a716-446655440000',
      'ffffffff-ffff-ffff-ffff-ffffffffffff',
      '00000000-0000-0000-0000-000000000000',
    ];

    testUUIDs.forEach((uuid) => {
      const name = selectArchetype(uuid);
      expect(['tulip', 'hibiscus', 'cactus', 'mushroom']).toContain(name);
    });
  });
});

describe('selectAccentRamp (shared)', () => {
  it('returns a 4-tuple of hex colors', () => {
    const ramp = selectAccentRamp('550e8400-e29b-41d4-a716-446655440000');
    expect(Array.isArray(ramp)).toBe(true);
    expect(ramp.length).toBe(4);
    ramp.forEach((color) => {
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  it('returns the same ramp for the same UUID', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const ramp1 = selectAccentRamp(uuid);
    const ramp2 = selectAccentRamp(uuid);
    expect(ramp1).toEqual(ramp2);
  });

  it('always returns a ramp from the defined palette', () => {
    const testUUIDs = [
      '550e8400-e29b-41d4-a716-446655440000',
      '650e8400-e29b-41d4-a716-446655440000',
      '750e8400-e29b-41d4-a716-446655440000',
      'ffffffff-ffff-ffff-ffff-ffffffffffff',
      '00000000-0000-0000-0000-000000000000',
    ];

    testUUIDs.forEach((uuid) => {
      const ramp = selectAccentRamp(uuid);
      const rampString = JSON.stringify(ramp);
      const isValid = ACCENT_RAMPS.some((valid) => JSON.stringify(valid) === rampString);
      expect(isValid).toBe(true);
    });
  });
});

describe('ACCENT_RAMPS (shared)', () => {
  it('exports an array of 11 ramps', () => {
    expect(Array.isArray(ACCENT_RAMPS)).toBe(true);
    expect(ACCENT_RAMPS.length).toBe(11);
  });

  it('each ramp is a 4-tuple of hex colors', () => {
    ACCENT_RAMPS.forEach((ramp, index) => {
      expect(Array.isArray(ramp)).toBe(true);
      expect(ramp.length).toBe(4);
      ramp.forEach((color, colorIndex) => {
        expect(color).toMatch(
          /^#[0-9a-fA-F]{6}$/,
          `Ramp ${index} color ${colorIndex} is invalid: ${color}`
        );
      });
    });
  });
});
