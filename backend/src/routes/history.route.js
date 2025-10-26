import { Router } from "express";
import { all, run } from "../db/db.js";

export const historyRouter = Router();

// GET /api/history
historyRouter.get("/", async (req, res) => {
  try {
    const rows = await all(
      `SELECT
         date,
         city,
         temp,
         conditions
       FROM history
       ORDER BY id DESC
       LIMIT 10`,
      []
    );
    res.json(rows);
  } catch (err) {
    console.error("Failed to get history:", err);
    res.status(500).json({ error: "Failed to get history" });
  }
});

// POST /api/history
historyRouter.post("/", async (req, res) => {
  try {
    let { date, city, temp, conditions } = req.body;

    if (!city || typeof city !== "string") {
      return res.status(400).json({ error: "City is required" });
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

    const result = await run(
      "INSERT INTO history (date, city, temp, conditions) VALUES (?, ?, ?, ?)",
      [date, city, temp, conditions]
    );

    await run(
      `DELETE FROM history
       WHERE id NOT IN (
         SELECT id FROM history
         ORDER BY id DESC
         LIMIT 10
       )`,
      []
    );

    res.status(201).json({
      id: result.lastID,
      date,
      city,
      temp,
      conditions
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
