import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { appRouter } from './router'
import { getDb, closeDb } from './db'
import path from 'path'
import fs from 'fs'

// Use an in-memory database for tests — never touches data/scion.db
process.env.DB_PATH = ':memory:'

beforeAll(() => {
  const db = getDb()
  const schemaPath1 = path.join(process.cwd(), 'migrations', '001_initial_schema.sql')
  const schema1 = fs.readFileSync(schemaPath1, 'utf-8')
  db.exec(schema1)

  const schemaPath2 = path.join(process.cwd(), 'migrations', '002_add_budding_stage.sql')
  const schema2 = fs.readFileSync(schemaPath2, 'utf-8')
  db.exec(schema2)

  const schemaPath3 = path.join(
    process.cwd(),
    'migrations',
    '003_add_archetype_and_accent_ramp.sql'
  )
  const schema3 = fs.readFileSync(schemaPath3, 'utf-8')
  db.exec(schema3)
})

afterAll(() => {
  closeDb()
  delete process.env.DB_PATH
})

describe('song.list', () => {
  it('returns an empty array initially', async () => {
    const caller = appRouter.createCaller({})
    const result = await caller.song.list()
    expect(Array.isArray(result)).toBe(true)
  })

  it('returns archetype and accent_ramp in list results', async () => {
    const caller = appRouter.createCaller({})

    // Clear any existing songs first by creating a fresh caller
    await caller.song.create({
      title: 'First Song',
    })

    const result = await caller.song.list()
    expect(result.length).toBeGreaterThan(0)

    // Verify each song in the list has archetype and accent_ramp
    result.forEach((song) => {
      expect(song.archetype).toBeDefined()
      expect(song.accent_ramp).toBeDefined()
    })
  })

  it('orders songs by updated_at descending', async () => {
    const caller = appRouter.createCaller({})

    // Create two songs
    const older = await caller.song.create({ title: 'Older Song' })
    const newer = await caller.song.create({ title: 'Newer Song' })

    // Both were just created, so newer should come first (descending by updated_at)
    let result = await caller.song.list()
    expect(result[0].title).toBe('Newer Song')
    expect(result[1].title).toBe('Older Song')

    // Update the older song's title — this bumps its updated_at
    await caller.song.update({ id: older.id, title: 'Older Song (edited)' })

    // Now the older song should come first (its updated_at is newest)
    result = await caller.song.list()
    expect(result[0].title).toBe('Older Song (edited)')
    expect(result[1].title).toBe('Newer Song')
  })
})

describe('song.create', () => {
  it('creates a new song with required fields', async () => {
    const caller = appRouter.createCaller({})

    const result = await caller.song.create({
      title: 'Test Song',
    })

    expect(result).toBeDefined()
    expect(result.id).toBeDefined()
    expect(result.title).toBe('Test Song')
    expect(result.growth_stage).toBe('seed')
    expect(result.body).toBe('')
  })

  it('creates a song with body', async () => {
    const caller = appRouter.createCaller({})

    const result = await caller.song.create({
      title: 'Song with Body',
      body: 'This is the body',
    })

    expect(result.title).toBe('Song with Body')
    expect(result.body).toBe('This is the body')
  })

  it('populates archetype and accent_ramp from UUID if not provided', async () => {
    const caller = appRouter.createCaller({})

    const result = await caller.song.create({
      title: 'Test Song',
    })

    expect(result.archetype).toBeDefined()
    expect(['tulip', 'hibiscus', 'cactus', 'mushroom']).toContain(result.archetype)
    expect(result.accent_ramp).toBeDefined()
    // accent_ramp should be a JSON array string with 4 hex colors
    const parsed = JSON.parse(result.accent_ramp!)
    expect(Array.isArray(parsed)).toBe(true)
    expect(parsed.length).toBe(4)
    parsed.forEach((color: string) => {
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/)
    })
  })

  it('allows explicit archetype and accent_ramp on creation', async () => {
    const caller = appRouter.createCaller({})

    const result = await caller.song.create({
      title: 'Custom Plant Song',
      archetype: 'mushroom',
      accent_ramp: '["#322030","#492850","#823a63","#c54c86"]',
    })

    expect(result.archetype).toBe('mushroom')
    expect(result.accent_ramp).toBe('["#322030","#492850","#823a63","#c54c86"]')
  })
})

describe('song.get', () => {
  it('retrieves a song by id', async () => {
    const caller = appRouter.createCaller({})

    const created = await caller.song.create({
      title: 'Get Test Song',
    })

    const retrieved = await caller.song.get(created.id)

    expect(retrieved).toBeDefined()
    expect(retrieved?.id).toBe(created.id)
    expect(retrieved?.title).toBe('Get Test Song')
  })

  it('returns archetype and accent_ramp from song.get', async () => {
    const caller = appRouter.createCaller({})

    const created = await caller.song.create({
      title: 'Get Test Song',
    })

    const retrieved = await caller.song.get(created.id)

    expect(retrieved?.archetype).toBeDefined()
    expect(retrieved?.accent_ramp).toBeDefined()
  })

  it('returns null for non-existent song', async () => {
    const caller = appRouter.createCaller({})
    const result = await caller.song.get('550e8400-e29b-41d4-a716-446655440000')
    expect(result).toBeNull()
  })
})

describe('song.update', () => {
  it('updates a song title', async () => {
    const caller = appRouter.createCaller({})

    const created = await caller.song.create({
      title: 'Original Title',
    })

    const updated = await caller.song.update({
      id: created.id,
      title: 'Updated Title',
    })

    expect(updated.title).toBe('Updated Title')
  })

  it('updates growth stage', async () => {
    const caller = appRouter.createCaller({})

    const created = await caller.song.create({
      title: 'Stage Test',
    })

    const updated = await caller.song.update({
      id: created.id,
      growth_stage: 'blooming',
    })

    expect(updated.growth_stage).toBe('blooming')
  })

  it('updates archetype and accent_ramp', async () => {
    const caller = appRouter.createCaller({})

    const created = await caller.song.create({
      title: 'Update Appearance Test',
    })

    const updated = await caller.song.update({
      id: created.id,
      archetype: 'cactus',
      accent_ramp: '["#984c39","#c97743","#ecaa66","#f4c37d"]',
    })

    expect(updated.archetype).toBe('cactus')
    expect(updated.accent_ramp).toBe('["#984c39","#c97743","#ecaa66","#f4c37d"]')
  })

  it('throws for non-existent song', async () => {
    const caller = appRouter.createCaller({})

    await expect(
      caller.song.update({
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Updated',
      })
    ).rejects.toThrow('Song not found')
  })
})

describe('song.delete', () => {
  it('deletes a song', async () => {
    const caller = appRouter.createCaller({})

    const created = await caller.song.create({
      title: 'Delete Test',
    })

    const result = await caller.song.delete({ id: created.id })
    expect(result.success).toBe(true)

    const retrieved = await caller.song.get(created.id)
    expect(retrieved).toBeNull()
  })

  it('throws for non-existent song', async () => {
    const caller = appRouter.createCaller({})

    await expect(
      caller.song.delete({ id: '550e8400-e29b-41d4-a716-446655440000' })
    ).rejects.toThrow('Song not found')
  })

  it('rejects invalid UUID format', async () => {
    const caller = appRouter.createCaller({})

    await expect(caller.song.delete({ id: 'not-a-uuid' })).rejects.toThrow()
  })

  it('requires id field', async () => {
    const caller = appRouter.createCaller({})

    await expect(caller.song.delete({ id: '' } as any)).rejects.toThrow()
  })
})
