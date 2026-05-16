import { describe, it, expect } from 'vitest';
import { GrowthStageEnum, SongSchema, CreateSongInput, UpdateSongInput } from './index';

describe('GrowthStageEnum', () => {
  it('accepts valid growth stages', () => {
    const stages = ['seed', 'seedling', 'sprout', 'blooming', 'dormant', 'archived'];
    stages.forEach((stage) => {
      const result = GrowthStageEnum.safeParse(stage);
      expect(result.success).toBe(true);
    });
  });

  it('rejects invalid growth stages', () => {
    const result = GrowthStageEnum.safeParse('invalid');
    expect(result.success).toBe(false);
  });
});

describe('SongSchema', () => {
  const validSong = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Test Song',
    body: 'A test song body',
    plot_id: null,
    growth_stage: 'seed' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  it('validates a complete valid song', () => {
    const result = SongSchema.safeParse(validSong);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Test Song');
    }
  });

  it('requires a title', () => {
    const invalid = { ...validSong, title: '' };
    const result = SongSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('defaults body to empty string', () => {
    const song = { ...validSong, body: undefined };
    const result = SongSchema.safeParse(song);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.body).toBe('');
    }
  });

  it('defaults growth_stage to seed', () => {
    const song = { ...validSong, growth_stage: undefined };
    const result = SongSchema.safeParse(song);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.growth_stage).toBe('seed');
    }
  });

  it('rejects invalid UUID for id', () => {
    const invalid = { ...validSong, id: 'not-a-uuid' };
    const result = SongSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe('CreateSongInput', () => {
  it('validates a valid create input', () => {
    const input = {
      title: 'New Song',
      body: 'A new song',
    };
    const result = CreateSongInput.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('requires a title', () => {
    const input = {
      title: '',
      body: 'A new song',
    };
    const result = CreateSongInput.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('defaults body to empty string', () => {
    const input = {
      title: 'New Song',
    };
    const result = CreateSongInput.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.body).toBe('');
    }
  });
});

describe('UpdateSongInput', () => {
  it('validates partial updates', () => {
    const input = {
      title: 'Updated Title',
    };
    const result = UpdateSongInput.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('allows empty object for partial updates', () => {
    const input = {};
    const result = UpdateSongInput.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('validates growth_stage updates', () => {
    const input = {
      growth_stage: 'blooming' as const,
    };
    const result = UpdateSongInput.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('rejects invalid growth stages', () => {
    const input = {
      growth_stage: 'invalid',
    };
    const result = UpdateSongInput.safeParse(input);
    expect(result.success).toBe(false);
  });
});
