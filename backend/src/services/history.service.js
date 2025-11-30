import {
  getAllHistory,
  insertHistoryRecord,
  trimHistory,
  clearHistory,
  deleteHistoryOlderThan,
} from "../dal/history.dal.js";

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

export async function listHistory(limit) {
  const parsedLimit = Number.isInteger(limit) && limit > 0 ? limit : 10;
  return getAllHistory(parsedLimit);
}

export async function addHistoryRecord(payload) {
  let { date, city, temp, conditions } = payload ?? {};

  if (!city || typeof city !== "string") {
    throw badRequest("City is required");
  }

  if (!date || typeof date !== "string" || date.trim().length === 0) {
    date = new Date().toISOString().split("T")[0];
  }

  if (typeof temp !== "number") {
    temp = null;
  }

  if (typeof conditions !== "string") {
    conditions = "";
  }

  const result = await insertHistoryRecord({ date, city, temp, conditions });
  await trimHistory(10);

  return {
    id: result.lastID,
    date,
    city,
    temp,
    conditions,
  };
}

export async function clearHistoryService() {
  const result = await clearHistory();
  return { changed: result.changes };
}

export async function cleanupOldHistory(days) {
  const safeDays = Number.isInteger(days) && days > 0 ? days : 30;

  const now = new Date();
  const cutoff = new Date(now.getTime() - safeDays * 24 * 60 * 60 * 1000);
  const dateLimit = cutoff.toISOString().split("T")[0];

  const result = await deleteHistoryOlderThan(dateLimit);

  return {
    changed: result.changes,
    beforeDate: dateLimit,
  };
}
