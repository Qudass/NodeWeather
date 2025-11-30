import { all, get } from "../db/db.js";

export async function getTopCities(limit = 5) {
  return all(
    `SELECT city, COUNT(*) AS count
       FROM history
       GROUP BY city
       ORDER BY count DESC, city ASC
       LIMIT ?`,
    [limit]
  );
}

export async function getTotals() {
  const historyRow = await get(
    "SELECT COUNT(*) AS totalHistory FROM history",
    []
  );
  const favoritesRow = await get(
    "SELECT COUNT(*) AS totalFavorites FROM favorites",
    []
  );

  return {
    totalHistory: historyRow?.totalHistory ?? 0,
    totalFavorites: favoritesRow?.totalFavorites ?? 0,
  };
}

export async function getTodayHistoryCount(date) {
  const row = await get(
    "SELECT COUNT(*) AS count FROM history WHERE date = ?",
    [date]
  );

  return row?.count ?? 0;
}
