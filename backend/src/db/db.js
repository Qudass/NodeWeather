import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

sqlite3.verbose();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "..", "..", "weather.db");

export const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Failed to connect to SQLite database:", err);
    return;
  }
  console.log("Connected to SQLite database:", DB_PATH);

  db.run(
    `CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      lat REAL NOT NULL,
      lon REAL NOT NULL
    )`,
    (err) => {
      if (err) {
        console.error("Failed to create favorites table:", err);
      }
    }
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      city TEXT NOT NULL,
      temp REAL,
      conditions TEXT
    )`,
    (err) => {
      if (err) {
        console.error("Failed to create history table:", err);
      }
    }
  );
});

export function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        return reject(err);
      }
      // this.lastID / this.changes доступні тут
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

export function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
}

export function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        return reject(err);
      }
      resolve(row);
    });
  });
}
