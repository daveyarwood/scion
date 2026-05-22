import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { appRouter } from './router';
import { getDb, closeDb } from './db';
import path from 'path';
import fs from 'fs';

// Use an in-memory database for tests — never touches data/scion.db
process.env.DB_PATH = ':memory:';

beforeAll(() => {
  const db = getDb();
  const schemaPath = path.join(process.cwd(), 'migrations', '001_initial_schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
});

afterAll(() => {
  closeDb();
  delete process.env.DB_PATH;
});

describe('song.list', () => {
  it('returns an empty array initially', async () => {
    const caller = appRouter.createCaller({});
    const result = await caller.song.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe('song.create', () => {
  it('creates a new song with required fields', async () => {
    const caller = appRouter.createCaller({});

    const result = await caller.song.create({
      title: 'Test Song',
    });

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.title).toBe('Test Song');
    expect(result.growth_stage).toBe('seed');
    expect(result.body).toBe('');
  });

  it('creates a song with body', async () => {
    const caller = appRouter.createCaller({});

    const result = await caller.song.create({
      title: 'Song with Body',
      body: 'This is the body',
    });

    expect(result.title).toBe('Song with Body');
    expect(result.body).toBe('This is the body');
  });
});

describe('song.get', () => {
  it('retrieves a song by id', async () => {
    const caller = appRouter.createCaller({});

    const created = await caller.song.create({
      title: 'Get Test Song',
    });

    const retrieved = await caller.song.get(created.id);

    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(created.id);
    expect(retrieved?.title).toBe('Get Test Song');
  });

  it('returns null for non-existent song', async () => {
    const caller = appRouter.createCaller({});
    const result = await caller.song.get('550e8400-e29b-41d4-a716-446655440000');
    expect(result).toBeNull();
  });
});

describe('song.update', () => {
  it('updates a song title', async () => {
    const caller = appRouter.createCaller({});

    const created = await caller.song.create({
      title: 'Original Title',
    });

    const updated = await caller.song.update({
      id: created.id,
      title: 'Updated Title',
    });

    expect(updated.title).toBe('Updated Title');
  });

  it('updates growth stage', async () => {
    const caller = appRouter.createCaller({});

    const created = await caller.song.create({
      title: 'Stage Test',
    });

    const updated = await caller.song.update({
      id: created.id,
      growth_stage: 'blooming',
    });

    expect(updated.growth_stage).toBe('blooming');
  });

  it('throws for non-existent song', async () => {
    const caller = appRouter.createCaller({});

    await expect(
      caller.song.update({
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Updated',
      })
    ).rejects.toThrow('Song not found');
  });
});

describe('song.delete', () => {
  it('deletes a song', async () => {
    const caller = appRouter.createCaller({});

    const created = await caller.song.create({
      title: 'Delete Test',
    });

    const result = await caller.song.delete({ id: created.id });
    expect(result.success).toBe(true);

    const retrieved = await caller.song.get(created.id);
    expect(retrieved).toBeNull();
  });

  it('throws for non-existent song', async () => {
    const caller = appRouter.createCaller({});

    await expect(caller.song.delete({ id: '550e8400-e29b-41d4-a716-446655440000' })).rejects.toThrow(
      'Song not found'
    );
  });
});
