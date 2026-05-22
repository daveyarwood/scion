-- Add archetype and accent_ramp columns to songs table
-- Cycle 008: Store plant identity (archetype and accent color ramp) in the database

ALTER TABLE songs ADD COLUMN archetype TEXT;
ALTER TABLE songs ADD COLUMN accent_ramp TEXT;

-- archetype stores the archetype name ('tulip', 'hibiscus', 'cactus', 'mushroom')
-- accent_ramp stores a JSON array string: '["#color1","#color2","#color3","#color4"]'
-- Both columns are nullable to support existing rows that predate this migration.
-- On creation, song.create populates both columns with UUID-derived values.
-- On read, song.get and song.list return both columns.
-- PlantVisual.tsx uses stored values when present, falls back to UUID-derived values for older songs.
