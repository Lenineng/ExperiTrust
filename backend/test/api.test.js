import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../src/server.js";

test("returns 404 JSON for unknown routes", async () => {
  const res = await request(app).get("/api/unknown");
  assert.equal(res.status, 404);
  assert.match(res.body.message, /Route not found/i);
});

test("auth protected route returns 401 without cookie", async () => {
  const res = await request(app).get("/api/auth/check");
  assert.equal(res.status, 401);
  assert.match(res.body.message, /Unauthorized/i);
});

test("signup validation rejects missing fields", async () => {
  const res = await request(app).post("/api/auth/signup").send({
    email: "x@test.com",
    password: "123456",
  });
  assert.equal(res.status, 400);
  assert.match(res.body.message, /fullName is required/i);
});

test("employer route guard blocks unauthenticated access", async () => {
  const res = await request(app).get("/api/employer/dashboard");
  assert.equal(res.status, 401);
});

test("invalid object id is rejected before controller logic", async () => {
  const res = await request(app)
    .patch("/api/admin/experiences/not-an-id/verify")
    .send({ equivalenceYears: 0.5 });
  assert.equal(res.status, 401);
});

