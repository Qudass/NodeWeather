import { Router } from "express";
import { all, run } from "../db/db.js";

export const historyRouter = Router();

// GET /api/history
historyRouter.get("/", async (req, res) => {
  try {
    const rows = await all(
      `SELECT id, city, searched_at AS searchedAt
       FROM history
       ORDER BY id DESC
       LIMIT 50`,
      []
    );
    res.json(rows);
  } catch (err) {
    console.error("Failed to get history:", err);
    res.status(500).json({ error: "Failed to get history" });
  }
});

// POST /api/history  body: { city: "Kyiv", searchedAt?: "2025-11-24T11:22:33.000Z" }
historyRouter.post("/", async (req, res) => {
  try {
    const { city, searchedAt } = req.body;

    if (!city || typeof city !== "string") {
      return res.status(400).json({ error: "City is required" });
    }

    const timestamp =
      typeof searchedAt === "string" && searchedAt.trim().length > 0
        ? searchedAt
        : new Date().toISOString();

    const result = await run(
      "INSERT INTO history (city, searched_at) VALUES (?, ?)",
      [city, timestamp]
    );

    res.status(201).json({
      id: result.lastID,
      city,
      searchedAt: timestamp
    });
  } catch (err) {
    console.error("Failed to add history record:", err);
    res.status(500).json({ error: "Failed to add history record" });
  }
});

// DELETE /api/history
historyRouter.delete("/", async (req, res) => {
  try {
    const result = await run("DELETE FROM history", []);
    res.json({ success: true, deleted: result.changes });
  } catch (err) {
    console.error("Failed to clear history:", err);
    res.status(500).json({ error: "Failed to clear history" });
  }
});
