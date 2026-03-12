const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "../database/app.sqlite");

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON");

  db.run(`
    CREATE TABLE IF NOT EXISTS lists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT
    )
    `);

  db.run(`
    CREATE TABLE IF NOT EXISTS list_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      list_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'done')),
      FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
    )
    `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_list_items_list_id
    ON list_items(list_id)
    `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_list_items_status
    ON list_items(status)
    `);
});

module.exports = db;
