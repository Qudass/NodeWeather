import request from "supertest";
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";

import { createApp } from "../src/app.js";
import { db, run } from "../src/db/db.js";

let app;

beforeAll(() => {
  app = createApp();
});

beforeEach(async () => {
  await run("DELETE FROM favorites", []);
  await run("DELETE FROM history", []);
});

afterAll((done) => {
  db.close((err) => {
    if (err) {
      console.error("Failed to close DB connection:", err);
    }
    done();
  });
});

describe("API integration tests", () => {
  it("GET /api/health should return ok status", async () => {
    const res = await request(app).get("/api/health");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("favorites flow: add → list → delete → list empty", async () => {
    const favCity = { name: "Kyiv", lat: 50.45, lon: 30.52 };

    // Add favorite
    const postRes = await request(app).post("/api/favorites").send(favCity);

    expect(postRes.statusCode).toBe(201);
    expect(postRes.body).toMatchObject(favCity);

    // List favorites
    const listRes = await request(app).get("/api/favorites");
    expect(listRes.statusCode).toBe(200);
    expect(listRes.body).toHaveLength(1);
    expect(listRes.body[0]).toMatchObject(favCity);

    // Delete by name
    const deleteRes = await request(app).delete("/api/favorites/Kyiv");
    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    // Ensure empty
    const listAfterDelete = await request(app).get("/api/favorites");
    expect(listAfterDelete.statusCode).toBe(200);
    expect(listAfterDelete.body).toHaveLength(0);
  });

  it("history flow: add → list → clear", async () => {
    // Add history record
    const postRes = await request(app).post("/api/history").send({
      city: "Kyiv",
      temp: 10.5,
      conditions: "Cloudy",
    });

    expect(postRes.statusCode).toBe(201);
    expect(postRes.body.city).toBe("Kyiv");
    expect(postRes.body).toHaveProperty("date");
    expect(postRes.body).toHaveProperty("id");

    // List history
    const listRes = await request(app).get("/api/history");

    expect(listRes.statusCode).toBe(200);
    expect(Array.isArray(listRes.body)).toBe(true);
    expect(listRes.body.length).toBeGreaterThanOrEqual(1);
    expect(listRes.body[0].city).toBe("Kyiv");

    // Clear history
    const clearRes = await request(app).delete("/api/history");
    expect(clearRes.statusCode).toBe(200);
    expect(clearRes.body.success).toBe(true);

    // Ensure empty
    const listAfterClear = await request(app).get("/api/history");
    expect(listAfterClear.statusCode).toBe(200);
    expect(listAfterClear.body).toHaveLength(0);
  });
});
