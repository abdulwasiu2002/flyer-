import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(path.join(dbDir, 'app.db'));

export function setupDb() {
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      flyer_code TEXT NOT NULL,
      full_name TEXT NOT NULL,
      state_of_origin TEXT NOT NULL,
      birthday TEXT NOT NULL,
      relationship_status TEXT NOT NULL,
      phone TEXT NOT NULL,
      best_course TEXT NOT NULL,
      challenging_course TEXT NOT NULL,
      best_level TEXT NOT NULL,
      challenging_level TEXT NOT NULL,
      favorite_lecturer TEXT NOT NULL,
      best_experience TEXT NOT NULL,
      post_held TEXT NOT NULL,
      next_after_school TEXT NOT NULL,
      favorite_quote TEXT NOT NULL,
      photo_url TEXT NOT NULL,
      flyer_url TEXT NOT NULL,
      nickname TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  try {
    db.exec(`ALTER TABLE students ADD COLUMN nickname TEXT DEFAULT '';`);
  } catch (e) {
    // Ignore if column already exists
  }

  // Create default admin if not exists
  const adminExists = db.prepare('SELECT id FROM admins WHERE email = ?').get('admin@ncc.edu.ng');
  if (!adminExists) {
    db.prepare('INSERT INTO admins (id, name, email, password) VALUES (?, ?, ?, ?)').run(
      'admin-1',
      'System Admin',
      'admin@ncc.edu.ng',
      'admin123'
    );
  }

  // Initialize settings
  const settingsCount = db.prepare('SELECT count(*) as count FROM settings').get() as { count: number };
  if (settingsCount.count === 0) {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('theme', 'white-gold');
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('graduating_year', '2026');
  }
}
