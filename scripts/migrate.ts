import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = path.join(__dirname, '..', 'data')
const DB_PATH = path.join(DATA_DIR, 'scion.db')
const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations')

const ensureDataDir = (): void => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

const readMigrations = (): Array<{ version: string; path: string }> => {
  const files = fs.readdirSync(MIGRATIONS_DIR).sort()
  return files
    .filter((f) => f.endsWith('.sql'))
    .map((f) => ({
      version: f.replace('.sql', ''),
      path: path.join(MIGRATIONS_DIR, f),
    }))
}

const getAppliedMigrations = (db: Database.Database): Set<string> => {
  try {
    const result = db.prepare('SELECT version FROM schema_migrations').all() as Array<{
      version: string
    }>
    return new Set(result.map((r) => r.version))
  } catch {
    // schema_migrations table doesn't exist yet, will be created by first migration
    return new Set()
  }
}

const migrate = (): void => {
  ensureDataDir()

  const db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')

  try {
    const migrations = readMigrations()
    const applied = getAppliedMigrations(db)

    const pending = migrations.filter((m) => !applied.has(m.version))

    if (pending.length === 0) {
      console.log('✓ All migrations applied.')
      return
    }

    console.log(`Found ${pending.length} pending migration(s).`)

    for (const migration of pending) {
      const sql = fs.readFileSync(migration.path, 'utf-8')

      try {
        // Execute migration
        db.exec(sql)

        // Record the migration as applied
        db.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run(migration.version)

        console.log(`✓ Applied: ${migration.version}`)
      } catch (err) {
        console.error(`✗ Failed to apply ${migration.version}:`, err)
        throw err
      }
    }

    console.log(`✓ ${pending.length} migration(s) applied successfully.`)
  } finally {
    db.close()
  }
}

migrate()
