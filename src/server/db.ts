import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = path.join(__dirname, '..', '..', 'data')
const DB_PATH = path.join(DATA_DIR, 'scion.db')

let db: Database.Database | null = null

const ensureDataDir = (): void => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

export const getDb = (): Database.Database => {
  if (!db) {
    ensureDataDir()
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
  }
  return db
}

export const closeDb = (): void => {
  if (db) {
    db.close()
    db = null
  }
}
