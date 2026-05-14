const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const dbPath = path.isAbsolute(process.env.DB_PATH) 
    ? process.env.DB_PATH 
    : path.join(__dirname, '..', process.env.DB_PATH);

const db = new Database(dbPath);

// Activer les clés étrangères
db.pragma('foreign_keys = ON');

// Initialisation des tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    created_at INTEGER,
    refresh_token TEXT
  );

  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,       -- 'invoice' | 'quote'
    data TEXT NOT NULL,       -- JSON stringifié
    created_at INTEGER,
    updated_at INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

console.log('Base de données SQLite initialisée à :', dbPath);

module.exports = db;
