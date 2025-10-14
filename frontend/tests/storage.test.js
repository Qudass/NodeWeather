import { addFavorite, getFavorites, removeFavorite, addHistory, getHistory } from "../storage.js";

beforeEach(() => {
  localStorage.clear();
});

test("Додає місто в улюблені", () => {
  const kyiv = { name: "Kyiv", lat: 50.45, lon: 30.52 };

  addFavorite(kyiv);

  expect(getFavorites()).toEqual([kyiv]);
});

test("Видаляє місто з улюблених", () => {
  const lviv = { name: "Lviv", lat: 49.84, lon: 24.03 };

  addFavorite(lviv);
  removeFavorite("Lviv");

  expect(getFavorites()).toEqual([]);
});

test("Додає запис в історію і зберігає максимум 10", () => {
  for (let i = 1; i <= 12; i++) {
    addHistory({ date: `2025-01-${i}`, city: `City${i}` });
  }
  const history = getHistory();
  expect(history.length).toBe(10);
  expect(history[0].city).toBe("City12");
});
