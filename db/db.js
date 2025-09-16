const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.resolve(__dirname, 'email_verification.db'));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS email_verification (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    email TEXT UNIQUE NOT NULL, 
    created_at TEXT NOT NULL, 
    expire_at TEXT NOT NULL,
    verified INTEGER DEFAULT 0
    )`);
  });

module.exports = db;