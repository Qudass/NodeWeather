import { Router } from "express";

export const favoritesRouter = Router();

// TODO: implement favorites endpoints
favoritesRouter.get("/", (req, res) => {
  res.json([]);
});
