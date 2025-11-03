import {
  addFavorite,
  getFavorites,
  removeFavorite,
  clearFavorites,
  isFavorite,
  addHistory,
  getHistory,
  clearHistory,
  getHistoryByCity
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

describe("history storage", () => {
  test("adds history entry with explicit date and trims to 10 records", () => {
    for (let i = 1; i <= 12; i++) {
      addHistory({ date: `2025-01-${String(i).padStart(2, "0")}`, city: `City${i}` });
    }

    const history = getHistory();
    expect(history.length).toBe(10);
    expect(history[0].city).toBe("City12");
    expect(history[9].city).toBe("City3");
  });

  test("adds history entry with default date based on current day", () => {
    const realDate = Date;
    const fixed = new Date("2025-03-10T12:00:00.000Z");
    // simple mock of Date
    // eslint-disable-next-line no-global-assign
    Date = class extends realDate {
      constructor(...args) {
        if (args.length === 0) {
          return fixed;
        }
        return new realDate(...args);
      }
    };

    addHistory({ city: "Kyiv" });
    const history = getHistory();

    expect(history[0].date).toBe("2025-03-10");
    expect(history[0].city).toBe("Kyiv");

    // restore Date
    // eslint-disable-next-line no-global-assign
    Date = realDate;
  });

  test("clearHistory removes all history entries and logs info", () => {
    const infoSpy = jest.spyOn(console, "info").mockImplementation(() => {});

    addHistory({ date: "2025-01-01", city: "Kyiv" });
    addHistory({ date: "2025-01-02", city: "Lviv" });

    clearHistory();

    expect(getHistory()).toEqual([]);
    expect(infoSpy).toHaveBeenCalled();
  });

  test("getHistoryByCity filters only records with given city name", () => {
    addHistory({ date: "2025-01-01", city: "Kyiv" });
    addHistory({ date: "2025-01-02", city: "Lviv" });
    addHistory({ date: "2025-01-03", city: "Kyiv" });

    const kyivHistory = getHistoryByCity("Kyiv");
    const lvivHistory = getHistoryByCity("Lviv");

    expect(kyivHistory).toHaveLength(2);
    expect(kyivHistory.every((h) => h.city === "Kyiv")).toBe(true);

    expect(lvivHistory).toHaveLength(1);
    expect(lvivHistory[0].city).toBe("Lviv");
  });
});
