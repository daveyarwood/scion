/**
 * Seed the database with 20 songs using random two-word titles from
 * /usr/share/dict/words and placeholder body text.
 *
 * Requires the app to be running: yarn dev
 *
 * Usage:
 *   tsx scripts/seed-songs.ts
 *   tsx scripts/seed-songs.ts --count 10
 */

import { execSync } from 'child_process';

const BASE_URL = 'http://localhost:3000/trpc';
const DEFAULT_COUNT = 20;

const GROWTH_STAGES = [
  'seed',
  'seedling',
  'sprout',
  'budding',
  'blooming',
  'dormant',
] as const;

const BODY_LINES = [
  'Melody in D minor, needs a bridge.',
  'Rough idea — came to me on the bus.',
  'Could be a duet. Try with fingerpicking.',
  '90bpm, 4/4. Verse needs work.',
  'Sample the rain from yesterday.',
  'Starts quiet, builds to something big.',
  'Folk feel, maybe a banjo.',
  'Needs a proper chorus. Placeholder for now.',
  'Ambient, no drums. Lots of reverb.',
  'Upbeat. Think summer, late afternoon.',
  '',
  '',
  '',
];

const pickRandom = <T>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const getWords = (n: number): string[] => {
  const raw = execSync(`shuf -n ${n} /usr/share/dict/words`).toString().trim();
  return raw
    .split('\n')
    .map((w) => w.trim().toLowerCase().replace(/[^a-z]/g, ''))
    .filter((w) => w.length >= 3 && w.length <= 10);
};

const createSong = async (title: string, body: string, growthStage: string): Promise<void> => {
  // Create the song (always starts as 'seed')
  const createResponse = await fetch(`${BASE_URL}/song.create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, body }),
  });

  if (!createResponse.ok) {
    const text = await createResponse.text();
    throw new Error(`Failed to create "${title}": ${createResponse.status} ${text}`);
  }

  const created = (await createResponse.json()) as { result: { data: { id: string } } };
  const id = created.result.data.id;

  // Update the growth stage if not 'seed'
  if (growthStage !== 'seed') {
    const updateResponse = await fetch(`${BASE_URL}/song.update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, growth_stage: growthStage }),
    });

    if (!updateResponse.ok) {
      const text = await updateResponse.text();
      throw new Error(`Created "${title}" but failed to set stage: ${updateResponse.status} ${text}`);
    }
  }
};

const main = async (): Promise<void> => {
  const countArg = process.argv.indexOf('--count');
  const count = countArg !== -1 ? parseInt(process.argv[countArg + 1], 10) : DEFAULT_COUNT;

  if (isNaN(count) || count < 1) {
    console.error('--count must be a positive integer');
    process.exit(1);
  }

  console.log(`Seeding ${count} songs...`);

  // Fetch enough words for two per song (with some extra in case of short/invalid words)
  const words = getWords(count * 4);

  if (words.length < count * 2) {
    console.error('Not enough valid words from dictionary. Try a smaller count.');
    process.exit(1);
  }

  let created = 0;
  let wordIndex = 0;

  while (created < count) {
    const w1 = words[wordIndex++];
    const w2 = words[wordIndex++];
    if (!w1 || !w2) break;

    const title = `${w1} ${w2}`;
    const body = pickRandom(BODY_LINES);
    const stage = pickRandom(GROWTH_STAGES);

    try {
      await createSong(title, body, stage);
      console.log(`  [${created + 1}/${count}] "${title}" (${stage})`);
      created++;
    } catch (err) {
      console.error(`  Error: ${err}`);
    }
  }

  console.log(`\nDone. Created ${created} song(s).`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
