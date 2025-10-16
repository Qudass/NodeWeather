import express from "express";
import cors from "cors";

import { favoritesRouter } from "./routes/favorites.route.js";
import { historyRouter } from "./routes/history.route.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health-check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/favorites", favoritesRouter);
app.use("/api/history", historyRouter);

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
