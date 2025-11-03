import {
  addFavorite,
  getFavorites,
  removeFavorite,
  clearFavorites,
  isFavorite,
} from "../storage.js";

beforeEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
});

describe("favorites storage", () => {
  test("adds valid city to favorites", () => {
    const kyiv = { name: "Kyiv", lat: 50.45, lon: 30.52 };

    addFavorite(kyiv);

    expect(getFavorites()).toEqual([kyiv]);
  });

  test("does not add duplicate city to favorites", () => {
    const lviv = { name: "Lviv", lat: 49.84, lon: 24.03 };

    addFavorite(lviv);
    addFavorite(lviv);

    expect(getFavorites()).toEqual([lviv]);
  });

  test("ignores invalid city payload and logs warning", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    addFavorite({});
    addFavorite({ name: "", lat: 1, lon: 2 });

    expect(getFavorites()).toEqual([]);
    expect(warnSpy).toHaveBeenCalled();
  });

  test("removes city from favorites by name", () => {
    const lviv = { name: "Lviv", lat: 49.84, lon: 24.03 };
    const kyiv = { name: "Kyiv", lat: 50.45, lon: 30.52 };

    addFavorite(lviv);
    addFavorite(kyiv);

    removeFavorite("Lviv");

    expect(getFavorites()).toEqual([kyiv]);
  });

  test("clearFavorites removes all favorites and logs info", () => {
    const infoSpy = jest.spyOn(console, "info").mockImplementation(() => {});

    addFavorite({ name: "Kyiv", lat: 50.45, lon: 30.52 });
    addFavorite({ name: "Lviv", lat: 49.84, lon: 24.03 });

    clearFavorites();

    expect(getFavorites()).toEqual([]);
    expect(infoSpy).toHaveBeenCalled();
  });

  test("isFavorite returns true only for stored cities", () => {
    const kyiv = { name: "Kyiv", lat: 50.45, lon: 30.52 };

    addFavorite(kyiv);

    expect(isFavorite("Kyiv")).toBe(true);
    expect(isFavorite("Lviv")).toBe(false);
  });

  test("getFavorites survives broken JSON in localStorage", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    // emulate corrupted data
    localStorage.setItem("favorites", "not-a-json");

    const favs = getFavorites();

    expect(favs).toEqual([]);
    expect(warnSpy).toHaveBeenCalled();
  });

  test("write errors are caught and do not crash app", () => {
    const originalSetItem = localStorage.setItem;

    localStorage.setItem = () => {
      throw new Error("boom");
    };

    expect(() => clearFavorites()).not.toThrow();

    localStorage.setItem = originalSetItem;
  });
});

