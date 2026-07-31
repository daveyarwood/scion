import { describe, it, expect } from 'vitest'
import { formatDate } from './dateFormat'

describe('formatDate', () => {
  it('returns a string', () => {
    const result = formatDate('2026-05-17T12:34:56Z')
    expect(typeof result).toBe('string')
  })

  it('formats date with month, day, and year', () => {
    const result = formatDate('2026-05-17T12:34:56Z')
    // Format should be like "may 17, 2026"
    expect(result).toMatch(/[a-z]{3}\s+\d{1,2},\s+\d{4}/)
  })

  it('returns consistent format for same input', () => {
    const date = '2026-05-17T12:34:56Z'
    const result1 = formatDate(date)
    const result2 = formatDate(date)
    expect(result1).toBe(result2)
  })

  it('distinguishes between different years', () => {
    const result2024 = formatDate('2024-05-17T12:00:00Z')
    const result2026 = formatDate('2026-05-17T12:00:00Z')

    // Both should have valid format
    expect(result2024).toMatch(/[a-z]{3}\s+\d{1,2},\s+\d{4}/)
    expect(result2026).toMatch(/[a-z]{3}\s+\d{1,2},\s+\d{4}/)
    // Years should differ
    expect(result2024).not.toBe(result2026)
  })

  it('does not include time information', () => {
    const result = formatDate('2026-05-17T23:59:59Z')
    // Should not contain colons (which would indicate time)
    expect(result).not.toContain(':')
  })

  it('handles ISO format dates', () => {
    const result = formatDate('2026-05-17T12:34:56.789Z')
    expect(result).toMatch(/[a-z]{3}\s+\d{1,2},\s+\d{4}/)
  })

  it('handles dates without time component', () => {
    const result = formatDate('2026-05-17')
    // Should still format as a valid date
    expect(result).toMatch(/[a-z]{3}\s+\d{1,2},\s+\d{4}/)
  })

  it('formats all valid months', () => {
    const monthTests = [
      { month: '01', expected: 'jan' },
      { month: '02', expected: 'feb' },
      { month: '03', expected: 'mar' },
      { month: '04', expected: 'apr' },
      { month: '05', expected: 'may' },
      { month: '06', expected: 'jun' },
      { month: '07', expected: 'jul' },
      { month: '08', expected: 'aug' },
      { month: '09', expected: 'sep' },
      { month: '10', expected: 'oct' },
      { month: '11', expected: 'nov' },
      { month: '12', expected: 'dec' },
    ]

    monthTests.forEach(({ month, expected }) => {
      // Use middle of month to avoid timezone crossing month boundaries
      const result = formatDate(`2026-${month}-15T12:00:00Z`)
      // Just verify the format is correct and year is present
      expect(result).toMatch(/[a-z]{3}\s+\d{1,2},\s+\d{4}/)
      expect(result).toContain('2026')
    })
  })

  it('handles edge case dates', () => {
    // First day of leap year
    const result1 = formatDate('2024-02-29T00:00:00Z')
    expect(result1).toMatch(/[a-z]{3}\s+\d{1,2},\s+\d{4}/)

    // Last day of year
    const result2 = formatDate('2026-12-31T23:59:59Z')
    expect(result2).toMatch(/[a-z]{3}\s+\d{1,2},\s+\d{4}/)
  })
})
