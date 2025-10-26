import { Router } from "express";
import { all, get, run } from "../db/db.js";

export const favoritesRouter = Router();

// GET /api/favorites
favoritesRouter.get("/", async (req, res) => {
  try {
    const rows = await all(
      "SELECT name, lat, lon FROM favorites ORDER BY id DESC",
      []
    );
    res.json(rows);
  } catch (err) {
    console.error("Failed to get favorites:", err);
    res.status(500).json({ error: "Failed to get favorites" });
  }
});

// POST /api/favorites
favoritesRouter.post("/", async (req, res) => {
  try {
    const { name, lat, lon } = req.body;

    if (
      !name ||
      typeof name !== "string" ||
      typeof lat !== "number" ||
      typeof lon !== "number"
    ) {
      return res.status(400).json({ error: "Invalid city payload" });
    }

    await run(
      "INSERT OR IGNORE INTO favorites (name, lat, lon) VALUES (?, ?, ?)",
      [name, lat, lon]
    );

    const row = await get(
      "SELECT name, lat, lon FROM favorites WHERE name = ?",
      [name]
    );

    res.status(201).json(row);
  } catch (err) {
    console.error("Failed to add favorite:", err);
    res.status(500).json({ error: "Failed to add favorite" });
  }
});

// DELETE /api/favorites/:name
favoritesRouter.delete("/:name", async (req, res) => {
  try {
    const rawName = req.params.name;
    const name = decodeURIComponent(rawName);

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Invalid city name" });
    }

    const result = await run("DELETE FROM favorites WHERE name = ?", [name]);

    res.json({ success: true, deleted: result.changes });
  } catch (err) {
    console.error("Failed to delete favorite:", err);
    res.status(500).json({ error: "Failed to delete favorite" });
  }
});

// DELETE /api/favorites
favoritesRouter.delete("/", async (req, res) => {
  try {
    const result = await run("DELETE FROM favorites", []);
    res.json({ success: true, deleted: result.changes });
  } catch (err) {
    console.error("Failed to clear favorites:", err);
    res.status(500).json({ error: "Failed to clear favorites" });
  }
});
