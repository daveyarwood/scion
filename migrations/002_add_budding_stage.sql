-- Add budding stage to growth stages
-- Cycle 005: Expand growth stage lifecycle from 6 to 7 stages
-- New order: seed → seedling → sprout → budding → blooming → dormant → archived

-- SQLite doesn't enforce enum constraints via CHECK, so this migration is primarily
-- a documentation of the schema change. The growth_stage column will accept 'budding'
-- as a valid value going forward.

-- No existing rows need updates since no songs are created before this migration runs.
-- The Zod schema, TypeScript types, and UI will be updated separately to recognize
-- the new stage in the enum and apply it to logic (stageComplexity, maxLeaves, etc.)
