// Shared schemas and types for Scion
// This module contains no dependencies on Node.js or browser APIs
// and is importable by both client and server

import { z } from 'zod';

export const appName = 'Scion';

// Growth stages for song plants
export const GrowthStageEnum = z.enum([
  'seed',
  'seedling',
  'sprout',
  'blooming',
  'dormant',
  'archived',
]);

export type GrowthStage = z.infer<typeof GrowthStageEnum>;

// Song schema with validation
export const SongSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  body: z.string().optional().default(''),
  plot_id: z.string().uuid().nullable().optional(),
  growth_stage: GrowthStageEnum.default('seed'),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Song = z.infer<typeof SongSchema>;

// Input schema for creating a song (excludes id, timestamps)
const createSongInputSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().optional().default(''),
  plot_id: z.string().uuid().nullable().optional(),
});

export const CreateSongInput = createSongInputSchema;
export type CreateSongInput = z.infer<typeof createSongInputSchema>;

// Input schema for updating a song
const updateSongInputSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  body: z.string().optional(),
  growth_stage: GrowthStageEnum.optional(),
  plot_id: z.string().uuid().nullable().optional(),
});

export const UpdateSongInput = updateSongInputSchema;
export type UpdateSongInput = z.infer<typeof updateSongInputSchema>;
