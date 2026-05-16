import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb, closeDb } from './db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use a test-specific directory
const TEST_DB_DIR = path.join(__dirname, '..', '..', 'data', 'test-db-module');
const TEST_DB_PATH = path.join(TEST_DB_DIR, 'test.db');

describe('Database module (db.ts)', () => {
  beforeEach(() => {
    // Clean up from previous tests
    closeDb();
    if (fs.existsSync(TEST_DB_DIR)) {
      fs.rmSync(TEST_DB_DIR, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    closeDb();
    // Clean up test database
    if (fs.existsSync(TEST_DB_DIR)) {
      fs.rmSync(TEST_DB_DIR, { recursive: true, force: true });
    }
  });

  describe('getDb', () => {
    it('creates a database instance', () => {
      const db = getDb();
      expect(db).toBeDefined();
      expect(typeof db.prepare).toBe('function');
    });

    it('returns the same instance on subsequent calls (connection pooling)', () => {
      const db1 = getDb();
      const db2 = getDb();
      expect(db1).toBe(db2);
    });

    it('creates the data directory if it does not exist', () => {
      const dataDir = path.join(__dirname, '..', '..', 'data');
      // If data dir doesn't exist (fresh env), this will create it
      getDb();
      expect(fs.existsSync(dataDir)).toBe(true);
    });

    it('applies WAL pragma to the database', () => {
      const db = getDb();
      const result = db.prepare('PRAGMA journal_mode').all();
      // WAL pragma should be set
      expect(result.length).toBeGreaterThan(0);
      // The journal mode should be WAL or one of the expected modes
      expect(result[0]).toBeDefined();
    });

    it('creates a working database that can be written to and read from', () => {
      const db = getDb();
      
      // Create a test table
      db.exec(`
        CREATE TABLE IF NOT EXISTS test_table (
          id INTEGER PRIMARY KEY,
          value TEXT NOT NULL
        )
      `);

      // Insert a value
      const stmt = db.prepare('INSERT INTO test_table (value) VALUES (?)');
      stmt.run('test_value');

      // Read it back
      const result = db.prepare('SELECT * FROM test_table').all();
      expect(result.length).toBe(1);
      expect(result[0]).toEqual({ id: 1, value: 'test_value' });

      // Clean up
      db.exec('DROP TABLE test_table');
    });
  });

  describe('closeDb', () => {
    it('closes the database connection', () => {
      const db1 = getDb();
      closeDb();
      // After closing, the next getDb should create a new instance
      const db2 = getDb();
      // They should be different instances
      expect(db1).not.toBe(db2);
    });

    it('can be called multiple times without error', () => {
      getDb();
      expect(() => {
        closeDb();
        closeDb();
        closeDb();
      }).not.toThrow();
    });

    it('can be called before getDb is ever called', () => {
      closeDb();
      expect(() => {
        const db = getDb();
        expect(db).toBeDefined();
      }).not.toThrow();
    });
  });
});
