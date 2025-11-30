import { all, get, run } from "../db/db.js";

export async function getAllFavorites() {
  return all(
    "SELECT name, lat, lon FROM favorites ORDER BY id DESC",
    []
  );
}

export async function findFavoriteByName(name) {
  return get(
    "SELECT name, lat, lon FROM favorites WHERE name = ?",
    [name]
  );
}

export async function insertFavorite({ name, lat, lon }) {
  return run(
    "INSERT OR IGNORE INTO favorites (name, lat, lon) VALUES (?, ?, ?)",
    [name, lat, lon]
  );
}

export async function deleteFavoriteByName(name) {
  return run("DELETE FROM favorites WHERE name = ?", [name]);
}

export async function clearFavorites() {
  return run("DELETE FROM favorites", []);
}
