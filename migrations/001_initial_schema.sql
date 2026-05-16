-- Initial schema: songs table and schema migrations tracking
-- Cycle 001: Greenfield database setup

CREATE TABLE IF NOT EXISTS schema_migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version TEXT NOT NULL UNIQUE,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS songs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT,
  plot_id TEXT,
  growth_stage TEXT NOT NULL DEFAULT 'seed',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_songs_plot_id ON songs(plot_id);
CREATE INDEX IF NOT EXISTS idx_songs_growth_stage ON songs(growth_stage);
CREATE INDEX IF NOT EXISTS idx_songs_created_at ON songs(created_at);
