import {
  getAllFavorites,
  findFavoriteByName,
  insertFavorite,
  deleteFavoriteByName,
  clearFavorites,
} from "../dal/favorites.dal.js";

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

export async function listFavorites() {
  return getAllFavorites();
}

export async function addFavorite(payload) {
  const { name, lat, lon } = payload ?? {};

  if (
    !name ||
    typeof name !== "string" ||
    typeof lat !== "number" ||
    typeof lon !== "number"
  ) {
    throw badRequest("Invalid city payload");
  }

  await insertFavorite({ name, lat, lon });
  const row = await findFavoriteByName(name);
  return row;
}

export async function removeFavoriteByName(name) {
  if (!name || typeof name !== "string") {
    throw badRequest("Invalid city name");
  }

  const result = await deleteFavoriteByName(name);
  return { changed: result.changes };
}

export async function removeAllFavorites() {
  const result = await clearFavorites();
  return { changed: result.changes };
}
