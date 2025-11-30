import {
  getTopCities,
  getTotals,
  getTodayHistoryCount,
} from "../dal/stats.dal.js";

export async function getTopCitiesStats(limit) {
  const safeLimit =
    Number.isInteger(limit) && limit > 0 && limit <= 50 ? limit : 5;

  return getTopCities(safeLimit);
}

export async function getOverviewStats() {
  return getTotals();
}

export async function getTodayStats(dateStr) {
  const date =
    typeof dateStr === "string" && dateStr.trim().length > 0
      ? dateStr
      : new Date().toISOString().split("T")[0];

  const count = await getTodayHistoryCount(date);

  return {
    date,
    requests: count,
  };
}
