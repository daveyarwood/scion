import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Test database path
const TEST_DB_PATH = path.join(__dirname, '..', 'data', 'test.db')
const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations')

// Helper to ensure test database exists and is clean
const setupTestDb = (): Database.Database => {
  const dataDir = path.dirname(TEST_DB_PATH)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH)
  }
  return new Database(TEST_DB_PATH)
}

// Helper to read and apply migrations manually (simulating the migrate script)
const applyMigration = (db: Database.Database, migrationPath: string): void => {
  const sql = fs.readFileSync(migrationPath, 'utf-8')
  db.exec(sql)
}

describe('Migration Runner', () => {
  let db: Database.Database

  beforeEach(() => {
    db = setupTestDb()
  })

  afterEach(() => {
    if (db) {
      db.close()
    }
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH)
    }
  })

  it('should create schema_migrations table during first migration', () => {
    const migrationPath = path.join(MIGRATIONS_DIR, '001_initial_schema.sql')
    applyMigration(db, migrationPath)

    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all() as Array<{ name: string }>

    expect(tables.map((t) => t.name)).toContain('schema_migrations')
  })

  it('should create songs table with correct columns', () => {
    const migrationPath = path.join(MIGRATIONS_DIR, '001_initial_schema.sql')
    applyMigration(db, migrationPath)

    const columns = db.prepare('PRAGMA table_info(songs)').all() as Array<{
      name: string
      type: string
      notnull: number
    }>

    const columnNames = columns.map((c) => c.name)
    expect(columnNames).toEqual([
      'id',
      'title',
      'body',
      'plot_id',
      'growth_stage',
      'created_at',
      'updated_at',
    ])
  })

  it('should create songs table with correct column types and constraints', () => {
    const migrationPath = path.join(MIGRATIONS_DIR, '001_initial_schema.sql')
    applyMigration(db, migrationPath)

    const columns = db.prepare('PRAGMA table_info(songs)').all() as Array<{
      name: string
      type: string
      notnull: number
      dflt_value: string | null
      pk: number
    }>

    const idColumn = columns.find((c) => c.name === 'id')
    expect(idColumn).toBeDefined()
    expect(idColumn?.pk).toBe(1) // PRIMARY KEY

    const titleColumn = columns.find((c) => c.name === 'title')
    expect(titleColumn?.notnull).toBe(1) // NOT NULL

    const growthStageColumn = columns.find((c) => c.name === 'growth_stage')
    expect(growthStageColumn?.dflt_value).toContain('seed')
  })

  it('should allow inserting a song record', () => {
    const migrationPath = path.join(MIGRATIONS_DIR, '001_initial_schema.sql')
    applyMigration(db, migrationPath)

    const stmt = db.prepare(
      'INSERT INTO songs (id, title, body, plot_id, growth_stage) VALUES (?, ?, ?, ?, ?)'
    )
    const result = stmt.run('test-1', 'Test Song', 'A test song body', null, 'seed')

    expect(result.changes).toBe(1)

    const song = db.prepare('SELECT * FROM songs WHERE id = ?').get('test-1') as
      | { title: string }
      | undefined
    expect(song).toBeDefined()
    expect(song!.title).toBe('Test Song')
  })

  it('should create indexes on songs table', () => {
    const migrationPath = path.join(MIGRATIONS_DIR, '001_initial_schema.sql')
    applyMigration(db, migrationPath)

    const indexes = db
      .prepare("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='songs'")
      .all() as Array<{ name: string }>

    const indexNames = indexes.map((i) => i.name)
    expect(indexNames).toContain('idx_songs_plot_id')
    expect(indexNames).toContain('idx_songs_growth_stage')
    expect(indexNames).toContain('idx_songs_created_at')
  })

  it('should record migration in schema_migrations table', () => {
    const migrationPath = path.join(MIGRATIONS_DIR, '001_initial_schema.sql')
    applyMigration(db, migrationPath)

    db.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run('001_initial_schema')

    const migration = db.prepare('SELECT version FROM schema_migrations WHERE version = ?').get(
      '001_initial_schema'
    )
    expect(migration).toBeDefined()
  })
})
