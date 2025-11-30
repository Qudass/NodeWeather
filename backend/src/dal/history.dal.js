import { all, run } from "../db/db.js";

export async function getAllHistory(limit = 10) {
  return all(
    `SELECT
       date,
       city,
       temp,
       conditions
     FROM history
     ORDER BY id DESC
     LIMIT ?`,
    [limit]
  );
}

export async function insertHistoryRecord({ date, city, temp, conditions }) {
  return run(
    "INSERT INTO history (date, city, temp, conditions) VALUES (?, ?, ?, ?)",
    [date, city, temp, conditions]
  );
}

export async function trimHistory(limit = 10) {
  return run(
    `DELETE FROM history
       WHERE id NOT IN (
         SELECT id FROM history
         ORDER BY id DESC
         LIMIT ?
       )`,
    [limit]
  );
}

export async function clearHistory() {
  return run("DELETE FROM history", []);
}

export async function deleteHistoryOlderThan(dateLimit) {
  return run(
    `DELETE FROM history
       WHERE date < ?`,
    [dateLimit]
  );
}
