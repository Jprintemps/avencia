const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const dbPath = path.isAbsolute(process.env.DB_PATH)
    ? process.env.DB_PATH
    : path.join(__dirname, '..', process.env.DB_PATH);

let db;

const dbProxy = {
    _save() {
        fs.writeFileSync(dbPath, Buffer.from(db.export()));
    },

    prepare(sql) {
        return {
            run(...params) {
                db.run(sql, params);
                dbProxy._save();
                return { changes: db.getRowsModified() };
            },
            get(...params) {
                const stmt = db.prepare(sql);
                stmt.bind(params);
                if (stmt.step()) {
                    const row = stmt.getAsObject();
                    stmt.free();
                    return row;
                }
                stmt.free();
                return undefined;
            },
            all(...params) {
                const stmt = db.prepare(sql);
                stmt.bind(params);
                const rows = [];
                while (stmt.step()) rows.push(stmt.getAsObject());
                stmt.free();
                return rows;
            }
        };
    },

    exec(sql) {
        db.run(sql);
        dbProxy._save();
    },

    pragma(sql) {
        db.run(`PRAGMA ${sql}`);
    }
};

async function initDB() {
    const SQL = await initSqlJs();
    if (fs.existsSync(dbPath)) {
        db = new SQL.Database(fs.readFileSync(dbPath));
    } else {
        db = new SQL.Database();
    }

    dbProxy.pragma('foreign_keys = ON');
    dbProxy.exec(`
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
            type TEXT NOT NULL,
            data TEXT NOT NULL,
            created_at INTEGER,
            updated_at INTEGER,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    `);

    console.log('Base de données SQLite initialisée à :', dbPath);
    return dbProxy;
}

module.exports = { initDB, dbProxy };
