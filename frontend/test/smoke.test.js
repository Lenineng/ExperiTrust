import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const read = (filePath) => fs.readFileSync(path.join(root, filePath), "utf8");

test("auth pages include script and submit buttons", () => {
  const login = read("frontend/login.html");
  const signup = read("frontend/signup.html");

  assert.match(login, /<script src="script\.js"><\/script>/i);
  assert.match(signup, /<script src="script\.js"><\/script>/i);
  assert.match(login, /class="primary-btn auth-submit" type="submit"/i);
  assert.match(signup, /class="primary-btn auth-submit" type="submit"/i);
});

test("frontend script targets backend API", () => {
  const script = read("frontend/script.js");
  assert.match(script, /:5001\/api/);
  assert.match(script, /\/auth\/login/);
  assert.match(script, /\/auth\/signup/);
});

test("protected frontend pages stay hidden until auth succeeds", () => {
  const protectedPages = [
    "frontend/student-dashboard.html",
    "frontend/employer-dashboard.html",
    "frontend/admin-dashboard.html",
    "frontend/student-settings.html",
    "frontend/employer-settings.html",
    "frontend/admin-settings.html",
  ];

  protectedPages.forEach((filePath) => {
    const html = read(filePath);
    assert.match(html, /class="[^"]*auth-pending[^"]*"/i);
  });
});

test("date-based forms use native date and time inputs", () => {
  const studentDashboard = read("frontend/student-dashboard.html");
  const employerDashboard = read("frontend/employer-dashboard.html");

  assert.match(studentDashboard, /<input type="date" \/>/i);
  assert.match(employerDashboard, /<input type="date" \/>/i);
  assert.match(employerDashboard, /<input type="time" \/>/i);
});
