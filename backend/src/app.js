import express from "express";
import cors from "cors";

import { favoritesRouter } from "./routes/favorites.route.js";
import { historyRouter } from "./routes/history.route.js";
import { statsRouter } from "./routes/stats.route.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Health-check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/favorites", favoritesRouter);
  app.use("/api/history", historyRouter);
  app.use("/api/stats", statsRouter);

  return app;
}
