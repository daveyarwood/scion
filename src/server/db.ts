import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
// If running tests and no explicit DB_PATH is provided, default to in-memory DB to
// ensure tests never write to the production database.
const DB_PATH = process.env.DB_PATH ?? (process.env.NODE_ENV === 'test' ? ':memory:' : path.join(DATA_DIR, 'scion.db'));

let db: Database.Database | null = null;

const ensureDataDir = (): void => {
  if (DB_PATH !== ':memory:' && !fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

export const getDb = (): Database.Database => {
  if (!db) {
    ensureDataDir();
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
  }
  return db;
};

export const closeDb = (): void => {
  if (db) {
    db.close();
    db = null;
  }
};
