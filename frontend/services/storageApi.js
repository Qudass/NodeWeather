import {
  addFavorite as addFavLocal,
  getFavorites as getFavLocal,
  removeFavorite as removeFavLocal,
  clearFavorites as clearFavLocal,
  addHistory as addHistLocal,
  getHistory as getHistLocal,
  clearHistory as clearHistLocal
} from "../storage.js";

export function addFavorite(city) {
  return addFavLocal(city);
}

export function getFavorites() {
  return getFavLocal();
}

export function removeFavorite(name) {
  return removeFavLocal(name);
}

export function clearFavorites() {
  return clearFavLocal();
}

export function addHistory(record) {
  return addHistLocal(record);
}

export function getHistory() {
  return getHistLocal();
}

export function clearHistory() {
  return clearHistLocal();
}
