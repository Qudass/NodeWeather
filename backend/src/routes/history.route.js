import { Router } from "express";

export const historyRouter = Router();

// TODO: implement history endpoints
historyRouter.get("/", (req, res) => {
  res.json([]);
});
