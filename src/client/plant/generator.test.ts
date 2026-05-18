import { describe, it, expect } from 'vitest';
import { generatePlant, selectArchetype, getArchetype, getSpritePath, selectAccentColor, parseHexToRGB } from './generator';

describe('selectArchetype', () => {
  it('returns a valid archetype index', () => {
    const index = selectArchetype('550e8400-e29b-41d4-a716-446655440000');
    expect(index).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(index)).toBe(true);
  });

  it('returns the same index for the same UUID', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const index1 = selectArchetype(uuid);
    const index2 = selectArchetype(uuid);
    expect(index1).toBe(index2);
  });

  it('may return different indices for different UUIDs', () => {
    const uuid1 = '550e8400-e29b-41d4-a716-446655440000';
    const uuid2 = '550e8400-e29b-41d4-a716-446655440001';
    // With 4 archetypes registered, different UUIDs may produce different indices
    const index1 = selectArchetype(uuid1);
    const index2 = selectArchetype(uuid2);
    expect(typeof index1).toBe('number');
    expect(typeof index2).toBe('number');
  });

  it('handles edge case UUIDs (empty string, special chars)', () => {
    // Edge case: empty string
    const emptyIndex = selectArchetype('');
    expect(emptyIndex).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(emptyIndex)).toBe(true);

    // Edge case: very long string
    const longIndex = selectArchetype('x'.repeat(1000));
    expect(longIndex).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(longIndex)).toBe(true);

    // Edge case: special characters
    const specialIndex = selectArchetype('!@#$%^&*()');
    expect(specialIndex).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(specialIndex)).toBe(true);
  });

  it('always returns an index within valid range', () => {
    // Test multiple UUIDs to ensure all are within bounds
    const testUUIDs = [
      '550e8400-e29b-41d4-a716-446655440000',
      '650e8400-e29b-41d4-a716-446655440000',
      '750e8400-e29b-41d4-a716-446655440000',
      'ffffffff-ffff-ffff-ffff-ffffffffffff',
      '00000000-0000-0000-0000-000000000000',
    ];

    testUUIDs.forEach((uuid) => {
      const index = selectArchetype(uuid);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(4); // Now 4 archetypes (tulip, hibiscus, cactus, mushroom)
    });
  });
});

describe('getArchetype', () => {
  it('returns archetype by ID', () => {
    const archetype = getArchetype(0);
    expect(archetype).toBeDefined();
    expect(archetype.id).toBe(0);
    expect(archetype.name).toBe('tulip');
  });

  it('returns default archetype for invalid ID', () => {
    const archetype = getArchetype(999);
    expect(archetype.id).toBe(0);
    expect(archetype.name).toBe('tulip');
  });

  it('returns different archetypes by different IDs', () => {
    expect(getArchetype(0).name).toBe('tulip');
    expect(getArchetype(1).name).toBe('hibiscus');
    expect(getArchetype(2).name).toBe('cactus');
    expect(getArchetype(3).name).toBe('mushroom');
  });
});

describe('getSpritePath', () => {
  it('returns correct path for a known archetype and stage', () => {
    expect(getSpritePath(0, 'seed')).toBe('tulip/seed.png');
    expect(getSpritePath(1, 'blooming')).toBe('hibiscus/blooming.png');
    expect(getSpritePath(2, 'sprout')).toBe('cactus/sprout.png');
    expect(getSpritePath(3, 'archived')).toBe('mushroom/archived.png');
  });

  it('falls back to tulip for invalid archetype ID', () => {
    expect(getSpritePath(999, 'seed')).toBe('tulip/seed.png');
  });
});

describe('selectAccentColor', () => {
  it('returns a valid hex color', () => {
    const color = selectAccentColor('550e8400-e29b-41d4-a716-446655440000');
    expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('returns the same color for the same UUID', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const color1 = selectAccentColor(uuid);
    const color2 = selectAccentColor(uuid);
    expect(color1).toBe(color2);
  });

  it('may return different colors for different UUIDs', () => {
    const uuid1 = '550e8400-e29b-41d4-a716-446655440000';
    const uuid2 = '550e8400-e29b-41d4-a716-446655440001';
    const color1 = selectAccentColor(uuid1);
    const color2 = selectAccentColor(uuid2);
    // Both are valid colors, but may differ
    expect(color1).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(color2).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('always returns a color from the defined palette', () => {
    // Test multiple UUIDs to ensure all results are from the palette
    const validAccentColors = [
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
      '#c54c86', // bright-magenta
      '#e67392', // pink
    ];

    const testUUIDs = [
      '550e8400-e29b-41d4-a716-446655440000',
      '650e8400-e29b-41d4-a716-446655440000',
      '750e8400-e29b-41d4-a716-446655440000',
      'ffffffff-ffff-ffff-ffff-ffffffffffff',
      '00000000-0000-0000-0000-000000000000',
    ];

    testUUIDs.forEach((uuid) => {
      const color = selectAccentColor(uuid);
      expect(validAccentColors).toContain(color);
    });
  });
});

describe('generatePlant', () => {
  const exampleUuid = '550e8400-e29b-41d4-a716-446655440000';

  it('produces same output for same input', () => {
    const plant1 = generatePlant(exampleUuid);
    const plant2 = generatePlant(exampleUuid);
    expect(plant1).toEqual(plant2);
  });

  it('produces different archetypes across a spread of UUIDs', () => {
    const uuids = [
      '550e8400-e29b-41d4-a716-446655440000',
      '650e8400-e29b-41d4-a716-446655440000',
      '750e8400-e29b-41d4-a716-446655440000',
      'ffffffff-ffff-ffff-ffff-ffffffffffff',
      '00000000-0000-0000-0000-000000000000',
      'aabbccdd-eeff-0011-2233-445566778899',
      '11111111-2222-3333-4444-555566667777',
      'deadbeef-dead-beef-dead-beefdeadbeef',
    ];
    const ids = new Set(uuids.map((u) => generatePlant(u).archetypeId));
    expect(ids.size).toBeGreaterThan(1);
  });

  it('includes a valid archetype ID', () => {
    const plant = generatePlant(exampleUuid);
    expect(typeof plant.archetypeId).toBe('number');
    expect(plant.archetypeId).toBeGreaterThanOrEqual(0);
  });
});

describe('parseHexToRGB', () => {
  describe('valid hex colors', () => {
    it('converts #c54c86 (accent color) to RGB', () => {
      const result = parseHexToRGB('#c54c86');
      expect(result.r).toBe(197);
      expect(result.g).toBe(76);
      expect(result.b).toBe(134);
    });

    it('converts #000000 (black) to RGB', () => {
      const result = parseHexToRGB('#000000');
      expect(result.r).toBe(0);
      expect(result.g).toBe(0);
      expect(result.b).toBe(0);
    });

    it('converts #ffffff (white) to RGB', () => {
      const result = parseHexToRGB('#ffffff');
      expect(result.r).toBe(255);
      expect(result.g).toBe(255);
      expect(result.b).toBe(255);
    });

    it('handles hex without leading # symbol', () => {
      const result = parseHexToRGB('c54c86');
      expect(result.r).toBe(197);
      expect(result.g).toBe(76);
      expect(result.b).toBe(134);
    });

    it('handles uppercase hex', () => {
      const result = parseHexToRGB('#C54C86');
      expect(result.r).toBe(197);
      expect(result.g).toBe(76);
      expect(result.b).toBe(134);
    });

    it('handles mixed case hex', () => {
      const result = parseHexToRGB('#C5c8C6');
      expect(result.r).toBe(197);
      expect(result.g).toBe(200);
      expect(result.b).toBe(198);
    });

    it('converts all Gardener palette colors correctly', () => {
      const paletteColors = [
        { hex: '#254265', r: 37, g: 66, b: 101 },
        { hex: '#3975a9', r: 57, g: 117, b: 169 },
        { hex: '#51a2c9', r: 81, g: 162, b: 201 },
        { hex: '#81c6d8', r: 129, g: 198, b: 216 },
        { hex: '#6b4446', r: 107, g: 68, b: 70 },
        { hex: '#9c665e', r: 156, g: 102, b: 94 },
        { hex: '#d4a78d', r: 212, g: 167, b: 141 },
        { hex: '#984c39', r: 152, g: 76, b: 57 },
        { hex: '#c97743', r: 201, g: 119, b: 67 },
        { hex: '#ecaa66', r: 236, g: 170, b: 102 },
        { hex: '#af3233', r: 175, g: 50, b: 51 },
        { hex: '#e14c43', r: 225, g: 76, b: 67 },
        { hex: '#e47d4b', r: 228, g: 125, b: 75 },
        { hex: '#492850', r: 73, g: 40, b: 80 },
        { hex: '#823a63', r: 130, g: 58, b: 99 },
        { hex: '#e67392', r: 230, g: 115, b: 146 },
      ];

      paletteColors.forEach(({ hex, r, g, b }) => {
        const result = parseHexToRGB(hex);
        expect(result.r).toBe(r);
        expect(result.g).toBe(g);
        expect(result.b).toBe(b);
      });
    });
  });

  describe('invalid hex colors', () => {
    it('returns black (0,0,0) for invalid hex', () => {
      const result = parseHexToRGB('invalid');
      expect(result.r).toBe(0);
      expect(result.g).toBe(0);
      expect(result.b).toBe(0);
    });

    it('returns black for too-short hex', () => {
      const result = parseHexToRGB('#c5');
      expect(result.r).toBe(0);
      expect(result.g).toBe(0);
      expect(result.b).toBe(0);
    });

    it('returns black for too-long hex', () => {
      const result = parseHexToRGB('#c54c86ff');
      expect(result.r).toBe(0);
      expect(result.g).toBe(0);
      expect(result.b).toBe(0);
    });

    it('returns black for empty string', () => {
      const result = parseHexToRGB('');
      expect(result.r).toBe(0);
      expect(result.g).toBe(0);
      expect(result.b).toBe(0);
    });

    it('returns black for non-hex characters', () => {
      const result = parseHexToRGB('#zzzzzz');
      expect(result.r).toBe(0);
      expect(result.g).toBe(0);
      expect(result.b).toBe(0);
    });
  });

  describe('RGB output properties', () => {
    it('always returns object with r, g, b properties', () => {
      const result = parseHexToRGB('#c54c86');
      expect(result).toHaveProperty('r');
      expect(result).toHaveProperty('g');
      expect(result).toHaveProperty('b');
    });

    it('RGB values are always integers', () => {
      const result = parseHexToRGB('#c54c86');
      expect(Number.isInteger(result.r)).toBe(true);
      expect(Number.isInteger(result.g)).toBe(true);
      expect(Number.isInteger(result.b)).toBe(true);
    });

    it('RGB values are within 0-255 range', () => {
      const testCases = ['#000000', '#ffffff', '#c54c86', '#123abc'];
      testCases.forEach((hex) => {
        const result = parseHexToRGB(hex);
        expect(result.r).toBeGreaterThanOrEqual(0);
        expect(result.r).toBeLessThanOrEqual(255);
        expect(result.g).toBeGreaterThanOrEqual(0);
        expect(result.g).toBeLessThanOrEqual(255);
        expect(result.b).toBeGreaterThanOrEqual(0);
        expect(result.b).toBeLessThanOrEqual(255);
      });
    });
  });
});
