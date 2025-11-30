import { Router } from "express";
import {
  getTopCitiesStats,
  getOverviewStats,
  getTodayStats,
} from "../services/stats.service.js";

export const statsRouter = Router();

// GET /api/stats/top-cities?limit=5
statsRouter.get("/top-cities", async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;

    const rows = await getTopCitiesStats(limit);
    res.json(rows);
  } catch (err) {
    console.error("Failed to get top cities stats:", err);
    res.status(500).json({ error: "Failed to get top cities stats" });
  }
});

// GET /api/stats/overview
statsRouter.get("/overview", async (req, res) => {
  try {
    const data = await getOverviewStats();
    res.json(data);
  } catch (err) {
    console.error("Failed to get stats overview:", err);
    res.status(500).json({ error: "Failed to get stats overview" });
  }
});

// GET /api/stats/today?date=YYYY-MM-DD
statsRouter.get("/today", async (req, res) => {
  try {
    const result = await getTodayStats(req.query.date);
    res.json(result);
  } catch (err) {
    console.error("Failed to get today's stats:", err);
    res.status(500).json({ error: "Failed to get today's stats" });
  }
});
