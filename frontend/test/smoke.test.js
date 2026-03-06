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

