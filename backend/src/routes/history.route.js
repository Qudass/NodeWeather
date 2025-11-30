import { Router } from "express";
import {
  listHistory,
  addHistoryRecord,
  clearHistoryService,
  cleanupOldHistory,
} from "../services/history.service.js";

export const historyRouter = Router();

// GET /api/history?limit=10
historyRouter.get("/", async (req, res) => {
  try {
    const limit = req.query.limit
      ? parseInt(req.query.limit, 10)
      : undefined;

    const rows = await listHistory(limit);
    res.json(rows);
  } catch (err) {
    console.error("Failed to get history:", err);
    res.status(500).json({ error: "Failed to get history" });
  }
});

// POST /api/history
historyRouter.post("/", async (req, res) => {
  try {
    const record = await addHistoryRecord(req.body);
    res.status(201).json(record);
  } catch (err) {
    console.error("Failed to add history record:", err);
    const status = err.statusCode || 500;
    res.status(status).json({
      error: status === 400 ? err.message : "Failed to add history record",
    });
  }
});

// DELETE /api/history
historyRouter.delete("/", async (req, res) => {
  try {
    const { changed } = await clearHistoryService();
    res.json({ success: true, deleted: changed });
  } catch (err) {
    console.error("Failed to clear history:", err);
    res.status(500).json({ error: "Failed to clear history" });
  }
});
