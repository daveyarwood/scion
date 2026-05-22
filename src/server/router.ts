import { initTRPC } from '@trpc/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { SongSchema, CreateSongInput, UpdateSongWithId, Song } from '../shared/index';
import { getDb } from './db';

const t = initTRPC.create();

export const appRouter = t.router({
  song: t.router({
    // List all songs
    list: t.procedure.query(() => {
      const db = getDb();
      const rows = db.prepare<[], Song>('SELECT * FROM songs ORDER BY created_at DESC').all();
      return rows.map((row) => SongSchema.parse(row));
    }),

    // Get a single song by id
    get: t.procedure
      .input((value) => {
        if (typeof value !== 'string') throw new Error('id must be a string');
        return value;
      })
      .query(({ input: id }) => {
        const db = getDb();
        const row = db.prepare<[string], Song>('SELECT * FROM songs WHERE id = ?').get(id);
        if (!row) return null;
        return SongSchema.parse(row);
      }),

    // Create a new song
    create: t.procedure.input(CreateSongInput).mutation(({ input }) => {
      const db = getDb();
      const id = uuidv4();
      const now = new Date().toISOString();

      const stmt = db.prepare<[string, string, string, null | string, string, string, string]>(
        `
        INSERT INTO songs (id, title, body, plot_id, growth_stage, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
      );

      stmt.run(id, input.title, input.body || '', input.plot_id || null, 'seed', now, now);

      const row = db.prepare<[string], Song>('SELECT * FROM songs WHERE id = ?').get(id);
      if (!row) throw new Error('Failed to retrieve created song');
      return SongSchema.parse(row);
    }),

    // Update a song
    update: t.procedure.input(UpdateSongWithId).mutation(({ input }) => {
      const db = getDb();
      const { id, ...updateData } = input;

      // Check if song exists
      const existing = db.prepare<[string], Song>('SELECT * FROM songs WHERE id = ?').get(id);
      if (!existing) throw new Error('Song not found');

      // Build dynamic update query
      const fields: string[] = [];
      const values: unknown[] = [];

      if (updateData.title !== undefined) {
        fields.push('title = ?');
        values.push(updateData.title);
      }
      if (updateData.body !== undefined) {
        fields.push('body = ?');
        values.push(updateData.body);
      }
      if (updateData.growth_stage !== undefined) {
        fields.push('growth_stage = ?');
        values.push(updateData.growth_stage);
      }
      if (updateData.plot_id !== undefined) {
        fields.push('plot_id = ?');
        values.push(updateData.plot_id);
      }

      // Always update the updated_at timestamp
      fields.push('updated_at = ?');
      values.push(new Date().toISOString());

      const query = `UPDATE songs SET ${fields.join(', ')} WHERE id = ?`;
      values.push(id);

      db.prepare(query).run(...values);

      const row = db.prepare<[string], Song>('SELECT * FROM songs WHERE id = ?').get(id);
      if (!row) throw new Error('Failed to retrieve updated song');
      return SongSchema.parse(row);
    }),

    // Delete a song
    delete: t.procedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(({ input: { id } }) => {
        const db = getDb();

        // Check if song exists
        const existing = db.prepare<[string], Song>('SELECT * FROM songs WHERE id = ?').get(id);
        if (!existing) throw new Error('Song not found');

        db.prepare('DELETE FROM songs WHERE id = ?').run(id);

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
