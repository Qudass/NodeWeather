import { Router } from "express";
import {
  listFavorites,
  addFavorite,
  removeFavoriteByName,
  removeAllFavorites,
} from "../services/favorites.service.js";

export const favoritesRouter = Router();

// GET /api/favorites
favoritesRouter.get("/", async (req, res) => {
  try {
    const rows = await listFavorites();
    res.json(rows);
  } catch (err) {
    console.error("Failed to get favorites:", err);
    res.status(500).json({ error: "Failed to get favorites" });
  }
});

// POST /api/favorites
favoritesRouter.post("/", async (req, res) => {
  try {
    const row = await addFavorite(req.body);
    res.status(201).json(row);
  } catch (err) {
    console.error("Failed to add favorite:", err);
    const status = err.statusCode || 500;
    res.status(status).json({
      error: status === 400 ? err.message : "Failed to add favorite",
    });
  }
});

// DELETE /api/favorites/:name
favoritesRouter.delete("/:name", async (req, res) => {
  try {
    const rawName = req.params.name;
    const name = decodeURIComponent(rawName);

    const { changed } = await removeFavoriteByName(name);

    if (changed === 0) {
      return res.status(404).json({ error: "Favorite not found" });
    }

    res.json({ success: true, deleted: changed });
  } catch (err) {
    console.error("Failed to delete favorite:", err);
    const status = err.statusCode || 500;
    res.status(status).json({
      error: status === 400 ? err.message : "Failed to delete favorite",
    });
  }
});

// DELETE /api/favorites
favoritesRouter.delete("/", async (req, res) => {
  try {
    const { changed } = await removeAllFavorites();
    res.json({ success: true, deleted: changed });
  } catch (err) {
    console.error("Failed to clear favorites:", err);
    res.status(500).json({ error: "Failed to clear favorites" });
  }
});
