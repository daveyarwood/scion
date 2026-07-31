import { describe, it, expect } from 'vitest'

/**
 * Convert archetype name to ID.
 * Maps: 'tulip' → 0, 'hibiscus' → 1, 'cactus' → 2, 'mushroom' → 3
 * Extracted from PlantVisual.tsx for testing.
 */
const getArchetypeIdByName = (name: string): number => {
  const nameMap: Record<string, number> = {
    tulip: 0,
    hibiscus: 1,
    cactus: 2,
    mushroom: 3,
  }
  return nameMap[name] ?? 0
}

describe('getArchetypeIdByName', () => {
  it('maps tulip to 0', () => {
    expect(getArchetypeIdByName('tulip')).toBe(0)
  })

  it('maps hibiscus to 1', () => {
    expect(getArchetypeIdByName('hibiscus')).toBe(1)
  })

  it('maps cactus to 2', () => {
    expect(getArchetypeIdByName('cactus')).toBe(2)
  })

  it('maps mushroom to 3', () => {
    expect(getArchetypeIdByName('mushroom')).toBe(3)
  })

  it('defaults unknown names to 0 (tulip)', () => {
    expect(getArchetypeIdByName('unknown')).toBe(0)
    expect(getArchetypeIdByName('invalid')).toBe(0)
    expect(getArchetypeIdByName('')).toBe(0)
  })

  it('handles all valid archetype names', () => {
    const archetypes = ['tulip', 'hibiscus', 'cactus', 'mushroom']
    archetypes.forEach((archetype, index) => {
      expect(getArchetypeIdByName(archetype)).toBe(index)
    })
  })
})
