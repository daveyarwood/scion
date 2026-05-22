/**
 * Delete all songs from the database via the tRPC HTTP API.
 *
 * Requires the app to be running: yarn dev
 *
 * Usage:
 *   tsx scripts/clear-songs.ts           # prompts for confirmation
 *   tsx scripts/clear-songs.ts --force   # skips confirmation
 */

import * as readline from 'readline';
import { z } from 'zod';

const BASE_URL = 'http://localhost:3000/trpc';

const SongSummarySchema = z.object({ id: z.string(), title: z.string() });
const ListResponseSchema = z.object({ result: z.object({ data: z.array(SongSummarySchema) }) });

const listSongs = async (): Promise<z.infer<typeof SongSummarySchema>[]> => {
  const response = await fetch(`${BASE_URL}/song.list`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Failed to list songs: ${response.status} ${await response.text()}`);
  }
  const data = ListResponseSchema.parse(await response.json());
  return data.result.data;
};

const deleteSong = async (id: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/song.delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!response.ok) {
    throw new Error(`Failed to delete ${id}: ${response.status} ${await response.text()}`);
  }
};

const confirm = (question: string): Promise<boolean> => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'y');
    });
  });
};

const main = async (): Promise<void> => {
  const force = process.argv.includes('--force');

  const songs = await listSongs();

  if (songs.length === 0) {
    console.log('No songs to delete.');
    return;
  }

  console.log(`Found ${songs.length} song(s):`);
  songs.forEach((s) => console.log(`  ${s.id}  "${s.title}"`));
  console.log();

  if (!force) {
    const ok = await confirm(`Delete all ${songs.length} song(s)? [y/N] `);
    if (!ok) {
      console.log('Aborted.');
      return;
    }
  }

  let deleted = 0;
  for (const song of songs) {
    try {
      await deleteSong(song.id);
      console.log(`  Deleted "${song.title}"`);
      deleted++;
    } catch (err) {
      console.error(`  Error deleting "${song.title}": ${err}`);
    }
  }

  console.log(`\nDone. Deleted ${deleted}/${songs.length} song(s).`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
