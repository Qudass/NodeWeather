import { jest } from "@jest/globals";
import {
  addFavorite,
  getFavorites,
  removeFavorite,
  clearFavorites,
  isFavorite,
  addHistory,
  getHistory,
  clearHistory,
  getHistoryByCity,
  getStorageStats,
  resetAll,
  debugStorage,
} from "../storage.js";

describe("storage.js", () => {
  beforeEach(() => {
    if (
      globalThis.localStorage &&
      typeof globalThis.localStorage.clear === "function"
    ) {
      globalThis.localStorage.clear();
    }
    jest.restoreAllMocks();
  });

  // ---------------- READ / WRITE ----------------

  describe("read/write integration via public API", () => {
    test("getFavorites returns empty array and does not log a warning when there is no data yet", () => {
      const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

      const favorites = getFavorites();

      expect(favorites).toEqual([]);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    test("getFavorites survives broken JSON in localStorage and logs a warning", () => {
      const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

      // Invalid JSON in localStorage
      globalThis.localStorage.setItem("favorites", "not-a-json-array");

      const favorites = getFavorites();

      expect(favorites).toEqual([]);
      expect(warnSpy).toHaveBeenCalled();
      const [message] = warnSpy.mock.calls[0];
      expect(message).toContain("Помилка читання favorites");
    });

    test("write logs an error when localStorage.setItem throws", () => {
      const errorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const fakeStorage = {
        getItem: () => "[]",
        setItem: () => {
          throw new Error("FAILED");
        },
      };

      const original = globalThis.localStorage;

      Object.defineProperty(globalThis, "localStorage", {
        value: fakeStorage,
        configurable: true,
        writable: true,
      });

      try {
        // clearFavorites -> write("favorites", [])
        clearFavorites();
      } finally {
        Object.defineProperty(globalThis, "localStorage", {
          value: original,
          configurable: true,
          writable: true,
        });
      }

      expect(errorSpy).toHaveBeenCalled();
      const [msg] = errorSpy.mock.calls[0];
      expect(msg).toContain("Помилка запису");
      expect(msg).toContain("favorites");
    });
  });

  // ---------------- FAVORITES ----------------

  describe("favorites", () => {
    test("addFavorite uses the correct favorites key in localStorage", () => {
      const city = { name: "Kyiv", lat: 50.45, lon: 30.52 };

      addFavorite(city);

      const raw = globalThis.localStorage.getItem("favorites");
      expect(raw).not.toBeNull();

      const parsed = JSON.parse(raw);
      expect(parsed).toEqual([city]);
    });

    test("addFavorite rejects city with non-numeric lon", () => {
      const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

      const invalidCity = { name: "Kyiv", lat: 50.45, lon: "30.52" };

      addFavorite(invalidCity);

      expect(getFavorites()).toEqual([]);
      expect(warnSpy).toHaveBeenCalledWith(
        "Невалідні дані міста:",
        invalidCity
      );
    });

    test("addFavorite rejects null city", () => {
      const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

      addFavorite(null);

      expect(getFavorites()).toEqual([]);
      expect(warnSpy).toHaveBeenCalledWith("Невалідні дані міста:", null);
    });

    test("addFavorite rejects city without name", () => {
      const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

      const invalidCity = { lat: 10, lon: 20 };

      addFavorite(invalidCity);

      expect(getFavorites()).toEqual([]);
      expect(warnSpy).toHaveBeenCalledWith(
        "Невалідні дані міста:",
        invalidCity
      );
    });

    test("addFavorite rejects city with non-numeric lat", () => {
      const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

      const invalidCity = { name: "Kyiv", lat: "50.45", lon: 30.52 };

      addFavorite(invalidCity);

      expect(getFavorites()).toEqual([]);
      expect(warnSpy).toHaveBeenCalledWith(
        "Невалідні дані міста:",
        invalidCity
      );
    });

    test("addFavorite adds a valid city exactly once and logs info messages", () => {
      const infoSpy = jest.spyOn(console, "info").mockImplementation(() => {});

      const city = { name: "Lviv", lat: 49.84, lon: 24.03 };

      addFavorite(city);
      addFavorite(city); // second time should not create a duplicate

      const favorites = getFavorites();
      expect(favorites).toHaveLength(1);
      expect(favorites[0]).toEqual(city);

      expect(
        infoSpy.mock.calls.some(
          (call) =>
            call[0] === "Місто додано в улюблені:" && call[1] === city.name
        )
      ).toBe(true);

      expect(
        infoSpy.mock.calls.some(
          (call) =>
            call[0] === "Місто вже є в улюблених:" && call[1] === city.name
        )
      ).toBe(true);
    });

    test("isFavorite works correctly for multiple favorites (protects from `.every` mutation)", () => {
      const city1 = { name: "Kyiv", lat: 50.45, lon: 30.52 };
      const city2 = { name: "Lviv", lat: 49.84, lon: 24.03 };

      addFavorite(city1);
      addFavorite(city2);

      expect(isFavorite("Kyiv")).toBe(true);
      expect(isFavorite("Lviv")).toBe(true);
      expect(isFavorite("Odesa")).toBe(false);
    });

    test("removeFavorite removes only the specified city and logs info", () => {
      const infoSpy = jest.spyOn(console, "info").mockImplementation(() => {});

      const city1 = { name: "Kyiv", lat: 50.45, lon: 30.52 };
      const city2 = { name: "Lviv", lat: 49.84, lon: 24.03 };

      addFavorite(city1);
      addFavorite(city2);

      removeFavorite("Kyiv");

      const favorites = getFavorites();
      expect(favorites).toHaveLength(1);
      expect(favorites[0].name).toBe("Lviv");

      expect(infoSpy).toHaveBeenCalledWith(
        "Місто видалено з улюблених:",
        "Kyiv"
      );
    });

    test("clearFavorites clears all favorites and logs an info message", () => {
      const infoSpy = jest.spyOn(console, "info").mockImplementation(() => {});

      addFavorite({ name: "Kyiv", lat: 50.45, lon: 30.52 });
      clearFavorites();

      expect(getFavorites()).toEqual([]);
      expect(infoSpy).toHaveBeenCalledWith("Усі улюблені очищено");
    });

    test("addFavorite accepts city whose name contains surrounding spaces but not empty after trim", () => {
      const city = { name: "  Kyiv  ", lat: 50.45, lon: 30.52 };

      addFavorite(city);

      const favorites = getFavorites();
      expect(favorites.length).toBe(1);
      expect(favorites[0].name.trim()).toBe("Kyiv");
    });

    test("addFavorite rejects city whose trimmed name is empty string", () => {
      const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

      const invalidCity = { name: "   ", lat: 50.45, lon: 30.52 };

      addFavorite(invalidCity);

      expect(getFavorites()).toEqual([]);
      expect(warnSpy).toHaveBeenCalled();
    });

    test("addFavorite must not treat other strings as empty trimmed value", () => {
      const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

      const weirdCity = { name: "Stryker was here!", lat: 1, lon: 2 };

      addFavorite(weirdCity);

      const favorites = getFavorites();
      expect(favorites.length).toBe(1);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    test("isValidCity must NOT accept city with empty name", () => {
      const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

      const invalid = { name: "", lat: 1, lon: 2 };

      addFavorite(invalid);

      expect(getFavorites().length).toBe(0);
      expect(warnSpy).toHaveBeenCalled();
    });
  });

  // ---------------- HISTORY ----------------

  describe("history", () => {
    test("addHistory uses 'history' key in localStorage", () => {
      addHistory({
        date: "2024-01-01",
        city: "Kyiv",
        temp: 5,
        conditions: "cloudy",
      });

      const raw = globalThis.localStorage.getItem("history");
      expect(raw).not.toBeNull();

      const parsed = JSON.parse(raw);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(1);
    });

    test("addHistory fills default values for temp and conditions when missing", () => {
      const record = {
        date: "2024-01-01",
        city: "Kyiv",
        temp: undefined,
        conditions: undefined,
      };

      addHistory(record);

      const history = getHistory();
      expect(history).toHaveLength(1);

      const entry = history[0];
      expect(entry.date).toBe("2024-01-01");
      expect(entry.city).toBe("Kyiv");
      expect(entry.temp).toBeNull();
      expect(entry.conditions).toBe("");
    });

    test("addHistory uses current date when no date is provided", () => {
      const RealDate = Date;
      const fakeIso = "2024-05-10T12:34:56.000Z";

      class FakeDate extends RealDate {
        constructor(...args) {
          if (args.length === 0) {
            return new RealDate(fakeIso);
          }
          return new RealDate(...args);
        }

        static now() {
          return new RealDate(fakeIso).getTime();
        }

        static parse(str) {
          return RealDate.parse(str);
        }

        static UTC(...args) {
          return RealDate.UTC.apply(RealDate, args);
        }

        toISOString() {
          return fakeIso;
        }
      }

      // @ts-ignore
      globalThis.Date = FakeDate;

      addHistory({
        city: "Kyiv",
        temp: 10,
        conditions: "cloudy",
      });

      const history = getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].date).toBe("2024-05-10");

      // @ts-ignore
      globalThis.Date = RealDate;
    });

    test("history is trimmed to last 10 entries with newest first", () => {
      for (let i = 0; i < 15; i++) {
        addHistory({
          date: `2024-01-${String(i + 1).padStart(2, "0")}`,
          city: "City" + i,
          temp: i,
          conditions: "ok",
        });
      }

      const history = getHistory();
      expect(history).toHaveLength(10);
      expect(history[0].city).toBe("City14");
      expect(history[9].city).toBe("City5");
    });

    test("getHistoryByCity returns only entries for requested city", () => {
      addHistory({
        date: "2024-01-01",
        city: "Kyiv",
        temp: 1,
        conditions: "a",
      });
      addHistory({
        date: "2024-01-02",
        city: "Lviv",
        temp: 2,
        conditions: "b",
      });
      addHistory({
        date: "2024-01-03",
        city: "Kyiv",
        temp: 3,
        conditions: "c",
      });

      const kyivHistory = getHistoryByCity("Kyiv");
      expect(kyivHistory).toHaveLength(2);
      expect(kyivHistory.every((h) => h.city === "Kyiv")).toBe(true);
    });

    test("clearHistory clears all history entries and logs an info message", () => {
      const infoSpy = jest.spyOn(console, "info").mockImplementation(() => {});

      addHistory({
        date: "2024-01-01",
        city: "Kyiv",
        temp: 1,
        conditions: "a",
      });

      clearHistory();

      expect(getHistory()).toEqual([]);
      expect(infoSpy).toHaveBeenCalledWith("Історію очищено");
    });

    test("addHistory logs info when a history entry is added", () => {
      const infoSpy = jest.spyOn(console, "info").mockImplementation(() => {});

      const record = {
        date: "2024-01-01",
        city: "Kyiv",
        temp: 5,
        conditions: "rainy",
      };

      addHistory(record);

      expect(infoSpy).toHaveBeenCalled();
      const [message] = infoSpy.mock.calls[0];
      expect(message).toBe("Додано запис в історію:");
    });
  });

  // ---------------- AGGREGATE & DEBUG ----------------

  describe("aggregate helpers and debug functions", () => {
    test("getStorageStats returns correct favorites and history counts", () => {
      addFavorite({ name: "Kyiv", lat: 50.45, lon: 30.52 });
      addFavorite({ name: "Lviv", lat: 49.84, lon: 24.03 });

      addHistory({
        date: "2024-01-01",
        city: "Kyiv",
        temp: 1,
        conditions: "a",
      });
      addHistory({
        date: "2024-01-02",
        city: "Lviv",
        temp: 2,
        conditions: "b",
      });

      const stats = getStorageStats();

      expect(stats).toEqual({
        favoritesCount: 2,
        historyCount: 2,
      });
    });

    test("resetAll clears both favorites and history and logs an info message", () => {
      const infoSpy = jest.spyOn(console, "info").mockImplementation(() => {});

      addFavorite({ name: "Kyiv", lat: 50.45, lon: 30.52 });
      addHistory({
        date: "2024-01-01",
        city: "Kyiv",
        temp: 1,
        conditions: "a",
      });

      resetAll();

      expect(getFavorites()).toEqual([]);
      expect(getHistory()).toEqual([]);

      expect(
        infoSpy.mock.calls.some(
          (call) => call[0] === "Повне очищення storage виконано"
        )
      ).toBe(true);
    });

    test("debugStorage groups and logs favorites and history", () => {
      const groupSpy = jest
        .spyOn(console, "group")
        .mockImplementation(() => {});
      const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
      const groupEndSpy = jest
        .spyOn(console, "groupEnd")
        .mockImplementation(() => {});

      addFavorite({ name: "Kyiv", lat: 50.45, lon: 30.52 });
      addHistory({
        date: "2024-01-01",
        city: "Kyiv",
        temp: 1,
        conditions: "a",
      });

      debugStorage();

      expect(groupSpy).toHaveBeenCalledWith("Storage Debug");

      expect(
        logSpy.mock.calls.some(
          (call) => call[0] === "Favorites:" && Array.isArray(call[1])
        )
      ).toBe(true);

      expect(
        logSpy.mock.calls.some(
          (call) => call[0] === "History:" && Array.isArray(call[1])
        )
      ).toBe(true);

      expect(groupEndSpy).toHaveBeenCalled();
    });
  });
});
