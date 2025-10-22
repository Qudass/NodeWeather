import { Router } from "express";
import { all, get, run } from "../db/db.js";

export const favoritesRouter = Router();

// GET /api/favorites
favoritesRouter.get("/", async (req, res) => {
  try {
    const rows = await all(
      "SELECT id, city FROM favorites ORDER BY id DESC",
      []
    );
    res.json(rows);
  } catch (err) {
    console.error("Failed to get favorites:", err);
    res.status(500).json({ error: "Failed to get favorites" });
  }
});

// POST /api/favorites  body: { city: "Kyiv" }
favoritesRouter.post("/", async (req, res) => {
  try {
    const { city } = req.body;

    if (!city || typeof city !== "string") {
      return res.status(400).json({ error: "City is required" });
    }

    await run("INSERT OR IGNORE INTO favorites (city) VALUES (?)", [city]);

    const row = await get("SELECT id, city FROM favorites WHERE city = ?", [
      city
    ]);

    res.status(201).json(row);
  } catch (err) {
    console.error("Failed to add favorite:", err);
    res.status(500).json({ error: "Failed to add favorite" });
  }
});

// DELETE /api/favorites/:id
favoritesRouter.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const result = await run("DELETE FROM favorites WHERE id = ?", [id]);

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
